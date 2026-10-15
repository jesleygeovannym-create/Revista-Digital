(function () {
  window.RevistaDigital = window.RevistaDigital || {};
  const hoteles = window.RevistaDigital.hoteles || {};
  const state = () => window.RevistaDigital.state;

  function getHotelMedia(pageName) {
    return (
      state().hotelMediaCatalog?.[pageName] || {
        banner: ["src/JOIA2.jpg"],
        habitaciones: [],
        piscinas: [],
        restaurante: []
      }
    );
  }

  function getSectionName(key) {
    const labels = {
      habitaciones: "Habitaciones",
      restaurante: "Restaurantes",
      piscinas: "Piscinas"
    };

    return labels[key] || "Experiencias";
  }

  function renderHotelSectionPanel(pageName, sectionKey) {
    const panelId = `hotel-panel-${window.slugify ? window.slugify(pageName) : pageName}`;
    const panel = document.getElementById(panelId);
    const media = getHotelMedia(pageName)[sectionKey] || [];
    const title = getSectionName(sectionKey);

    if (!panel) return;

    panel.innerHTML = `
      <div class="hotel-panel-header">
        <span>${pageName}</span>
        <h3>${title}</h3>
        <button type="button" class="hotel-panel-close" data-close-panel="${panelId}">×</button>
      </div>

      <div class="hotel-panel-grid">
        ${media.length ? media.map((image) => `
          <figure class="hotel-panel-item">
            <img src="${image}" alt="${title} de ${pageName}" loading="lazy" decoding="async" />
          </figure>
        `).join("") : `
          <div class="hotel-panel-empty">
            No hay imágenes disponibles para ${title.toLowerCase()} en este hotel.
          </div>
        `}
      </div>
    `;

    panel.classList.add("visible");
    panel.querySelector(".hotel-panel-close")?.addEventListener("click", () => {
      panel.classList.remove("visible");
    });
  }

  function initializeHotelCarousel(root) {
    const slides = [...root.querySelectorAll(".hotel-carousel-slide")];
    const indicators = [...root.querySelectorAll(".hotel-carousel-indicator")];
    const prev = root.querySelector(".hotel-carousel-prev");
    const next = root.querySelector(".hotel-carousel-next");

    if (!slides.length) return;

    let currentSlide = 0;
    let autoTimer = null;
    let touchStartX = 0;

    const showSlide = (index) => {
      currentSlide = (index + slides.length) % slides.length;

      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("active", slideIndex === currentSlide);
      });

      indicators.forEach((indicator, indicatorIndex) => {
        indicator.classList.toggle("active", indicatorIndex === currentSlide);
        indicator.setAttribute("aria-selected", String(indicatorIndex === currentSlide));
      });
    };

    const restartAutoPlay = () => {
      if (autoTimer) clearInterval(autoTimer);
      autoTimer = setInterval(() => {
        showSlide(currentSlide + 1);
      }, 4500);
    };

    prev?.addEventListener("click", () => {
      showSlide(currentSlide - 1);
      restartAutoPlay();
    });

    next?.addEventListener("click", () => {
      showSlide(currentSlide + 1);
      restartAutoPlay();
    });

    indicators.forEach((indicator) => {
      indicator.addEventListener("click", () => {
        showSlide(Number(indicator.dataset.slideIndex));
        restartAutoPlay();
      });
    });

    root.addEventListener("touchstart", (event) => {
      touchStartX = event.touches[0].clientX;
    }, { passive: true });

    root.addEventListener("touchend", (event) => {
      const deltaX = event.changedTouches[0].clientX - touchStartX;

      if (Math.abs(deltaX) > 50) {
        showSlide(currentSlide + (deltaX < 0 ? 1 : -1));
        restartAutoPlay();
      }
    }, { passive: true });

    root.addEventListener("mouseenter", () => clearInterval(autoTimer));
    root.addEventListener("mouseleave", restartAutoPlay);

    showSlide(0);
    restartAutoPlay();
  }

  const destinationDefinitions = {
    mexico: {
      name: "México", image: "src/paraiso-del-mar/banner/ParaisoDelMar.jpg", destinations: [
        { slug: "riviera-maya", name: "Riviera Maya", description: "Un refugio frente al Caribe mexicano.", image: "src/paraiso-del-mar/banner/ParaisoDelMar.jpg", complex: true, pageHotels: true, hotels: [
          { slug: "iberostar-waves-quetzal", name: "Iberostar Waves Quetzal", image: "src/official-hotels/waves-quetzal.jpg", tagline: "Frente al mar y cuatro piscinas en Playacar", description: "Hotel todo incluido frente al mar en Playacar, Playa del Carmen, con acceso directo a la playa, cuatro piscinas, cinco restaurantes de especialidad, spa y programas para familias. Comparte complejo con Iberostar Waves Tucán." },
          { slug: "iberostar-waves-tucan", name: "Iberostar Waves Tucán", image: "src/official-hotels/waves-tucan.jpg", tagline: "Todo incluido frente al mar en Playacar", description: "Hotel todo incluido en Playacar, Playa del Carmen, con cinco restaurantes de especialidad, tres buffets, spa, deportes acuáticos y actividades para toda la familia. Comparte complejo con Iberostar Waves Quetzal." }
        ], detectionArea: { center: [20.62, -87.08], radiusMeters: 65000 } },
        { slug: "cancun", name: "Cancún", description: "Playas turquesa y hospitalidad junto al mar.", image: "src/paraiso-lindo/banner/ParaisoLindo.jpg", imageHotel: "Iberostar Selection Cancún", hotelTerms: ["cancun"], hotelAliases: [{ name: "Iberostar Selection Coral Cancún", slug: "iberostar-selection-coral-cancun", aliasOf: "Iberostar Selection Cancún", tagline: "Exclusivo para adultos", description: "Sección solo para adultos dentro del complejo Selection Cancún, con piscina privada, atención de mayordomo y acceso a las instalaciones del resort." }], detectionArea: { center: [21.1743, -86.8466], radiusMeters: 40000 } },
        { slug: "cozumel", name: "Cozumel", description: "Naturaleza tropical y experiencias sobre el agua.", image: "src/paraiso-del-mar/banner/ParaisoDelMar.jpg", imageHotel: "Iberostar Waves Cozumel", hotelTerms: ["cozumel"], detectionArea: { center: [20.42, -86.92], radiusMeters: 30000 } },
        { slug: "playa-mita", name: "Playa Mita", description: "El Pacífico mexicano, a tu ritmo.", image: "src/paraiso-JOIA/banner/JOIA2.jpg", imageHotel: "Iberostar Selection Playa Mita", hotelTerms: ["playa-mita"], detectionArea: { center: [20.77, -105.53], radiusMeters: 25000 } }
      ]
    },
    jamaica: {
      name: "Jamaica", image: "src/JOIA2.jpg", imageHotel: "JOIA Rose Hall by Iberostar", destinations: [
        { slug: "rose-hall", name: "Rose Hall", description: "Descubre la costa y el carácter de Jamaica.", image: "src/JOIA2.jpg", imageHotel: "JOIA Rose Hall by Iberostar", detectionArea: { center: [18.52, -77.82], radiusMeters: 20000 } }
      ]
    },
    "republica-dominicana": {
      name: "República Dominicana", image: "src/ParaisoDelMar 1.png", imageHotel: "Iberostar Selection Bávaro Suites", destinations: [
        { slug: "punta-cana", name: "Punta Cana", description: "Playas amplias y paisajes tropicales.", image: "src/ParaisoDelMar 1.png", imageHotel: "Iberostar Selection Bávaro Suites", detectionArea: { center: [18.5818, -68.4043], radiusMeters: 30000 } }
      ]
    },
    brasil: {
      name: "Brasil", image: "src/paraisoBeach1.jpg", imageHotel: "Iberostar Selection Praia do Forte", destinations: [
        { slug: "praia-do-forte", name: "Praia do Forte", description: "Resorts junto a la costa de Bahía y a una reserva marina.", image: "src/paraiso-del-mar/banner/ParaisoDelMar.jpg", imageHotel: "Iberostar Selection Praia do Forte", hotelTerms: ["praia-do-forte"], detectionArea: { center: [-12.57, -37.99], radiusMeters: 20000 } },
        { slug: "bahia", name: "Bahía", description: "Descubre la costa de Bahía y la hospitalidad de Iberostar Waves Bahia.", image: "src/paraisoBeach1.jpg", imageHotel: "Iberostar Waves Bahia", hotelTerms: ["waves-bahia"], detectionArea: { center: [-12.55, -38.00], radiusMeters: 20000 } },
        { slug: "amazon", name: "Amazonas", description: "Una experiencia fluvial con itinerarios cambiantes por el río Amazonas.", image: "src/JOIA2.jpg", imageHotel: "Iberostar Heritage Grand Amazon", hotelTerms: ["heritage-grand-amazon"], mapCenter: [-3.13417, -60.02944], mapLabel: "Puerto de Manaus · embarque del crucero", mapNotice: "El crucero parte del Puerto de Manaus. Su ubicación cambia con el itinerario.", detectionArea: { center: [-3.13417, -60.02944], radiusMeters: 5000 } }
      ]
    }
  };

  const hotelSlugOverrides = {
    "JOIA Rose Hall by Iberostar": "joia-rose-hall"
  };

  function getHotelSlug(name, slugify) {
    return hotelSlugOverrides[name] || slugify(name);
  }

  function getDestinationCatalog() {
    const data = state() || {};
    const slugify = window.slugify || ((value = "") => String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));

    return Object.fromEntries(Object.entries(destinationDefinitions).map(([countrySlug, country]) => {
      const menu = data.hotelCountryMenus?.[countrySlug];
      const destinations = country.destinations.map((destination) => {
        const pageHotels = destination.pageHotels ? getHotelNamesFromPages(data.pages, slugify) : [];
        const catalogHotels = (destination.hotels || []).map((hotel) => ({ ...hotel, source: "catalog" }));
        const hotels = destination.pageHotels
          ? [...pageHotels, ...catalogHotels]
          : (menu?.hotels || []).map((hotel, hotelIndex) => ({
              slug: getHotelSlug(hotel.name, slugify),
              name: hotel.name,
              image: hotel.image,
              description: hotel.description,
              tagline: hotel.tagline,
              source: "menu",
              hotelIndex,
              countryMenuKey: countrySlug
            })).filter((hotel) => !destination.hotelTerms?.length || destination.hotelTerms.some((term) => slugify(hotel.name).includes(term)));
        const aliases = (destination.hotelAliases || []).flatMap((alias) => {
          const sourceHotel = hotels.find((hotel) => hotel.name === alias.aliasOf);
          return sourceHotel ? [{
            ...sourceHotel,
            ...alias,
            tabOverrides: window.RevistaDigital.hotelContent?.[alias.name]?.tabs || null,
            source: sourceHotel.source,
            hotelIndex: sourceHotel.hotelIndex,
            countryMenuKey: sourceHotel.countryMenuKey
          }] : [];
        });
        const destinationHotels = [...hotels, ...aliases].map((hotel) => {
          const coordinates = data.hotelCoordinates?.[hotel.name];
          return {
            ...hotel,
            countrySlug,
            countryName: country.name,
            destinationSlug: destination.slug,
            destinationName: destination.name,
            latitude: coordinates?.[0] ?? null,
            longitude: coordinates?.[1] ?? null,
            detectionRadiusMeters: data.hotelDetectionRadii?.[hotel.name] ?? data.locationDetectionRadiusMeters ?? 1500
          };
        });

        return {
          ...destination,
          image: data.hotelCoverImages?.[destination.imageHotel] || destination.image,
          hotels: destinationHotels
        };
      });
      return [countrySlug, {
        ...country,
        image: data.hotelCoverImages?.[country.imageHotel] || country.image,
        destinations
      }];
    }));
  }

  function getNormalizedCatalog() {
    const catalog = getDestinationCatalog();
    const countries = Object.entries(catalog).map(([countrySlug, country]) => ({
      slug: countrySlug,
      name: country.name,
      image: country.image,
      destinations: (country.destinations || []).map((destination) => ({
        slug: destination.slug,
        name: destination.name,
        image: destination.image,
        description: destination.description || "",
        countrySlug,
        countryName: country.name,
        hotels: (destination.hotels || []).map((hotel) => ({
          slug: hotel.slug,
          name: hotel.name,
          countrySlug,
          countryName: country.name,
          destinationSlug: destination.slug,
          destinationName: destination.name,
          latitude: hotel.latitude ?? null,
          longitude: hotel.longitude ?? null,
          detectionRadiusMeters: hotel.detectionRadiusMeters ?? 1500,
          image: hotel.image || destination.image || country.image,
          description: hotel.description || destination.description || "",
          tagline: hotel.tagline || "",
          source: hotel.source || "catalog"
        }))
      }))
    }));

    const normalized = {
      countries,
      byCountry: Object.fromEntries(countries.map((country) => [country.slug, country])),
      byCountryDestination: Object.fromEntries(
        countries.flatMap((country) => country.destinations.map((destination) => [
          `${country.slug}/${destination.slug}`,
          destination
        ]))
      )
    };

    normalized.routeIndex = countries.flatMap((country) => [
      { type: "country", slug: country.slug, name: country.name, route: `/${country.slug}` },
      ...country.destinations.map((destination) => ({
        type: "destination",
        slug: destination.slug,
        name: destination.name,
        route: `/${country.slug}/${destination.slug}`,
        countrySlug: country.slug
      })),
      ...country.destinations.flatMap((destination) => (destination.hotels || []).map((hotel) => ({
        type: "hotel",
        slug: hotel.slug,
        name: hotel.name,
        route: `/${country.slug}/${destination.slug}/${hotel.slug}`,
        countrySlug: country.slug,
        destinationSlug: destination.slug
      })))
    ]);

    return normalized;
  }

  function getHotelNamesFromPages(pages = [], slugify) {
    return (pages || []).map((page, pageIndex) => page?.type === "hotel" ? {
      slug: getHotelSlug(page.name, slugify),
      name: page.name,
      image: page.image,
      description: page.intro,
      source: "page",
      pageIndex,
      countryMenuKey: "mexico"
    } : null).filter(Boolean);
  }

  hoteles.getPageHotels = function () {
    return Array.isArray(state().pages)
      ? state().pages.filter((page) => page && page.type === "hotel")
      : [];
  };

  hoteles.getHotelNames = function () {
    if (typeof window.getHotelNames === "function") {
      return window.getHotelNames();
    }
    return hoteles.getPageHotels().map((page) => page.name);
  };

  hoteles.getCountryMenus = function () {
    return typeof state().hotelCountryMenus === "object" ? state().hotelCountryMenus : {};
  };

  hoteles.getDestinationCatalog = getDestinationCatalog;
  hoteles.getNormalizedCatalog = getNormalizedCatalog;
  hoteles.getRouteIndex = function () {
    return getNormalizedCatalog().routeIndex || [];
  };
  window.RevistaDigital.catalog = getNormalizedCatalog();
  window.RevistaDigital.routeIndex = window.RevistaDigital.routeIndex || window.RevistaDigital.catalog.routeIndex || [];

  hoteles.getMedia = function (pageName) {
    return getHotelMedia(pageName);
  };

  hoteles.getSectionName = getSectionName;
  hoteles.renderHotelSectionPanel = renderHotelSectionPanel;
  hoteles.initializeHotelCarousel = initializeHotelCarousel;
  hoteles.getAll = function () {
    return hoteles.getPageHotels();
  };

  window.getHotelMedia = window.getHotelMedia || getHotelMedia;
  window.getSectionName = window.getSectionName || getSectionName;
  window.renderHotelSectionPanel = window.renderHotelSectionPanel || renderHotelSectionPanel;
  window.initializeHotelCarousel = window.initializeHotelCarousel || initializeHotelCarousel;
  window.RevistaDigital.hoteles = hoteles;
})();
