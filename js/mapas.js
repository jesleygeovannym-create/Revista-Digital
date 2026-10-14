(function () {
  window.RevistaDigital = window.RevistaDigital || {};
  const mapas = window.RevistaDigital.mapas || {};
  const state = () => window.RevistaDigital.state;

  function distanceBetweenCoordinates(first, second) {
    const radians = (degrees) => (degrees * Math.PI) / 180;
    const latitudeDelta = radians(second.latitude - first.latitude);
    const longitudeDelta = radians(second.longitude - first.longitude);
    const firstLatitude = radians(first.latitude);
    const secondLatitude = radians(second.latitude);
    const haversine = (
      Math.sin(latitudeDelta / 2) ** 2 +
      Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.sin(longitudeDelta / 2) ** 2
    );
    return 6371000 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
  }

  function formatApproximateDistance(meters) {
    return meters < 1000
      ? `${Math.round(meters / 10) * 10} m`
      : `${(meters / 1000).toLocaleString("es-MX", { maximumFractionDigits: 1 })} km`;
  }

  function findNearbyLocation(coords) {
    const catalog = window.RevistaDigital.hoteles?.getNormalizedCatalog?.() || window.RevistaDigital.hoteles?.getDestinationCatalog?.() || {};
    const countries = catalog.countries || Object.entries(catalog).map(([countrySlug, country]) => ({
      slug: countrySlug,
      name: country.name,
      destinations: country.destinations || []
    }));

    let closestHotel = null;
    let closestDestination = null;

    countries.forEach((countryEntry) => {
      const countrySlug = countryEntry.slug || countryEntry.countrySlug;
      const countryName = countryEntry.name || "Destino";
      (countryEntry.destinations || []).forEach((destination) => {
        const destinationHotels = destination.hotels || [];
        const points = [];

        destinationHotels.forEach((hotel) => {
          const latitude = Number(hotel.latitude);
          const longitude = Number(hotel.longitude);
          if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;

          const point = { latitude, longitude };
          points.push(point);
          const distance = distanceBetweenCoordinates(coords, point);
          const detectionRadius = Number(hotel.detectionRadiusMeters) || Number(state()?.locationDetectionRadiusMeters) || 1500;

          if (distance <= detectionRadius && (!closestHotel || distance < closestHotel.distance)) {
            closestHotel = {
              hotel,
              country: { name: countryName, slug: countrySlug },
              destination,
              distance,
              type: "hotel"
            };
          }
        });

        const areaCenter = destination.detectionArea?.center;
        if (Array.isArray(areaCenter) && areaCenter.length === 2) {
          const center = { latitude: Number(areaCenter[0]), longitude: Number(areaCenter[1]) };
          const radius = Number(destination.detectionArea.radiusMeters) || Number(state()?.destinationDetectionRadiusMeters) || 5000;
          const distance = distanceBetweenCoordinates(coords, center);
          if (distance <= radius && (!closestDestination || distance < closestDestination.distance)) {
            closestDestination = {
              hotel: null,
              country: { name: countryName, slug: countrySlug },
              destination,
              distance,
              type: "destination"
            };
          }
        } else if (points.length) {
          const center = points.reduce((total, point) => ({
            latitude: total.latitude + point.latitude / points.length,
            longitude: total.longitude + point.longitude / points.length
          }), { latitude: 0, longitude: 0 });
          const distance = distanceBetweenCoordinates(coords, center);
          if (distance <= (Number(state()?.destinationDetectionRadiusMeters) || 5000) && (!closestDestination || distance < closestDestination.distance)) {
            closestDestination = {
              hotel: null,
              country: { name: countryName, slug: countrySlug },
              destination,
              distance,
              type: "destination"
            };
          }
        }
      });
    });

    if (closestHotel) {
      return {
        ...closestHotel,
        route: `/${closestHotel.country.slug}/${closestHotel.destination.slug}/${closestHotel.hotel.slug}`
      };
    }

    if (closestDestination) {
      return {
        ...closestDestination,
        route: `/${closestDestination.country.slug}/${closestDestination.destination.slug}`
      };
    }

    return null;
  }

  function describeNearbyLocation(coords) {
    const nearby = findNearbyLocation(coords);
    if (nearby?.type === "hotel") {
      return `Estás aproximadamente a ${formatApproximateDistance(nearby.distance)} de ${nearby.hotel.name}, en ${nearby.destination.name}, ${nearby.country.name}.`;
    }
    if (nearby?.type === "destination") {
      return `Estás en ${nearby.destination.name}, ${nearby.country.name}.`;
    }
    return "Ubicación actual disponible para calcular rutas. No se detectó un destino Iberostar cercano.";
  }

  mapas.distanceBetweenCoordinates = distanceBetweenCoordinates;
  mapas.findNearbyLocation = findNearbyLocation;
  mapas.describeNearbyLocation = describeNearbyLocation;
  mapas.formatApproximateDistance = formatApproximateDistance;
  mapas.getLocationMessage = function (coords) {
    return describeNearbyLocation(coords);
  };

  mapas.evaluateNearbyContext = function (coords = state()?.currentPosition) {
    if (!coords || !Number.isFinite(coords.latitude) || !Number.isFinite(coords.longitude)) {
      return null;
    }

    const nearby = findNearbyLocation(coords);
    if (!nearby) return null;

    const currentRoute = (window.RevistaDigital?.routes?.getCurrentRoute?.() || window.location.pathname || "/").replace(/\/+$/, "") || "/";
    const currentNormalized = currentRoute === "/" ? "/" : currentRoute;
    const nearbyRoute = nearby.route || "/";
    const isSameContext = currentNormalized === nearbyRoute;

    return {
      ...nearby,
      isSameContext,
      message: nearby.type === "hotel"
        ? `📍 Parece que estás cerca de ${nearby.hotel.name}.`
        : `📍 Estás en ${nearby.destination.name}.`,
      actionLabel: nearby.type === "hotel" ? "Explorar hotel" : "Explorar destino",
      currentRoute: currentNormalized
    };
  };

  mapas.routeToNearbyContext = function (context) {
    if (!context || !context.route) return false;

    const navigate = window.RevistaDigital?.routes?.navigate;
    if (typeof navigate === "function") {
      navigate(context.route);
      return true;
    }

    if (window.location.pathname !== context.route) {
      window.history.pushState({}, "", context.route);
      if (typeof window.RevistaDigital?.routes?.restoreCurrentRoute === "function") {
        window.RevistaDigital.routes.restoreCurrentRoute();
      }
    }

    return true;
  };

  mapas.renderNearbyContext = function (coords = state()?.currentPosition) {
    const status = document.getElementById("locationStatus");
    if (!status || !coords) return null;

    const context = mapas.evaluateNearbyContext(coords);
    if (!context) {
      status.replaceChildren(document.createTextNode(describeNearbyLocation(coords)));
      document.body.dataset.nearbyContext = "";
      return null;
    }

    const action = document.createElement("a");
    action.href = context.route;
    action.className = "location-status-action";
    action.textContent = context.actionLabel;
    action.dataset.appRoute = context.route;

    status.replaceChildren(document.createTextNode(context.message + " "));
    status.appendChild(action);
    document.body.dataset.nearbyContext = context.route;

    if (!context.isSameContext && window.RevistaDigital.location?.autoNavigateNearbyContext) {
      setTimeout(() => {
        if (document.body.dataset.nearbyContext === context.route) {
          mapas.routeToNearbyContext(context);
        }
      }, 1400);
    }

    return context;
  };

  mapas.startNearbyContextWatch = function () {
    if (!navigator.geolocation || mapas._nearbyWatchId) return;

    mapas._nearbyWatchId = navigator.geolocation.watchPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        state().currentPosition = position.coords;
        mapas.renderNearbyContext(coords);
      },
      () => {},
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  window.RevistaDigital.location = window.RevistaDigital.location || {};
  window.RevistaDigital.location.detectNearbyLocation = findNearbyLocation;
  window.RevistaDigital.location.describeNearbyLocation = describeNearbyLocation;
  window.RevistaDigital.location.getLocationMessage = mapas.getLocationMessage;
  window.RevistaDigital.location.evaluateNearbyContext = mapas.evaluateNearbyContext;
  window.RevistaDigital.location.renderNearbyContext = mapas.renderNearbyContext;
  window.RevistaDigital.location.routeToNearbyContext = mapas.routeToNearbyContext;
  window.RevistaDigital.location.startNearbyContextWatch = mapas.startNearbyContextWatch;
  window.RevistaDigital.location.autoNavigateNearbyContext = false;

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

  // Agrupación de marcadores (Leaflet.markercluster). Se carga desde el mismo
  // CDN que Leaflet y es opcional: si no está disponible o falla la descarga,
  // se resuelve igualmente con L y los mapas muestran marcadores sueltos.
  mapas.loadMarkerCluster = function () {
    const leaflet = mapas.loadLeaflet();

    if (window.L && typeof window.L.markerClusterGroup === "function") {
      return leaflet;
    }

    if (window.markerClusterPromise) {
      return window.markerClusterPromise;
    }

    window.markerClusterPromise = leaflet.then((L) => new Promise((resolve) => {
      if (L && typeof L.markerClusterGroup === "function") {
        resolve(L);
        return;
      }
      ["MarkerCluster.css", "MarkerCluster.Default.css"].forEach((file) => {
        const stylesheet = document.createElement("link");
        stylesheet.rel = "stylesheet";
        stylesheet.href = `https://unpkg.com/leaflet.markercluster@1.5.3/dist/${file}`;
        document.head.appendChild(stylesheet);
      });
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js";
      script.onload = () => resolve(window.L || L);
      script.onerror = () => resolve(window.L || L);
      document.head.appendChild(script);
    }));

    return window.markerClusterPromise;
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

        const nearby = findNearbyLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });

        status.textContent = nearby
          ? nearby.type === "hotel"
            ? `📍 Estás cerca de ${nearby.hotel.name}.`
            : `📍 Estás en ${nearby.destination.name}.`
          : "Ubicación actual disponible para calcular rutas.";

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

        mapas.renderNearbyContext({
          latitude: state().currentPosition.latitude,
          longitude: state().currentPosition.longitude
        });
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

  };

  const isAbortError = (error) => error && error.name === "AbortError";

  const makeAbortError = () => {
    const abortError = new Error("Ruta cancelada.");
    abortError.name = "AbortError";
    return abortError;
  };

  // Decodifica una polyline codificada (por defecto precisión 6, la que usa Valhalla)
  // y devuelve pares [latitud, longitud], listos para Leaflet.
  mapas.decodePolyline = function (encoded, precision) {
    const factor = Math.pow(10, typeof precision === "number" ? precision : 6);
    const coordinates = [];
    let index = 0;
    let latitude = 0;
    let longitude = 0;
    const length = encoded ? encoded.length : 0;

    while (index < length) {
      let shift = 0;
      let result = 0;
      let byte;
      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      latitude += (result & 1) ? ~(result >> 1) : (result >> 1);

      shift = 0;
      result = 0;
      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      longitude += (result & 1) ? ~(result >> 1) : (result >> 1);

      coordinates.push([latitude / factor, longitude / factor]);
    }

    return coordinates;
  };

  mapas.decodePolyline6 = function (encoded) {
    return mapas.decodePolyline(encoded, 6);
  };

  // Proveedor peatonal: Valhalla (costing pedestrian), geometría polyline6.
  mapas.requestPedestrianRoute = function (origin, destination, signal) {
    if (signal && signal.aborted) return Promise.reject(makeAbortError());
    const payload = {
      locations: [
        { lat: origin[0], lon: origin[1] },
        { lat: destination[0], lon: destination[1] }
      ],
      costing: "pedestrian",
      units: "kilometers"
    };

    return fetch("https://valhalla1.openstreetmap.de/route", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Valhalla no disponible (${response.status}).`);
        return response.json();
      })
      .then((data) => {
        const trip = data && data.trip;
        if (!trip || trip.status !== 0 || !Array.isArray(trip.legs) || !trip.legs.length) {
          throw new Error("Valhalla no encontró una ruta peatonal.");
        }
        const encodedShape = trip.legs.map((leg) => leg.shape || "").join("");
        const coordinates = mapas.decodePolyline6(encodedShape);
        if (!coordinates.length) throw new Error("Valhalla devolvió una geometría vacía.");
        const summary = trip.summary || {};
        return {
          provider: "valhalla",
          profile: "pedestrian",
          distance: typeof summary.length === "number" ? summary.length * 1000 : null,
          duration: typeof summary.time === "number" ? summary.time : null,
          coordinates
        };
      });
  };

  // Proveedor en coche: OSRM (respaldo), geometría GeoJSON.
  mapas.requestDrivingRoute = function (origin, destination, signal) {
    if (signal && signal.aborted) return Promise.reject(makeAbortError());
    const start = `${origin[1]},${origin[0]}`;
    const end = `${destination[1]},${destination[0]}`;
    const requestUrl = `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`;

    return fetch(requestUrl, signal ? { signal } : undefined)
      .then((response) => {
        if (!response.ok) throw new Error(`OSRM no disponible (${response.status}).`);
        return response.json();
      })
      .then((route) => {
        const best = Array.isArray(route.routes) && route.routes.length ? route.routes[0] : null;
        const geometry = best?.geometry?.coordinates;
        if (!best || !Array.isArray(geometry) || !geometry.length) {
          throw new Error("OSRM no encontró una ruta en coche.");
        }
        return {
          provider: "osrm",
          profile: "driving",
          distance: best.distance,
          duration: best.duration,
          coordinates: geometry.map(([longitude, latitude]) => [latitude, longitude])
        };
      });
  };

  // Criterio ÚNICO para decidir si un destino pertenece al complejo Playa Paraíso
  // (y por tanto se rutea a pie). Parte de los límites de los mapas
  // (state().complexBounds) y los amplía para cubrir los POIs verificados de la
  // guía, de modo que un mismo destino use el mismo perfil desde cualquier punto
  // de entrada (explorador o botones "Cómo llegar"). No altera las coordenadas
  // de los POIs ni los límites visuales de los mapas.
  mapas.complexRoutingBounds = function () {
    const base = (state() && state().complexBounds) || [[20.7525065, -86.9710573], [20.7654525, -86.9560717]];
    const bounds = [[base[0][0], base[0][1]], [base[1][0], base[1][1]]];
    const pois = (window.RevistaDigital?.guiapa?.POIS) || [];
    pois.forEach((poi) => {
      if (!poi || poi.verified === false) return;
      if (typeof poi.lat !== "number" || typeof poi.lng !== "number") return;
      bounds[0][0] = Math.min(bounds[0][0], poi.lat);
      bounds[0][1] = Math.min(bounds[0][1], poi.lng);
      bounds[1][0] = Math.max(bounds[1][0], poi.lat);
      bounds[1][1] = Math.max(bounds[1][1], poi.lng);
    });
    return bounds;
  };

  mapas.isComplexDestination = function (coordinates) {
    if (!Array.isArray(coordinates) || coordinates.length < 2) return false;
    const bounds = mapas.complexRoutingBounds();
    return coordinates[0] >= bounds[0][0] && coordinates[0] <= bounds[1][0] &&
      coordinates[1] >= bounds[0][1] && coordinates[1] <= bounds[1][1];
  };

  // Motor de rutas reutilizable: prioriza peatonal (Valhalla) y usa OSRM en coche
  // como respaldo. Devuelve geometría, distancia, duración, proveedor y perfil reales.
  // Nunca dibuja una línea recta como si fuera un camino.
  mapas.computeRoute = function (options) {
    const opts = options || {};
    const origin = opts.origin;
    const destination = opts.destination;
    const signal = opts.signal;
    const prefer = opts.prefer === "driving" ? "driving" : "pedestrian";

    if (!Array.isArray(origin) || origin.length < 2 || !Array.isArray(destination) || destination.length < 2) {
      return Promise.reject(new Error("Coordenadas insuficientes para calcular la ruta."));
    }

    if (prefer === "driving") {
      return mapas.requestDrivingRoute(origin, destination, signal);
    }

    return mapas.requestPedestrianRoute(origin, destination, signal).catch((error) => {
      if (isAbortError(error)) throw error;
      return mapas.requestDrivingRoute(origin, destination, signal);
    });
  };

  mapas.cancelRoute = function () {
    state().routeLine?.remove();
    state().routeLine = null;
  };

  mapas.openDirections = function (destination, coordinatesArg) {
    const mapElement = document.querySelector("#hotelMap, #generalMap, #hotelPortalMap, #destinationMap, #allHotelsMap, #countryMap, #complexPortalMap");
    const status = document.getElementById("locationStatus");

    if (!mapElement) return;

    if (!state().currentPosition) {
      if (status) status.textContent = "Necesitamos permiso para calcular la ruta.";
      mapas.requestCurrentLocation();
      return;
    }

    if (state().activeMap && window.L) {
      let destinationCoordinates = null;
      if (Array.isArray(coordinatesArg) && coordinatesArg.length === 2) {
        destinationCoordinates = [coordinatesArg[0], coordinatesArg[1]];
      } else {
        const destinationPage =
          (state().pages || []).find((item) => item.location === destination) ||
          (state().pages || [])[state().currentIndex || 0];
        destinationCoordinates = state().hotelCoordinates?.[destinationPage?.name] || state().hotelCoordinates?.[destination] || null;
      }

      if (!destinationCoordinates) {
        if (status) status.textContent = "No tenemos coordenadas verificadas para ese destino.";
        return;
      }

      const isComplex = mapas.isComplexDestination(destinationCoordinates);

      if (status) status.textContent = isComplex ? "Calculando ruta a pie..." : "Calculando ruta...";

      mapas
        .computeRoute({
          origin: [state().currentPosition.latitude, state().currentPosition.longitude],
          destination: destinationCoordinates,
          prefer: isComplex ? "pedestrian" : "driving"
        })
        .then((result) => {
          const routeCoordinates = [
            [state().currentPosition.latitude, state().currentPosition.longitude],
            ...result.coordinates,
            destinationCoordinates
          ];

          state().routeLine?.remove();
          state().routeLine = window.L.polyline(routeCoordinates, {
            color: "#d9b978",
            weight: 6,
            opacity: 0.95,
            dashArray: "12 8"
          }).addTo(state().activeMap);

          // Centra en el destino con un zoom cercano en lugar de alejar el mapa
          // para encuadrar toda la ruta (el usuario puede alejar si lo desea).
          const focusZoom = Math.max(state().activeMap.getZoom() || 15, 15);
          state().activeMap.setView(destinationCoordinates, focusZoom);

          const distance = result.distance ? `${(result.distance / 1000).toFixed(1)} km` : "";
          const minutes = result.duration ? Math.round(result.duration / 60) : null;
          const detail = [distance, minutes != null ? `${minutes} min` : ""].filter(Boolean).join(" · ");
          if (status) status.textContent = `Ruta ${result.profile === "pedestrian" ? "a pie" : "en coche"} marcada dentro del mapa${detail ? ": " + detail : ""}.`;
        })
        .catch(() => {
          state().routeLine?.remove();
          state().routeLine = null;
          if (status) status.textContent = "No se encontró una ruta disponible para ese destino.";
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
      const generalMap = L.map(mapElement, {
        zoomControl: true,
        attributionControl: true
      });

      state().activeMap = generalMap;

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

      if (window.RevistaDigital && typeof window.RevistaDigital.setupComplexMapFraming === "function") {
        window.RevistaDigital.setupComplexMapFraming(generalMap, L);
      }
    });
  };

  mapas.initializeHotelMap = function () {
    const mapElement = document.querySelector("#hotelMap");
    if (!mapElement) return;

    const hotelName = mapElement.closest(".interactive-map")?.dataset.hotelName;
    const destinationCoordinates = state().hotelCoordinates?.[hotelName];
    if (!Array.isArray(destinationCoordinates) || destinationCoordinates.length < 2) return;

    const complexBounds = state().complexBounds;
    const isPlayaParaisoHotel = Array.isArray(complexBounds) &&
      complexBounds.length === 2 &&
      destinationCoordinates[0] >= complexBounds[0][0] &&
      destinationCoordinates[0] <= complexBounds[1][0] &&
      destinationCoordinates[1] >= complexBounds[0][1] &&
      destinationCoordinates[1] <= complexBounds[1][1];

    state().activeMap = null;
    state().userMarker = null;
    state().routeLine = null;

    mapas.loadLeaflet().then((L) => {
      const mapOptions = { zoomControl: true, attributionControl: true };
      if (isPlayaParaisoHotel) {
        mapOptions.maxBounds = complexBounds;
        mapOptions.maxBoundsViscosity = 1.0;
      }
      state().activeMap = L.map(mapElement, mapOptions)
        .setView(destinationCoordinates, isPlayaParaisoHotel ? 17 : 15);

      if (isPlayaParaisoHotel) {
        state().activeMap.setMinZoom(state().activeMap.getBoundsZoom(complexBounds));
      }

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

  function addCurrentUserMarker(map, L) {
    const position = state().currentPosition;
    if (!position) return;
    state().userMarker = L.circleMarker([position.latitude, position.longitude], {
      radius: 9,
      color: "#fff",
      weight: 3,
      fillColor: "#28b7a0",
      fillOpacity: 1
    }).addTo(map).bindTooltip("Tu ubicación actual");
  }

  mapas.initializeDestinationMap = function (element, routeInfo = {}) {
    if (!element) return;
    const hotels = (routeInfo.destination?.hotels || []).filter((hotel) =>
      Array.isArray(state().hotelCoordinates?.[hotel.name])
    );
    const destination = routeInfo.destination || {};
    if (!hotels.length && !Array.isArray(destination.mapCenter)) return;

    const projectBase = new URL(document.querySelector("base")?.href || window.location.href, window.location.href).pathname.replace(/\/+$/, "");
    const points = hotels.map((hotel) => state().hotelCoordinates[hotel.name]);
    mapas.loadLeaflet().then((L) => {
      const map = L.map(element, { scrollWheelZoom: true, preferCanvas: true });
      state().activeMap = map;
      state().userMarker = null;
      state().routeLine = null;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors"
      }).addTo(map);

      hotels.forEach((hotel, index) => {
        const route = `${projectBase}/${routeInfo.countrySlug}/${routeInfo.destination.slug}/${hotel.slug}`;
        const marker = L.marker(points[index]).addTo(map);
        marker.bindPopup(`<strong>${hotel.name}</strong><br><a href="${route}" data-app-route="/${routeInfo.countrySlug}/${routeInfo.destination.slug}/${hotel.slug}">Abrir ficha del hotel →</a>`);
      });
      if (!hotels.length && Array.isArray(destination.mapCenter)) {
        L.marker(destination.mapCenter)
          .addTo(map)
          .bindPopup(`<strong>${destination.mapLabel || destination.name}</strong><br>${destination.mapNotice || "Punto de referencia del destino."}`)
          .openPopup();
      }
      addCurrentUserMarker(map, L);

      const regionPoints = points.length ? points : (Array.isArray(destination.mapCenter) ? [destination.mapCenter] : []);
      let regionBounds = null;
      if (regionPoints.length === 1) {
        const [lat, lng] = regionPoints[0];
        regionBounds = L.latLngBounds([lat - 0.15, lng - 0.15], [lat + 0.15, lng + 0.15]);
      } else if (regionPoints.length > 1) {
        regionBounds = L.latLngBounds(regionPoints).pad(0.2);
      }
      if (regionBounds) map.setMaxBounds(regionBounds);

      if (points.length === 1) map.setView(points[0], 14);
      else if (points.length > 1) map.fitBounds(L.latLngBounds(points).pad(0.16), { maxZoom: 14 });
      else map.setView(destination.mapCenter, 13);

      if (regionBounds) map.setMinZoom(map.getBoundsZoom(regionBounds));
      setTimeout(() => { try { map.invalidateSize(); } catch (e) { /* ignore */ } }, 0);
    }).catch((error) => console.warn("No se pudo cargar el mapa del destino.", error));
  };

  const COUNTRY_MAP_OVERRIDES = {
    jamaica: {
      bounds: [[17.7, -78.4], [18.6, -76.2]],
      fitMaxZoom: 9
    },
    "republica-dominicana": {
      bounds: [[17.5, -72.0], [20.0, -68.3]],
      fitMaxZoom: 8
    },
    brasil: {
      bounds: [[-15.5, -42.5], [-9.5, -34.5]],
      fitMaxZoom: 6
    }
  };

  mapas.initializeAllHotelsMap = function (element, hotels = [], options = {}) {
    if (!element) return;
    const mappedHotels = hotels.filter((hotel) => Array.isArray(state().hotelCoordinates?.[hotel.name]));
    if (!mappedHotels.length) return;
    const countryOverride = COUNTRY_MAP_OVERRIDES[options.countrySlug] || null;

    mapas.loadLeaflet().then((L) => {
      const map = L.map(element, { scrollWheelZoom: true, preferCanvas: true });
      state().activeMap = map;
      state().userMarker = null;
      state().routeLine = null;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors"
      }).addTo(map);

      const markers = L.featureGroup();
      mappedHotels.forEach((hotel) => {
        const coordinates = state().hotelCoordinates[hotel.name];
        const route = `/${hotel.countrySlug}/${hotel.destinationSlug}/${hotel.slug}`;
        L.marker(coordinates).bindPopup(`<strong>${hotel.name}</strong><br><small>${hotel.destinationName}, ${hotel.countryName}</small><br><a href="${route}" data-app-route="${route}">Abrir ficha del hotel →</a>`).addTo(markers);
      });
      addCurrentUserMarker(map, L);
      markers.addTo(map);
      const regionPoints = mappedHotels.map((hotel) => state().hotelCoordinates[hotel.name]);
      let regionBounds;
      if (countryOverride) {
        regionBounds = L.latLngBounds(countryOverride.bounds).pad(0.3);
      } else if (regionPoints.length === 1) {
        const [lat, lng] = regionPoints[0];
        regionBounds = L.latLngBounds([lat - 0.15, lng - 0.15], [lat + 0.15, lng + 0.15]);
      } else {
        regionBounds = L.latLngBounds(regionPoints).pad(0.2);
      }
      map.setMaxBounds(regionBounds);
      if (countryOverride) {
        map.fitBounds(L.latLngBounds(countryOverride.bounds), { maxZoom: countryOverride.fitMaxZoom });
      } else if (mappedHotels.length === 1) {
        map.setView(state().hotelCoordinates[mappedHotels[0].name], 9);
      } else {
        map.fitBounds(markers.getBounds().pad(0.12), { maxZoom: 5 });
      }
      const boundsZoom = map.getBoundsZoom(regionBounds);
      map.setMinZoom(countryOverride ? Math.max(1, boundsZoom - 1) : boundsZoom);
      setTimeout(() => { try { map.invalidateSize(); } catch (e) { /* ignore */ } }, 0);
    }).catch((error) => console.warn("No se pudo cargar el mapa general de hoteles.", error));
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
