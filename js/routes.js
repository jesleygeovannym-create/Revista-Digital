(function () {
  window.RevistaDigital = window.RevistaDigital || {};
  const routes = window.RevistaDigital.routes || {};
  const state = () => window.RevistaDigital.state;

  function slugify(value = "") {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "hotel";
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
    } else if (page?.type === "map") {
      nextPath = "/mapa-general";
    } else if (page?.type === "mapamundi") {
      nextPath = "/mapa-mundi";
    } else if (page?.type === "workspace") {
      nextPath = "/workspace";
    } else if (page?.type === "media360") {
      nextPath = "/360";
    } else if (page?.type === "videos") {
      nextPath = "/videos";
    }

    const currentPath = window.location.pathname || "/";
    if (currentPath !== nextPath) {
      window.history.pushState(
        {
          currentIndex: state().currentIndex,
          activeHotelDetail: state().activeHotelDetail,
          returnPageIndex: state().returnPageIndex,
          activeRestaurantMenuIndex: state().activeRestaurantMenuIndex
        },
        "",
        nextPath
      );
    }
  }

  function resolveInitialRoute() {
    const route = (window.location.pathname || "/").replace(/\/+$/, "") || "/";
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
    return (window.location.pathname || "/").replace(/\/+$/, "") || "/";
  }

  function initializeRouteHandler() {
    window.addEventListener("popstate", () => handleRouteChange());
  }

  function restoreCurrentRoute() {
    handleRouteChange();
  }

  function handleRouteChange(route = getCurrentRoute()) {
      const restaurantMenuMatch = route.match(/^\/restaurantes\/([^/]+)$/);
      const hotelMatch = route.match(/^\/hoteles\/([^/]+)\/([^/]+)$/);
      const countryMatch = route.match(/^\/hoteles\/([^/]+)$/);

      if (restaurantMenuMatch) {
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
      }

      if (hotelMatch) {
        const countryKey = hotelMatch[1];
        const hotelName = hotelMatch[2];
        const country = state().hotelCountryMenus?.[countryKey];
        const hotelIndex = country?.hotels?.findIndex((hotel) => slugify(hotel.name) === hotelName) ?? -1;

        if (country && hotelIndex >= 0) {
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
        "/mapa-general": "map",
        "/mapa-mundi": "mapamundi",
        "/workspace": "workspace",
        "/360": "media360",
        "/videos": "videos"
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

  window.slugify = window.slugify || slugify;
  window.syncBookRoute = window.syncBookRoute || syncBookRoute;
  window.resolveInitialRoute = window.resolveInitialRoute || resolveInitialRoute;
  window.RevistaDigital.routes = routes;

  if (document.readyState !== "loading") {
    initializeRouteHandler();
  } else {
    document.addEventListener("DOMContentLoaded", initializeRouteHandler);
  }
})();
