// Pega aquí tu clave de Google Maps entre las comillas.
const GOOGLE_MAPS_API_KEY = "";
let googleMapsPromise;
let leafletPromise;
const generalMapCenter = { latitude: 20.7612389, longitude: -86.9640931 };
const generalMapZoom = 15;

const hotelCoordinates = {
  "Iberostar Paraíso del Mar": [20.7612389, -86.9640931],
  "Iberostar Paraíso Maya": [20.7578835, -86.9648766],
  "Iberostar Paraíso Lindo": [20.7596096, -86.9639649],
  "Iberostar Paraíso Beach": [20.7584, -86.9585],
  "Iberostar Paraíso JOIA": [20.7563073, -86.9629786]
};

// Límite del complejo: ningún mapa (general o de hotel) puede
// alejarse ni desplazarse más allá de este rectángulo. Así solo
// se ve Iberostar Playa Paraíso, nunca lo que hay alrededor.
const complexBounds = [
  [20.7550, -86.9700], // suroeste
  [20.7690, -86.9550]  // noreste
];


/* =========================================================
   NUEVO - ALMACENAMIENTO PARA WORKSPACE, 360 Y VIDEOS
   ========================================================= */

const mediaDatabaseName = "iberostarRevistaDB";
const mediaDatabaseVersion = 1;
let mediaDatabasePromise;

function openMediaDatabase() {
  if (mediaDatabasePromise) return mediaDatabasePromise;

  mediaDatabasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(mediaDatabaseName, mediaDatabaseVersion);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains("workspace")) {
        database.createObjectStore("workspace", {
          keyPath: "id",
          autoIncrement: true
        });
      }

      if (!database.objectStoreNames.contains("media360")) {
        database.createObjectStore("media360", {
          keyPath: "id",
          autoIncrement: true
        });
      }

      if (!database.objectStoreNames.contains("videos")) {
        database.createObjectStore("videos", {
          keyPath: "id",
          autoIncrement: true
        });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return mediaDatabasePromise;
}

async function databaseGetAll(storeName) {
  const database = await openMediaDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

async function databaseAdd(storeName, data) {
  const database = await openMediaDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.add(data);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function databasePut(storeName, data) {
  const database = await openMediaDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.put(data);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function databaseDelete(storeName, id) {
  const database = await openMediaDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.delete(Number(id));

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);

    reader.readAsDataURL(file);
  });
}

function createMediaUrl(blob) {
  if (!blob) return "";
  return URL.createObjectURL(blob);
}

function getHotelNames() {
  return pages
    .filter((page) => page.type === "hotel")
    .map((page) => page.name);
}


/* =========================================================
   PÁGINAS
   ========================================================= */

const pages = [
  {
    type: "cover",
    kicker: "REVISTA DIGITAL · PLAYA PARAÍSO",
    image: "src/JOIA2.jpg",
    title: "Iberostar Playa Paraíso",
    subtitle: "La guía interactiva del complejo",
    quote: "Un destino que se queda contigo para siempre"
  },

  {
    type: "hotel",
    kicker: "HOTEL 1 DE 5 · PARAÍSO DEL MAR",
    name: "Iberostar Paraíso del Mar",
    location: "Iberostar Paraíso del Mar, Playa Paraíso, Quintana Roo, México",
    image: "src/paraisoDelMar.jpg",
    intro: "Iberostar Waves Paraíso del Mar combina la belleza natural de la Riviera Maya, una experiencia Todo Incluido premium, gastronomía internacional, actividades para toda la familia y acceso a una de las playas más atractivas del Caribe mexicano.",
    stats: [
      ["344", "Habitaciones"],
      ["7", "Restaurantes"],
      ["4", "Piscinas"]
    ],
    benefits: [
      "Programa de deporte Fit&Fun y animación diaria",
      "Desayuno, almuerzo y cena buffet en el restaurante principal",
      "Snack bar entre el almuerzo y la cena",
      "Acceso a las instalaciones y restaurantes de Iberostar Waves Paraíso Beach"
    ]
  },

  {
    type: "hotel",
    kicker: "HOTEL 2 DE 5 · PARAÍSO MAYA",
    name: "Iberostar Paraíso Maya",
    location: "Iberostar Selection Paraíso Maya Suites, Carretera Chetumal-Puerto Juárez km 309, Playa Paraíso, Quintana Roo, México",
    image: "src/paraisoMaya.jpg",
    intro: "Iberostar Selection Paraíso Maya combina la grandeza de la cultura maya con una experiencia todo incluido frente al Caribe. Sus piscinas, parque acuático, río lento, gastronomía internacional y programas familiares convierten al resort en uno de los destinos más completos de Riviera Maya..",
    stats: [
      ["308", "Habitaciones"],
      ["8", "Restaurantes"],
      ["5", "Piscinas"]
    ],
    benefits: [
      "Cenote natural en el hotel",
      "Tours culturales mayas",
      "Cocina yucateca",
      "Anfiteatro maya"
    ]
  },

  {
    type: "hotel",
    kicker: "HOTEL 3 DE 5 · PARAÍSO LINDO",
    name: "Iberostar Paraíso Lindo",
    location: "Iberostar Paraíso Lindo, Playa Paraíso, Quintana Roo, México",
    image: "src/ParaisoLindo.jpg",
    intro: "Iberostar Selection Paraíso Lindo combina naturaleza, diversión y descanso en un entorno privilegiado frente al Caribe mexicano. Sus piscinas, parque acuático, río lento y experiencias gastronómicas lo convierten en el lugar ideal para familias y viajeros que buscan disfrutar de la esencia de Riviera Maya con el sello de hospitalidad Iberostar.",
    stats: [
      ["388", "Habitaciones"],
      ["9", "Restaurantes"],
      ["6", "Piscinas"]
    ],
    benefits: [
      "Aqua Park con toboganes",
      "Kids Club premiado",
      "Baby club (0-3 años)",
      "Teen Club"
    ]
  },

  {
    type: "hotel",
    kicker: "HOTEL 4 DE 5 · PARAÍSO BEACH",
    name: "Iberostar Paraíso Beach",
    location: "Iberostar Paraíso Beach, Playa Paraíso, Quintana Roo, México",
    image: "src/paraisoBeach.jpg",
    intro: "Iberostar Waves Paraíso Beach combina la esencia del Caribe mexicano con una experiencia Todo Incluido diseñada para toda la familia. Rodeado de exuberantes jardines tropicales y una espectacular playa de arena blanca, ofrece gastronomía internacional, entretenimiento para todas las edades, piscinas de gran tamaño y acceso a las experiencias exclusivas que caracterizan a Iberostar. Un destino donde la relajación, la diversión y la sostenibilidad se unen para crear vacaciones inolvidables.",
    stats: [
      ["302", "Habitaciones"],
      ["6", "Restaurantes"],
      ["4", "Piscinas"]
    ],
    benefits: [
      "Bar sumergible en piscina",
      "Snorkel directo desde la playa",
      "Animación todo el día",
      "Vista al arrecife"
    ]
  },

  {
    type: "hotel",
    kicker: "HOTEL 5 DE 5 · PARAÍSO JOIA",
    name: "Iberostar Paraíso JOIA",
    location: "Iberostar JOIA Paraíso, Playa Paraíso, Quintana Roo, México",
    image: "src/JOIA.jpg",
    intro: "JOIA Paraíso by Iberostar representa la máxima expresión de lujo dentro del complejo Iberostar Playa Paraíso. Diseñado exclusivamente para adultos, ofrece suites elegantes, servicio de mayordomía, experiencias gastronómicas gourmet, spa de clase mundial y acceso privilegiado a una de las playas más hermosas del Caribe mexicano.",
    stats: [
      ["310", "Habitaciones"],
      ["8", "Restaurantes"],
      ["5", "Piscinas"]
    ],
    benefits: [
      "Suites frente al mar",
      "Mayordomía personalizada",
      "Campo de golf",
      "Spa de autor"
    ]
  },

  {
    type: "map",
    kicker: "MAPA GENERAL · 5 HOTELES",
    title: "Iberostar Playa Paraíso",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=90"
  },

  {
    type: "mapamundi",
    title: "Mapa Mundi"
  },

  /* NUEVO */
  {
    type: "workspace",
    title: "Workspace",
    kicker: "EXPERIENCIAS DE LA COMUNIDAD"
  },

  /* NUEVO */
  {
    type: "media360",
    title: "Exploración 360°",
    kicker: "RECORRIDO VIRTUAL"
  },

  /* NUEVO */
  {
    type: "videos",
    title: "Videos",
    kicker: "EXPERIENCIAS EN VIDEO"
  },

  {
    type: "back",
    kicker: "CONTRAPORTADA",
    image: "src/JOIA3.jpg",
    quote: "Un destino que se queda contigo para siempre",
    contact: [
      "+52 984 877 2800",
      "reservas@iberostar.com",
      "iberostar.com",
      "Playa del Carmen, Q.R00"
    ]
  }
];


const bookShell = document.getElementById("bookShell");
const pager = document.getElementById("pager");
const leftButton = document.querySelector(".nav-left");
const rightButton = document.querySelector(".nav-right");

let currentIndex = 0;
let currentPosition = null;
let activeMap = null;
let activeDirectionsRenderer = null;
let userMarker = null;
let routeLine = null;


/* =========================================================
   LEAFLET
   ========================================================= */

function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  if (leafletPromise) return leafletPromise;

  leafletPromise = new Promise((resolve, reject) => {
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

  return leafletPromise;
}

function loadGoogleMaps() {
  if (!GOOGLE_MAPS_API_KEY) return Promise.resolve(null);
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (googleMapsPromise) return googleMapsPromise;

  googleMapsPromise = new Promise((resolve, reject) => {
    const callbackName = "googleMapsReady";

    window[callbackName] = () => resolve(window.google.maps);

    const script = document.createElement("script");

    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry&callback=${callbackName}`;

    script.async = true;
    script.defer = true;
    script.onerror = reject;

    document.head.appendChild(script);
  });

  return googleMapsPromise;
}


/* =========================================================
   UBICACIÓN
   ========================================================= */

function requestCurrentLocation() {
  const status = document.getElementById("locationStatus");

  if (!navigator.geolocation) {
    status.textContent =
      "La geolocalización no está disponible en este navegador.";
    return;
  }

  status.textContent =
    "Solicitando permiso para detectar tu ubicación...";

  navigator.geolocation.getCurrentPosition(
    (position) => {
      currentPosition = position.coords;

      status.textContent =
        "Ubicación actual disponible para calcular rutas.";

      if (activeMap && userMarker) {
        userMarker.setLatLng([
          currentPosition.latitude,
          currentPosition.longitude
        ]);

        activeMap.panTo([
          currentPosition.latitude,
          currentPosition.longitude
        ]);
      } else if (activeMap && window.L) {
        userMarker = L.circleMarker(
          [
            currentPosition.latitude,
            currentPosition.longitude
          ],
          {
            radius: 9,
            color: "#fff",
            weight: 3,
            fillColor: "#28b7a0",
            fillOpacity: 1
          }
        )
          .addTo(activeMap)
          .bindTooltip("Tu ubicación actual");
      }

      updateGeneralUserMarker();
      updateHotelUserMarker();
    },
    () => {
      status.textContent =
        "Permiso no concedido. Puedes activarlo desde el navegador.";
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    }
  );

  navigator.geolocation.watchPosition(
    (position) => {
      currentPosition = position.coords;

      if (userMarker) {
        userMarker.setLatLng([
          currentPosition.latitude,
          currentPosition.longitude
        ]);
      }

      updateGeneralUserMarker();
      updateHotelUserMarker();
    },
    () => {},
    {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 15000
    }
  );
}


/* =========================================================
   RUTAS
   ========================================================= */

function openDirections(destination) {
  const mapElement =
    bookShell.querySelector("#hotelMap, #generalMap");

  const status =
    document.getElementById("locationStatus");

  if (!mapElement) return;

  if (!currentPosition) {
    status.textContent =
      "Necesitamos permiso para calcular la ruta.";

    requestCurrentLocation();
    return;
  }

  const origin =
    `${currentPosition.latitude},${currentPosition.longitude}`;

  if (activeMap && window.L) {
    const destinationPage =
      pages.find((item) => item.location === destination) ||
      pages[currentIndex];

    const destinationCoordinates =
      hotelCoordinates[destinationPage.name];

    if (!destinationCoordinates) return;

    const start =
      `${currentPosition.longitude},${currentPosition.latitude}`;

    const end =
      `${destinationCoordinates[1]},${destinationCoordinates[0]}`;

    const routeRequest =
      `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`;

    fetch(routeRequest)
      .then((response) => response.json())
      .then((route) => {
        const routeCoordinates =
          route.routes?.[0]?.geometry?.coordinates?.map(
            ([longitude, latitude]) =>
              [latitude, longitude]
          );

        routeLine?.remove();

        routeLine =
          L.polyline(
            routeCoordinates ||
              [
                [
                  currentPosition.latitude,
                  currentPosition.longitude
                ],
                destinationCoordinates
              ],
            {
              color: "#d9b978",
              weight: 6,
              opacity: 0.95,
              dashArray: "12 8"
            }
          ).addTo(activeMap);

        activeMap.fitBounds(
          routeLine.getBounds(),
          {
            padding: [35, 35]
          }
        );

        const distance =
          route.routes?.[0]?.distance
            ? `${(
                route.routes[0].distance / 1000
              ).toFixed(1)} km`
            : "Ruta calculada";

        document.getElementById(
          "locationStatus"
        ).textContent =
          `Ruta por calles marcada dentro del mapa: ${distance}.`;
      })
      .catch(() => {
        routeLine?.remove();

        routeLine =
          L.polyline(
            [
              [
                currentPosition.latitude,
                currentPosition.longitude
              ],
              destinationCoordinates
            ],
            {
              color: "#d9b978",
              weight: 6,
              dashArray: "12 8"
            }
          ).addTo(activeMap);

        activeMap.fitBounds(
          routeLine.getBounds(),
          {
            padding: [35, 35]
          }
        );

        document.getElementById(
          "locationStatus"
        ).textContent =
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

  status.textContent =
    "Ruta mostrada dentro del mapa.";
}


/* =========================================================
   MAPA DE HOTEL
   ========================================================= */

function hotelMap(page) {
  return `
    <div
      class="interactive-map"
      data-location="${page.location}"
      data-hotel-name="${page.name}"
    >
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

      <div
        class="hotel-google-frame"
        id="hotelMapFrame"
      >
        <div id="hotelMap" class="google-map"></div>
      </div>
    </div>
  `;
}


/* =========================================================
   MARCADORES
   ========================================================= */

function updateGeneralUserMarker() {
  const marker =
    document.getElementById("generalUserMarker");

  const frame =
    document.getElementById("generalMapFrame");

  if (!marker || !frame || !currentPosition) return;

  const width = frame.clientWidth;
  const height = frame.clientHeight;

  const worldSize =
    256 * 2 ** generalMapZoom;

  const project =
    (latitude, longitude) => {
      const x =
        ((longitude + 180) / 360) *
        worldSize;

      const sine =
        Math.sin(
          (latitude * Math.PI) / 180
        );

      const y =
        (
          0.5 -
          Math.log(
            (1 + sine) /
            (1 - sine)
          ) /
          (4 * Math.PI)
        ) *
        worldSize;

      return { x, y };
    };

  const center =
    project(
      generalMapCenter.latitude,
      generalMapCenter.longitude
    );

  const user =
    project(
      currentPosition.latitude,
      currentPosition.longitude
    );

  marker.style.left =
    `${width / 2 + user.x - center.x}px`;

  marker.style.top =
    `${height / 2 + user.y - center.y}px`;

  marker.classList.add("visible");
}

function updateHotelUserMarker() {
  const marker =
    document.getElementById("hotelUserMarker");

  const frame =
    document.getElementById("hotelMapFrame");

  const hotelName =
    frame?.closest(".interactive-map")
      ?.dataset.hotelName;

  if (
    !marker ||
    !frame ||
    !currentPosition ||
    !hotelCoordinates[hotelName]
  ) return;

  const center =
    hotelCoordinates[hotelName];

  const zoom = 18;

  const worldSize =
    256 * 2 ** zoom;

  const project =
    (latitude, longitude) => {
      const x =
        ((longitude + 180) / 360) *
        worldSize;

      const sine =
        Math.sin(
          (latitude * Math.PI) / 180
        );

      const y =
        (
          0.5 -
          Math.log(
            (1 + sine) /
            (1 - sine)
          ) /
          (4 * Math.PI)
        ) *
        worldSize;

      return { x, y };
    };

  const centerPoint =
    project(
      center[0],
      center[1]
    );

  const userPoint =
    project(
      currentPosition.latitude,
      currentPosition.longitude
    );

  marker.style.left =
    `${frame.clientWidth / 2 + userPoint.x - centerPoint.x}px`;

  marker.style.top =
    `${frame.clientHeight / 2 + userPoint.y - centerPoint.y}px`;

  marker.classList.add("visible");
}


/* =========================================================
   HOTEL
   ========================================================= */

function renderHotel(page) {
  const stats =
    page.stats
      .map(
        ([value, label]) =>
          `<div><strong>${value}</strong><small>${label}</small></div>`
      )
      .join("");

  const benefits =
    page.benefits
      .map((item) => `<li>${item}</li>`)
      .join("");

  return `
    <div class="spread reference-spread hotel-spread">

      <article class="reference-left">

        <div
          class="reference-photo"
          style="background-image:linear-gradient(180deg,transparent 35%,rgba(5,12,17,.8)),url('${page.image}')"
        >
          <div>
            <small>Todo lo incluido · La esencia</small>
            <h1>${page.name}</h1>
          </div>
        </div>

        <div class="reference-copy">

          <p>${page.intro}</p>

          <div class="reference-stats">
            ${stats}
          </div>

          <ul>
            ${benefits}
          </ul>

        </div>

      </article>

      <article class="reference-right">

        <header>
          <small>MAPA INTERACTIVO</small>
          <h2>${page.name}</h2>
        </header>

        ${hotelMap(page)}

        <div class="food-panel">

          <small>GASTRONOMÍA</small>

          <h3>
            Reservar Restaurante <b>★</b>
          </h3>

          <div class="food-list">
            <span>
              🍝 Bella Italia
              <small>18:00</small>
            </span>

            <span>
              🍜 La Palapa
              <small>07:00</small>
            </span>

            <span>
              🥩 El Gaucho
              <small>19:00</small>
            </span>

            <span>
              🍔 Snack &amp; Grill
              <small>12:00</small>
            </span>
          </div>

          <button
            class="reserve"
            type="button"
          >
            HACER RESERVACIÓN →
          </button>

        </div>

      </article>

    </div>
  `;
}


/* =========================================================
   NUEVO - WORKSPACE
   ========================================================= */

function renderWorkspace() {
  return `
    <div class="spread workspace-spread">

      <div class="workspace-header">
        <div>
          <small>EXPERIENCIAS DE LA COMUNIDAD</small>
          <h1>Workspace</h1>
        </div>

        <button
          class="workspace-add-button"
          id="workspaceAddButton"
          type="button"
        >
          + Agregar experiencia
        </button>
      </div>

      <div class="workspace-content">

        <div
          class="workspace-form"
          id="workspaceForm"
        >

          <input
            type="hidden"
            id="workspaceEditId"
          />

          <label>
            Hotel
            <select id="workspaceHotel">
              ${getHotelNames()
                .map(
                  (hotel) =>
                    `<option value="${hotel}">${hotel}</option>`
                )
                .join("")}
            </select>
          </label>

          <label>
            Título
            <input
              type="text"
              id="workspaceTitle"
              placeholder="Nombre de la experiencia"
            />
          </label>

          <label>
            Texto
            <textarea
              id="workspaceText"
              placeholder="Escribe la experiencia..."
            ></textarea>
          </label>

          <label>
            Producto
            <input
              type="text"
              id="workspaceProduct"
              placeholder="Producto o servicio"
            />
          </label>

          <label>
            Foto
            <input
              type="file"
              id="workspaceImage"
              accept="image/*"
            />
          </label>

          <div class="workspace-form-actions">

            <button
              type="button"
              id="workspaceSaveButton"
            >
              PUBLICAR
            </button>

            <button
              type="button"
              class="media-cancel"
              id="workspaceCancelButton"
            >
              CANCELAR
            </button>

          </div>

        </div>

        <div
          class="workspace-cards"
          id="workspaceCards"
        ></div>

      </div>

    </div>
  `;
}

async function renderWorkspaceCards() {
  const container =
    document.getElementById("workspaceCards");

  if (!container) return;

  const items =
    await databaseGetAll("workspace");

  if (!items.length) {
    container.innerHTML = `
      <div class="workspace-empty">
        Todavía no hay experiencias publicadas.
      </div>
    `;

    return;
  }

  container.innerHTML =
    items
      .map(
        (item) => `
          <article
            class="workspace-card"
            data-id="${item.id}"
          >

            ${
              item.image
                ? `
                  <img
                    class="workspace-card-image"
                    src="${item.image}"
                    alt="${item.title}"
                  />
                `
                : `
                  <div class="workspace-card-image"></div>
                `
            }

            <div class="workspace-card-content">

              <div class="workspace-card-hotel">
                ${item.hotel}
              </div>

              <h3>
                ${item.title}
              </h3>

              <p>
                ${item.text}
              </p>

              ${
                item.product
                  ? `
                    <div class="workspace-product">
                      Producto: ${item.product}
                    </div>
                  `
                  : ""
              }

              <div class="workspace-card-actions">

                <button
                  type="button"
                  data-workspace-edit="${item.id}"
                >
                  EDITAR
                </button>

                <button
                  type="button"
                  class="media-delete"
                  data-workspace-delete="${item.id}"
                >
                  ELIMINAR
                </button>

              </div>

            </div>

          </article>
        `
      )
      .join("");

  container
    .querySelectorAll("[data-workspace-edit]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        editWorkspace(
          button.dataset.workspaceEdit
        );
      });
    });

  container
    .querySelectorAll("[data-workspace-delete]")
    .forEach((button) => {
      button.addEventListener("click", async () => {
        await deleteWorkspace(
          button.dataset.workspaceDelete
        );
      });
    });
}

async function editWorkspace(id) {
  const items =
    await databaseGetAll("workspace");

  const item =
    items.find(
      (entry) =>
        String(entry.id) === String(id)
    );

  if (!item) return;

  document.getElementById(
    "workspaceEditId"
  ).value = item.id;

  document.getElementById(
    "workspaceHotel"
  ).value = item.hotel;

  document.getElementById(
    "workspaceTitle"
  ).value = item.title;

  document.getElementById(
    "workspaceText"
  ).value = item.text;

  document.getElementById(
    "workspaceProduct"
  ).value = item.product || "";

  document.getElementById(
    "workspaceForm"
  ).classList.add("visible");

  document.getElementById(
    "workspaceSaveButton"
  ).textContent = "GUARDAR CAMBIOS";
}

async function deleteWorkspace(id) {
  await databaseDelete("workspace", id);
  await renderWorkspaceCards();
}

function resetWorkspaceForm() {
  document.getElementById(
    "workspaceEditId"
  ).value = "";

  document.getElementById(
    "workspaceTitle"
  ).value = "";

  document.getElementById(
    "workspaceText"
  ).value = "";

  document.getElementById(
    "workspaceProduct"
  ).value = "";

  document.getElementById(
    "workspaceImage"
  ).value = "";

  document.getElementById(
    "workspaceSaveButton"
  ).textContent = "PUBLICAR";
}

function wireWorkspace() {
  const addButton =
    document.getElementById(
      "workspaceAddButton"
    );

  const form =
    document.getElementById(
      "workspaceForm"
    );

  const saveButton =
    document.getElementById(
      "workspaceSaveButton"
    );

  const cancelButton =
    document.getElementById(
      "workspaceCancelButton"
    );

  if (!addButton || !form) return;

  addButton.addEventListener("click", () => {
    form.classList.toggle("visible");
  });

  cancelButton.addEventListener("click", () => {
    resetWorkspaceForm();
    form.classList.remove("visible");
  });

  saveButton.addEventListener("click", async () => {
    const editId =
      document.getElementById(
        "workspaceEditId"
      ).value;

    const hotel =
      document.getElementById(
        "workspaceHotel"
      ).value;

    const title =
      document.getElementById(
        "workspaceTitle"
      ).value.trim();

    const text =
      document.getElementById(
        "workspaceText"
      ).value.trim();

    const product =
      document.getElementById(
        "workspaceProduct"
      ).value.trim();

    const imageFile =
      document.getElementById(
        "workspaceImage"
      ).files[0];

    if (!title || !text) {
      alert(
        "Completa el título y el texto."
      );

      return;
    }

    let image = "";

    if (imageFile) {
      image =
        await fileToDataURL(imageFile);
    }

    if (editId) {
      const items =
        await databaseGetAll(
          "workspace"
        );

      const current =
        items.find(
          (item) =>
            String(item.id) ===
            String(editId)
        );

      await databasePut(
        "workspace",
        {
          ...current,
          hotel,
          title,
          text,
          product,
          image:
            image ||
            current.image ||
            ""
        }
      );
    } else {
      await databaseAdd(
        "workspace",
        {
          hotel,
          title,
          text,
          product,
          image,
          createdAt: Date.now()
        }
      );
    }

    resetWorkspaceForm();
    form.classList.remove("visible");

    await renderWorkspaceCards();
  });
}


/* =========================================================
   NUEVO - 360
   ========================================================= */

function render360() {
  return `
    <div class="spread media-spread">

      <div class="media-header">
        <div>
          <small>RECORRIDO VIRTUAL</small>
          <h1>Exploración 360°</h1>
        </div>

        <button
          class="media-add-button"
          id="media360AddButton"
          type="button"
        >
          + Agregar imagen 360°
        </button>
      </div>

      <div class="media-content">

        <div
          class="media-form"
          id="media360Form"
        >

          <input
            type="hidden"
            id="media360EditId"
          />

          <label>
            Hotel
            <select id="media360Hotel">
              ${getHotelNames()
                .map(
                  (hotel) =>
                    `<option value="${hotel}">${hotel}</option>`
                )
                .join("")}
            </select>
          </label>

          <label>
            Título
            <input
              type="text"
              id="media360Title"
              placeholder="Nombre del recorrido"
            />
          </label>

          <label>
            Imagen 360°
            <input
              type="file"
              id="media360Image"
              accept="image/*"
            />
          </label>

          <div class="media-form-actions">

            <button
              type="button"
              id="media360SaveButton"
            >
              PUBLICAR
            </button>

            <button
              type="button"
              class="media-cancel"
              id="media360CancelButton"
            >
              CANCELAR
            </button>

          </div>

        </div>

        <div
          class="media-selector"
        >
          <label for="media360Filter">
            Hotel:
          </label>

          <select id="media360Filter">
            <option value="all">
              Todos
            </option>

            ${getHotelNames()
              .map(
                (hotel) =>
                  `<option value="${hotel}">${hotel}</option>`
              )
              .join("")}
          </select>
        </div>

        <div
          class="media-grid"
          id="media360Grid"
        ></div>

      </div>

    </div>
  `;
}

async function render360Cards() {
  const container =
    document.getElementById(
      "media360Grid"
    );

  if (!container) return;

  const filter =
    document.getElementById(
      "media360Filter"
    )?.value || "all";

  const items =
    await databaseGetAll(
      "media360"
    );

  const filtered =
    filter === "all"
      ? items
      : items.filter(
          (item) =>
            item.hotel === filter
        );

  if (!filtered.length) {
    container.innerHTML = `
      <div class="media-empty">
        No hay imágenes 360° para este hotel.
      </div>
    `;

    return;
  }

  container.innerHTML = "";

  filtered.forEach((item) => {
    const url =
      createMediaUrl(item.image);

    const card =
      document.createElement("article");

    card.className =
      "media-card";

    card.innerHTML = `
      <img
        class="media-card-image"
        src="${url}"
        alt="${item.title}"
      />

      <div class="media-card-content">

        <h3>
          ${item.title}
        </h3>

        <p>
          ${item.hotel}
        </p>

        <div class="media-card-actions">

          <button
            type="button"
            data-360-edit="${item.id}"
          >
            EDITAR
          </button>

          <button
            type="button"
            class="media-delete"
            data-360-delete="${item.id}"
          >
            ELIMINAR
          </button>

        </div>

      </div>
    `;

    container.appendChild(card);

    card
      .querySelector("[data-360-edit]")
      .addEventListener(
        "click",
        () => edit360(item.id)
      );

    card
      .querySelector("[data-360-delete]")
      .addEventListener(
        "click",
        () => delete360(item.id)
      );
  });
}

async function edit360(id) {
  const items =
    await databaseGetAll(
      "media360"
    );

  const item =
    items.find(
      (entry) =>
        String(entry.id) ===
        String(id)
    );

  if (!item) return;

  document.getElementById(
    "media360EditId"
  ).value = item.id;

  document.getElementById(
    "media360Hotel"
  ).value = item.hotel;

  document.getElementById(
    "media360Title"
  ).value = item.title;

  document.getElementById(
    "media360Form"
  ).classList.add("visible");

  document.getElementById(
    "media360SaveButton"
  ).textContent =
    "GUARDAR CAMBIOS";
}

async function delete360(id) {
  await databaseDelete(
    "media360",
    id
  );

  await render360Cards();
}

function reset360Form() {
  document.getElementById(
    "media360EditId"
  ).value = "";

  document.getElementById(
    "media360Title"
  ).value = "";

  document.getElementById(
    "media360Image"
  ).value = "";

  document.getElementById(
    "media360SaveButton"
  ).textContent =
    "PUBLICAR";
}

function wire360() {
  const addButton =
    document.getElementById(
      "media360AddButton"
    );

  const form =
    document.getElementById(
      "media360Form"
    );

  const saveButton =
    document.getElementById(
      "media360SaveButton"
    );

  const cancelButton =
    document.getElementById(
      "media360CancelButton"
    );

  const filter =
    document.getElementById(
      "media360Filter"
    );

  if (!addButton || !form) return;

  addButton.addEventListener(
    "click",
    () => {
      form.classList.toggle(
        "visible"
      );
    }
  );

  cancelButton.addEventListener(
    "click",
    () => {
      reset360Form();
      form.classList.remove(
        "visible"
      );
    }
  );

  filter.addEventListener(
    "change",
    render360Cards
  );

  saveButton.addEventListener(
    "click",
    async () => {
      const editId =
        document.getElementById(
          "media360EditId"
        ).value;

      const hotel =
        document.getElementById(
          "media360Hotel"
        ).value;

      const title =
        document.getElementById(
          "media360Title"
        ).value.trim();

      const file =
        document.getElementById(
          "media360Image"
        ).files[0];

      if (!title) {
        alert(
          "Escribe un título."
        );

        return;
      }

      if (!editId && !file) {
        alert(
          "Selecciona una imagen 360°."
        );

        return;
      }

      if (editId) {
        const items =
          await databaseGetAll(
            "media360"
          );

        const current =
          items.find(
            (item) =>
              String(item.id) ===
              String(editId)
          );

        let image =
          current.image;

        if (file) {
          image =
            await fileToDataURL(
              file
            );
        }

        await databasePut(
          "media360",
          {
            ...current,
            hotel,
            title,
            image
          }
        );
      } else {
        const image =
          await fileToDataURL(
            file
          );

        await databaseAdd(
          "media360",
          {
            hotel,
            title,
            image,
            createdAt: Date.now()
          }
        );
      }

      reset360Form();

      form.classList.remove(
        "visible"
      );

      await render360Cards();
    }
  );
}


/* =========================================================
   NUEVO - VIDEOS
   ========================================================= */

function renderVideos() {
  return `
    <div class="spread media-spread">

      <div class="media-header">

        <div>
          <small>EXPERIENCIAS EN VIDEO</small>
          <h1>Videos</h1>
        </div>

        <button
          class="media-add-button"
          id="videosAddButton"
          type="button"
        >
          + Agregar video
        </button>

      </div>

      <div class="media-content">

        <div
          class="media-form"
          id="videosForm"
        >

          <input
            type="hidden"
            id="videosEditId"
          />

          <label>
            Hotel

            <select id="videosHotel">
              ${getHotelNames()
                .map(
                  (hotel) =>
                    `<option value="${hotel}">${hotel}</option>`
                )
                .join("")}
            </select>
          </label>

          <label>
            Título

            <input
              type="text"
              id="videosTitle"
              placeholder="Nombre del video"
            />
          </label>

          <label>
            Video

            <input
              type="file"
              id="videosFile"
              accept="video/*"
            />
          </label>

          <video
            class="video-preview"
            id="videosPreview"
            controls
          ></video>

          <div
            class="video-duration-info"
            id="videosDurationInfo"
          >
            Selecciona un video para establecer el fragmento.
          </div>

          <div class="video-time-row">

            <label>
              Inicio (segundos)

              <input
                type="number"
                id="videosStart"
                min="0"
                step="0.1"
                value="0"
              />
            </label>

            <label>
              Final (segundos)

              <input
                type="number"
                id="videosEnd"
                min="0"
                step="0.1"
                value="35"
              />
            </label>

          </div>

          <div class="media-note">
            El fragmento publicado no puede superar los 35 segundos.
          </div>

          <div class="media-form-actions">

            <button
              type="button"
              id="videosSaveButton"
            >
              PUBLICAR
            </button>

            <button
              type="button"
              class="media-cancel"
              id="videosCancelButton"
            >
              CANCELAR
            </button>

          </div>

        </div>

        <div
          class="media-selector"
        >

          <label for="videosFilter">
            Hotel:
          </label>

          <select id="videosFilter">

            <option value="all">
              Todos
            </option>

            ${getHotelNames()
              .map(
                (hotel) =>
                  `<option value="${hotel}">${hotel}</option>`
              )
              .join("")}

          </select>

        </div>

        <div
          class="media-grid"
          id="videosGrid"
        ></div>

      </div>

    </div>
  `;
}

async function renderVideoCards() {
  const container =
    document.getElementById(
      "videosGrid"
    );

  if (!container) return;

  const filter =
    document.getElementById(
      "videosFilter"
    )?.value || "all";

  const items =
    await databaseGetAll(
      "videos"
    );

  const filtered =
    filter === "all"
      ? items
      : items.filter(
          (item) =>
            item.hotel === filter
        );

  if (!filtered.length) {
    container.innerHTML = `
      <div class="media-empty">
        No hay videos publicados para este hotel.
      </div>
    `;

    return;
  }

  container.innerHTML = "";

  filtered.forEach((item) => {
    const url =
      createMediaUrl(item.video);

    const card =
      document.createElement(
        "article"
      );

    card.className =
      "media-card";

    card.innerHTML = `
      <video
        class="media-card-video"
        controls
        data-video-start="${item.start}"
        data-video-end="${item.end}"
      >
        <source
          src="${url}"
          type="${item.mimeType || "video/mp4"}"
        >
      </video>

      <div class="media-card-content">

        <h3>
          ${item.title}
        </h3>

        <p>
          ${item.hotel}
        </p>

        <p>
          Fragmento:
          ${Number(item.start).toFixed(1)}s -
          ${Number(item.end).toFixed(1)}s
        </p>

        <div class="media-card-actions">

          <button
            type="button"
            data-video-edit="${item.id}"
          >
            EDITAR
          </button>

          <button
            type="button"
            class="media-delete"
            data-video-delete="${item.id}"
          >
            ELIMINAR
          </button>

        </div>

      </div>
    `;

    container.appendChild(card);

    const video =
      card.querySelector(
        "video"
      );

    video.addEventListener(
      "loadedmetadata",
      () => {
        video.currentTime =
          Number(item.start);

        video.addEventListener(
          "timeupdate",
          () => {
            if (
              video.currentTime >=
              Number(item.end)
            ) {
              video.pause();
              video.currentTime =
                Number(item.start);
            }
          }
        );
      }
    );

    card
      .querySelector(
        "[data-video-edit]"
      )
      .addEventListener(
        "click",
        () =>
          editVideo(item.id)
      );

    card
      .querySelector(
        "[data-video-delete]"
      )
      .addEventListener(
        "click",
        () =>
          deleteVideo(item.id)
      );
  });
}

async function editVideo(id) {
  const items =
    await databaseGetAll(
      "videos"
    );

  const item =
    items.find(
      (entry) =>
        String(entry.id) ===
        String(id)
    );

  if (!item) return;

  document.getElementById(
    "videosEditId"
  ).value = item.id;

  document.getElementById(
    "videosHotel"
  ).value = item.hotel;

  document.getElementById(
    "videosTitle"
  ).value = item.title;

  document.getElementById(
    "videosStart"
  ).value = item.start;

  document.getElementById(
    "videosEnd"
  ).value = item.end;

  const preview =
    document.getElementById(
      "videosPreview"
    );

  const url =
    createMediaUrl(item.video);

  preview.src = url;
  preview.classList.add(
    "visible"
  );

  document.getElementById(
    "videosForm"
  ).classList.add(
    "visible"
  );

  document.getElementById(
    "videosSaveButton"
  ).textContent =
    "GUARDAR CAMBIOS";
}

async function deleteVideo(id) {
  await databaseDelete(
    "videos",
    id
  );

  await renderVideoCards();
}

function resetVideoForm() {
  document.getElementById(
    "videosEditId"
  ).value = "";

  document.getElementById(
    "videosTitle"
  ).value = "";

  document.getElementById(
    "videosFile"
  ).value = "";

  document.getElementById(
    "videosStart"
  ).value = "0";

  document.getElementById(
    "videosEnd"
  ).value = "35";

  const preview =
    document.getElementById(
      "videosPreview"
    );

  preview.pause();
  preview.removeAttribute(
    "src"
  );
  preview.load();
  preview.classList.remove(
    "visible"
  );

  document.getElementById(
    "videosDurationInfo"
  ).textContent =
    "Selecciona un video para establecer el fragmento.";

  document.getElementById(
    "videosSaveButton"
  ).textContent =
    "PUBLICAR";
}

function wireVideos() {
  const addButton =
    document.getElementById(
      "videosAddButton"
    );

  const form =
    document.getElementById(
      "videosForm"
    );

  const saveButton =
    document.getElementById(
      "videosSaveButton"
    );

  const cancelButton =
    document.getElementById(
      "videosCancelButton"
    );

  const filter =
    document.getElementById(
      "videosFilter"
    );

  const fileInput =
    document.getElementById(
      "videosFile"
    );

  const preview =
    document.getElementById(
      "videosPreview"
    );

  const startInput =
    document.getElementById(
      "videosStart"
    );

  const endInput =
    document.getElementById(
      "videosEnd"
    );

  const durationInfo =
    document.getElementById(
      "videosDurationInfo"
    );

  if (!addButton || !form) return;

  addButton.addEventListener(
    "click",
    () => {
      form.classList.toggle(
        "visible"
      );
    }
  );

  cancelButton.addEventListener(
    "click",
    () => {
      resetVideoForm();
      form.classList.remove(
        "visible"
      );
    }
  );

  filter.addEventListener(
    "change",
    renderVideoCards
  );

  fileInput.addEventListener(
    "change",
    () => {
      const file =
        fileInput.files[0];

      if (!file) return;

      const url =
        URL.createObjectURL(file);

      preview.src = url;

      preview.classList.add(
        "visible"
      );

      preview.onloadedmetadata =
        () => {
          const duration =
            preview.duration;

          durationInfo.textContent =
            `Duración del video: ${duration.toFixed(1)} segundos. El fragmento publicado puede tener máximo 35 segundos.`;

          startInput.value =
            "0";

          endInput.value =
            Math.min(
              35,
              duration
            ).toFixed(1);

          preview.currentTime =
            0;
        };
    }
  );

  startInput.addEventListener(
    "input",
    () => {
      const start =
        Number(startInput.value);

      const end =
        Number(endInput.value);

      if (
        preview.duration &&
        start >= 0 &&
        start < preview.duration
      ) {
        preview.currentTime =
          start;
      }

      if (
        end - start > 35
      ) {
        endInput.value =
          Math.min(
            preview.duration || 35,
            start + 35
          ).toFixed(1);
      }
    }
  );

  endInput.addEventListener(
    "input",
    () => {
      const start =
        Number(startInput.value);

      let end =
        Number(endInput.value);

      if (end - start > 35) {
        end =
          start + 35;

        endInput.value =
          end.toFixed(1);
      }

      if (
        preview.duration &&
        end <= preview.duration
      ) {
        preview.currentTime =
          Math.max(
            start,
            end - 0.1
          );
      }
    }
  );

  saveButton.addEventListener(
    "click",
    async () => {
      const editId =
        document.getElementById(
          "videosEditId"
        ).value;

      const hotel =
        document.getElementById(
          "videosHotel"
        ).value;

      const title =
        document.getElementById(
          "videosTitle"
        ).value.trim();

      const file =
        fileInput.files[0];

      const start =
        Number(startInput.value);

      const end =
        Number(endInput.value);

      if (!title) {
        alert(
          "Escribe un título."
        );

        return;
      }

      if (
        Number.isNaN(start) ||
        Number.isNaN(end) ||
        start < 0 ||
        end <= start
      ) {
        alert(
          "Revisa el inicio y el final del fragmento."
        );

        return;
      }

      if (
        end - start > 35
      ) {
        alert(
          "El fragmento no puede superar los 35 segundos."
        );

        return;
      }

      if (!editId && !file) {
        alert(
          "Selecciona un video."
        );

        return;
      }

      if (
        preview.duration &&
        end > preview.duration
      ) {
        alert(
          "El tiempo final supera la duración del video."
        );

        return;
      }

      if (editId) {
        const items =
          await databaseGetAll(
            "videos"
          );

        const current =
          items.find(
            (item) =>
              String(item.id) ===
              String(editId)
          );

        let video =
          current.video;

        let mimeType =
          current.mimeType;

        if (file) {
          video = file;
          mimeType =
            file.type ||
            "video/mp4";
        }

        await databasePut(
          "videos",
          {
            ...current,
            hotel,
            title,
            video,
            mimeType,
            start,
            end
          }
        );
      } else {
        await databaseAdd(
          "videos",
          {
            hotel,
            title,
            video: file,
            mimeType:
              file.type ||
              "video/mp4",
            start,
            end,
            createdAt:
              Date.now()
          }
        );
      }

      resetVideoForm();

      form.classList.remove(
        "visible"
      );

      await renderVideoCards();
    }
  );
}


/* =========================================================
   RENDER HOTEL
   ========================================================= */

function renderPage() {
  const page =
    pages[currentIndex];

  bookShell.classList.remove(
    "page-turn"
  );

  void bookShell.offsetWidth;

  bookShell.classList.add(
    "page-turn"
  );

  if (
    page.type === "hotel"
  ) {
    bookShell.innerHTML =
      renderHotel(page);
  }

  else if (
    page.type === "cover"
  ) {
    bookShell.innerHTML = `
      <div class="spread cover-spread">

        <section class="cover-left">

          <img
            class="cover-logo"
            src="src/logo png-01.png"
            alt="Logo"
          />

          <h1>
            <span>Playa</span>
            <span>Paraíso</span>
          </h1>

          <p>
            RIVIERA MAYA · MÉXICO
          </p>

          <footer>
            IBEROSTAR THE CLUB · REVISTA DIGITAL 2026
            · EDICIÓN ESPECIAL
          </footer>

        </section>

        <section
          class="cover-right"
          style="background-image:linear-gradient(180deg,rgba(8,20,28,.08) 45%,rgba(6,13,19,.8)),url('${page.image}')"
        >
          <div>

            <small>
              EN ESTE NÚMERO
            </small>

            <p>
              5 Hoteles · Una Experiencia Única
            </p>

            <p>
              Mapas Interactivos del Complejo
            </p>

            <p>
              Gastronomía de Excepción
            </p>

            <p>
              Spa, Bienestar &amp; Actividades
            </p>

          </div>
        </section>

      </div>
    `;
  }

  else if (page.type === "map") {
    bookShell.innerHTML = `
      <div class="spread general-map-spread">
        <div class="general-map-frame" id="generalMapFrame">
          <div id="generalMap" class="google-map general-google-map"></div>
          <button type="button" class="locate-me map-location-button">
            📍 Mi ubicación
          </button>
        </div>

        <div class="map-route-list">
          <b>★ NAVEGAR A HOTEL</b>
          ${pages
            .filter((item) => item.type === "hotel")
            .map(
              (item, i) => `
                <button type="button" data-hotel="${i + 1}" data-route="${item.location}" class="hotel-route-button">
                  ● ${item.name.replace("Iberostar ", "")}
                  <span>→</span>
                </button>
                <button class="mini-route" type="button" data-route="${item.location}">
                  Cómo llegar
                </button>
              `
            )
            .join("")}
        </div>

        <a class="open-map general-map-link" href="https://www.openstreetmap.org/?mlat=20.7612389&mlon=-86.9640931#map=16/20.7612389/-86.9640931" target="_blank" rel="noopener">
          Abrir mapa completo ↗
        </a>
      </div>
    `;
  }


  else if (
    page.type === "mapamundi"
  ) {
    bookShell.innerHTML = `
      <div class="spread">

        <iframe
          src="index_responsive (3).html"
          style="
            width:100%;
            height:740px;
            border:none;
          "
        ></iframe>

      </div>
    `;
  }

  /* NUEVO */
  else if (
    page.type === "workspace"
  ) {
    bookShell.innerHTML =
      renderWorkspace();
  }

  /* NUEVO */
  else if (
    page.type === "media360"
  ) {
    bookShell.innerHTML =
      render360();
  }

  /* NUEVO */
  else if (
    page.type === "videos"
  ) {
    bookShell.innerHTML =
      renderVideos();
  }

else {
  bookShell.innerHTML = `
    <div class="spread back-spread" style="background-image:linear-gradient(90deg,rgba(4,24,39,.65),rgba(10,3,16,.94)),url('${page.image}')">

      <section class="back-quote">
        <span>${page.kicker}</span>
        <h1>“${page.quote}”</h1>
        <span>KM. 309 · PLAYA DEL CARMEN, Q.ROO MÉXICO</span>
      </section>

      <section class="back-contact">
        <img class="cover-logo" src="src/logo png-01.png" alt="Logo">
        <h1>PLAYA PARAISO</h1>
        <small>IBEROSTAR</small>

        ${page.contact.map((line) => `<p>${line}</p>`).join("")}

        <button class="back-reserve" type="button">
          RESERVAR AHORA
        </button>
      </section>

    </div>`;
}

  renderDots();

  wirePageInteractions();

  updateGeneralUserMarker();

  /* NUEVO */
  if (
    page.type === "workspace"
  ) {
    wireWorkspace();
    renderWorkspaceCards();
  }

  /* NUEVO */
  if (
    page.type === "media360"
  ) {
    wire360();
    render360Cards();
  }

  /* NUEVO */
  if (
    page.type === "videos"
  ) {
    wireVideos();
    renderVideoCards();
  }
}


/* =========================================================
   PUNTOS DE PÁGINA
   ========================================================= */

function renderDots() {
  pager.innerHTML =
    pages
      .map(
        (_, index) =>
          `
            <button
              class="dot ${
                index === currentIndex
                  ? "active"
                  : ""
              }"
              aria-label="Ir a la página ${
                index + 1
              }"
              data-page="${index}"
            ></button>
          `
      )
      .join("");

  pager
    .querySelectorAll(".dot")
    .forEach((dot) => {
      dot.addEventListener(
        "click",
        () => {
          currentIndex =
            Number(
              dot.dataset.page
            );

          renderPage();
        }
      );
    });
}


/* =========================================================
   INTERACCIONES
   ========================================================= */

function wirePageInteractions() {
  const map =
    bookShell.querySelector(
      ".map-canvas"
    );

  initializeHotelMap();
  initializeGeneralMap();

  if (map) {
    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;
    let startX;
    let startY;
    let dragging = false;

    const updateMap = () => {
      map.style.transform =
        `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    };

    const zoomIn =
      bookShell.querySelector(
        ".zoom-in"
      );

    const zoomOut =
      bookShell.querySelector(
        ".zoom-out"
      );

    if (zoomIn) {
      zoomIn.addEventListener(
        "click",
        () => {
          scale =
            Math.min(
              1.45,
              scale + 0.12
            );

          updateMap();
        }
      );
    }

    if (zoomOut) {
      zoomOut.addEventListener(
        "click",
        () => {
          scale =
            Math.max(
              0.8,
              scale - 0.12
            );

          updateMap();
        }
      );
    }

    map.addEventListener(
      "pointerdown",
      (event) => {
        dragging = true;

        startX =
          event.clientX;

        startY =
          event.clientY;

        map.setPointerCapture(
          event.pointerId
        );
      }
    );

    map.addEventListener(
      "pointermove",
      (event) => {
        if (!dragging) return;

        offsetX +=
          event.clientX -
          startX;

        offsetY +=
          event.clientY -
          startY;

        startX =
          event.clientX;

        startY =
          event.clientY;

        updateMap();
      }
    );

    map.addEventListener(
      "pointerup",
      () => {
        dragging = false;
      }
    );
  }

  const reserve =
    bookShell.querySelector(
      ".reserve, .back-reserve"
    );

  if (reserve) {
    reserve.addEventListener(
      "click",
      () => {
        reserve.textContent =
          "RESERVA SOLICITADA ✓";
      }
    );
  }

  const locateButton =
    bookShell.querySelector(
      ".locate-me"
    );

  if (locateButton) {
    locateButton.addEventListener(
      "click",
      () => {
        requestCurrentLocation();

        if (
          activeMap &&
          currentPosition
        ) {
          activeMap.setView(
            [
              currentPosition.latitude,
              currentPosition.longitude
            ],
            Math.max(
              activeMap.getZoom(),
              17
            )
          );
        }
      }
    );
  }

  const routeButton =
    bookShell.querySelector(
      ".route-to"
    );

  if (routeButton) {
    const destination =
      pages[currentIndex]
        .location;

    routeButton.addEventListener(
      "click",
      () =>
        openDirections(
          destination
        )
    );
  }

  bookShell
    .querySelectorAll(
      "[data-hotel]"
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          currentIndex =
            Number(
              button.dataset.hotel
            );

          renderPage();
        }
      );
    });

  bookShell
    .querySelectorAll(
      "[data-route]"
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        () =>
          openDirections(
            button.dataset.route
          )
      );
    });
}


/* =========================================================
   MAPA GENERAL
   ========================================================= */

function initializeGeneralMap() {
  const mapElement =
    bookShell.querySelector(
      "#generalMap"
    );

  if (!mapElement) return;

  loadLeaflet()
    .then((L) => {
      const complexCenter =
        [20.7615, -86.9628];

      const generalMap =
        L.map(
          mapElement,
          {
            zoomControl: true,
            attributionControl: true,
            maxBounds: complexBounds,
            maxBoundsViscosity: 1.0
          }
        ).setView(
          complexCenter,
          16
        );

      activeMap =
        generalMap;

      // Zoom mínimo = justo lo que ocupa el complejo. No se puede
      // alejar más y ver los alrededores.
      generalMap.setMinZoom(
        generalMap.getBoundsZoom(complexBounds)
      );

      const satelliteLayer =
        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            maxZoom: 20,
            attribution: "Tiles © Esri"
          }
        );

      const streetLayer =
        L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            maxZoom: 19,
            attribution:
              "© OpenStreetMap contributors"
          }
        );

      satelliteLayer.addTo(
        generalMap
      );

      L.control.layers(
        {
          "Satélite":
            satelliteLayer,
          "Mapa":
            streetLayer
        },
        null,
        {
          collapsed: false
        }
      ).addTo(
        generalMap
      );

      Object.entries(
        hotelCoordinates
      ).forEach(
        ([name, coordinates]) => {
          L.marker(
            coordinates
          )
            .addTo(generalMap)
            .bindTooltip(
              name.replace(
                "Iberostar ",
                ""
              ),
              {
                permanent: true,
                direction: "top",
                className:
                  "complex-label"
              }
            );
        }
      );

      const places = [
        [
          "Centro de convenciones",
          20.7610,
          -86.9650
        ],
        [
          "Bella Italia",
          20.7618,
          -86.9631
        ],
        [
          "La Palapa",
          20.7604,
          -86.9619
        ],
        [
          "El Gaucho",
          20.7594,
          -86.9628
        ],
        [
          "Snack & Grill",
          20.7626,
          -86.9642
        ],
        [
          "Spa y bienestar",
          20.7601287,
          -86.9661145
        ]
      ];

      places.forEach(
        ([
          name,
          latitude,
          longitude
        ]) => {
          L.circleMarker(
            [
              latitude,
              longitude
            ],
            {
              radius: 7,
              color: "#fff",
              weight: 2,
              fillColor:
                "#e5b85f",
              fillOpacity: 1
            }
          )
            .addTo(
              generalMap
            )
            .bindTooltip(
              name,
              {
                permanent: true,
                direction: "right",
                className:
                  "place-label"
              }
            );
        }
      );
    });
}


/* =========================================================
   MAPA DE HOTEL
   ========================================================= */

function initializeHotelMap() {
  const mapElement =
    bookShell.querySelector(
      "#hotelMap"
    );

  if (!mapElement) return;

  const hotelName =
    mapElement
      .closest(
        ".interactive-map"
      )
      .dataset.hotelName;

  const destinationCoordinates =
    hotelCoordinates[
      hotelName
    ];

  activeMap = null;
  userMarker = null;
  routeLine = null;

  loadLeaflet()
    .then((L) => {
      activeMap =
        L.map(
          mapElement,
          {
            zoomControl: true,
            attributionControl: true,
            maxBounds: complexBounds,
            maxBoundsViscosity: 1.0
          }
        ).setView(
          destinationCoordinates,
          17
        );

      // No dejar alejar el zoom más allá de lo que ocupa el complejo,
      // así nunca se ve lo que hay fuera de Iberostar Playa Paraíso.
      activeMap.setMinZoom(
        activeMap.getBoundsZoom(complexBounds)
      );

      const satelliteLayer =
        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            maxZoom: 20,
            attribution:
              "Tiles © Esri"
          }
        );

      const streetLayer =
        L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            maxZoom: 19,
            attribution:
              "© OpenStreetMap contributors"
          }
        );

      satelliteLayer.addTo(
        activeMap
      );

      L.control.layers(
        {
          "Satélite":
            satelliteLayer,
          "Mapa":
            streetLayer
        },
        null,
        {
          collapsed: false
        }
      ).addTo(
        activeMap
      );

      L.marker(
        destinationCoordinates
      )
        .addTo(activeMap)
        .bindPopup(
          hotelName
        )
        .openPopup();

      if (currentPosition) {
        userMarker =
          L.circleMarker(
            [
              currentPosition.latitude,
              currentPosition.longitude
            ],
            {
              radius: 9,
              color: "#fff",
              weight: 3,
              fillColor:
                "#28b7a0",
              fillOpacity: 1
            }
          )
            .addTo(activeMap)
            .bindTooltip(
              "Tu ubicación actual"
            );
      }

      activeMap.on(
        "zoomend moveend",
        () => {
          if (
            currentPosition &&
            userMarker
          ) {
            userMarker.setLatLng(
              [
                currentPosition.latitude,
                currentPosition.longitude
              ]
            );
          }
        }
      );
    });
}


/* =========================================================
   CAMBIO DE PÁGINA
   ========================================================= */

function movePage(direction) {
  currentIndex =
    (
      currentIndex +
      direction +
      pages.length
    ) %
    pages.length;

  renderPage();
}

leftButton.addEventListener(
  "click",
  () =>
    movePage(-1)
);

rightButton.addEventListener(
  "click",
  () =>
    movePage(1)
);

window.addEventListener(
  "keydown",
  (event) => {
    if (
      event.key ===
      "ArrowLeft"
    ) {
      movePage(-1);
    }

    if (
      event.key ===
      "ArrowRight"
    ) {
      movePage(1);
    }
  }
);


/* =========================================================
   SWIPE
   ========================================================= */

const magazineStage =
  document.querySelector(
    ".magazine-stage"
  );

let startX = 0;

magazineStage.addEventListener(
  "touchstart",
  (e) => {
    startX =
      e.touches[0].clientX;
  }
);

magazineStage.addEventListener(
  "touchend",
  (e) => {
    const endX =
      e.changedTouches[0].clientX;

    const distance =
      startX - endX;

    if (
      Math.abs(distance) >
      60
    ) {
      if (distance > 0) {
        movePage(1);
      } else {
        movePage(-1);
      }
    }
  }
);


/* =========================================================
   INICIO
   ========================================================= */

requestCurrentLocation();
renderPage();