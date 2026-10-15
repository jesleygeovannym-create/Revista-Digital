(function () {
  window.RevistaDigital = window.RevistaDigital || {};
  const restaurantes = window.RevistaDigital.restaurantes || {};
  const state = () => window.RevistaDigital.state;
  const restaurantMenuOptions = [
    { name: "Bella Italia", cuisine: "ITALIANA", hours: "18:00" },
    { name: "La Palapa", cuisine: "MEXICANA COSTERA", hours: "07:00" },
    { name: "El Gaucho", cuisine: "PARRILLA ARGENTINA", hours: "19:00" },
    { name: "Snack & Grill", cuisine: "CASUAL INTERNACIONAL", hours: "12:00" }
  ];
  const hotelRestaurantCatalog = {
    "Iberostar Selection Playa Mita": [
      ["El Cuate Pancho", "Mexicana"], ["Pacific Express · Bistró", "Francesa"],
      ["Tsuba", "Asiática"], ["El Nopal", "Buffet"], ["La Bahía Steak House", "Carnes"]
    ],
    "Iberostar Selection Cancún": [
      ["American Bistro", "Americana"], ["Antiguo Laguito Buffet", "Buffet"],
      ["Trattoria La Horma", "Italiana"], ["Teppanyaki Naga Hibachi", "Japonesa"],
      ["La Parrilla Steak House", "Carnes"], ["Burger Box", "Hamburguesas"],
      ["Taquería Los Amigos", "Mexicana"], ["Beach Social Lounge Al Mar", "Mediterránea"],
      ["Caribbean Al Mar", "Caribeña"]
    ],
    "Iberostar Waves Cozumel": [
      ["Cozumel Buffet", "Buffet"], ["El Cedral Buffet", "Buffet"],
      ["El Cedral Smoke House", "Parrilla"], ["Las dos Marías", "Mexicana"]
    ],
    "JOIA Rose Hall by Iberostar": [
      ["Chez Charlie", "Francesa"], ["Amari", "Italiana"], ["Oriole", "Jamaicana"],
      ["Marina", "Buffet mediterráneo"], ["Garden Pantry", "Opciones frescas"], ["Gaia", "Parrilla"]
    ],
    "Iberostar Selection Rose Hall Suites": [
      ["Miranda Hill Buffet", "Buffet internacional"], ["Sole Mio", "Italiana"],
      ["Mare Nostrum Greek Taverna", "Griega"], ["Uncle Tony’s Buffet and Rotisserie", "Jamaicana y parrilla"]
    ],
    "Iberostar Waves Rose Hall Beach": [
      ["Little River Buffet", "Buffet"], ["Uncle Tony’s Buffet and Rotisserie", "Jamaicana y parrilla"],
      ["Samurai Japanese Restaurant", "Japonesa"], ["One Love Jerk Hut", "Jamaicana"],
      ["Chill Out Snack Bar", "Snacks"]
    ],
    "Iberostar Selection Bávaro Suites": [
      ["Brave Steakhouse", "Carnes"], ["Los Haitises Buffet Restaurant", "Buffet"],
      ["Kabuki Japanese Restaurant", "Japonesa"], ["Il Forno Italian Restaurant", "Italiana"],
      ["El Tapatío Mexican Restaurant", "Mexicana"], ["La Dorada Greek Restaurant", "Griega"],
      ["Bistró La Coupole", "Francesa"], ["Star Rock American Restaurant", "Americana"]
    ],
    "JOIA Bávaro by Iberostar": [
      ["Casa de la Playa", "Dominicana"], ["Le Tourbillon", "Alta cocina"],
      ["El Galeón", "Pescados y carnes"], ["Bella Vista Buffet", "Buffet"],
      ["La Tentazione Wine Cellar", "Italiana"], ["Hashira Japanese Restaurant", "Japonesa"],
      ["La Perla Buffet", "Buffet"]
    ],
    "Iberostar Waves Punta Cana": [
      ["Higuey Buffet", "Buffet dominicano e internacional"], ["La Sibila Gourmet Restaurant", "Francesa"],
      ["La Marimba Restaurant Grill", "Parrilla"], ["La Pagoda Asian Restaurant", "Asiática"],
      ["Star Rock American Restaurant", "Americana"], ["La Yola Ice Cream Parlor", "Heladería"]
    ],
    "Iberostar Waves Dominicana": [
      ["La Sibila Gourmet Restaurant", "Francesa"], ["La Marimba Restaurant Grill", "Parrilla"],
      ["La Pagoda Asian Restaurant", "Asiática"], ["María Bonita Mexican Restaurant", "Mexicana"],
      ["Star Rock American Restaurant", "Americana"], ["Higuey Buffet", "Buffet"],
      ["Hispaniola Buffet", "Buffet"], ["La Palapita", "Restaurante de playa"]
    ],
    "Iberostar Selection Praia do Forte": [
      ["Novecento Italian Restaurant", "Italiana"], ["Pelô International Buffet", "Buffet"],
      ["Mai Tai Asian Restaurant", "Asiática"], ["Maresia Mexican Restaurant", "Mexicana"],
      ["Odoiá Bahian Restaurant", "Bahiana"], ["Do Lago Bistró Restaurant", "Bistró"]
    ],
    "Iberostar Waves Bahia": [
      ["Meu Rei Buffet", "Buffet brasileño"], ["Coqueiro", "Italiana"],
      ["Bahian Restaurant", "Bahiana"], ["Mare Nostrum Mediterranean Restaurant", "Mediterránea"],
      ["Sakura Teppanyaki", "Japonesa"], ["Oxente Food Truck", "Comida casual"]
    ],
    "Iberostar Heritage Grand Amazon": [
      ["Kuarup", "Restaurante principal"], ["Vitória-Régia", "Restaurante"]
    ]
  };
  const hotelRestaurantAliases = {
    "Iberostar Selection Coral Cancún": "Iberostar Selection Cancún",
    "Coral Level at Iberostar Selection Rose Hall Suites": "Iberostar Selection Rose Hall Suites",
    "Praia do Forte · Star Prestige": "Iberostar Selection Praia do Forte"
  };
  const hotelRestaurantPageUrls = {
    "Iberostar Selection Playa Mita": "https://www.iberostar.com/en/hotels/riviera-nayarit/iberostar-selection-playa-mita/",
    "Iberostar Selection Cancún": "https://www.iberostar.com/en/hotels/cancun/iberostar-selection-cancun/",
    "Iberostar Waves Cozumel": "https://www.iberostar.com/en/hotels/cozumel/iberostar-waves-cozumel/",
    "JOIA Rose Hall by Iberostar": "https://www.iberostar.com/en/hotels/montego-bay/joia-rose-hall-by-iberostar/",
    "Iberostar Selection Rose Hall Suites": "https://www.iberostar.com/en/hotels/montego-bay/iberostar-selection-rose-hall-suites/",
    "Iberostar Waves Rose Hall Beach": "https://www.iberostar.com/en/hotels/montego-bay/iberostar-waves-rose-hall-beach/",
    "Iberostar Selection Bávaro Suites": "https://www.iberostar.com/en/hotels/punta-cana/iberostar-selection-bavaro-suites/",
    "JOIA Bávaro by Iberostar": "https://www.iberostar.com/en/hotels/punta-cana/joia-bavaro-by-iberostar/",
    "Iberostar Waves Punta Cana": "https://www.iberostar.com/en/hotels/punta-cana/iberostar-waves-punta-cana/",
    "Iberostar Waves Dominicana": "https://www.iberostar.com/en/hotels/punta-cana/iberostar-waves-dominicana/",
    "Iberostar Selection Praia do Forte": "https://www.iberostar.com/en/hotels/bahia/iberostar-selection-praia-do-forte/",
    "Iberostar Waves Bahia": "https://www.iberostar.com/en/hotels/bahia/iberostar-waves-bahia/",
    "Iberostar Heritage Grand Amazon": "https://www.iberostar.com/en/hotels/manaus/iberostar-grand-amazon/"
  };

  function escapeHtml(value = "") {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
  }

  restaurantes.getHotelRestaurants = function (...hotelNames) {
    for (const hotelName of hotelNames) {
      const canonicalName = hotelRestaurantAliases[hotelName] || hotelName;
      if (hotelRestaurantCatalog[canonicalName]) return hotelRestaurantCatalog[canonicalName];
    }
    return [];
  };

  restaurantes.getHotelRestaurantPageUrl = function (...hotelNames) {
    for (const hotelName of hotelNames) {
      const canonicalName = hotelRestaurantAliases[hotelName] || hotelName;
      if (hotelRestaurantPageUrls[canonicalName]) return hotelRestaurantPageUrls[canonicalName];
    }
    return "";
  };

  restaurantes.renderHotelRestaurants = function (hotelName, fallbackName = "") {
    const restaurants = restaurantes.getHotelRestaurants(hotelName, fallbackName);
    if (!restaurants.length) return "";
    const restaurantPageUrl = restaurantes.getHotelRestaurantPageUrl(hotelName, fallbackName);

    return `<section class="hotel-restaurant-list" aria-labelledby="hotelRestaurantHeading">
      <div class="hotel-restaurant-heading"><div><small>GASTRONOMÍA · SELECCIÓN DE RESTAURANTES</small><h2 id="hotelRestaurantHeading">Restaurantes de ${escapeHtml(hotelName)}</h2></div><span>${restaurants.length} opciones</span></div>
      <div class="hotel-restaurant-grid">${restaurants.map(([name, cuisine]) => `<article class="hotel-restaurant-card"><h3>${escapeHtml(name)}</h3><span>${escapeHtml(cuisine)}</span></article>`).join("")}</div>
      <p>La oferta, los horarios y las reservaciones pueden variar según la estancia. Confírmalos con el hotel.</p>
      ${restaurantPageUrl ? `<a class="hotel-restaurant-source" href="${escapeHtml(restaurantPageUrl)}" target="_blank" rel="noopener noreferrer">Consultar menús y horarios oficiales <span aria-hidden="true">↗</span></a>` : ""}
    </section>`;
  };

  restaurantes.getMenus = function () {
    return restaurantMenuOptions;
  };

  restaurantes.renderMenu = function (hotelOrIndex) {
    const hotel = typeof hotelOrIndex === "object"
      ? hotelOrIndex
      : state().pages?.[hotelOrIndex];

    if (!hotel || hotel.type !== "hotel") {
      if (typeof window.renderRestaurantMenu === "function") {
        return window.renderRestaurantMenu(hotelOrIndex);
      }
      return "";
    }
    const hotelMedia = window.getHotelMedia ? window.getHotelMedia(hotel.name) : {};
    const heroImage = hotelMedia.banner?.[0] || hotel.image;

    const catalogRestaurants = restaurantes.getHotelRestaurants(hotel.name);
    const paraiso = paraisoRestaurants(hotel.name);
    const pannellum = window.RevistaDigital?.pannellum360;
    const hasParaisoCards = Boolean(
      pannellum &&
      typeof pannellum.renderRestaurantCards === "function" &&
      typeof pannellum.isPlayaParaiso === "function" &&
      pannellum.isPlayaParaiso(hotel.name) &&
      pannellum.getRestaurantes(hotel.name).length
    );

    const menuEntries = catalogRestaurants.length
      ? catalogRestaurants.map(([name, cuisine]) => ({ name, cuisine }))
      : (paraiso.length
          ? paraiso.map(([name, cuisine]) => ({ name, cuisine }))
          : restaurantMenuOptions);

    const restaurantCount = menuEntries.length
      || hotel.stats.find(([, label]) => String(label).toLowerCase().includes("restaurantes"))?.[0]
      || restaurantMenuOptions.length;

    const restaurantListingMarkup = hasParaisoCards
      ? pannellum.renderRestaurantCards(hotel.name)
      : `<div class="restaurant-menu-options">
          ${menuEntries.map((restaurant, index) => `
            <article class="restaurant-menu-option">
              <span class="restaurant-menu-number">${String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>${escapeHtml(restaurant.name)}</h3>
                <small>${escapeHtml(restaurant.cuisine || "Cocina de autor")}</small>
              </div>
              ${restaurant.hours ? `<span class="restaurant-menu-hours">${escapeHtml(restaurant.hours)}</span>` : ""}
            </article>`).join("")}
        </div>`;

    return `
      <div class="spread restaurant-menu-spread">

        <section class="restaurant-menu-story">

          <div
            class="restaurant-menu-photo"
            style="background-image:linear-gradient(180deg,rgba(5,12,17,.08),rgba(5,12,17,.62)),url('${heroImage}')"
          >

            <div>
              <small>
                EXPERIENCIAS CULINARIAS
              </small>

              <h1>
                ${hotel.name}
              </h1>
            </div>

          </div>

          <div class="restaurant-menu-summary">

            <small>
              LA MESA DEL HOTEL
            </small>

            <h2>
              Sabores para descubrir
            </h2>

            <p>
              Una selección para disfrutar durante tu estancia en
              ${hotel.name}.
            </p>

            <div class="restaurant-menu-facts">

              <div>
                <strong>
                  ${restaurantCount}
                </strong>

                <small>
                  Restaurantes
                </small>
              </div>

              <div>
                <strong>AI</strong>

                <small>
                  Todo incluido
                </small>
              </div>

            </div>

            <p class="restaurant-menu-note">
              Los horarios pueden variar según la temporada.
              Consulta disponibilidad al llegar.
            </p>

          </div>

        </section>

        <section class="restaurant-menu-listing">

          <header class="restaurant-menu-brand">

            <img
              src="src/logo png-02.png"
              alt="Iberostar The Club"
            />

            <button
              class="restaurant-menu-back"
              type="button"
            >
              ← Volver al mapa del hotel
            </button>

          </header>

          <div class="restaurant-menu-heading">

            <div>

              <small>
                SELECCIÓN DEL HOTEL · TODO INCLUIDO
              </small>

              <h2>
                Menú de restaurantes
              </h2>

            </div>

            <span>
              ${restaurantCount} ${restaurantCount === 1 ? "opción" : "opciones"}
            </span>

          </div>

          ${restaurantListingMarkup}

        </section>

      </div>
    `;
  };

  restaurantes.getHotel = function (pageIndex) {
    return state().pages && state().pages[pageIndex] ? state().pages[pageIndex] : null;
  };

  /* ---------------------------------------------------------
     DIRECTORIO DE RESTAURANTES (apartado /restaurantes)
     Una sola ficha por hotel canónico: los alias (Coral Level,
     Coral Cancún, Star Prestige) comparten la carta de su hotel
     matriz y no se vuelven a listar, evitando duplicaciones.
     --------------------------------------------------------- */

  const restaurantCountryOrder = ["mexico", "jamaica", "republica-dominicana", "brasil"];

  function getDestinationCatalog() {
    return (
      window.RevistaDigital.hoteles?.getNormalizedCatalog?.() ||
      window.RevistaDigital.hoteles?.getDestinationCatalog?.() ||
      {}
    );
  }

  function canonicalHotelName(hotelName) {
    return hotelRestaurantAliases[hotelName] || hotelName;
  }

  function officialGalleryPhotos(hotel, menuHotel, content) {
    const galleries = window.RevistaDigital.officialHotelGalleries || {};
    const stemOf = (image) => (image || "").match(/^src\/official-hotels\/([^/]+)\.jpg$/)?.[1] || null;
    const stems = [
      hotel?.slug,
      hotel?.slug?.startsWith("iberostar-") ? hotel.slug.slice("iberostar-".length) : null,
      stemOf(hotel?.image),
      stemOf(menuHotel?.image),
      stemOf(content?.image)
    ].filter(Boolean);
    for (const stem of stems) {
      const gallery = galleries[stem];
      if (gallery?.restaurante?.length) return gallery.restaurante.slice(0, 9);
    }
    return [];
  }

  // Cartas de los hoteles del complejo Playa Paraíso: viven en el módulo 360
  // (RESTAURANTES_PARAISO) y se leen desde aquí para no duplicar datos.
  function paraisoRestaurants(hotelName) {
    const pano = window.RevistaDigital?.pannellum360;
    if (pano && typeof pano.getRestaurantes === "function") {
      const list = pano.getRestaurantes(hotelName);
      if (Array.isArray(list) && list.length) return list.map(([name, cuisine]) => [name, cuisine || "Restaurante"]);
    }
    return [];
  }

  function paraisoPhotos(hotel) {
    const media = window.RevistaDigital.hoteles?.getMedia?.(hotel.name) || {};
    return Array.isArray(media.restaurante) ? media.restaurante.slice(0, 9) : [];
  }

  function buildRestaurantHotels() {
    const catalog = getDestinationCatalog();
    const countries = catalog.countries ||
      Object.entries(catalog).map(([countrySlug, country]) => ({
        slug: countrySlug,
        name: country.name,
        destinations: country.destinations || []
      }));
    const menuHotels = Object.values(state()?.hotelCountryMenus || {})
      .flatMap((country) => country?.hotels || []);
    const seen = new Set();
    const hotels = [];

    countries.forEach((country) => {
      (country.destinations || []).forEach((destination) => {
        (destination.hotels || []).forEach((hotel) => {
          const canonical = canonicalHotelName(hotel.name);
          if (seen.has(canonical)) return;
          const catalogRestaurants = restaurantes.getHotelRestaurants(hotel.name);
          const restaurants = catalogRestaurants.length ? catalogRestaurants : paraisoRestaurants(hotel.name);
          if (!restaurants.length) return;
          seen.add(canonical);

          const menuHotel = menuHotels.find((item) => item.name === canonical) || null;
          const content = window.RevistaDigital.hotelContent?.[canonical] || null;
          const slug = hotel.slug || canonical;
          const destinationSlug = destination.slug || destination.destinationSlug;
          const countrySlug = country.slug || hotel.countrySlug;
          const hotelRoute = `/${countrySlug}/${destinationSlug}/${slug}`;
          const photos = officialGalleryPhotos(hotel, menuHotel, content);
          const gallery = photos.length ? photos : paraisoPhotos(hotel);

          hotels.push({
            slug,
            name: canonical,
            countrySlug,
            countryName: country.name || hotel.countryName,
            destinationSlug,
            destinationName: destination.name || hotel.destinationName,
            image: hotel.image || destination.image || country.image || "src/paraiso-del-mar/banner/ParaisoDelMar.jpg",
            restaurants,
            photos: gallery,
            route: `/restaurantes/${slug}`,
            hotelRoute
          });
        });
      });
    });

    return {
      order: restaurantCountryOrder,
      byCountry: hotels.reduce((groups, hotel) => {
        (groups[hotel.countrySlug] = groups[hotel.countrySlug] || []).push(hotel);
        return groups;
      }, {})
    };
  }

  restaurantes.getRestaurantHotels = function () {
    return buildRestaurantHotels().byCountry;
  };

  restaurantes.getDirectory = function () {
    const { order, byCountry } = buildRestaurantHotels();
    const slugs = [...new Set([...order, ...Object.keys(byCountry)])];

    return slugs
      .filter((slug) => (byCountry[slug] || []).length)
      .map((slug) => {
        const hotels = byCountry[slug];
        return {
          slug,
          name: hotels[0].countryName,
          image: hotels[0].image,
          hotels,
          restaurantCount: hotels.reduce((total, hotel) => total + hotel.restaurants.length, 0)
        };
      });
  };

  restaurantes.getCountryDirectory = function (countrySlug) {
    return restaurantes.getDirectory().find((country) => country.slug === countrySlug) || null;
  };

  restaurantes.getCountryRestaurantGroups = function (countrySlug) {
    const country = restaurantes.getCountryDirectory(countrySlug);
    if (!country) return [];

    const groups = [];
    country.hotels.forEach((hotel) => {
      const last = groups[groups.length - 1];
      if (last && last.destinationSlug === hotel.destinationSlug) {
        last.hotels.push(hotel);
        return;
      }
      groups.push({ destinationSlug: hotel.destinationSlug, destinationName: hotel.destinationName, hotels: [hotel] });
    });

    return groups.map((group) => ({
      destinationSlug: group.destinationSlug,
      destinationName: group.destinationName,
      hotelRoute: group.hotels[0].hotelRoute,
      hotelName: group.hotels.map((hotel) => hotel.name).join(" · "),
      restaurants: group.hotels.flatMap((hotel) => hotel.restaurants)
    }));
  };

  /* Ficha de un hotel dentro del apartado: /restaurantes/<hotel>.
     Devuelve el hotel con su país para no tener que repetir la búsqueda. */
  restaurantes.getRestaurantHotel = function (hotelSlug) {
    for (const country of restaurantes.getDirectory()) {
      const hotel = country.hotels.find((item) => item.slug === hotelSlug);
      if (hotel) return { country, hotel };
    }
    return null;
  };

  restaurantes.wireInteractions = function (root, handlers = {}) {
    root.querySelectorAll(".restaurant-menu-open").forEach((button) => {
      button.addEventListener("click", () => handlers.open?.());
    });

    root.querySelectorAll(".restaurant-menu-back").forEach((button) => {
      button.addEventListener("click", () => handlers.close?.());
    });
  };

  window.restaurantMenuOptions = window.restaurantMenuOptions || restaurantMenuOptions;
  window.renderRestaurantMenu = window.renderRestaurantMenu || ((hotelOrIndex) =>
    restaurantes.renderMenu(hotelOrIndex)
  );

  window.RevistaDigital.restaurantes = restaurantes;
})();
