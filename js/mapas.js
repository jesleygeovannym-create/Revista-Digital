(function () {
  window.RevistaDigital = window.RevistaDigital || {};
  const mapas = window.RevistaDigital.mapas || {};
  const state = () => window.RevistaDigital.state;

  mapas.loadLeaflet = function () {
    if (window.L) {
      return Promise.resolve(window.L);
    }

    if (window.leafletPromise) {
      return window.leafletPromise;
    }

    window.leafletPromise = new Promise((resolve, reject) => {
      const stylesheet = document.createElement("link");
      stylesheet.rel = "stylesheet";
      stylesheet.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(stylesheet);

      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => resolve(window.L);
      script.onerror = reject;
      document.head.appendChild(script);
    });

    return window.leafletPromise;
  };

  mapas.loadGoogleMaps = function () {
    if (!window.GOOGLE_MAPS_API_KEY) {
      return Promise.resolve(null);
    }

    if (window.google?.maps) {
      return Promise.resolve(window.google.maps);
    }

    if (window.googleMapsPromise) {
      return window.googleMapsPromise;
    }

    window.googleMapsPromise = new Promise((resolve, reject) => {
      const callbackName = "googleMapsReady";
      window[callbackName] = () => resolve(window.google.maps);

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${window.GOOGLE_MAPS_API_KEY}&callback=${callbackName}`;
      script.async = true;
      script.defer = true;
      script.onerror = reject;
      document.head.appendChild(script);
    });

    return window.googleMapsPromise;
  };

  mapas.requestCurrentLocation = function () {
    const status = document.getElementById("locationStatus");

    if (!navigator.geolocation) {
      status.textContent = "La geolocalización no está disponible en este navegador.";
      return;
    }

    status.textContent = "Solicitando permiso para detectar tu ubicación...";

    navigator.geolocation.getCurrentPosition(
      (position) => {
        state().currentPosition = position.coords;

        status.textContent = "Ubicación actual disponible para calcular rutas.";

        if (state().activeMap && state().userMarker) {
          state().userMarker.setLatLng([
            state().currentPosition.latitude,
            state().currentPosition.longitude
          ]);

          state().activeMap.panTo([
            state().currentPosition.latitude,
            state().currentPosition.longitude
          ]);
        } else if (state().activeMap && window.L) {
          state().userMarker = window.L.circleMarker(
            [
              state().currentPosition.latitude,
              state().currentPosition.longitude
            ],
            {
              radius: 9,
              color: "#fff",
              weight: 3,
              fillColor: "#28b7a0",
              fillOpacity: 1
            }
          )
            .addTo(state().activeMap)
            .bindTooltip("Tu ubicación actual");
        }

        if (typeof window.updateGeneralUserMarker === "function") {
          window.updateGeneralUserMarker();
        }

        if (typeof window.updateHotelUserMarker === "function") {
          window.updateHotelUserMarker();
        }
      },
      () => {
        status.textContent = "Permiso no concedido. Puedes activarlo desde el navegador.";
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );

    navigator.geolocation.watchPosition(
      (position) => {
        state().currentPosition = position.coords;

        if (state().userMarker) {
          state().userMarker.setLatLng([
            state().currentPosition.latitude,
            state().currentPosition.longitude
          ]);
        }

        if (typeof window.updateGeneralUserMarker === "function") {
          window.updateGeneralUserMarker();
        }

        if (typeof window.updateHotelUserMarker === "function") {
          window.updateHotelUserMarker();
        }
      },
      () => {},
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 15000
      }
    );
  };

  mapas.openDirections = function (destination) {
    const mapElement = document.querySelector("#hotelMap, #generalMap");
    const status = document.getElementById("locationStatus");

    if (!mapElement) return;

    if (!state().currentPosition) {
      status.textContent = "Necesitamos permiso para calcular la ruta.";
      mapas.requestCurrentLocation();
      return;
    }

    const origin = `${state().currentPosition.latitude},${state().currentPosition.longitude}`;

    if (state().activeMap && window.L) {
      const destinationPage =
        (state().pages || []).find((item) => item.location === destination) ||
        (state().pages || [])[state().currentIndex || 0];

      const destinationCoordinates = state().hotelCoordinates?.[destinationPage?.name];

      if (!destinationCoordinates) return;

      const start = `${state().currentPosition.longitude},${state().currentPosition.latitude}`;
      const end = `${destinationCoordinates[1]},${destinationCoordinates[0]}`;
      const routeRequest = `https://router.project-osrm.org/route/v1/foot/${start};${end}?overview=full&geometries=geojson`;

      fetch(routeRequest)
        .then((response) => response.json())
        .then((route) => {
          const osrmCoordinates = route.routes?.[0]?.geometry?.coordinates?.map(
            ([longitude, latitude]) => [latitude, longitude]
          );

          const routeCoordinates =
            osrmCoordinates && osrmCoordinates.length
              ? [
                  [state().currentPosition.latitude, state().currentPosition.longitude],
                  ...osrmCoordinates,
                  destinationCoordinates
                ]
              : null;

          state().routeLine?.remove();

          state().routeLine = window.L.polyline(
            routeCoordinates || [
              [state().currentPosition.latitude, state().currentPosition.longitude],
              destinationCoordinates
            ],
            {
              color: "#d9b978",
              weight: 6,
              opacity: 0.95,
              dashArray: "12 8"
            }
          ).addTo(state().activeMap);

          state().activeMap.fitBounds(state().routeLine.getBounds(), {
            padding: [35, 35]
          });

          const distance = route.routes?.[0]?.distance
            ? `${(route.routes[0].distance / 1000).toFixed(1)} km`
            : "Ruta calculada";

          document.getElementById("locationStatus").textContent =
            `Ruta por calles marcada dentro del mapa: ${distance}.`;
        })
        .catch(() => {
          state().routeLine?.remove();

          state().routeLine = window.L.polyline(
            [
              [state().currentPosition.latitude, state().currentPosition.longitude],
              destinationCoordinates
            ],
            {
              color: "#d9b978",
              weight: 6,
              dashArray: "12 8"
            }
          ).addTo(state().activeMap);

          state().activeMap.fitBounds(state().routeLine.getBounds(), {
            padding: [35, 35]
          });

          document.getElementById("locationStatus").textContent =
            "Ruta directa marcada dentro del mapa.";
        });

      return;
    }

    mapElement.innerHTML = `
      <div class="route-preview">
        <div class="route-preview-header">
          <strong>Ruta desde tu ubicación</strong>
          <span>En coche</span>
        </div>

        <div class="route-preview-map">
          <div class="route-path">
            <i class="route-start"></i>
            <b></b>
            <i class="route-end"></i>
          </div>

          <span class="route-label route-start-label">
            Tu ubicación actual
          </span>

          <span class="route-label route-end-label">
            ${destination}
          </span>
        </div>

        <small>
          Conectando con el mapa interactivo...
        </small>
      </div>
    `;

    status.textContent = "Ruta mostrada dentro del mapa.";
  };

  mapas.hotelMap = function (page) {
    return `
      <div class="interactive-map" data-location="${page.location}" data-hotel-name="${page.name}">
        <div class="map-toolbar">
          <span>
            ● ${page.name.replace("Iberostar ", "")}
          </span>

          <div class="map-actions">
            <button class="locate-me" type="button">
              📍 Ubicarme
            </button>

            <button class="route-to" type="button">
              Cómo llegar
            </button>
          </div>
        </div>

        <div class="hotel-google-frame" id="hotelMapFrame">
          <div id="hotelMap" class="google-map"></div>
        </div>
      </div>
    `;
  };

  mapas.updateGeneralUserMarker = function () {
    const marker = document.getElementById("generalUserMarker");
    const frame = document.getElementById("generalMapFrame");

    if (!marker || !frame || !state().currentPosition) return;

    const width = frame.clientWidth;
    const height = frame.clientHeight;
    const worldSize = 256 * 2 ** (state().generalMapZoom ?? 15);

    const project = (latitude, longitude) => {
      const x = ((longitude + 180) / 360) * worldSize;
      const sine = Math.sin((latitude * Math.PI) / 180);
      const y = (0.5 - Math.log((1 + sine) / (1 - sine)) / (4 * Math.PI)) * worldSize;
      return { x, y };
    };

    const center = project(
      state().generalMapCenter?.latitude ?? 20.7612389,
      state().generalMapCenter?.longitude ?? -86.9640931
    );

    const user = project(
      state().currentPosition.latitude,
      state().currentPosition.longitude
    );

    marker.style.left = `${width / 2 + user.x - center.x}px`;
    marker.style.top = `${height / 2 + user.y - center.y}px`;
    marker.classList.add("visible");
  };

  mapas.updateHotelUserMarker = function () {
    const marker = document.getElementById("hotelUserMarker");
    const frame = document.getElementById("hotelMapFrame");
    const hotelName = frame?.closest(".interactive-map")?.dataset.hotelName;

    if (!marker || !frame || !state().currentPosition || !state().hotelCoordinates?.[hotelName]) {
      return;
    }

    const center = state().hotelCoordinates[hotelName];
    const zoom = 18;
    const worldSize = 256 * 2 ** zoom;

    const project = (latitude, longitude) => {
      const x = ((longitude + 180) / 360) * worldSize;
      const sine = Math.sin((latitude * Math.PI) / 180);
      const y = (0.5 - Math.log((1 + sine) / (1 - sine)) / (4 * Math.PI)) * worldSize;
      return { x, y };
    };

    const centerPoint = project(center[0], center[1]);
    const userPoint = project(
      state().currentPosition.latitude,
      state().currentPosition.longitude
    );

    marker.style.left = `${frame.clientWidth / 2 + userPoint.x - centerPoint.x}px`;
    marker.style.top = `${frame.clientHeight / 2 + userPoint.y - centerPoint.y}px`;
    marker.classList.add("visible");
  };

  mapas.initializeGeneralMap = function () {
    const mapElement = document.querySelector("#generalMap");
    if (!mapElement) return;

    mapas.loadLeaflet().then((L) => {
      const complexCenter = [20.7615, -86.9628];
      const generalMap = L.map(mapElement, {
        zoomControl: true,
        attributionControl: true,
        maxBounds: state().complexBounds,
        maxBoundsViscosity: 1.0
      }).setView(complexCenter, 16);

      state().activeMap = generalMap;
      generalMap.setMinZoom(generalMap.getBoundsZoom(state().complexBounds));

      const streetLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors"
      });

      streetLayer.addTo(generalMap);

      Object.entries(state().hotelCoordinates || {}).forEach(([name, coordinates]) => {
        L.marker(coordinates)
          .addTo(generalMap)
          .bindTooltip(name.replace("Iberostar ", ""), {
            permanent: true,
            direction: "top",
            className: "complex-label"
          });
      });

      const places = [
        ["Centro de convenciones", 20.7610, -86.9650],
        ["Bella Italia", 20.7618, -86.9631],
        ["La Palapa", 20.7604, -86.9619],
        ["El Gaucho", 20.7594, -86.9628],
        ["Snack & Grill", 20.7626, -86.9642],
        ["Spa y bienestar", 20.7601287, -86.9661145]
      ];

      places.forEach(([name, latitude, longitude]) => {
        L.circleMarker([latitude, longitude], {
          radius: 7,
          color: "#fff",
          weight: 2,
          fillColor: "#e5b85f",
          fillOpacity: 1
        })
          .addTo(generalMap)
          .bindTooltip(name, {
            permanent: true,
            direction: "right",
            className: "place-label"
          });
      });
    });
  };

  mapas.initializeHotelMap = function () {
    const mapElement = document.querySelector("#hotelMap");
    if (!mapElement) return;

    const hotelName = mapElement.closest(".interactive-map")?.dataset.hotelName;
    const destinationCoordinates = state().hotelCoordinates?.[hotelName];

    state().activeMap = null;
    state().userMarker = null;
    state().routeLine = null;

    mapas.loadLeaflet().then((L) => {
      state().activeMap = L.map(mapElement, {
        zoomControl: true,
        attributionControl: true,
        maxBounds: state().complexBounds,
        maxBoundsViscosity: 1.0
      }).setView(destinationCoordinates, 17);

      state().activeMap.setMinZoom(state().activeMap.getBoundsZoom(state().complexBounds));

      const streetLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors"
      });

      streetLayer.addTo(state().activeMap);

      L.marker(destinationCoordinates)
        .addTo(state().activeMap)
        .bindPopup(hotelName)
        .openPopup();

      if (state().currentPosition) {
        state().userMarker = L.circleMarker(
          [
            state().currentPosition.latitude,
            state().currentPosition.longitude
          ],
          {
            radius: 9,
            color: "#fff",
            weight: 3,
            fillColor: "#28b7a0",
            fillOpacity: 1
          }
        )
          .addTo(state().activeMap)
          .bindTooltip("Tu ubicación actual");
      }

      state().activeMap.on("zoomend moveend", () => {
        if (state().currentPosition && state().userMarker) {
          state().userMarker.setLatLng([
            state().currentPosition.latitude,
            state().currentPosition.longitude
          ]);
        }
      });
    });
  };

  if (typeof window.loadLeaflet !== "function") {
    window.loadLeaflet = mapas.loadLeaflet;
  }

  if (typeof window.loadGoogleMaps !== "function") {
    window.loadGoogleMaps = mapas.loadGoogleMaps;
  }

  if (typeof window.requestCurrentLocation !== "function") {
    window.requestCurrentLocation = mapas.requestCurrentLocation;
  }

  if (typeof window.openDirections !== "function") {
    window.openDirections = mapas.openDirections;
  }

  if (typeof window.hotelMap !== "function") {
    window.hotelMap = mapas.hotelMap;
  }

  if (typeof window.updateGeneralUserMarker !== "function") {
    window.updateGeneralUserMarker = mapas.updateGeneralUserMarker;
  }

  if (typeof window.updateHotelUserMarker !== "function") {
    window.updateHotelUserMarker = mapas.updateHotelUserMarker;
  }

  if (typeof window.initializeGeneralMap !== "function") {
    window.initializeGeneralMap = mapas.initializeGeneralMap;
  }

  if (typeof window.initializeHotelMap !== "function") {
    window.initializeHotelMap = mapas.initializeHotelMap;
  }

  window.RevistaDigital.mapas = mapas;
})();
