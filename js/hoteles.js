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
            <img src="${image}" alt="${title} de ${pageName}" />
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
