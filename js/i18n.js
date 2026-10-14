(function () {
  window.RevistaDigital = window.RevistaDigital || {};

  const translations = {
    es: {
      siteTitle: "Iberostar | Destinos y hoteles",
      brandDestinations: "Destinos",
      navMexico: "México",
      navJamaica: "Jamaica",
      navDominican: "República Dominicana",
      navBrazil: "Brasil",
      navLocation: "Usar mi ubicación",
      navExplore: "Explorar",
      navSearch: "Buscar",
      
      menuWorldMap: "Mapamundi",
      menuWorldMapD3: "Planisferio Interactivo (D3)",
      menuHotelsMap: "Mapa general de hoteles",
      menuComplexMap: "Mapa del complejo Playa Paraíso",
      menuWorkspace: "Workspace",
      menuVideos: "Videos",
      menu360: "Contenido 360°",
      menuRestaurants: "Restaurantes",
      menuComplex: "Iberostar Playa Paraíso",
      menuGuia: "Guía interactiva",

      prevPage: "Página anterior",
      nextPage: "Página siguiente",
      home: "Inicio",
      viewHotel: "Ver ficha",
      viewDetails: "Ver detalles",
      back: "Volver",
      close: "Cerrar",
      searchPlaceholder: "Buscar por hotel, destino, categoría...",
      allFilters: "Todos",
      resultsCount: "hoteles encontrados",
      noResults: "No se encontraron hoteles con esa búsqueda.",
      exploreSection: "Explora las secciones y amenidades",
      rooms: "Habitaciones",
      pools: "Piscinas",
      restaurants: "Restaurantes",
      experiences: "Experiencias",
      locationStatusInitial: "Usa “Usar mi ubicación” para encontrar el hotel cercano o calcular una ruta.",
      d3WorldMapNotice: "Explora la distribución global de la cadena Iberostar en nuestro mapa mundial interactivo.",
      openD3WorldMap: "Abrir Planisferio Interactivo",
      searchHotelsHeading: "Explorar catálogo de hoteles",
      searchFilterBrand: "Filtrar por marca",
      searchFilterCountry: "Filtrar por país"
    },
    en: {
      siteTitle: "Iberostar | Destinations & Hotels",
      brandDestinations: "Destinations",
      navMexico: "Mexico",
      navJamaica: "Jamaica",
      navDominican: "Dominican Republic",
      navBrazil: "Brazil",
      navLocation: "Use my location",
      navExplore: "Explore",
      navSearch: "Search",

      menuWorldMap: "World Map",
      menuWorldMapD3: "Interactive World Map (D3)",
      menuHotelsMap: "General Hotels Map",
      menuComplexMap: "Playa Paraíso Complex Map",
      menuWorkspace: "Workspace",
      menuVideos: "Videos",
      menu360: "360° Tours",
      menuRestaurants: "Restaurants",
      menuComplex: "Iberostar Playa Paraíso",
      menuGuia: "Interactive guide",

      prevPage: "Previous page",
      nextPage: "Next page",
      home: "Home",
      viewHotel: "View hotel",
      viewDetails: "View details",
      back: "Back",
      close: "Close",
      searchPlaceholder: "Search by hotel, destination, category...",
      allFilters: "All",
      resultsCount: "hotels found",
      noResults: "No hotels found matching your search.",
      exploreSection: "Explore sections and amenities",
      rooms: "Rooms",
      pools: "Pools",
      restaurants: "Restaurants",
      experiences: "Experiences",
      locationStatusInitial: "Use “Use my location” to find nearby hotels or calculate a route.",
      d3WorldMapNotice: "Explore the global footprint of Iberostar Hotels on our interactive world map.",
      openD3WorldMap: "Open Interactive World Map",
      searchHotelsHeading: "Explore hotel catalog",
      searchFilterBrand: "Filter by brand",
      searchFilterCountry: "Filter by country"
    }
  };

  let currentLang = localStorage.getItem("revista_lang") || "es";
  if (!translations[currentLang]) currentLang = "es";

  function t(key, defaultVal = "") {
    return translations[currentLang]?.[key] || defaultVal || key;
  }

  function getLang() {
    return currentLang;
  }

  function applyTranslations() {
    document.documentElement.lang = currentLang;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const text = t(key);
      if (text) {
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          el.placeholder = text;
        } else {
          el.textContent = text;
        }
      }
    });

    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      const key = el.getAttribute("data-i18n-aria");
      const text = t(key);
      if (text) el.setAttribute("aria-label", text);
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      const text = t(key);
      if (text) el.placeholder = text;
    });

    const langToggleBtn = document.getElementById("langToggleBtn");
    if (langToggleBtn) {
      langToggleBtn.textContent = currentLang === "es" ? "🌐 EN" : "🌐 ES";
      langToggleBtn.setAttribute("title", currentLang === "es" ? "Switch to English" : "Cambiar a Español");
    }

    window.dispatchEvent(new CustomEvent("languagechange", { detail: { lang: currentLang } }));
  }

  function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem("revista_lang", lang);
    applyTranslations();
  }

  function toggleLanguage() {
    setLanguage(currentLang === "es" ? "en" : "es");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyTranslations);
  } else {
    applyTranslations();
  }

  window.RevistaDigital.i18n = {
    t,
    getLang,
    setLanguage,
    toggleLanguage,
    applyTranslations,
    translations
  };
})();

