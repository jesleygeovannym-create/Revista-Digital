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
    const restaurantCount = hotel.stats.find(([, label]) =>
      String(label).toLowerCase().includes("restaurantes")
    )?.[0] || restaurantMenuOptions.length;

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
              +${restaurantMenuOptions.length} opciones
            </span>

          </div>

          <div class="restaurant-menu-options">

            ${restaurantMenuOptions
              .map(
                (restaurant, index) => `
                  <article
                    class="restaurant-menu-option"
                  >

                    <span
                      class="restaurant-menu-number"
                    >
                      ${String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <div>

                      <h3>
                        ${restaurant.name}
                      </h3>

                      <small>
                        ${restaurant.cuisine}
                      </small>

                    </div>

                    <span
                      class="restaurant-menu-hours"
                    >
                      ${restaurant.hours}
                    </span>

                  </article>
                `
              )
              .join("")}

          </div>

        </section>

      </div>
    `;
  };

  restaurantes.getHotel = function (pageIndex) {
    return state().pages && state().pages[pageIndex] ? state().pages[pageIndex] : null;
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
