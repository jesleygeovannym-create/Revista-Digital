(function () {
  window.RevistaDigital = window.RevistaDigital || {};
  const routes = window.RevistaDigital.routes || {};
  const state = () => window.RevistaDigital.state;
  const getDestinationCatalog = () => window.RevistaDigital.hoteles?.getDestinationCatalog?.() || window.RevistaDigital.catalog?.byCountry || {};
  let activeHotelPortalMap = null;

  function slugify(value = "") {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "hotel";
  }

  function getProjectBasePath() {
    const baseHref = document.querySelector("base")?.href || window.location.href;
    return new URL(baseHref, window.location.href).pathname.replace(/\/+$/, "");
  }

  function href(path = "/") {
    const routePath = `/${String(path || "/").replace(/^\/+|\/+$/g, "")}`.replace(/^\/$/, "/");
    const projectBasePath = getProjectBasePath();
    return routePath === "/" ? `${projectBasePath}/` : `${projectBasePath}${routePath}`;
  }

  function escapeHtml(value = "") {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    })[character]);
  }

  function getAppRoute(pathname = window.location.pathname) {
    const projectBasePath = getProjectBasePath();
    if (projectBasePath && (pathname === projectBasePath || pathname.startsWith(`${projectBasePath}/`))) {
      pathname = pathname.slice(projectBasePath.length) || "/";
    }
    return pathname.replace(/\/index\.html$/i, "").replace(/\/+$/, "") || "/";
  }

  function syncBookRoute() {
    const page = state().pages?.[state().currentIndex ?? 0];
    let nextPath = "/";

    if (state().activeRestaurantMenuIndex !== null && state().activeRestaurantMenuIndex !== undefined) {
      const restaurantHotel = state().pages?.[state().activeRestaurantMenuIndex];
      if (restaurantHotel?.type === "hotel") {
        nextPath = `/restaurantes/${slugify(restaurantHotel.name)}`;
      }
    } else if (state().activeHotelDetail) {
      const countryKey = state().activeHotelDetail.countryKey;
      const hotel = state().hotelCountryMenus?.[countryKey]?.hotels?.[state().activeHotelDetail.hotelIndex];
      if (hotel) {
        nextPath = `/hoteles/${countryKey}/${slugify(hotel.name)}`;
      }
    } else if (page?.type === "country-menu") {
      nextPath = `/hoteles/${page.country}`;
    } else if (page?.type === "mapamundi") {
      nextPath = "/mapa-hoteles";
    } else if (page?.type === "workspace") {
      nextPath = "/workspace";
    } else if (page?.type === "media360") {
      nextPath = "/360";
    } else if (page?.type === "videos") {
      nextPath = "/videos";
    }

    const projectBasePath = getProjectBasePath();
    const targetPath = nextPath === "/" ? `${projectBasePath}/` : `${projectBasePath}${nextPath}`;
    const currentPath = window.location.pathname || "/";
    if (currentPath !== targetPath) {
      window.history.pushState(
        {
          currentIndex: state().currentIndex,
          activeHotelDetail: state().activeHotelDetail,
          returnPageIndex: state().returnPageIndex,
          activeRestaurantMenuIndex: state().activeRestaurantMenuIndex
        },
        "",
        targetPath
      );
    }
  }

  function resolveInitialRoute() {
    const route = getAppRoute();
    const parts = route.split("/").filter(Boolean);

    if (parts[0] === "hoteles" && parts[1]) {
      return parts[1];
    }

    if (parts[0] === "restaurantes" && parts[1]) {
      return parts[1];
    }

    return "";
  }

  function getCurrentRoute() {
    return getAppRoute();
  }

  function refreshCurrentAppContext(pathname = window.location.pathname) {
    const target = resolveRouteTarget(pathname);
    const routeContext = target?.context || getRouteContext(pathname);

    window.RevistaDigital.appContext = {
      ...target,
      route: getAppRoute(pathname),
      countrySlug: routeContext.country || target.countrySlug || null,
      destinationSlug: routeContext.destination || target.destinationSlug || null,
      hotelSlug: routeContext.hotel || target.hotelSlug || null,
      kind: routeContext.kind || target.kind || "default"
    };

    document.body.dataset.countrySlug = routeContext.country || target.countrySlug || "";
    document.body.dataset.destinationSlug = routeContext.destination || target.destinationSlug || "";
    document.body.dataset.hotelSlug = routeContext.hotel || target.hotelSlug || "";
    document.body.dataset.routeKind = routeContext.kind || target.kind || "default";

    const routeLabels = {
      "/": "Inicio",
      "/mapa-hoteles": "Mapa general de hoteles",
      "/mapa-mundi": "Mapa mundial",
      "/workspace": "Workspace",
      "/360": "360°",
      "/videos": "Videos",
      "/guia-playa-paraiso": "Guía interactiva"
    };

    const currentLabel = routeLabels[getAppRoute(pathname)] ||
      (routeContext.country ? routeContext.country : "Destino");

    document.body.dataset.currentRouteLabel = currentLabel;
    document.body.dataset.currentRoute = getAppRoute(pathname);

    if (typeof window.updateAppContextBar === "function") {
      window.updateAppContextBar();
    }

    return window.RevistaDigital.appContext;
  }

  function getBreadcrumbs(pathname = window.location.pathname) {
    const target = resolveRouteTarget(pathname);
    const context = target.context || getRouteContext(pathname);
    const breadcrumbs = [];

    if (context.country) {
      breadcrumbs.push({
        label: context.country,
        route: `/${context.country}`
      });
    }

    if (context.destination) {
      breadcrumbs.push({
        label: context.destination,
        route: context.country ? `/${context.country}/${context.destination}` : `/${context.destination}`
      });
    }

    if (context.hotel) {
      breadcrumbs.push({
        label: context.hotel,
        route: context.country && context.destination ? `/${context.country}/${context.destination}/${context.hotel}` : `/${context.hotel}`
      });
    }

    if (!breadcrumbs.length) {
      breadcrumbs.push({ label: "Inicio", route: "/" });
    }

    return breadcrumbs;
  }

  function computeTopNavState(pathname = window.location.pathname) {
    const breadcrumbs = getBreadcrumbs(pathname);
    const current = breadcrumbs[breadcrumbs.length - 1] || { label: "Inicio", route: "/" };
    const previous = breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2] : null;

    return {
      current,
      previous,
      breadcrumbs,
      label: current.label,
      route: current.route,
      hasPrevious: Boolean(previous)
    };
  }

  function resolveRouteTarget(pathname = window.location.pathname) {
    const context = getRouteContext(pathname);
    const routeIndex = window.RevistaDigital?.routeIndex || window.RevistaDigital?.hoteles?.getRouteIndex?.() || [];
    const match = routeIndex.find((entry) => {
      if (context.country && entry.type === "country" && entry.slug === context.country) return true;
      if (context.country && context.destination && entry.type === "destination" && entry.countrySlug === context.country && entry.slug === context.destination) return true;
      if (context.country && context.destination && context.hotel && entry.type === "hotel" && entry.countrySlug === context.country && entry.destinationSlug === context.destination && entry.slug === context.hotel) return true;
      return false;
    });

    return {
      route: getAppRoute(pathname),
      context,
      match: match || null,
      countrySlug: context.country || match?.countrySlug || null,
      destinationSlug: context.destination || match?.destinationSlug || null,
      hotelSlug: context.hotel || match?.slug || null,
      kind: context.kind
    };
  }

  function getRouteContext(pathname = window.location.pathname) {
    const route = getAppRoute(pathname);
    const parts = route.split("/").filter(Boolean);
    const context = {
      route,
      kind: "default",
      country: null,
      destination: null,
      hotel: null,
      segments: parts
    };

    const directCountryKeys = Object.keys(getDestinationCatalog() || {});
    const directCountryMatch = parts[0] && directCountryKeys.includes(parts[0]);

    if (parts[0] === "hoteles") {
      context.kind = "legacy-country";
      if (parts[1]) context.country = parts[1];
      if (parts[2]) context.destination = parts[2];
      if (parts[3]) context.hotel = parts[3];
      return context;
    }

    if (parts[0] === "restaurantes") {
      context.kind = "restaurant";
      if (parts[1]) context.hotel = parts[1];
      return context;
    }

    if (directCountryMatch) {
      context.kind = "country";
      context.country = parts[0];
      if (parts[1]) context.destination = parts[1];
      if (parts[2]) context.hotel = parts[2];
      return context;
    }

    if (parts[0] && ["mapa-hoteles", "mapa-mundi", "workspace", "360", "videos", "complejo-playa-paraiso", "guia-playa-paraiso"].includes(parts[0])) {
      context.kind = "section";
      context.destination = parts[0];
      return context;
    }

    if (parts.length >= 2 && parts[0] && !parts[2]) {
      const countrySlug = parts[0];
      if (directCountryKeys.includes(countrySlug)) {
        context.kind = "destination";
        context.country = countrySlug;
        context.destination = parts[1];
      }
    }

    return context;
  }

  function renderCards(records, getPath, type) {
    return records.map((item) => `<a class="destination-card ${type}" href="${escapeHtml(href(getPath(item)))}" data-app-route="${escapeHtml(getPath(item))}">
      <img src="${escapeHtml(item.image || "src/JOIA2.jpg")}" alt="" loading="lazy"><span class="destination-card-copy"><small>${type === "hotel" ? "HOTEL" : "DESTINO"}</small><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.description || item.tagline || "Descubre el hotel y sus experiencias.")}</span><b>Explorar →</b></span></a>`).join("");
  }
  function findHotelPortalRoute(hotelName) {
    const targetSlug = slugify(hotelName);
    const catalog = getDestinationCatalog();
    for (const [countrySlug, country] of Object.entries(catalog || {})) {
      for (const destination of country.destinations || []) {
        const hotel = (destination.hotels || []).find((item) => item.slug === targetSlug || slugify(item.name) === targetSlug);
        if (hotel) return `/${countrySlug}/${destination.slug}/${hotel.slug}`;
      }
    }
    return null;
  }

  function portalHotelPoints(hotels) {
    return (hotels || [])
      .map((hotel) => ({ name: hotel.name, coordinates: state()?.hotelCoordinates?.[hotel.name] }))
      .filter((item) => Array.isArray(item.coordinates));
  }

  function portalRegionBounds(L, hotels) {
    const points = portalHotelPoints(hotels).map((item) => item.coordinates);
    if (!points.length) return null;
    let bounds = L.latLngBounds(points);
    const degenerate = Math.abs(bounds.getNorth() - bounds.getSouth()) < 1e-9 &&
      Math.abs(bounds.getEast() - bounds.getWest()) < 1e-9;
    if (degenerate) {
      const [lat, lng] = points[0];
      bounds = L.latLngBounds([lat - 0.15, lng - 0.15], [lat + 0.15, lng + 0.15]);
    }
    return bounds.pad(0.2);
  }

  // Encuadre visual SOLO para el mapa del complejo: abarca los hoteles y los
  // POIs verificados del complejo (áreas comunes, playa). No participa en la
  // decisión del perfil de ruta (eso vive en mapas.isComplexDestination).
  function portalComplexViewBounds(L, hotelPoints, poiLayer) {
    const points = (hotelPoints || []).map((item) => item.coordinates).filter((coords) => Array.isArray(coords));
    if (!points.length) return null;
    const bounds = L.latLngBounds(points);
    try {
      const poiBounds = poiLayer && typeof poiLayer.getBounds === "function" ? poiLayer.getBounds() : null;
      if (poiBounds && typeof poiBounds.isValid === "function" && poiBounds.isValid()) bounds.extend(poiBounds);
    } catch (e) { /* ignore */ }
    return bounds.pad(0.05);
  }

  function portalMapActions(hotels = [], fallback = null) {
    const points = portalHotelPoints(hotels);
    const targets = points.length
      ? points
      : (Array.isArray(fallback?.coordinates) && fallback.coordinates.length === 2
        ? [{ name: fallback.name || "", coordinates: fallback.coordinates }]
        : []);
    const directions = targets.length
      ? `<button type="button" class="portal-map-btn portal-directions" data-directions-hotels="${escapeHtml(JSON.stringify(targets.map((item) => [item.name, item.coordinates[0], item.coordinates[1]])))}">Cómo llegar</button>`
      : "";
    return `<div class="portal-map-actions">
        <button type="button" class="portal-map-btn portal-locate">📍 Ubicarme</button>
        ${directions}
      </div>`;
  }

  function renderPortal(route) {
    const view = document.getElementById("appView");
    if (!view) return false;
    const catalog = getDestinationCatalog();
    if (route === "/complejo-playa-paraiso") {
      const complexEntry = Object.entries(catalog || {})
        .flatMap(([countrySlug, country]) => (country.destinations || []).map((destination) => ({ countrySlug, country, destination })))
        .find((entry) => entry.destination.complex);
      if (complexEntry) {
        const { countrySlug, destination } = complexEntry;
        const complexHotels = (destination.hotels || []).filter((hotel) => hotel.complex !== false);
        const complexPage = (state()?.pages || []).find((page) => page?.type === "complex") || {};
        document.body.dataset.appMode = "portal";
        document.body.dataset.routeManaged = "true";
        const complexCards = renderCards(complexHotels, (hotel) => `/${countrySlug}/${destination.slug}/${hotel.slug}`, "hotel");
        view.innerHTML = `<main class="portal-page">
          <div class="portal-breadcrumb"><a href="${href("/")}" data-app-route="/">Inicio</a> / EL COMPLEJO</div>
          <section class="portal-destination-hero portal-complex-hero">
            <img src="${escapeHtml(destination.image || "src/paraiso-del-mar/banner/ParaisoDelMar.jpg")}" alt="">
            <div>
              <p class="portal-kicker">${escapeHtml(complexPage.kicker || `EL COMPLEJO · ${destination.name.toUpperCase()}`)}</p>
              <h1>${escapeHtml(complexPage.title || destination.name)}</h1>
              <p>${escapeHtml(complexPage.intro || destination.description || "")}</p>
            </div>
          </section>
          <section class="portal-map-section">
            <div>
              <p class="portal-kicker">UBICACIÓN</p>
              <h2>Mapa del complejo</h2>
              <p>Los hoteles de ${escapeHtml(destination.name)} en un solo mapa. Usa “Ubicarme” para situarte y “Cómo llegar” para trazar la ruta.</p>
            </div>
            <div class="portal-map-frame">
              <div class="portal-destination-map portal-complex-map" id="complexPortalMap" role="application" aria-label="Mapa del complejo ${escapeHtml(destination.name)}"></div>
              ${portalMapActions(complexHotels)}
            </div>
          </section>
          <section class="portal-section portal-guide-section">
            <div id="guideExplorer" class="guide-explorer-mount"></div>
          </section>
          <section class="portal-section">
            <div class="portal-section-heading">
              <div>
                <p class="portal-kicker">NUESTROS HOTELES</p>
                <h2>Los complejos</h2>
              </div>
              <a href="${href(`/${countrySlug}/${destination.slug}`)}" data-app-route="/${countrySlug}/${destination.slug}">Ver ${escapeHtml(destination.name)}</a>
            </div>
            <div class="destination-grid">${complexCards}</div>
          </section>
        </main>`;
        const complexMap = view.querySelector("#complexPortalMap");
        if (complexMap) initComplexPortalMap(complexMap, countrySlug, destination);
        const guideMount = view.querySelector("#guideExplorer");
        if (guideMount && window.RevistaDigital.guiapa && typeof window.RevistaDigital.guiapa.renderExplorer === "function") {
          window.RevistaDigital.guiapa.renderExplorer(guideMount);
        }
        return true;
      }
    }
    if (route === "/restaurantes" || route.startsWith("/restaurantes/")) {
      if (renderRestaurantPortal(route, view)) return true;
    }

    const parts = route.split("/").filter(Boolean);
    const country = parts[0];
    const countryData = catalog[country];
    const isHome = !parts.length;
    if (isHome || (countryData && parts.length === 1)) {
      document.body.dataset.appMode = "portal";
      document.body.dataset.routeManaged = "true";
      const countryCards = Object.entries(catalog).map(([key, item]) => ({ name: item.name, image: item.image, description: `${item.destinations.length} destinos para explorar.`, route: `/${key}` }));
      let heading = "Encuentra tu próximo destino";
      let intro = "Explora hoteles y destinos Iberostar. Elige un país para comenzar.";
      let cards = renderCards(countryCards, (item) => item.route, "country");
      let breadcrumb = "IBEROSTAR · DESTINOS";
      let countryMapMarkup = "";
      let countryHotels = [];
      if (!isHome) {
        heading = countryData.name; intro = `Descubre los destinos de ${countryData.name}.`;
        breadcrumb = `DESTINOS · ${countryData.name.toUpperCase()}`;
        cards = renderCards(countryData.destinations, (item) => `/${country}/${item.slug}`, "destination");
        countryHotels = countryData.destinations.flatMap((destination) => destination.hotels.map((hotel) => ({
          ...hotel,
          countrySlug: country,
          countryName: countryData.name,
          destinationSlug: destination.slug,
          destinationName: destination.name
        }))).filter((hotel) => Array.isArray(state()?.hotelCoordinates?.[hotel.name]));
        if (countryHotels.length) {
          countryMapMarkup = `<section class="portal-map-section"><div><p class="portal-kicker">UBICACIÓN</p><h2>Mapa de ${escapeHtml(countryData.name)}</h2><p>Explora los hoteles disponibles en los destinos de ${escapeHtml(countryData.name)}.</p></div><div class="portal-map-frame"><div class="portal-destination-map" id="countryMap" role="application" aria-label="Mapa de hoteles en ${escapeHtml(countryData.name)}"></div>${portalMapActions(countryHotels)}</div></section>`;
        }
      }
      view.innerHTML = `<main class="portal-page"><section class="portal-hero"><div><p class="portal-kicker">${breadcrumb}</p><h1>${heading}</h1><p>${intro}</p>${!isHome ? "" : `<a class="portal-hero-link" href="${href("/complejo-playa-paraiso")}" data-app-route="/complejo-playa-paraiso">Conoce Iberostar Playa Paraíso <span>→</span></a>`}</div><img src="${isHome ? "src/paraiso-del-mar/banner/ParaisoDelMar.jpg" : countryData.image}" alt="Paisaje de destino" /></section>${countryMapMarkup}<section class="portal-section"><div class="portal-section-heading"><div><p class="portal-kicker">${isHome ? "NUESTROS PAÍSES" : "DESTINOS"}</p><h2>${isHome ? "Viaja a tu manera" : "Elige dónde hospedarte"}</h2></div>${!isHome ? `<a href="${href("/")}" data-app-route="/">Todos los países</a>` : ""}</div><div class="destination-grid">${cards}</div></section></main>`;
      const countryMap = view.querySelector("#countryMap");
      if (countryMap) {
        window.RevistaDigital.mapas?.initializeAllHotelsMap(countryMap, countryHotels, { countrySlug: country });
      }
      return true;
    }
    if (countryData && parts.length === 2) {
      const destination = countryData.destinations.find((item) => item.slug === parts[1]);
      if (!destination) return false;
      const hotels = destination.hotels;
      if (!hotels.length) return false;
      const hasDestinationMap = hotels.some((hotel) => Array.isArray(state()?.hotelCoordinates?.[hotel.name]))
        || Array.isArray(destination.mapCenter);
      document.body.dataset.appMode = "portal";
      document.body.dataset.routeManaged = "true";
      const mapDescription = destination.mapNotice || "Selecciona un marcador para abrir la ficha del hotel.";
      view.innerHTML = `<main class="portal-page"><div class="portal-breadcrumb"><a href="${href(`/${country}`)}" data-app-route="/${country}">${escapeHtml(countryData.name)}</a> / ${escapeHtml(destination.name)}</div><section class="portal-destination-hero"><img src="${escapeHtml(destination.image)}" alt=""><div><p class="portal-kicker">${escapeHtml(countryData.name).toUpperCase()} · DESTINO</p><h1>${escapeHtml(destination.name)}</h1><p>${escapeHtml(destination.description)}</p>${destination.complex ? `<a class="portal-hero-link" href="${href("/complejo-playa-paraiso")}" data-app-route="/complejo-playa-paraiso">Ver el complejo Playa Paraíso →</a>` : ""}</div></section><section class="portal-section"><div class="portal-section-heading"><div><p class="portal-kicker">ALOJAMIENTOS</p><h2>Hoteles en ${escapeHtml(destination.name)}</h2></div></div><div class="destination-grid destination-grid--hotels">${renderCards(hotels, (hotel) => `/${country}/${destination.slug}/${hotel.slug}`, "hotel")}</div></section></main>`;
      const mapElement = view.querySelector("#destinationMap");
      if (mapElement) window.RevistaDigital.mapas?.initializeDestinationMap(mapElement, { countrySlug: country, destination });
      return true;
    }
    if (countryData && parts.length === 3) {
      const destination = countryData.destinations.find((item) => item.slug === parts[1]);
      if (!destination) return false;
      const hotel = destination.hotels.find((item) => item.slug === parts[2])
        || destination.hotels.find((item) => slugify(item.name) === parts[2]);
      if (!hotel) return false;
      document.body.dataset.appMode = "portal";
      document.body.dataset.routeManaged = "true";
      document.body.dataset.returnRoute = `/${country}/${destination.slug}`;
      view.innerHTML = renderHotelPortal({ countrySlug: country, countryData, destination, hotel });
      initHotelPortalMap(view, hotel, destination, countryData);
      view.querySelectorAll(".pano-360-ficha").forEach((ficha) => {
        ficha.addEventListener("click", () => {
          if (!window.RevistaDigital.pannellum360?.open) return;
          window.RevistaDigital.pannellum360.open(
            ficha.dataset.hotel,
            ficha.dataset.zone,
            ficha.dataset.label
          );
        });
      });
      return true;
    }
    return false;
  }
  function restaurantHotelCardMarkup(hotel) {
    const chips = hotel.restaurants.slice(0, 4)
      .map(([name]) => `<span class="restaurant-chip">${escapeHtml(name)}</span>`).join("");
    const extra = hotel.restaurants.length > 4
      ? `<span class="restaurant-chip restaurant-chip-more">+${hotel.restaurants.length - 4}</span>` : "";
    const meta = hotel.restaurants.length
      ? `<div class="restaurant-chip-row">${chips}${extra}</div>`
      : `<span class="restaurant-count-note">Galería gastronómica</span>`;
    return `<a class="destination-card restaurant-hotel-card" href="${href(hotel.route)}" data-app-route="${hotel.route}">
      <img src="${escapeHtml(hotel.image)}" alt="" loading="lazy" decoding="async">
      <span class="destination-card-copy">
        <small>${escapeHtml(hotel.destinationName).toUpperCase()}</small>
        <strong>${escapeHtml(hotel.name)}</strong>
        ${meta}
        <b>Ver carta →</b>
      </span>
    </a>`;
  }

  function restaurantCountryGroupsMarkup(groups) {
    if (!groups.length) return `<p class="restaurant-count-note">Todavía no hay restaurantes registrados para este país.</p>`;
    return `<div class="restaurant-country-list">${groups.map((group) => `<article class="restaurant-group">
      <header class="restaurant-group-head">
        <div><small>${escapeHtml(group.destinationName).toUpperCase()}</small><a href="${href(group.hotelRoute)}" data-app-route="${group.hotelRoute}">${escapeHtml(group.hotelName)}</a></div>
        <span>${group.restaurants.length} ${group.restaurants.length === 1 ? "restaurante" : "restaurantes"}</span>
      </header>
      <ul class="restaurant-rows">${group.restaurants.map(([name, cuisine]) => `<li><a href="${href(group.hotelRoute)}" data-app-route="${group.hotelRoute}">${escapeHtml(name)}</a><em>${escapeHtml(cuisine || "Cocina de autor")}</em></li>`).join("")}</ul>
    </article>`).join("")}</div>`;
  }

  function renderRestaurantPortal(route, view) {
    const api = window.RevistaDigital.restaurantes;
    if (!api?.getDirectory) return false;
    const parts = route.split("/").filter(Boolean);
    if (parts[0] !== "restaurantes") return false;

    document.body.dataset.appMode = "portal";
    document.body.dataset.routeManaged = "true";

    if (parts.length === 1) {
      const countries = api.getDirectory();
      if (!countries.length) return false;
      const cards = countries.map((country) => {
        const hotelWord = country.hotels.length === 1 ? "hotel" : "hoteles";
        const restaurantWord = country.restaurantCount === 1 ? "restaurante" : "restaurantes";
        return `<a class="destination-card restaurant-country-card" href="${href(`/restaurantes/${country.slug}`)}" data-app-route="/restaurantes/${country.slug}">
        <img src="${escapeHtml(country.image)}" alt="" loading="lazy" decoding="async">
        <span class="destination-card-copy"><small>RESTAURANTES</small><strong>${escapeHtml(country.name)}</strong><span>${country.hotels.length} ${hotelWord} · ${country.restaurantCount} ${restaurantWord}</span><b>Ver carta →</b></span>
      </a>`;
      }).join("");
      view.innerHTML = `<main class="portal-page">
        <div class="portal-breadcrumb">IBEROSTAR · GASTRONOMÍA</div>
        <section class="portal-hero">
          <div><p class="portal-kicker">RESTAURANTES</p><h1>Sabores de nuestros destinos</h1><p>Elige un país para descubrir la carta de restaurantes de cada hotel.</p></div>
          <img src="src/paraiso-del-mar/banner/ParaisoDelMar.jpg" alt="">
        </section>
        <section class="portal-section">
          <div class="portal-section-heading"><div><p class="portal-kicker">NUESTROS PAÍSES</p><h2>Cartas por país</h2></div></div>
          <div class="destination-grid">${cards}</div>
        </section>
      </main>`;
      return true;
    }

    if (parts.length === 2 && typeof api.getRestaurantHotel === "function") {
      const hotelMatch = api.getRestaurantHotel(parts[1]);
      const pano = window.RevistaDigital?.pannellum360;
      const isParaiso = Boolean(hotelMatch && pano?.isPlayaParaiso?.(hotelMatch.hotel.name));
      // Los hoteles de Playa Paraíso conservan su página 360° existente.
      if (hotelMatch && !isParaiso) {
        const countryRoute = `/restaurantes/${hotelMatch.country.slug}`;
        document.body.dataset.returnRoute = countryRoute;
        view.innerHTML = restaurantFichePageMarkup({
          country: hotelMatch.country,
          hotel: hotelMatch.hotel,
          breadcrumbCountryRoute: countryRoute
        });
        wirePanoFiches(view);
        return true;
      }
    }

    const country = api.getCountryDirectory(parts[1]);
    if (!country) return false;
    const groups = api.getCountryRestaurantGroups(country.slug);

    if (parts.length === 2) {
      document.body.dataset.returnRoute = "/restaurantes";
      const hotelWord = country.hotels.length === 1 ? "hotel" : "hoteles";
      const restaurantWord = country.restaurantCount === 1 ? "restaurante" : "restaurantes";
      view.innerHTML = `<main class="portal-page">
        <div class="portal-breadcrumb"><a href="${href("/")}" data-app-route="/">Inicio</a> / <a href="${href("/restaurantes")}" data-app-route="/restaurantes">Restaurantes</a> / ${escapeHtml(country.name)}</div>
        <section class="portal-destination-hero">
          <img src="${escapeHtml(country.image)}" alt="">
          <div><p class="portal-kicker">GASTRONOMÍA · ${escapeHtml(country.name).toUpperCase()}</p><h1>Restaurantes en ${escapeHtml(country.name)}</h1><p>${country.hotels.length} ${hotelWord} y ${country.restaurantCount} ${restaurantWord}. Elige un hotel para ver su carta.</p></div>
        </section>
        <section class="portal-section">
          <div class="portal-section-heading"><div><p class="portal-kicker">HOTELES Y SUS RESTAURANTES</p><h2>Elige un hotel</h2></div></div>
          <div class="destination-grid">${country.hotels.map(restaurantHotelCardMarkup).join("")}</div>
        </section>
        <section class="portal-section">
          <div class="portal-section-heading"><div><p class="portal-kicker">TODAS LAS CARTAS</p><h2>Todos los restaurantes de ${escapeHtml(country.name)}</h2></div></div>
          ${restaurantCountryGroupsMarkup(groups)}
        </section>
      </main>`;
      return true;
    }

    if (parts.length === 3) {
      const hotel = country.hotels.find((item) => item.slug === parts[2]);
      if (!hotel) return false;
      document.body.dataset.returnRoute = `/restaurantes/${country.slug}`;
      view.innerHTML = restaurantFichePageMarkup({
        country,
        hotel,
        breadcrumbCountryRoute: `/restaurantes/${country.slug}`
      });
      wirePanoFiches(view);
      return true;
    }
    return false;
  }

  /* Página de fichas visuales de un hotel dentro del apartado /restaurantes.
     Reutiliza renderRestaurantFiches: imagen y recorrido 360° solo si existen. */
  function restaurantFichePageMarkup({ country, hotel, breadcrumbCountryRoute }) {
    const api = window.RevistaDigital.restaurantes;
    const count = Array.isArray(hotel.restaurants) ? hotel.restaurants.length : 0;
    const countWord = count === 1 ? "restaurante" : "restaurantes";
    const fiches = api.renderRestaurantFiches(hotel.name, {
      hotelLabel: hotel.name,
      countryLabel: country.name
    });
    const gallery = Array.isArray(hotel.photos) && hotel.photos.length
      ? `<section class="portal-section">
          <div class="portal-section-heading"><div><p class="portal-kicker">GALERÍA GASTRONÓMICA</p><h2>Ambientes y platos</h2></div></div>
          <div class="hotel-portal-card-grid hotel-portal-card-grid-3">${hotel.photos.slice(0, 9).map((src) => hotelImageCard("", src)).join("")}</div>
        </section>` : "";
    const heroImage = hotel.image || "src/paraiso-del-mar/banner/ParaisoDelMar.jpg";
    return `<main class="portal-page">
      <div class="portal-breadcrumb"><a href="${href("/")}" data-app-route="/">Inicio</a> / <a href="${href("/restaurantes")}" data-app-route="/restaurantes">Restaurantes</a> / <a href="${href(breadcrumbCountryRoute)}" data-app-route="${breadcrumbCountryRoute}">${escapeHtml(country.name)}</a> / ${escapeHtml(hotel.name)}</div>
      <section class="portal-destination-hero">
        <img src="${escapeHtml(heroImage)}" alt="">
        <div><p class="portal-kicker">${escapeHtml(country.name).toUpperCase()} · ${escapeHtml(hotel.destinationName).toUpperCase()}</p><h1>${escapeHtml(hotel.name)}</h1><p>${count} ${countWord} para descubrir durante tu estancia.</p><a class="portal-hero-link" href="${href(hotel.hotelRoute)}" data-app-route="${hotel.hotelRoute}">Ver la ficha del hotel →</a></div>
      </section>
      <section class="portal-section">
        <div class="portal-section-heading"><div><p class="portal-kicker">LA CARTA</p><h2>Restaurantes de ${escapeHtml(hotel.name)}</h2></div><span class="restaurant-count-note">${count} ${count === 1 ? "opción" : "opciones"}</span></div>
        ${fiches || `<p class="restaurant-count-note">Este hotel ofrece una experiencia gastronómica que puedes descubrir en su galería.</p>`}
      </section>
      ${gallery}
      <section class="portal-section">
        <div class="portal-section-heading"><div><p class="portal-kicker">MÁS CARTAS</p><h2>Más restaurantes de ${escapeHtml(country.name)}</h2></div></div>
        <p class="restaurant-count-note"><a href="${href(breadcrumbCountryRoute)}" data-app-route="${breadcrumbCountryRoute}">Ver todos los restaurantes de ${escapeHtml(country.name)} →</a></p>
      </section>
    </main>`;
  }

  function wirePanoFiches(root) {
    root.querySelectorAll(".pano-360-ficha[data-hotel]").forEach((ficha) => {
      ficha.addEventListener("click", () => {
        if (!window.RevistaDigital.pannellum360?.open) return;
        window.RevistaDigital.pannellum360.open(
          ficha.dataset.hotel,
          ficha.dataset.zone,
          ficha.dataset.label
        );
      });
    });
  }
  function hotelImageCard(alt, src) {
    return `<figure class="hotel-portal-card"><img src="${escapeHtml(src)}" alt="${alt}" loading="lazy" decoding="async" /></figure>`;
  }
  function renderHotelPortal(context) {
    const { countrySlug, countryData, destination, hotel } = context;
    const stateData = state() || {};
    const page = hotel.pageIndex != null && Array.isArray(stateData.pages)
      ? stateData.pages[hotel.pageIndex]
      : null;
    const media = stateData.hotelMediaCatalog?.[hotel.name] || {};
    const content = window.RevistaDigital.hotelContent?.[hotel.name] || null;
    const officialGalleries = window.RevistaDigital.officialHotelGalleries || {};
    const stemOf = (image) => (image || "").match(/^src\/official-hotels\/([^/]+)\.jpg$/)?.[1] || null;
    const menuHotel = (stateData.hotelCountryMenus ? Object.values(stateData.hotelCountryMenus) : [])
      .flatMap((country) => country?.hotels || [])
      .find((item) => item.name === hotel.name) || null;
    const official = [
      hotel.slug,
      hotel.slug?.startsWith("iberostar-") ? hotel.slug.slice("iberostar-".length) : null,
      stemOf(hotel.image),
      stemOf(menuHotel?.image),
      stemOf(content?.image)
    ].filter(Boolean).map((stem) => officialGalleries[stem]).find((gallery) => gallery) || null;
    const coordinates = stateData.hotelCoordinates?.[hotel.name];
    const hasCoordinates = Array.isArray(coordinates);

    const heroImage = hotel.image || content?.image || destination.image || countryData.image || "src/paraiso-del-mar/banner/ParaisoDelMar.jpg";
    const displayName = hotel.name;
    const intro = hotel.description || page?.intro || content?.description || destination.description || "";
    const tagline = hotel.tagline || content?.tagline || "";
    const plainIntro = intro.replace(/\s+/g, " ").trim();
    const firstSentence = (plainIntro.match(/^.*?[.!?](?=\s|$)/) || [plainIntro])[0];
    const teaser = tagline || firstSentence;
    const locationLine = `${destination.name}, ${countryData.name}`;
    const fullAddress = page?.location || locationLine;
    const destinationRoute = `/${countrySlug}/${destination.slug}`;
    const hotelRoute = `${destinationRoute}/${hotel.slug}`;

    const pools = (media.piscinas?.length ? media.piscinas : (official?.piscinas || []));
    const dining = (media.restaurante?.length ? media.restaurante : (official?.restaurante || []));
    const experiences = official?.experiencias || [];
    const bannerImages = Array.isArray(media.banner) && media.banner.length ? media.banner : [];
    const services = (content?.tabs?.servicios?.keyPoints?.length
      ? content.tabs.servicios.keyPoints
      : (Array.isArray(page?.benefits) ? page.benefits : []));
    const stats = (page && Array.isArray(page.stats)) ? page.stats : [];
    const restaurantMarkup = window.RevistaDigital.restaurantes?.renderHotelRestaurants?.(displayName, page?.name || "") || "";
    const paraisoRestaurants360 = (window.RevistaDigital?.pannellum360?.isPlayaParaiso?.(hotel.name))
      ? window.RevistaDigital.pannellum360.getRestaurantes(hotel.name).length
      : 0;
    const hasDiningSection = (dining.length || restaurantMarkup) && !paraisoRestaurants360;

    const navItems = [];
    if (hasCoordinates) navItems.push(["ubicacion", "Ubicación"]);
    if (hasDiningSection) navItems.push(["restaurantes", "Restaurantes"]);
    else if (paraisoRestaurants360) navItems.push(["restaurantes-360", "Restaurantes"]);
    if (services.length) navItems.push(["servicios", "Servicios"]);

    const heroMarkup = `
        <section class="hotel-portal-hero">
          <img class="hotel-portal-hero-bg" src="${escapeHtml(heroImage)}" alt="${escapeHtml(displayName)}" fetchpriority="high" />
          <div class="hotel-portal-hero-scrim"></div>
          <div class="hotel-portal-hero-content">
            <p class="portal-kicker">${escapeHtml(countryData.name).toUpperCase()} · ${escapeHtml(destination.name).toUpperCase()}</p>
            <h1>${escapeHtml(displayName)}</h1>
            <p class="hotel-portal-hero-location">${escapeHtml(locationLine)}</p>
            ${teaser ? `<p class="hotel-portal-hero-desc">${escapeHtml(teaser)}</p>` : ""}
            <a class="hotel-portal-hero-cta" href="${href(hotelRoute)}#hotel-ubicacion">Descubrir el hotel ↓</a>
          </div>
        </section>`;

    const aboutMarkup = `
        <section class="hotel-portal-section hotel-portal-about${stats.length ? " hotel-portal-about-split" : ""}" id="hotel-sobre">
          <div class="hotel-portal-about-copy">
            <p class="portal-kicker">SOBRE EL HOTEL</p>
            <h2>${escapeHtml(displayName)}</h2>
            ${intro ? `<p>${escapeHtml(intro)}</p>` : ""}
            <p class="hotel-portal-address">${escapeHtml(fullAddress)}</p>
          </div>
          ${stats.length ? `<div class="hotel-portal-stats-panel">${stats.map(([value, label]) => `<div class="hotel-portal-stat"><strong>${escapeHtml(value)}</strong><small>${escapeHtml(label)}</small></div>`).join("")}</div>` : ""}
        </section>`;

    const diningMarkup = hasDiningSection ? `
        <section class="hotel-portal-section" id="hotel-restaurantes">
          <div class="hotel-portal-section-head">
            <p class="portal-kicker">GASTRONOMÍA</p>
            <h2>Restaurantes</h2>
            <p>Descubre los restaurantes de ${escapeHtml(displayName)}.</p>
          </div>
          ${restaurantMarkup}
        </section>` : "";

    const servicesMarkup = services.length ? `
        <section class="hotel-portal-section" id="hotel-servicios">
          <div class="hotel-portal-section-head">
            <p class="portal-kicker">SERVICIOS</p>
            <h2>Servicios y comodidades</h2>
            <p>Lo que te espera durante tu estancia.</p>
          </div>
          <ul class="hotel-portal-services">${services.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </section>` : "";

    const zoneCandidates = [
      { label: "Piscina", images: pools },
      { label: "Restaurante", images: dining },
      { label: "Experiencias", images: experiences },
      { label: "Exterior", images: bannerImages }
    ];
    const zones = zoneCandidates
      .filter((zone) => Array.isArray(zone.images) && zone.images.length)
      .map((zone) => ({ label: zone.label, image: zone.images[0] }));
    const zoneButtons = zones.map((zone, index) => `<button type="button" class="hotel-zone${index === 0 ? " is-active" : ""}" data-zone="${escapeHtml(zone.label)}" data-hotel="${escapeHtml(displayName)}" data-lat="${hasCoordinates ? coordinates[0] : ""}" data-lng="${hasCoordinates ? coordinates[1] : ""}">
              <img src="${escapeHtml(zone.image)}" alt="${escapeHtml(zone.label)}" loading="lazy" decoding="async" />
              <span>${escapeHtml(zone.label)}</span>
            </button>`).join("");

    const mapMarkup = hasCoordinates ? `
        <section class="hotel-portal-section" id="hotel-ubicacion">
          <div class="hotel-portal-section-head">
            <p class="portal-kicker">UBICACIÓN</p>
            <h2>Dónde estamos</h2>
            <p>${escapeHtml(fullAddress)}</p>
          </div>
          <div class="hotel-portal-location">
            <div class="hotel-portal-map-wrap">
              ${portalMapActions([hotel])}
              <div id="hotelPortalMap" class="hotel-portal-map" role="application" aria-label="Mapa de ${escapeHtml(displayName)}"></div>
            </div>
            <aside class="hotel-zone-panel" aria-label="Zonas del hotel">
              <p class="portal-kicker">EXPLORA EL HOTEL</p>
              <p class="hotel-zone-hint">Toca una imagen para ver de qué parte del hotel es y trazar cómo llegar.</p>
              ${zoneButtons ? `<div class="hotel-zone-strip">${zoneButtons}</div>` : ""}
              <div class="hotel-zone-status" data-zone-status>
                <span>Estás viendo: <strong data-zone-name>${escapeHtml(zones[0]?.label || "el hotel")}</strong></span>
                <button type="button" class="portal-map-btn portal-directions" data-directions="${escapeHtml(displayName)}" data-lat="${coordinates[0]}" data-lng="${coordinates[1]}">Cómo llegar</button>
              </div>
            </aside>
          </div>
        </section>` : "";

    const paraiso360 = (window.RevistaDigital?.pannellum360?.isPlayaParaiso?.(hotel.name))
      ? window.RevistaDigital.pannellum360.renderSection(hotel.name)
      : "";

    const restaurantCta = window.RevistaDigital.restaurantes?.getRestaurantHotel?.(hotel.slug)
      ? `<section class="hotel-portal-section hotel-portal-restaurant-cta" id="hotel-cartas">
          <div class="hotel-portal-section-head">
            <p class="portal-kicker">GASTRONOMÍA</p>
            <h2>La carta de restaurantes</h2>
            <p>Consulta todos los restaurantes de ${escapeHtml(displayName)} en fichas visuales.</p>
          </div>
          <a class="portal-hero-link" href="${href(`/restaurantes/${hotel.slug}`)}" data-app-route="/restaurantes/${hotel.slug}">Ver restaurantes de ${escapeHtml(displayName)} →</a>
        </section>`
      : "";

    return `
      <main class="portal-page">
        <nav class="portal-breadcrumb" aria-label="Migas de pan">
          <a href="${href("/")}" data-app-route="/">Inicio</a>
          <span> / </span>
          <a href="${href(`/${countrySlug}`)}" data-app-route="/${countrySlug}">${escapeHtml(countryData.name)}</a>
          <span> / </span>
          <a href="${href(destinationRoute)}" data-app-route="${destinationRoute}">${escapeHtml(destination.name)}</a>
          <span> / </span>
          <span>${escapeHtml(displayName)}</span>
        </nav>

        ${heroMarkup}

        <nav class="hotel-portal-nav" aria-label="Secciones del hotel">
          ${navItems.map(([id, label]) => `<a href="${href(hotelRoute)}#hotel-${id}">${label}</a>`).join("")}
        </nav>

        ${aboutMarkup}
        ${mapMarkup}
        ${paraiso360}
        ${diningMarkup}
        ${restaurantCta}
        ${servicesMarkup}

        <div class="hotel-portal-actions">
          <a class="hotel-portal-back" href="${href(destinationRoute)}" data-app-route="${destinationRoute}">← Volver a ${escapeHtml(destination.name)}</a>
        </div>
      </main>
    `;
  }
  // Recalcula el tamaño del mapa cuando su contenedor cambia de tamaño o se
  // muestra (p. ej. al cambiar de vista), evitando mapas en blanco o descentrados.
  function trackMapResize(map, element) {
    if (!map || !element) return;
    const invalidate = () => { try { map.invalidateSize(); } catch (e) { /* ignore */ } };
    try {
      if (typeof ResizeObserver === "function") {
        if (element._gpResizeObserver) element._gpResizeObserver.disconnect();
        const observer = new ResizeObserver(invalidate);
        observer.observe(element);
        element._gpResizeObserver = observer;
      }
    } catch (e) { /* ignore observer errors */ }
    setTimeout(invalidate, 0);
  }

  function initHotelPortalMap(view, hotel, destination, countryData) {
    const element = view?.querySelector("#hotelPortalMap");
    const coordinates = state()?.hotelCoordinates?.[hotel.name];
    const mapas = window.RevistaDigital.mapas;
    if (!element || !Array.isArray(coordinates) || !mapas?.loadLeaflet) return;

    if (activeHotelPortalMap) {
      try { activeHotelPortalMap.remove(); } catch (error) { /* ignore */ }
      activeHotelPortalMap = null;
    }

    const build = typeof mapas.loadMarkerCluster === "function" ? mapas.loadMarkerCluster() : mapas.loadLeaflet();
    build.then((L) => {
      const map = L.map(element, { scrollWheelZoom: true, preferCanvas: true, zoomAnimation: false });
      activeHotelPortalMap = map;
      window.RevistaDigital.state.activeMap = map;
      window.RevistaDigital.state.userMarker = null;
      window.RevistaDigital.state.routeLine = null;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors"
      }).addTo(map);
      L.marker(coordinates)
        .addTo(map)
        .bindPopup(`<strong>${escapeHtml(hotel.name)}</strong><br><small>${escapeHtml(destination.name)}, ${escapeHtml(countryData.name)}</small>`)
        .openPopup();
      // Encuadre y límites de navegación individuales por hotel: buffer
      // alrededor de sus coordenadas reales (~330 m). Reutiliza la misma
      // lógica que el mapa general del complejo (setupComplexMapFraming).
      const hotelInset = 0.003;
      const hotelPerimeter = L.latLngBounds(
        [coordinates[0] - hotelInset, coordinates[1] - hotelInset],
        [coordinates[0] + hotelInset, coordinates[1] + hotelInset]
      );
      if (window.RevistaDigital && typeof window.RevistaDigital.setupComplexMapFraming === "function") {
        window.RevistaDigital.setupComplexMapFraming(map, L, { perimeter: hotelPerimeter, navBounds: hotelPerimeter });
      } else {
        map.setMinZoom(map.getBoundsZoom(hotelPerimeter));
        map.setMaxZoom(18);
        map.fitBounds(hotelPerimeter, { animate: false });
      }
      try {
        if (hotel.complex !== false && window.RevistaDigital.guiapa && typeof window.RevistaDigital.guiapa.addPoiLayer === "function") {
          window.RevistaDigital.guiapa.addPoiLayer(map, hotel.name);
        }
      } catch (e) {}
    }).catch((error) => console.warn("No se pudo cargar el mapa del hotel.", error));
  }
  function initComplexPortalMap(element, countrySlug, destination) {
    const mapas = window.RevistaDigital.mapas;
    const hotels = portalHotelPoints((destination.hotels || []).filter((hotel) => hotel.complex !== false));
    if (!element || !hotels.length || !mapas?.loadLeaflet) return;

    const build = typeof mapas.loadMarkerCluster === "function" ? mapas.loadMarkerCluster() : mapas.loadLeaflet();
    build.then((L) => {
      const map = L.map(element, { scrollWheelZoom: true, preferCanvas: true, zoomAnimation: false });
      window.RevistaDigital.state.activeMap = map;
      window.RevistaDigital.state.userMarker = null;
      window.RevistaDigital.state.routeLine = null;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors"
      }).addTo(map);
      hotels.forEach((item) => {
        const hotelSlug = slugify(item.name);
        const route = `/${countrySlug}/${destination.slug}/${hotelSlug}`;
        const hotelMarker = L.marker(item.coordinates)
          .addTo(map)
          .bindPopup(`<strong>${escapeHtml(item.name)}</strong><br><a href="${href(route)}" data-app-route="${route}">Ver ficha →</a>`);
        try {
          const guideHotel = window.RevistaDigital.guiapa?.poiForHotel?.(item.name);
          window.RevistaDigital.guiapa?.registerMarker?.(guideHotel ? guideHotel.id : item.name, hotelMarker);
        } catch (e) { /* ignore guide marker registry errors */ }
      });
      // Encuadre del complejo: hoteles + áreas comunes verificadas (POIs del
      // complejo). Se calculan a partir de los marcadores reales para que el
      // mapa abra centrado en el complejo y no en hoteles/POIs vecinos.
      let poiLayer = null;
      try {
        if (window.RevistaDigital.guiapa && typeof window.RevistaDigital.guiapa.addPoiLayer === "function") {
          poiLayer = window.RevistaDigital.guiapa.addPoiLayer(map, null, { disableClusteringAtZoom: 17 });
        }
      } catch (e) {}
      // Encuadre y límites de navegación del complejo Playa Paraíso: se usa el
      // perímetro real verificado (OSM) como fuente única; solo si no está
      // disponible se recurre a los marcadores + POIs.
      const regionBounds = portalComplexViewBounds(L, hotels, poiLayer);
      const rdState = window.RevistaDigital && window.RevistaDigital.state;
      const perimeter = (rdState && rdState.complexPerimeter) ? L.latLngBounds(rdState.complexPerimeter) : regionBounds;
      const navBounds = (rdState && rdState.complexBounds) ? L.latLngBounds(rdState.complexBounds) : (regionBounds ? regionBounds.pad(0.05) : null);
      if (perimeter && window.RevistaDigital && typeof window.RevistaDigital.setupComplexMapFraming === "function") {
        window.RevistaDigital.setupComplexMapFraming(map, L, { perimeter, navBounds });
      } else if (regionBounds) {
        map.setMinZoom(map.getBoundsZoom(regionBounds));
        map.setMaxZoom(18);
        map.fitBounds(regionBounds, { animate: false });
      } else {
        map.setView(hotels[0].coordinates, 13);
      }
      const position = state()?.currentPosition;
      if (position) {
        L.circleMarker([position.latitude, position.longitude], {
          radius: 7, color: "#fff", weight: 2, fillColor: "#0057b8", fillOpacity: 1
        }).addTo(map).bindPopup("Tu ubicación");
      }
      try {
        if (window.RevistaDigital.guiapa && typeof window.RevistaDigital.guiapa.bindMap === "function") {
          window.RevistaDigital.guiapa.bindMap(map);
        }
      } catch (e) {}
    }).catch((error) => console.warn("No se pudo cargar el mapa del complejo.", error));
  }
  function navigate(path) {
    const target = href(path);
    const isRestaurantRoute = path.startsWith("/restaurantes/");
    const restaurantReturnRoute = isRestaurantRoute
      ? (document.body.dataset.restaurantReturnRoute || getCurrentRoute())
      : null;
    if (restaurantReturnRoute) document.body.dataset.restaurantReturnRoute = restaurantReturnRoute;
    if (window.location.pathname !== target) history.pushState({ appRoute: path, restaurantReturnRoute }, "", target);
    handleRouteChange(path);
  }
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-app-route]");
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(link.dataset.appRoute || "/");
  });

  let portalZoneMarker = null;
  async function handleZoneClick(zone) {
    const panel = zone.closest(".hotel-zone-panel");
    if (panel) panel.querySelectorAll(".hotel-zone").forEach((button) => button.classList.toggle("is-active", button === zone));
    const label = zone.dataset.zone || "";
    const hotelName = zone.dataset.hotel || "";
    const status = panel?.querySelector("[data-zone-status]");
    if (status) {
      const nameElement = status.querySelector("[data-zone-name]");
      if (nameElement) nameElement.textContent = label;
      status.hidden = false;
    }
    const coordinates = zone.dataset.lat && zone.dataset.lng
      ? [parseFloat(zone.dataset.lat), parseFloat(zone.dataset.lng)]
      : null;
    const map = state()?.activeMap;
    const mapas = window.RevistaDigital.mapas;
    if (!coordinates || !map || !mapas?.loadLeaflet) return;
    try {
      const L = await mapas.loadLeaflet();
      if (!portalZoneMarker) {
        portalZoneMarker = L.marker(coordinates).addTo(map);
      } else {
        portalZoneMarker.setLatLng(coordinates);
      }
      portalZoneMarker.bindPopup(`<strong>${escapeHtml(label)}</strong><br><small>${escapeHtml(hotelName)}</small>`);
      portalZoneMarker.openPopup();
      map.setView(coordinates, Math.max(map.getZoom(), 16));
    } catch (error) {
      console.warn("No se pudo mostrar la zona en el mapa.", error);
    }
  }

  document.addEventListener("click", (event) => {
    if (event.target.closest(".portal-locate")) {
      window.requestCurrentLocation?.();
      return;
    }
    const directionsButton = event.target.closest(".portal-directions");
    if (directionsButton) {
      let name = directionsButton.dataset.directions || "";
      let coordinates = directionsButton.dataset.lat && directionsButton.dataset.lng
        ? [parseFloat(directionsButton.dataset.lat), parseFloat(directionsButton.dataset.lng)]
        : null;
      const rawList = directionsButton.dataset.directionsHotels;
      if (rawList) {
        try {
          const list = JSON.parse(rawList);
          if (Array.isArray(list) && list.length) {
            const position = state()?.currentPosition;
            let pick = list[0];
            if (position) {
              pick = list.reduce((best, item) => {
                const bestDistance = Math.abs(best[1] - position.latitude) + Math.abs(best[2] - position.longitude);
                const distance = Math.abs(item[1] - position.latitude) + Math.abs(item[2] - position.longitude);
                return distance < bestDistance ? item : best;
              }, list[0]);
            }
            name = pick[0];
            coordinates = [pick[1], pick[2]];
          }
        } catch (error) {
          console.warn("No se pudieron leer los destinos del mapa.", error);
        }
      }
      if (name || coordinates) window.RevistaDigital?.mapas?.openDirections?.(name, coordinates);
      return;
    }
    const gpdir = event.target.closest(".gp-dir");
    if (gpdir) {
      const lat = parseFloat(gpdir.dataset.lat);
      const lng = parseFloat(gpdir.dataset.lng);
      const nm = gpdir.dataset.name || "POI";
      if (!isNaN(lat) && !isNaN(lng)) {
        try { window.RevistaDigital?.mapas?.openDirections?.(nm, [lat, lng]); } catch (e) {}
      }
      return;
    }
    const zone = event.target.closest(".hotel-zone");
    if (zone) handleZoneClick(zone);
  });

  function scrollToAppHash(behavior) {
    const hash = window.location.hash;
    if (!hash || hash.length < 2) return;
    let targetId = hash.slice(1);
    try {
      targetId = decodeURIComponent(targetId);
    } catch {
      // Keep the raw id when the hash contains malformed percent escapes.
    }
    const target = document.getElementById(targetId);
    if (!target) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: behavior || (reduce ? "auto" : "smooth"), block: "start" });
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link || link.hasAttribute("data-app-route") || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const raw = (link.getAttribute("href") || "").trim();
    if (!raw || raw === "#" || raw.startsWith("#!")) return;
    let hash = "";
    if (raw.startsWith("#")) {
      hash = raw;
    } else {
      let resolved;
      try {
        resolved = new URL(link.href);
      } catch {
        return;
      }
      if (!resolved.hash || resolved.pathname !== window.location.pathname || resolved.search !== window.location.search) return;
      hash = resolved.hash;
    }
    event.preventDefault();
    let targetId = hash.slice(1);
    try {
      targetId = decodeURIComponent(targetId);
    } catch {
      // Keep the raw id when the hash contains malformed percent escapes.
    }
    if (!targetId || !document.getElementById(targetId)) return;
    const url = new URL(window.location.href);
    url.hash = hash;
    window.history.replaceState(window.history.state, "", url.href);
    scrollToAppHash();
  });

  function initializeRouteHandler() {
    window.addEventListener("popstate", (event) => {
      const route = getCurrentRoute();
      if (route.startsWith("/restaurantes/") && event.state?.restaurantReturnRoute) {
        document.body.dataset.restaurantReturnRoute = event.state.restaurantReturnRoute;
      }
      handleRouteChange(route);
    });
  }

  function restoreCurrentRoute() {
    handleRouteChange();
  }

  function handleRouteChange(route = getCurrentRoute()) {
      route = route.startsWith("/") ? route : `/${route}`;
      if (route === "/") {
        document.body.dataset.routeManaged = "true";
        document.body.dataset.appMode = "portal";
      }
      window.RevistaDigital.routeContext = getRouteContext(route);
      window.RevistaDigital.routeTarget = resolveRouteTarget(route);
      refreshCurrentAppContext(route);
      if (!route.startsWith("/restaurantes/")) delete document.body.dataset.restaurantReturnRoute;
      const legacyRouteAliases = {
        "/mapa-general": "/mapa-hoteles",
        "/mapa-mundi": "/mapa-hoteles",
        "/brasil/brasil": "/brasil/praia-do-forte",
        "/brasil/manaus": "/brasil/amazon",
        "/brasil/manaus/iberostar-heritage-grand-amazon": "/brasil/amazon/iberostar-heritage-grand-amazon",
        "/brasil/praia-do-forte/iberostar-waves-bahia": "/brasil/bahia/iberostar-waves-bahia",
        "/brasil/brasil/iberostar-waves-bahia": "/brasil/bahia/iberostar-waves-bahia",
        "/brasil/brasil/iberostar-heritage-grand-amazon": "/brasil/amazon/iberostar-heritage-grand-amazon",
        "/jamaica/rose-hall/joia-rose-hall-by-iberostar": "/jamaica/rose-hall/joia-rose-hall"
      };
      if (legacyRouteAliases[route]) {
        route = legacyRouteAliases[route];
        history.replaceState(history.state, "", href(route));
      }
      if (renderPortal(route)) {
        state().activeRestaurantMenuIndex = null;
        state().activeHotelDetail = null;
        state().returnPageIndex = null;
        const position = state()?.currentPosition;
        if (position && document.body.dataset.locationRequested === "true") {
          window.RevistaDigital.mapas?.renderLocationStatus?.(position);
        }
        if (window.location.hash) scrollToAppHash("auto");
        return;
      }
      document.body.dataset.routeManaged = "false";
      document.body.dataset.appMode = "legacy";
      const view = document.getElementById("appView");
      if (view) view.innerHTML = "";
      const hierarchicalParts = route.split("/").filter(Boolean);
      if (hierarchicalParts.length === 3 && getDestinationCatalog()[hierarchicalParts[0]]) {
        const [countrySlug, destinationSlug, hotelSlug] = hierarchicalParts;
        const countryDestinations = getDestinationCatalog()[countrySlug]?.destinations || [];
        let destination = countryDestinations.find((item) => item.slug === destinationSlug);
        let hotel = destination?.hotels.find((item) => item.slug === hotelSlug);
        if (!hotel) {
          const match = countryDestinations.map((item) => ({ destination: item, hotel: item.hotels.find((record) => record.slug === hotelSlug) })).find((item) => item.hotel);
          destination = match?.destination || destination;
          hotel = match?.hotel || null;
        }
        const targetIndex = hotel?.source === "page" ? hotel.pageIndex : -1;
        const menuDetail = hotel?.source === "menu"
          ? {
              countryKey: hotel.countryMenuKey,
              hotelIndex: hotel.hotelIndex,
              activeTab: "habitaciones",
              galleryIndex: 0,
              ...(hotel.tabOverrides ? { tabOverrides: hotel.tabOverrides } : {}),
              ...(hotel.aliasOf ? { displayName: hotel.name, tagline: hotel.tagline, description: hotel.description } : {})
            }
          : null;
        if (targetIndex >= 0 || menuDetail) {
          const canonicalRoute = destination && hotel ? `/${countrySlug}/${destination.slug}/${hotel.slug}` : "";
          if (canonicalRoute && canonicalRoute !== route) {
            history.replaceState(history.state, "", href(canonicalRoute));
            return handleRouteChange(canonicalRoute);
          }
          document.body.dataset.appMode = "hotel";
          document.body.dataset.routeManaged = "true";
          document.body.dataset.returnRoute = `/${countrySlug}/${destination.slug}`;
          state().activeRestaurantMenuIndex = null;
          state().activeHotelDetail = menuDetail;
          state().returnPageIndex = targetIndex >= 0 ? targetIndex : 0;
          state().currentIndex = targetIndex >= 0 ? targetIndex : 0;
          window.renderPage?.();
          return;
        }
      }
      const restaurantMenuMatch = route.match(/^\/restaurantes\/([^/]+)$/);
      const hotelMatch = route.match(/^\/hoteles\/([^/]+)\/([^/]+)$/);
      const countryMatch = route.match(/^\/hoteles\/([^/]+)$/);

      if (restaurantMenuMatch) {
        document.body.dataset.restaurantReturnRoute ||= "/";
        const targetIndex = state().pages?.findIndex((page) =>
          page.type === "hotel" && slugify(page.name) === restaurantMenuMatch[1]
        ) ?? -1;

        if (targetIndex >= 0) {
          state().activeRestaurantMenuIndex = targetIndex;
          state().activeHotelDetail = null;
          state().returnPageIndex = null;
          state().currentIndex = targetIndex;
          if (typeof window.renderPage === "function") {
            window.renderPage();
          }
          return;
        }

        const restaurantHotel = Object.values(getDestinationCatalog())
          .flatMap((country) => country.destinations)
          .flatMap((destination) => destination.hotels.map((hotel) => ({ hotel, destination })))
          .find(({ hotel }) => hotel.source === "menu" && (
            hotel.slug === restaurantMenuMatch[1] || slugify(hotel.name) === restaurantMenuMatch[1]
          ));

        if (restaurantHotel) {
          const { hotel, destination } = restaurantHotel;
          const restaurantReturnRoute = document.body.dataset.restaurantReturnRoute || "/";
          document.body.dataset.appMode = "hotel";
          document.body.dataset.routeManaged = "true";
          state().activeRestaurantMenuIndex = null;
          state().activeHotelDetail = {
            countryKey: hotel.countryMenuKey,
            hotelIndex: hotel.hotelIndex,
            activeTab: "restaurante",
            galleryIndex: 0,
            ...(hotel.aliasOf ? {
              displayName: hotel.name,
              tagline: hotel.tagline,
              description: hotel.description,
              ...(hotel.tabOverrides ? { tabOverrides: hotel.tabOverrides } : {})
            } : {})
          };
          state().returnPageIndex = 0;
          state().currentIndex = 0;
          document.body.dataset.returnRoute = restaurantReturnRoute !== "/"
            ? restaurantReturnRoute
            : `/${hotel.countryMenuKey}/${destination.slug}`;
          window.renderPage?.();
          return;
        }
      }

      if (hotelMatch) {
        const countryKey = hotelMatch[1];
        const hotelName = hotelMatch[2];
        const country = state().hotelCountryMenus?.[countryKey];
        const hotelIndex = country?.hotels?.findIndex((hotel) => slugify(hotel.name) === hotelName) ?? -1;

        if (country && hotelIndex >= 0) {
          const portalRoute = findHotelPortalRoute(country.hotels[hotelIndex].name);
          if (portalRoute) {
            history.replaceState(history.state, "", href(portalRoute));
            return handleRouteChange(portalRoute);
          }
          state().activeRestaurantMenuIndex = null;
          state().activeHotelDetail = { countryKey, hotelIndex, activeTab: "habitaciones", galleryIndex: 0 };
          state().returnPageIndex = state().pages?.findIndex((page) =>
            (page.type === "country-menu" && page.country === countryKey) ||
            (page.type === "hotel" && page.country === "mexico" && countryKey === "mexico")
          ) ?? 0;
          state().currentIndex = state().returnPageIndex >= 0 ? state().returnPageIndex : 0;
          if (typeof window.renderPage === "function") {
            window.renderPage();
          }
          return;
        }

        if (country) {
          const countryPageIndex = state().pages?.findIndex((page) =>
            (page.type === "country-menu" && page.country === countryKey) ||
            (page.type === "hotel" && page.country === "mexico" && countryKey === "mexico")
          ) ?? -1;

          if (countryPageIndex >= 0) {
            state().activeRestaurantMenuIndex = null;
            state().activeHotelDetail = null;
            state().returnPageIndex = null;
            state().currentIndex = countryPageIndex;
            if (typeof window.renderPage === "function") {
              window.renderPage();
            }
            return;
          }
        }
      }

      if (countryMatch) {
        const countryKey = countryMatch[1];
        const targetIndex = state().pages?.findIndex((page) =>
          (page.type === "country-menu" && page.country === countryKey) ||
          (page.type === "hotel" && page.country === "mexico" && countryKey === "mexico")
        ) ?? -1;

        if (targetIndex >= 0) {
          state().activeRestaurantMenuIndex = null;
          state().activeHotelDetail = null;
          state().returnPageIndex = null;
          state().currentIndex = targetIndex;
          if (typeof window.renderPage === "function") {
            window.renderPage();
          }
          return;
        }
      }

      const pageTypeByRoute = {
        "/complejo-playa-paraiso": "complex",
        "/mapa-hoteles": "mapamundi",
        "/workspace": "workspace",
        "/360": "media360",
        "/videos": "videos",
        "/guia-playa-paraiso": "guia"
      };
      const pageType = pageTypeByRoute[route];

      if (pageType) {
        const targetIndex = state().pages?.findIndex((page) => page.type === pageType) ?? -1;

        if (targetIndex >= 0) {
          state().activeRestaurantMenuIndex = null;
          state().activeHotelDetail = null;
          state().returnPageIndex = null;
          state().currentIndex = targetIndex;
          if (typeof window.renderPage === "function") {
            window.renderPage();
          }
          return;
        }
      }

      state().activeRestaurantMenuIndex = null;
      state().activeHotelDetail = null;
      state().returnPageIndex = null;
      state().currentIndex = 0;
      if (typeof window.renderPage === "function") {
        window.renderPage();
      }
  }

  routes.slugify = slugify;
  routes.syncBookRoute = syncBookRoute;
  routes.resolveInitialRoute = resolveInitialRoute;
  routes.initializeRouteHandler = initializeRouteHandler;
  routes.restoreCurrentRoute = restoreCurrentRoute;
  routes.navigate = navigate;
  routes.renderPortal = renderPortal;
  routes.renderHotelPortal = renderHotelPortal;
  routes.findHotelPortalRoute = findHotelPortalRoute;
  routes.getRouteContext = getRouteContext;
  routes.resolveRouteTarget = resolveRouteTarget;
  routes.refreshCurrentAppContext = refreshCurrentAppContext;
  routes.getBreadcrumbs = getBreadcrumbs;
  routes.computeTopNavState = computeTopNavState;
  routes.getCurrentLabel = function (pathname = window.location.pathname) {
    return computeTopNavState(pathname).label || "Inicio";
  };

  window.slugify = window.slugify || slugify;
  window.syncBookRoute = window.syncBookRoute || syncBookRoute;
  window.resolveInitialRoute = window.resolveInitialRoute || resolveInitialRoute;
  window.RevistaDigital.routes = routes;
  window.RevistaDigital.routeContext = getRouteContext();
  window.RevistaDigital.routeTarget = resolveRouteTarget();
  refreshCurrentAppContext();
  window.RevistaDigital.breadcrumbs = getBreadcrumbs();
  window.RevistaDigital.topNav = computeTopNavState();

  if (document.readyState !== "loading") {
    initializeRouteHandler();
  } else {
    document.addEventListener("DOMContentLoaded", initializeRouteHandler);
  }
})();
