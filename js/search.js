(function () {
  window.RevistaDigital = window.RevistaDigital || {};

  const search = {};

  const allHotelsData = [
    // Complejo Playa Paraíso
    {
      name: "Iberostar Paraíso del Mar",
      country: "México",
      countryKey: "mexico",
      destination: "Riviera Maya",
      brand: "Waves",
      image: "src/ParaisoDelMar 1.png",
      tagline: "Caribe tradicional y exuberante",
      description: "Arquitectura colonial, jardines tropicales y una de las piscinas más espectaculares de Riviera Maya.",
      route: "/mexico/riviera-maya/iberostar-paraiso-del-mar"
    },
    {
      name: "Iberostar Paraíso Maya",
      country: "México",
      countryKey: "mexico",
      destination: "Riviera Maya",
      brand: "Selection",
      image: "src/paraisoMaya 1.png",
      tagline: "Homenaje a la cultura maya",
      description: "Esculturas monumentales, parque acuático, piscina de olas y gastronomía de autor frente al Caribe.",
      route: "/mexico/riviera-maya/iberostar-paraiso-maya"
    },
    {
      name: "Iberostar Paraíso Lindo",
      country: "México",
      countryKey: "mexico",
      destination: "Riviera Maya",
      brand: "Selection",
      image: "src/ParaisoLindo1.png",
      tagline: "Diversión familiar y río lento",
      description: "Parque acuático, río lento, piscina de olas y spa para unas vacaciones inolvidables en familia.",
      route: "/mexico/riviera-maya/iberostar-paraiso-lindo"
    },
    {
      name: "Iberostar Paraíso Beach",
      country: "México",
      countryKey: "mexico",
      destination: "Riviera Maya",
      brand: "Waves",
      image: "src/paraisoBeach1.jpg",
      tagline: "Playa caribeña y descanso",
      description: "Acceso directo a la playa de arena blanca, gastronomía internacional y actividades acuáticas.",
      route: "/mexico/riviera-maya/iberostar-paraiso-beach"
    },
    {
      name: "Iberostar Paraíso JOIA",
      country: "México",
      countryKey: "mexico",
      destination: "Riviera Maya",
      brand: "JOIA",
      image: "src/JOIA2.jpg",
      tagline: "Lujo solo adultos y servicio de mayordomo",
      description: "Suites de máxima categoría, alta gastronomía, spa de clase mundial y campo de golf profesional.",
      route: "/mexico/riviera-maya/iberostar-paraiso-joia"
    },
    {
      name: "Iberostar Waves Tucán",
      country: "México",
      countryKey: "mexico",
      destination: "Riviera Maya",
      brand: "Waves",
      image: "https://apiimg.iberostar.com/uploads/image/89213/crops/16:9/1920/image.jpeg",
      tagline: "Todo incluido frente al mar en Playacar",
      description: "Hotel todo incluido en Playacar, Playa del Carmen, con cinco restaurantes de especialidad, tres buffets, spa y deportes acuáticos.",
      route: "/mexico/riviera-maya/iberostar-waves-tucan"
    },
    {
      name: "Iberostar Waves Quetzal",
      country: "México",
      countryKey: "mexico",
      destination: "Riviera Maya",
      brand: "Waves",
      image: "https://apiimg.iberostar.com/uploads/image/89293/crops/16:9/1920/image.jpeg",
      tagline: "Frente al mar y cuatro piscinas en Playacar",
      description: "Hotel todo incluido frente al mar en Playacar, Playa del Carmen, con acceso directo a la playa, cuatro piscinas y cinco restaurantes de especialidad.",
      route: "/mexico/riviera-maya/iberostar-waves-quetzal"
    },

    // México otros
    {
      name: "Iberostar Selection Playa Mita",
      country: "México",
      countryKey: "mexico",
      destination: "Playa Mita",
      brand: "Selection",
      image: "src/official-hotels/selection-playa-mita.jpg",
      tagline: "Pacífico, naturaleza y cultura huichol",
      description: "Resort en Riviera Nayarit con playa semiprivada, tres piscinas, campo de golf y deportes acuáticos.",
      route: "/hoteles/mexico/iberostar-selection-playa-mita",
      countryMenuKey: "mexico",
      hotelIndex: 0
    },
    {
      name: "Iberostar Waves Cozumel",
      country: "México",
      countryKey: "mexico",
      destination: "Cozumel",
      brand: "Waves",
      image: "src/official-hotels/waves-cozumel.jpg",
      tagline: "Bungalows tropicales frente al arrecife",
      description: "Bungalows con terraza junto a los arrecifes de Cozumel, ideal para buceo PADI y snorkel.",
      route: "/hoteles/mexico/iberostar-waves-cozumel",
      countryMenuKey: "mexico",
      hotelIndex: 1
    },
    {
      name: "Iberostar Selection Cancún",
      country: "México",
      countryKey: "mexico",
      destination: "Cancún",
      brand: "Selection",
      image: "src/official-hotels/selection-cancun.jpg",
      tagline: "Villas frente al mar turquesa",
      description: "Playa Delfines, diez piscinas, campo de golf propio, spa y restaurantes de alta cocina.",
      route: "/hoteles/mexico/iberostar-selection-cancun",
      countryMenuKey: "mexico",
      hotelIndex: 2
    },
    {
      name: "Iberostar Selection Coral Cancún",
      country: "México",
      countryKey: "mexico",
      destination: "Cancún",
      brand: "Selection",
      image: "src/official-hotels/selection-cancun.jpg",
      tagline: "Sección exclusiva solo adultos",
      description: "Área exclusiva para adultos dentro de Selection Cancún con piscina privada y servicio premium.",
      route: "/mexico/cancun/iberostar-selection-coral-cancun"
    },

    // Jamaica
    {
      name: "JOIA Rose Hall by Iberostar",
      country: "Jamaica",
      countryKey: "jamaica",
      destination: "Rose Hall",
      brand: "JOIA",
      image: "src/official-hotels/joia-rose-hall.jpg",
      tagline: "Lujo solo adultos y servicio personalizado",
      description: "Resort frente al mar caribeño con mayordomo, spa y gastronomía refinada en Montego Bay.",
      route: "/hoteles/jamaica/joia-rose-hall-by-iberostar",
      countryMenuKey: "jamaica",
      hotelIndex: 0
    },
    {
      name: "Iberostar Selection Rose Hall Suites",
      country: "Jamaica",
      countryKey: "jamaica",
      destination: "Rose Hall",
      brand: "Selection",
      image: "src/official-hotels/selection-rose-hall-suites.jpg",
      tagline: "Suites para toda la familia",
      description: "Parque acuático infantil, río lento, playa tranquila y múltiples restaurantes temáticos.",
      route: "/hoteles/jamaica/iberostar-selection-rose-hall-suites",
      countryMenuKey: "jamaica",
      hotelIndex: 1
    },
    {
      name: "Coral Level at Iberostar Selection Rose Hall Suites",
      country: "Jamaica",
      countryKey: "jamaica",
      destination: "Rose Hall",
      brand: "Selection",
      image: "src/official-hotels/selection-rose-hall-suites.jpg",
      tagline: "Espacio exclusivo dentro del resort",
      description: "Habitaciones premium con comodidades VIP, playa reservada y acceso completo al complejo.",
      route: "/hoteles/jamaica/coral-level-at-iberostar-selection-rose-hall-suites",
      countryMenuKey: "jamaica",
      hotelIndex: 2
    },
    {
      name: "Iberostar Waves Rose Hall Beach",
      country: "Jamaica",
      countryKey: "jamaica",
      destination: "Rose Hall",
      brand: "Waves",
      image: "src/official-hotels/waves-rose-hall-beach.jpg",
      tagline: "Ambiente caribeño y descanso",
      description: "Piscinas infinitas frente al mar, actividades para todas las edades y cocina jamaicana.",
      route: "/hoteles/jamaica/iberostar-waves-rose-hall-beach",
      countryMenuKey: "jamaica",
      hotelIndex: 3
    },

    // República Dominicana
    {
      name: "Iberostar Selection Bávaro Suites",
      country: "República Dominicana",
      countryKey: "republica-dominicana",
      destination: "Punta Cana",
      brand: "Selection",
      image: "src/official-hotels/selection-bavaro-suites.jpg",
      tagline: "Villas caribeñas en Playa Bávaro",
      description: "Jardines tropicales, campo de golf de 18 hoyos, spa y club infantil Star Camp.",
      route: "/hoteles/republica-dominicana/iberostar-selection-bavaro-suites",
      countryMenuKey: "republica-dominicana",
      hotelIndex: 0
    },
    {
      name: "JOIA Bávaro by Iberostar",
      country: "República Dominicana",
      countryKey: "republica-dominicana",
      destination: "Punta Cana",
      brand: "JOIA",
      image: "src/official-hotels/joia-bavaro.jpg",
      tagline: "Gran lujo y alta gastronomía solo adultos",
      description: "Suites de ensueño, servicio de mayordomo, playa privada y restaurantes a la carta.",
      route: "/hoteles/republica-dominicana/joia-bavaro-by-iberostar",
      countryMenuKey: "republica-dominicana",
      hotelIndex: 1
    },
    {
      name: "Iberostar Waves Punta Cana",
      country: "República Dominicana",
      countryKey: "republica-dominicana",
      destination: "Punta Cana",
      brand: "Waves",
      image: "src/official-hotels/waves-punta-cana.jpg",
      tagline: "Diversión familiar y deportes acuáticos",
      description: "Playa Bávaro, piscinas familiares, espectáculos en vivo y spa frente al océano.",
      route: "/hoteles/republica-dominicana/iberostar-waves-punta-cana",
      countryMenuKey: "republica-dominicana",
      hotelIndex: 2
    },
    {
      name: "Iberostar Waves Dominicana",
      country: "República Dominicana",
      countryKey: "republica-dominicana",
      destination: "Punta Cana",
      brand: "Waves",
      image: "src/official-hotels/waves-dominicana.jpg",
      tagline: "Vacaciones tropicales en primera línea de playa",
      description: "Ambiente caribeño, variada gastronomía buffet y temática, y entretenimiento continuo.",
      route: "/hoteles/republica-dominicana/iberostar-waves-dominicana",
      countryMenuKey: "republica-dominicana",
      hotelIndex: 3
    },

    // Brasil
    {
      name: "Iberostar Selection Praia do Forte",
      country: "Brasil",
      countryKey: "brasil",
      destination: "Praia do Forte",
      brand: "Selection",
      image: "src/official-hotels/selection-praia-do-forte.jpg",
      tagline: "Naturaleza y lujo en Bahía",
      description: "Frente a piscinas naturales de coral y reserva de tortugas marinas, con spa y golf.",
      route: "/hoteles/brasil/iberostar-selection-praia-do-forte",
      countryMenuKey: "brasil",
      hotelIndex: 0
    },
    {
      name: "Iberostar Waves Bahia",
      country: "Brasil",
      countryKey: "brasil",
      destination: "Bahía",
      brand: "Waves",
      image: "src/official-hotels/waves-bahia.jpg",
      tagline: "Cultura bahiana y diversión familiar",
      description: "Complejo todo incluido con múltiples piscinas, deportes, gastronomía local y Star Camp.",
      route: "/hoteles/brasil/iberostar-waves-bahia",
      countryMenuKey: "brasil",
      hotelIndex: 1
    },
    {
      name: "Iberostar Heritage Grand Amazon",
      country: "Brasil",
      countryKey: "brasil",
      destination: "Amazonas",
      brand: "JOIA",
      image: "src/official-hotels/grand-amazon-expedition.jpg",
      tagline: "Crucero fluvial de expedición por el Amazonas",
      description: "Experiencia única navegando los ríos Negro y Solimões con camarotes de lujo y excursiones guiadas.",
      route: "/hoteles/brasil/iberostar-heritage-grand-amazon",
      countryMenuKey: "brasil",
      hotelIndex: 2
    }
  ];

  let activeBrandFilter = "all";
  let activeCountryFilter = "all";
  let searchQuery = "";

  function getBrandBadgeClass(brand) {
    if (brand === "JOIA") return "badge-joia";
    if (brand === "Selection") return "badge-selection";
    return "badge-waves";
  }

  function filterHotels() {
    return allHotelsData.filter((item) => {
      if (activeBrandFilter !== "all" && item.brand !== activeBrandFilter) return false;
      if (activeCountryFilter !== "all" && item.countryKey !== activeCountryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const hay = `${item.name} ${item.country} ${item.destination} ${item.tagline} ${item.description}`
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function renderResults() {
    const listEl = document.getElementById("searchResultsList");
    const countEl = document.getElementById("searchResultCount");
    if (!listEl) return;

    const results = filterHotels();
    const t = window.RevistaDigital.i18n?.t || ((k) => k);

    if (countEl) {
      countEl.textContent = `${results.length} ${t("resultsCount", "hoteles encontrados")}`;
    }

    if (!results.length) {
      listEl.innerHTML = `
        <div class="search-empty">
          <p>${t("noResults", "No se encontraron hoteles con esa búsqueda.")}</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = results.map((hotel) => `
      <article class="search-item" data-hotel-route="${hotel.route}" data-hotel-name="${hotel.name}">
        <img class="search-item-img" src="${hotel.image}" alt="${hotel.name}" loading="lazy" decoding="async" />
        <div class="search-item-info">
          <div class="search-item-tags">
            <span class="search-badge ${getBrandBadgeClass(hotel.brand)}">${hotel.brand}</span>
            <span class="search-item-country">${hotel.country} · ${hotel.destination}</span>
          </div>
          <h4 class="search-item-title">${hotel.name}</h4>
          <p class="search-item-tagline">${hotel.tagline}</p>
          <small class="search-item-desc">${hotel.description}</small>
        </div>
        <button type="button" class="search-item-btn" aria-label="Ver ${hotel.name}">
          ${t("viewHotel", "Ver ficha")} →
        </button>
      </article>
    `).join("");

    listEl.querySelectorAll(".search-item").forEach((card) => {
      card.addEventListener("click", () => {
        const hotelName = card.dataset.hotelName;
        const target = allHotelsData.find((h) => h.name === hotelName);
        if (target) {
          selectHotel(target);
        }
      });
    });
  }

  function selectHotel(hotel) {
    closeSearch();
    if (typeof hotel.pageIndex === "number" && typeof window.goToPage === "function") {
      window.goToPage(hotel.pageIndex);
      return;
    }
    if (hotel.countryMenuKey && typeof hotel.hotelIndex === "number" && typeof window.openHotelDetail === "function") {
      window.openHotelDetail(hotel.countryMenuKey, hotel.hotelIndex);
      return;
    }
    if (hotel.route && window.RevistaDigital.routes?.navigate) {
      window.RevistaDigital.routes.navigate(hotel.route);
    }
  }

  function openSearch() {
    const modal = document.getElementById("searchModal");
    if (!modal) return;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    const input = document.getElementById("searchInputField");
    if (input) {
      input.value = searchQuery;
      setTimeout(() => input.focus(), 80);
    }
    renderResults();
  }

  function closeSearch() {
    const modal = document.getElementById("searchModal");
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function setupEvents() {
    const openBtn = document.getElementById("openSearchButton");
    const closeBtn = document.getElementById("searchCloseButton");
    const modal = document.getElementById("searchModal");
    const input = document.getElementById("searchInputField");

    openBtn?.addEventListener("click", openSearch);
    closeBtn?.addEventListener("click", closeSearch);

    modal?.addEventListener("click", (e) => {
      if (e.target === modal) closeSearch();
    });

    input?.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      renderResults();
    });

    document.querySelectorAll(".search-filter-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const filterType = chip.dataset.filterType;
        const filterVal = chip.dataset.filterValue;

        if (filterType === "brand") {
          activeBrandFilter = filterVal;
          document.querySelectorAll('[data-filter-type="brand"]').forEach((c) => c.classList.remove("active"));
        } else if (filterType === "country") {
          activeCountryFilter = filterVal;
          document.querySelectorAll('[data-filter-type="country"]').forEach((c) => c.classList.remove("active"));
        }
        chip.classList.add("active");
        renderResults();
      });
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeSearch();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openSearch();
      }
    });

    window.addEventListener("languagechange", renderResults);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupEvents);
  } else {
    setupEvents();
  }

  window.RevistaDigital.search = {
    open: openSearch,
    close: closeSearch,
    allHotelsData
  };
})();

