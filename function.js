// Pega aquí tu clave de Google Maps entre las comillas.
const appBaseElement = document.createElement("base");
appBaseElement.href = new URL(".", document.currentScript.src).href;
document.head.prepend(appBaseElement);

/* =========================================================
   SUPABASE
   ========================================================= */

const SUPABASE_URL =
  "https://pmnnweuoqghcyeffjzva.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_fVJ6ntm-e2s-0IdI0IPC9A_7H741TpI";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );

async function probarSupabase() {
  const { data, error } = await supabaseClient
    .from("media")
    .select("*");

  if (error) {
    console.error("ERROR SUPABASE:", error);
    return;
  }

  console.log("DATOS DE SUPABASE:", data);
}

const GOOGLE_MAPS_API_KEY = "";
let googleMapsPromise;
let leafletPromise;

const generalMapCenter = {
  latitude: 20.7612389,
  longitude: -86.9640931
};

const generalMapZoom = 15;

const hotelCoordinates = {
  "Iberostar Paraíso del Mar": [20.7612389, -86.9640931],
  "Iberostar Paraíso Maya": [20.7578835, -86.9648766],
  "Iberostar Paraíso Lindo": [20.7596096, -86.9639649],
  "Iberostar Paraíso Beach": [20.7584, -86.9585],
  "Iberostar Paraíso JOIA": [20.7563073, -86.9629786]
};

// Límite del complejo: ningún mapa (general o de hotel) puede
// alejarse ni desplazarse más allá de este rectángulo.
const complexBounds = [
  [20.7553, -86.9663],
  [20.7630, -86.9578]
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
    const request = indexedDB.open(
      mediaDatabaseName,
      mediaDatabaseVersion
    );

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
    const transaction = database.transaction(
      storeName,
      "readonly"
    );

    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () =>
      resolve(request.result || []);

    request.onerror = () =>
      reject(request.error);
  });
}

async function databaseAdd(storeName, data) {
  const database = await openMediaDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      storeName,
      "readwrite"
    );

    const store = transaction.objectStore(storeName);
    const request = store.add(data);

    request.onsuccess = () =>
      resolve(request.result);

    request.onerror = () =>
      reject(request.error);
  });
}

async function databasePut(storeName, data) {
  const database = await openMediaDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      storeName,
      "readwrite"
    );

    const store = transaction.objectStore(storeName);
    const request = store.put(data);

    request.onsuccess = () =>
      resolve(request.result);

    request.onerror = () =>
      reject(request.error);
  });
}

async function databaseDelete(storeName, id) {
  const database = await openMediaDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      storeName,
      "readwrite"
    );

    const store = transaction.objectStore(storeName);
    const request = store.delete(Number(id));

    request.onsuccess = () => resolve();

    request.onerror = () =>
      reject(request.error);
  });
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () =>
      resolve(reader.result);

    reader.onerror = () =>
      reject(reader.error);

    reader.readAsDataURL(file);
  });
}

function createMediaUrl(blob) {
  if (!blob) return "";

  if (typeof blob === "string") {
    return blob;
  }

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
    type: "country-menu",
    country: "mexico",
    title: "México",
    intro:
      "El Caribe mexicano, con sol, diseño y experiencias para toda la familia.",
    kicker: "MÉXICO"
  },

  {
    type: "country-menu",
    country: "jamaica",
    title: "Jamaica",
    intro:
      "Una isla de ritmos, paisajes y experiencias bajo el sol del Caribe.",
    kicker: "JAMAICA"
  },

  {
    type: "country-menu",
    country: "republica-dominicana",
    title: "República Dominicana",
    intro:
      "Playas de arena fina, gastronomía y aventuras para una estancia completa.",
    kicker: "REPÚBLICA DOMINICANA"
  },

  {
    type: "country-menu",
    country: "brasil",
    title: "Brasil",
    intro:
      "Costa, naturaleza y personalidad brasileña en cada experiencia.",
    kicker: "BRASIL"
  },

  {
    type: "hotel",
    kicker: "HOTEL 1 DE 5 · PARAÍSO DEL MAR",
    country: "mexico",
    name: "Iberostar Paraíso del Mar",
    location:
      "Iberostar Paraíso del Mar, Playa Paraíso, Quintana Roo, México",
    image: "src/ParaisoDelMar.jpg",
    intro:
      "Iberostar Waves Paraíso del Mar combina la belleza natural de la Riviera Maya, una experiencia Todo Incluido premium, gastronomía internacional, actividades para toda la familia y acceso a una de las playas más atractivas del Caribe mexicano.",
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
    location:
      "Iberostar Selection Paraíso Maya Suites, Carretera Chetumal-Puerto Juárez km 309, Playa Paraíso, Quintana Roo, México",
    image: "src/paraisoMaya.jpg",
    intro:
      "Iberostar Selection Paraíso Maya combina la grandeza de la cultura maya con una experiencia todo incluido frente al Caribe. Sus piscinas, parque acuático, río lento, gastronomía internacional y programas familiares convierten al resort en uno de los destinos más completos de Riviera Maya.",
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
    location:
      "Iberostar Paraíso Lindo, Playa Paraíso, Quintana Roo, México",
    image: "src/ParaisoLindo.jpg",
    intro:
      "Iberostar Selection Paraíso Lindo combina naturaleza, diversión y descanso en un entorno privilegiado frente al Caribe mexicano. Sus piscinas, parque acuático, río lento y experiencias gastronómicas lo convierten en el lugar ideal para familias y viajeros que buscan disfrutar de la esencia de Riviera Maya con el sello de hospitalidad Iberostar.",
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
    location:
      "Iberostar Paraíso Beach, Playa Paraíso, Quintana Roo, México",
    image: "src/paraisoBeach.jpg",
    intro:
      "Iberostar Waves Paraíso Beach combina la esencia del Caribe mexicano con una experiencia Todo Incluido diseñada para toda la familia. Rodeado de exuberantes jardines tropicales y una espectacular playa de arena blanca, ofrece gastronomía internacional, entretenimiento para todas las edades, piscinas de gran tamaño y acceso a las experiencias exclusivas que caracterizan a Iberostar. Un destino donde la relajación, la diversión y la sostenibilidad se unen para crear vacaciones inolvidables.",
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
    location:
      "Iberostar JOIA Paraíso, Playa Paraíso, Quintana Roo, México",
    image: "src/JOIA.jpg",
    intro:
      "JOIA Paraíso by Iberostar representa la máxima expresión de lujo dentro del complejo Iberostar Playa Paraíso. Diseñado exclusivamente para adultos, ofrece suites elegantes, servicio de mayordomía, experiencias gastronómicas gourmet, spa de clase mundial y acceso privilegiado a una de las playas más hermosas del Caribe mexicano.",
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
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=90"
  },

  {
    type: "mapamundi",
    title: "Mapa Mundi"
  },

  {
    type: "workspace",
    title: "Workspace",
    kicker: "EXPERIENCIAS DE LA COMUNIDAD"
  },

  {
    type: "media360",
    title: "Exploración 360°",
    kicker: "RECORRIDO VIRTUAL"
  },

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


/* =========================================================
   MENÚS DE HOTELES POR PAÍS
   ========================================================= */

const hotelCountryMenus = {
  mexico: {
    key: "mexico",
    name: "México",
    intro:
      "El Caribe mexicano, con sol, diseño y experiencias para toda la familia.",
    hotels: [
      {
        name: "Iberostar Selection Playa Mita",
        tagline: "El Pacífico, a tu ritmo",
        description:
          "Experiencias: surf, vela y rutas junto al mar.",
        image:
          "src/paraiso-JOIA/banner/JOIA2.jpg",

        tabs: {
          habitaciones: {
            title: "Habitaciones",
            description:
              "Espacios serenos con diseño tropical y vistas al océano.",
            keyPoints: [
              "Suites luminosas",
              "Terrazas privadas",
              "Mobiliario contemporáneo"
            ],
            images: [
              "src/JOIA2.jpg",
              "src/ParaisoDelMar.jpg",
              "src/paraisoBeach.jpg"
            ]
          },

          restaurante: {
            title: "Restaurantes",
            description:
              "Gastronomía de autor y sabores locales en un ambiente relajado.",
            keyPoints: [
              "Menús creativos",
              "Cocktails de temporada",
              "Ambiente íntimo"
            ],
            images: [
              "src/paraisoBeach.jpg",
              "src/ParaisoLindo.jpg",
              "src/JOIA.jpg"
            ]
          },

          piscinas: {
            title: "Piscinas",
            description:
              "Aguas tranquilas y áreas de descanso pensadas para disfrutar del sol.",
            keyPoints: [
              "Piscina principal",
              "Área familiar",
              "Vista panorámica"
            ],
            images: [
              "src/JOIA.jpg",
              "src/ParaisoDelMar.jpg",
              "src/paraisoBeach.jpg"
            ]
          },

          experiencias: {
            title: "Experiencias",
            description:
              "Surf, vela y rutas junto al mar para vivir la costa con energía.",
            keyPoints: [
              "Surf y deportes náuticos",
              "Rutas costeras",
              "Excursiones relajadas"
            ],
            images: [
              "src/JOIA2.jpg",
              "src/paraisoBeach.jpg",
              "src/ParaisoDelMar.jpg"
            ]
          }
        }
      },

      {
        name: "Iberostar Waves Cozumel",
        tagline: "Agua entre palmas",
        description:
          "Contenido: piscina tropical, playa y ritmo relajado.",
        image:
          "src/paraiso-del-mar/banner/ParaisoDelMar.jpg",

        tabs: {
          habitaciones: {
            title: "Habitaciones",
            description:
              "Diseño acogedor con un toque muy tropical para descansar con calma.",
            keyPoints: [
              "Vista a la piscina",
              "Calidez natural",
              "Acabados claros"
            ],
            images: [
              "src/ParaisoDelMar.jpg",
              "src/paraisoBeach.jpg",
              "src/JOIA2.jpg"
            ]
          },

          restaurante: {
            title: "Restaurantes",
            description:
              "Sabores ligeros y experiencias gastronómicas de playa y terraza.",
            keyPoints: [
              "Bruces al aire libre",
              "Preparación fresca",
              "Ambiente relajado"
            ],
            images: [
              "src/paraisoBeach.jpg",
              "src/ParaisoLindo.jpg",
              "src/JOIA3.jpg"
            ]
          },

          piscinas: {
            title: "Piscinas",
            description:
              "Piscina tropical y espacios para disfrutar del sol y del mar.",
            keyPoints: [
              "Piscina tropical",
              "Zona de descanso",
              "Paseos desde la playa"
            ],
            images: [
              "src/JOIA3.jpg",
              "src/ParaisoDelMar.jpg",
              "src/paraisoBeach.jpg"
            ]
          },

          experiencias: {
            title: "Experiencias",
            description:
              "Bajo la serenidad del Caribe, el tiempo se vive con calma y movimiento.",
            keyPoints: [
              "Playa relax",
              "Actividades de agua",
              "Ritmos locales"
            ],
            images: [
              "src/JOIA2.jpg",
              "src/paraisoBeach.jpg",
              "src/ParaisoDelMar.jpg"
            ]
          }
        }
      },

      {
        name: "Iberostar Selection Cancún",
        tagline: "La luz entra primero",
        description:
          "Contenido: suites, terraza y vista al mar.",
        image:
          "src/paraiso-lindo/banner/ParaisoLindo.jpg",

        tabs: {
          habitaciones: {
            title: "Habitaciones",
            description:
              "Suites con luz, amplitud y detalles pensados para una estancia elegante.",
            keyPoints: [
              "Suites de doble altura",
              "Terraza con vista",
              "Madera y texturas cálidas"
            ],
            images: [
              "src/JOIA3.jpg",
              "src/ParaisoLindo.jpg",
              "src/JOIA2.jpg"
            ]
          },

          restaurante: {
            title: "Restaurantes",
            description:
              "Cocina internacional con un toque contemporáneo y cenas memorables.",
            keyPoints: [
              "Cenas al atardecer",
              "Menús gourmet",
              "Alta atención"
            ],
            images: [
              "src/JOIA2.jpg",
              "src/paraisoBeach.jpg",
              "src/JOIA.jpg"
            ]
          },

          piscinas: {
            title: "Piscinas",
            description:
              "Paseos, relajación y momentos al aire libre con vista al mar.",
            keyPoints: [
              "Piscina de descanso",
              "Zona de solárium",
              "Lounge de lujo"
            ],
            images: [
              "src/JOIA.jpg",
              "src/JOIA3.jpg",
              "src/ParaisoDelMar.jpg"
            ]
          },

          experiencias: {
            title: "Experiencias",
            description:
              "La luz del Caribe se convierte en la mejor compañía para cada momento.",
            keyPoints: [
              "Terrazas y vistas",
              "Relax premium",
              "Experiencias exclusivas"
            ],
            images: [
              "src/ParaisoDelMar.jpg",
              "src/JOIA3.jpg",
              "src/paraisoBeach.jpg"
            ]
          }
        }
      }
    ]
  },

    jamaica: {
    key: "jamaica",
    name: "Jamaica",
    intro:
      "Ritmos jamaicanos, playas de ensueño y un lujo cálido y sin prisa.",
    hotels: [
      {
        name: "JOIA Rose Hall by Iberostar",
        tagline: "El Caribe en voz baja",
        description:
          "Contenido: experiencias y servicio de mayordomía.",
        image:
          "src/paraiso-JOIA/banner/JOIA2.jpg",

        tabs: {
          habitaciones: {
            title: "Habitaciones",
            description:
              "Elegancia serena con vistas, privacidad y un servicio muy personalizado.",
            keyPoints: [
              "Suite premium",
              "Mobiliario especial",
              "Ambiente íntimo"
            ],
            images: [
              "src/JOIA2.jpg",
              "src/JOIA3.jpg",
              "src/JOIA.jpg"
            ]
          },

          restaurante: {
            title: "Restaurantes",
            description:
              "La gastronomía se convierte en un momento de disfrute y cultura.",
            keyPoints: [
              "Menú de autor",
              "Cenas sensoriales",
              "Servicio exclusivo"
            ],
            images: [
              "src/JOIA.jpg",
              "src/JOIA2.jpg",
              "src/JOIA3.jpg"
            ]
          },

          piscinas: {
            title: "Piscinas",
            description:
              "Aguas serenas y espacios de descanso bajo un cielo tropical.",
            keyPoints: [
              "Piscina privada",
              "Lounge exclusivo",
              "Vista panorámica"
            ],
            images: [
              "src/JOIA3.jpg",
              "src/JOIA2.jpg",
              "src/JOIA.jpg"
            ]
          },

          experiencias: {
            title: "Experiencias",
            description:
              "Experiencias y servicio de mayordomía para una estancia cuidada al detalle.",
            keyPoints: [
              "Mayordomía",
              "Relajación premium",
              "Ritmos del Caribe"
            ],
            images: [
              "src/JOIA.jpg",
              "src/JOIA3.jpg",
              "src/JOIA2.jpg"
            ]
          }
        }
      },

      {
        name: "Iberostar Selection Rose Hall Suites",
        tagline: "Elegancia frente al Caribe",
        description:
          "Contenido: suites, gastronomía y experiencias frente al mar.",
        image:
          "src/paraiso-beach/banner/paraisoBeach.jpg",

        tabs: {
          habitaciones: {
            title: "Habitaciones",
            description:
              "Suites amplias diseñadas para una estancia cómoda y relajante.",
            keyPoints: [
              "Suites amplias",
              "Vistas al Caribe",
              "Espacios familiares"
            ],
            images: [
              "src/paraisoBeach.jpg",
              "src/ParaisoLindo.jpg",
              "src/JOIA2.jpg"
            ]
          },

          restaurante: {
            title: "Restaurantes",
            description:
              "Opciones gastronómicas internacionales y sabores del Caribe.",
            keyPoints: [
              "Buffet internacional",
              "Cocina caribeña",
              "Cenas especiales"
            ],
            images: [
              "src/paraisoBeach.jpg",
              "src/JOIA.jpg",
              "src/ParaisoDelMar.jpg"
            ]
          },

          piscinas: {
            title: "Piscinas",
            description:
              "Espacios acuáticos para relajarse y disfrutar del clima tropical.",
            keyPoints: [
              "Piscinas familiares",
              "Zona de descanso",
              "Ambiente tropical"
            ],
            images: [
              "src/ParaisoLindo.jpg",
              "src/paraisoBeach.jpg",
              "src/JOIA2.jpg"
            ]
          },

          experiencias: {
            title: "Experiencias",
            description:
              "Actividades para disfrutar del Caribe y descubrir Jamaica.",
            keyPoints: [
              "Actividades acuáticas",
              "Entretenimiento",
              "Experiencias caribeñas"
            ],
            images: [
              "src/JOIA2.jpg",
              "src/paraisoBeach.jpg",
              "src/ParaisoLindo.jpg"
            ]
          }
        }
      },

      {
        name: "Coral Level at Iberostar Selection Rose Hall Suites",
        tagline: "Exclusividad frente al mar",
        description:
          "Contenido: servicio personalizado, privacidad y experiencias premium.",
        image:
          "src/paraiso-JOIA/banner/JOIA2.jpg",

        tabs: {
          habitaciones: {
            title: "Habitaciones",
            description:
              "Espacios exclusivos pensados para disfrutar de mayor privacidad y confort.",
            keyPoints: [
              "Suites premium",
              "Mayor privacidad",
              "Servicio personalizado"
            ],
            images: [
              "src/JOIA2.jpg",
              "src/JOIA3.jpg",
              "src/JOIA.jpg"
            ]
          },

          restaurante: {
            title: "Restaurantes",
            description:
              "Una propuesta gastronómica pensada para una experiencia más exclusiva.",
            keyPoints: [
              "Cocina internacional",
              "Servicio exclusivo",
              "Cenas especiales"
            ],
            images: [
              "src/JOIA.jpg",
              "src/JOIA2.jpg",
              "src/JOIA3.jpg"
            ]
          },

          piscinas: {
            title: "Piscinas",
            description:
              "Zonas de piscina y descanso rodeadas de un ambiente tropical.",
            keyPoints: [
              "Piscina exclusiva",
              "Solárium",
              "Zona lounge"
            ],
            images: [
              "src/JOIA3.jpg",
              "src/JOIA2.jpg",
              "src/JOIA.jpg"
            ]
          },

          experiencias: {
            title: "Experiencias",
            description:
              "Una estancia enfocada en relajación, privacidad y servicio personalizado.",
            keyPoints: [
              "Servicio premium",
              "Relajación",
              "Experiencias privadas"
            ],
            images: [
              "src/JOIA.jpg",
              "src/JOIA3.jpg",
              "src/JOIA2.jpg"
            ]
          }
        }
      },

      {
        name: "Iberostar Waves Rose Hall Beach",
        tagline: "Jamaica frente al mar",
        description:
          "Contenido: playa, actividades y ambiente caribeño.",
        image:
          "src/paraiso-beach/banner/paraisoBeach.jpg",

        tabs: {
          habitaciones: {
            title: "Habitaciones",
            description:
              "Habitaciones cómodas para disfrutar de una estancia relajada frente al Caribe.",
            keyPoints: [
              "Habitaciones cómodas",
              "Ambiente tropical",
              "Espacios familiares"
            ],
            images: [
              "src/paraisoBeach.jpg",
              "src/ParaisoLindo.jpg",
              "src/JOIA2.jpg"
            ]
          },

          restaurante: {
            title: "Restaurantes",
            description:
              "Sabores internacionales y propuestas gastronómicas para toda la familia.",
            keyPoints: [
              "Buffet internacional",
              "Sabores caribeños",
              "Opciones familiares"
            ],
            images: [
              "src/paraisoBeach.jpg",
              "src/JOIA.jpg",
              "src/ParaisoDelMar.jpg"
            ]
          },

          piscinas: {
            title: "Piscinas",
            description:
              "Piscinas y espacios de descanso para disfrutar del clima de Jamaica.",
            keyPoints: [
              "Piscinas",
              "Solárium",
              "Zona familiar"
            ],
            images: [
              "src/ParaisoLindo.jpg",
              "src/paraisoBeach.jpg",
              "src/JOIA2.jpg"
            ]
          },

          experiencias: {
            title: "Experiencias",
            description:
              "Actividades, playa y entretenimiento para disfrutar de unas vacaciones caribeñas.",
            keyPoints: [
              "Playa",
              "Entretenimiento",
              "Actividades"
            ],
            images: [
              "src/JOIA2.jpg",
              "src/paraisoBeach.jpg",
              "src/ParaisoLindo.jpg"
            ]
          }
        }
      }
    ]
  },

  "republica-dominicana": {
    key: "republica-dominicana",
    name: "República Dominicana",
    intro:
      "Playas de arena fina, gastronomía y aventuras para una estancia completa.",
    hotels: [
      {
        name: "Iberostar Selection Bávaro Suites",
        tagline: "Caribe en movimiento",
        description:
          "Contenido: playa, gastronomía y actividades.",
        image:
          "src/paraiso-beach/banner/paraisoBeach.jpg",

        tabs: {
          habitaciones: {
            title: "Habitaciones",
            description:
              "Espacios luminosos para descansar después de un día de playa.",
            keyPoints: [
              "Habitaciones amplias",
              "Terrazas",
              "Diseño tropical"
            ],
            images: [
              "src/paraisoBeach.jpg",
              "src/ParaisoLindo.jpg",
              "src/JOIA2.jpg"
            ]
          },

          restaurante: {
            title: "Restaurantes",
            description:
              "Sabores caribeños e internacionales para disfrutar sin prisa.",
            keyPoints: [
              "Cocina caribeña",
              "Buffet internacional",
              "Cenas especiales"
            ],
            images: [
              "src/paraisoBeach.jpg",
              "src/JOIA.jpg",
              "src/ParaisoDelMar.jpg"
            ]
          },

          piscinas: {
            title: "Piscinas",
            description:
              "Piscinas rodeadas de vegetación tropical y zonas de descanso.",
            keyPoints: [
              "Piscinas familiares",
              "Solárium",
              "Áreas de sombra"
            ],
            images: [
              "src/ParaisoLindo.jpg",
              "src/paraisoBeach.jpg",
              "src/JOIA2.jpg"
            ]
          },

          experiencias: {
            title: "Experiencias",
            description:
              "Playa, cultura y actividades para descubrir el espíritu dominicano.",
            keyPoints: [
              "Cultura",
              "Playa",
              "Actividades"
            ],
            images: [
              "src/JOIA2.jpg",
              "src/paraisoBeach.jpg",
              "src/ParaisoLindo.jpg"
            ]
          }
        }
      },

      {
        name: "JOIA Bávaro by Iberostar",
        tagline: "Lujo frente al Caribe",
        description:
          "Contenido: servicio personalizado, gastronomía y experiencias premium.",
        image:
          "src/paraiso-JOIA/banner/JOIA2.jpg",

        tabs: {
          habitaciones: {
            title: "Habitaciones",
            description:
              "Suites elegantes pensadas para una estancia tranquila y exclusiva.",
            keyPoints: [
              "Suites premium",
              "Privacidad",
              "Servicio personalizado"
            ],
            images: [
              "src/JOIA2.jpg",
              "src/JOIA3.jpg",
              "src/JOIA.jpg"
            ]
          },

          restaurante: {
            title: "Restaurantes",
            description:
              "Propuestas gastronómicas para disfrutar de una experiencia de alto nivel.",
            keyPoints: [
              "Menú de autor",
              "Cocina internacional",
              "Servicio exclusivo"
            ],
            images: [
              "src/JOIA.jpg",
              "src/JOIA2.jpg",
              "src/JOIA3.jpg"
            ]
          },

          piscinas: {
            title: "Piscinas",
            description:
              "Espacios de agua y descanso rodeados por un ambiente tropical.",
            keyPoints: [
              "Piscina exclusiva",
              "Lounge",
              "Solárium"
            ],
            images: [
              "src/JOIA3.jpg",
              "src/JOIA2.jpg",
              "src/JOIA.jpg"
            ]
          },

          experiencias: {
            title: "Experiencias",
            description:
              "Experiencias diseñadas para disfrutar del Caribe con mayor exclusividad.",
            keyPoints: [
              "Relajación",
              "Servicio premium",
              "Experiencias privadas"
            ],
            images: [
              "src/JOIA.jpg",
              "src/JOIA3.jpg",
              "src/JOIA2.jpg"
            ]
          }
        }
      },

      {
        name: "Iberostar Waves Punta Cana",
        tagline: "Energía tropical",
        description:
          "Contenido: playa, entretenimiento y actividades para disfrutar en familia.",
        image:
          "src/paraiso-beach/banner/paraisoBeach.jpg",

        tabs: {
          habitaciones: {
            title: "Habitaciones",
            description:
              "Espacios cómodos con un ambiente tropical y relajado.",
            keyPoints: [
              "Habitaciones cómodas",
              "Diseño tropical",
              "Espacios familiares"
            ],
            images: [
              "src/paraisoBeach.jpg",
              "src/ParaisoLindo.jpg",
              "src/JOIA2.jpg"
            ]
          },

          restaurante: {
            title: "Restaurantes",
            description:
              "Opciones gastronómicas internacionales y sabores del Caribe.",
            keyPoints: [
              "Buffet",
              "Cocina internacional",
              "Sabores caribeños"
            ],
            images: [
              "src/paraisoBeach.jpg",
              "src/JOIA.jpg",
              "src/ParaisoDelMar.jpg"
            ]
          },

          piscinas: {
            title: "Piscinas",
            description:
              "Piscinas y áreas de descanso para disfrutar del clima tropical.",
            keyPoints: [
              "Piscinas",
              "Solárium",
              "Áreas familiares"
            ],
            images: [
              "src/ParaisoLindo.jpg",
              "src/paraisoBeach.jpg",
              "src/JOIA2.jpg"
            ]
          },

          experiencias: {
            title: "Experiencias",
            description:
              "Entretenimiento y actividades para disfrutar de Punta Cana.",
            keyPoints: [
              "Entretenimiento",
              "Actividades",
              "Playa"
            ],
            images: [
              "src/JOIA2.jpg",
              "src/paraisoBeach.jpg",
              "src/ParaisoLindo.jpg"
            ]
          }
        }
      },

      {
        name: "Iberostar Waves Dominicana",
        tagline: "Caribe para todos",
        description:
          "Contenido: playa, naturaleza y actividades para toda la familia.",
        image:
          "src/paraiso-beach/banner/paraisoBeach.jpg",

        tabs: {
          habitaciones: {
            title: "Habitaciones",
            description:
              "Habitaciones pensadas para disfrutar de una estancia cómoda y tropical.",
            keyPoints: [
              "Habitaciones familiares",
              "Diseño tropical",
              "Confort"
            ],
            images: [
              "src/paraisoBeach.jpg",
              "src/ParaisoLindo.jpg",
              "src/JOIA2.jpg"
            ]
          },

          restaurante: {
            title: "Restaurantes",
            description:
              "Sabores internacionales y opciones para diferentes gustos.",
            keyPoints: [
              "Buffet internacional",
              "Cocina caribeña",
              "Opciones familiares"
            ],
            images: [
              "src/paraisoBeach.jpg",
              "src/JOIA.jpg",
              "src/ParaisoDelMar.jpg"
            ]
          },

          piscinas: {
            title: "Piscinas",
            description:
              "Áreas de piscina y descanso rodeadas de naturaleza tropical.",
            keyPoints: [
              "Piscinas familiares",
              "Solárium",
              "Zona de descanso"
            ],
            images: [
              "src/ParaisoLindo.jpg",
              "src/paraisoBeach.jpg",
              "src/JOIA2.jpg"
            ]
          },

          experiencias: {
            title: "Experiencias",
            description:
              "Actividades, naturaleza y playa para disfrutar del Caribe dominicano.",
            keyPoints: [
              "Naturaleza",
              "Playa",
              "Actividades"
            ],
            images: [
              "src/JOIA2.jpg",
              "src/paraisoBeach.jpg",
              "src/ParaisoLindo.jpg"
            ]
          }
        }
      }
    ]
  },

  brasil: {
    key: "brasil",
    name: "Brasil",
    intro:
      "Costa viva, naturaleza y un espíritu único que refleja la energía brasileña.",
    hotels: [
      {
        name: "Iberostar Selection Praia do Forte",
        tagline: "La costa más viva",
        description:
          "Contenido: naturaleza y conservación.",
        image:
          "src/paraiso-lindo/banner/ParaisoLindo.jpg",

        tabs: {
          habitaciones: {
            title: "Habitaciones",
            description:
              "Habitaciones con una mezcla de confort y energía tropical.",
            keyPoints: [
              "Diseño ligero",
              "Confort",
              "Ambiente natural"
            ],
            images: [
              "src/JOIA.jpg",
              "src/paraisoBeach.jpg",
              "src/ParaisoLindo.jpg"
            ]
          },

          restaurante: {
            title: "Restaurantes",
            description:
              "Sabores de la región y ambiente relajado para disfrutar la costa.",
            keyPoints: [
              "Gastronomía regional",
              "Ambiente relajado",
              "Atención cálida"
            ],
            images: [
              "src/paraisoBeach.jpg",
              "src/JOIA.jpg",
              "src/ParaisoDelMar.jpg"
            ]
          },

          piscinas: {
            title: "Piscinas",
            description:
              "Piscinas junto a un entorno verde muy cercano a la costa.",
            keyPoints: [
              "Aguas refrescantes",
              "Jardines",
              "Relajación"
            ],
            images: [
              "src/ParaisoDelMar.jpg",
              "src/paraisoBeach.jpg",
              "src/JOIA.jpg"
            ]
          },

          experiencias: {
            title: "Experiencias",
            description:
              "Naturaleza, conservación y contacto con la costa en cada momento.",
            keyPoints: [
              "Conservación",
              "Naturaleza",
              "Costa"
            ],
            images: [
              "src/JOIA2.jpg",
              "src/paraisoBeach.jpg",
              "src/JOIA.jpg"
            ]
          }
        }
      },

      {
        name: "Iberostar Waves Bahia",
        tagline: "Sabores de Bahía",
        description:
          "Contenido: gastronomía brasileña.",
        image:
          "src/paraiso-del-mar/banner/ParaisoDelMar.jpg",

        tabs: {
          habitaciones: {
            title: "Habitaciones",
            description:
              "Encuentro perfecto entre confort, luz y diseño tropical.",
            keyPoints: [
              "Luz natural",
              "Materiales cálidos",
              "Confort"
            ],
            images: [
              "src/JOIA2.jpg",
              "src/ParaisoDelMar.jpg",
              "src/JOIA.jpg"
            ]
          },

          restaurante: {
            title: "Restaurantes",
            description:
              "Gastronomía brasileña y cocina internacional para compartir cada momento.",
            keyPoints: [
              "Gastronomía local",
              "Sabor auténtico",
              "Atardeceres"
            ],
            images: [
              "src/JOIA.jpg",
              "src/JOIA2.jpg",
              "src/paraisoBeach.jpg"
            ]
          },

          piscinas: {
            title: "Piscinas",
            description:
              "Piscinas con buen ritmo, sol y un toque de energía contemporánea.",
            keyPoints: [
              "Sol y agua",
              "Lounge",
              "Relax"
            ],
            images: [
              "src/paraisoBeach.jpg",
              "src/JOIA2.jpg",
              "src/JOIA3.jpg"
            ]
          },

          experiencias: {
            title: "Experiencias",
            description:
              "Una mezcla de sabores, actividades y vida costera muy brasileña.",
            keyPoints: [
              "Gastronomía",
              "Vida costera",
              "Aventura"
            ],
            images: [
              "src/JOIA3.jpg",
              "src/paraisoBeach.jpg",
              "src/JOIA2.jpg"
            ]
          }
        }
      },

      {
        name: "Iberostar Heritage Grand Amazon",
        tagline: "Donde confluyen las aguas",
        description:
          "Contenido: excursiones amazónicas.",
        image:
          "src/paraiso-maya/banner/paraisoMaya.jpg",

        tabs: {
          habitaciones: {
            title: "Habitaciones",
            description:
              "Espacios serenos inspirados por el entorno natural de la Amazonia.",
            keyPoints: [
              "Naturaleza",
              "Calidez",
              "Silencio"
            ],
            images: [
              "src/ParaisoLindo.jpg",
              "src/JOIA.jpg",
              "src/JOIA2.jpg"
            ]
          },

          restaurante: {
            title: "Restaurantes",
            description:
              "Cocina con identidad regional, adaptada a paisajes y experiencias.",
            keyPoints: [
              "Cocina regional",
              "Ambiente natural",
              "Servicio cercano"
            ],
            images: [
              "src/JOIA2.jpg",
              "src/ParaisoLindo.jpg",
              "src/JOIA3.jpg"
            ]
          },

          piscinas: {
            title: "Piscinas",
            description:
              "Piscinas y áreas de descanso junto a la exuberante naturaleza.",
            keyPoints: [
              "Entorno verde",
              "Relajación",
              "Aguas calmadas"
            ],
            images: [
              "src/JOIA3.jpg",
              "src/ParaisoLindo.jpg",
              "src/JOIA.jpg"
            ]
          },

          experiencias: {
            title: "Experiencias",
            description:
              "Excursiones amazónicas y paisajes que invitan a descubrir nuevos ritmos.",
            keyPoints: [
              "Amazonia",
              "Excursiones",
              "Naturaleza"
            ],
            images: [
              "src/JOIA.jpg",
              "src/ParaisoLindo.jpg",
              "src/JOIA2.jpg"
            ]
          }
        }
      },

      {
        name: "Praia do Forte · Star Prestige",
        tagline: "Calma sobre el Atlántico",
        description:
          "Contenido: piscina exclusiva y servicio personalizado.",
        image:
          "src/paraiso-beach/banner/paraisoBeach.jpg",

        tabs: {
          habitaciones: {
            title: "Habitaciones",
            description:
              "Suite exclusiva con un estilo sereno y atención muy personalizada.",
            keyPoints: [
              "Exclusividad",
              "Servicio premium",
              "Relajación"
            ],
            images: [
              "src/JOIA3.jpg",
              "src/JOIA2.jpg",
              "src/ParaisoLindo.jpg"
            ]
          },

          restaurante: {
            title: "Restaurantes",
            description:
              "Recetas de la costa brasileña con una presentación de lujo.",
            keyPoints: [
              "Sabor costeño",
              "Servicio cuidado",
              "Ambiente premium"
            ],
            images: [
              "src/JOIA2.jpg",
              "src/JOIA3.jpg",
              "src/paraisoBeach.jpg"
            ]
          },

          piscinas: {
            title: "Piscinas",
            description:
              "Piscina exclusiva y un entorno muy tranquilo para respirar calma.",
            keyPoints: [
              "Piscina privada",
              "Lounge exclusivo",
              "Calma"
            ],
            images: [
              "src/paraisoBeach.jpg",
              "src/JOIA3.jpg",
              "src/JOIA2.jpg"
            ]
          },

          experiencias: {
            title: "Experiencias",
            description:
              "Servicio personalizado y un ambiente de tranquilidad sobre el Atlántico.",
            keyPoints: [
              "Servicio selectivo",
              "Mar abierto",
              "Calma"
            ],
            images: [
              "src/JOIA2.jpg",
              "src/paraisoBeach.jpg",
              "src/JOIA3.jpg"
            ]
          }
        }
      }
    ]
  }
};

const hotelMediaCatalog = {
  "Iberostar Paraíso Beach": {
    banner: [
      "src/paraiso-beach/banner/paraisoBeach.jpg",
      "src/paraiso-beach/banner/PBE_GAST_0049.jpg",
      "src/paraiso-beach/banner/PBE_INSIDE_0009.jpg",
      "src/paraiso-beach/banner/PBE_POOL_0003.jpg",
      "src/paraiso-beach/banner/PBE_STPR_0005.jpg",
      "src/paraiso-beach/banner/PBE_VIEWS_0012.jpg",
      "src/paraiso-beach/banner/PBE_VIEWS_0016.jpg"
    ],

    habitaciones: [
      "src/paraiso-beach/habitaciones/PBE_ROOM_0053.jpg",
      "src/paraiso-beach/habitaciones/PBE_ROOM_0066.jpg",
      "src/paraiso-beach/habitaciones/PBE_ROOM_0072.jpg",
      "src/paraiso-beach/habitaciones/PBE_ROOM_0084.jpg",
      "src/paraiso-beach/habitaciones/PBE_ROOM_0086.jpg"
    ],

    piscinas: [
      "src/paraiso-beach/piscinas/PBE_POOL_0003.jpg",
      "src/paraiso-beach/piscinas/PBE_POOL_0011.jpg",
      "src/paraiso-beach/piscinas/PBE_POOL_0014.jpg",
      "src/paraiso-beach/piscinas/PBE_STPR_0005.jpg",
      "src/paraiso-beach/piscinas/PBE_VIEWS_0016.jpg"
    ],

    restaurante: [
      "src/paraiso-beach/restaurante/PBE_GAST_0048.jpg",
      "src/paraiso-beach/restaurante/PBE_GAST_0049.jpg",
      "src/paraiso-beach/restaurante/PBE_GAST_0053.jpg",
      "src/paraiso-beach/restaurante/PBE_GAST_0059.jpg",
      "src/paraiso-beach/restaurante/PBE_GAST_0061.jpg"
    ]
  },

  "Iberostar Paraíso del Mar": {
    banner: [
      "src/paraiso-del-mar/banner/ParaisoDelMar.jpg",
      "src/paraiso-del-mar/banner/PMA_GAST_0011.jpg",
      "src/paraiso-del-mar/banner/PMA_GAST_0026.jpg",
      "src/paraiso-del-mar/banner/PMA_OUTSIDE_0004.jpg",
      "src/paraiso-del-mar/banner/PMA_VIEWS_0010.jpg",
      "src/paraiso-del-mar/banner/PMA_VIEWS_0016.jpg",
      "src/paraiso-del-mar/banner/PMA_VIEWS_0025.jpg"
    ],

    habitaciones: [
      "src/paraiso-del-mar/habitaciones/PMA_ROOM_0044.jpg",
      "src/paraiso-del-mar/habitaciones/PMA_ROOM_0067.jpg",
      "src/paraiso-del-mar/habitaciones/PMA_ROOM_0071.jpg",
      "src/paraiso-del-mar/habitaciones/PMA_ROOM_0080.jpg",
      "src/paraiso-del-mar/habitaciones/PMA_ROOM_0084.jpg"
    ],

    piscinas: [
      "src/paraiso-del-mar/piscinas/PBE_POOL_0003.jpg",
      "src/paraiso-del-mar/piscinas/PBE_POOL_0011.jpg",
      "src/paraiso-del-mar/piscinas/PMA_GAST_0079.jpg",
      "src/paraiso-del-mar/piscinas/PMA_VIEWS_0010.jpg",
      "src/paraiso-del-mar/piscinas/PMA_VIEWS_0017.jpg"
    ],

    restaurante: [
      "src/paraiso-del-mar/restaurante/PMA_GAST_0015.jpg",
      "src/paraiso-del-mar/restaurante/PMA_GAST_0024.jpg",
      "src/paraiso-del-mar/restaurante/PMA_GAST_0060.jpg",
      "src/paraiso-del-mar/restaurante/PMA_GAST_0065.jpg",
      "src/paraiso-del-mar/restaurante/PMA_GAST_0072.jpg"
    ]
  },

  "Iberostar Paraíso JOIA": {
    banner: [
      "src/paraiso-JOIA/banner/JOIA.jpg",
      "src/paraiso-JOIA/banner/JOIA2.jpg",
      "src/paraiso-JOIA/banner/GHP_MICE_0005.jpg",
      "src/paraiso-JOIA/banner/GHP_POOL_0050.jpg",
      "src/paraiso-JOIA/banner/GHP_POOL_0052.jpg",
      "src/paraiso-JOIA/banner/GHP_VIEWS_0023.jpg",
      "src/paraiso-JOIA/banner/GHP_VIEWS_0024.jpg"
    ],

    habitaciones: [
      "src/paraiso-JOIA/habitaciones/GHP_ROOM_0088.jpg",
      "src/paraiso-JOIA/habitaciones/GHP_ROOM_0090.jpg",
      "src/paraiso-JOIA/habitaciones/GHP_ROOM_0108.jpg",
      "src/paraiso-JOIA/habitaciones/GHP_ROOM_0118.jpg",
      "src/paraiso-JOIA/habitaciones/GHP_ROOM_0126.jpg"
    ],

    piscinas: [
      "src/paraiso-JOIA/piscinas/GHP_POOL_0012.jpg",
      "src/paraiso-JOIA/piscinas/GHP_POOL_0021.jpg",
      "src/paraiso-JOIA/piscinas/GHP_POOL_0037.jpg",
      "src/paraiso-JOIA/piscinas/GHP_POOL_0038.jpg",
      "src/paraiso-JOIA/piscinas/GHP_POOL_0050.jpg"
    ],

    restaurante: [
      "src/paraiso-JOIA/restaurante/GHP_GAST_0097.jpg",
      "src/paraiso-JOIA/restaurante/GHP_GAST_0102.jpg",
      "src/paraiso-JOIA/restaurante/GHP_GAST_0103.jpg",
      "src/paraiso-JOIA/restaurante/GHP_GAST_0166.jpg",
      "src/paraiso-JOIA/restaurante/GHP_GAST_0191.jpg"
    ]
  },

  "Iberostar Paraíso Lindo": {
    banner: [
      "src/paraiso-lindo/banner/ParaisoLindo.jpg",
      "src/paraiso-lindo/banner/PLI_GAST_0128.jpg",
      "src/paraiso-lindo/banner/PLI_POOL_0014.jpg",
      "src/paraiso-lindo/banner/PLI_VIEWS_0009.jpg",
      "src/paraiso-lindo/banner/PLI_VIEWS_0011.jpg",
      "src/paraiso-lindo/banner/PLI_VIEWS_0031.jpg",
      "src/paraiso-lindo/banner/PLI_VIEWS_0037.jpg",
      "src/paraiso-lindo/banner/PLI_VIEWS_0042.jpg"
    ],

    habitaciones: [
      "src/paraiso-lindo/habitaciones/PLI_ROOM_0002.jpg",
      "src/paraiso-lindo/habitaciones/PLI_ROOM_0031.jpg",
      "src/paraiso-lindo/habitaciones/PLI_ROOM_0103.jpg",
      "src/paraiso-lindo/habitaciones/PLI_ROOM_0137.jpg",
      "src/paraiso-lindo/habitaciones/PLI_ROOM_0164.jpg"
    ],

    piscinas: [
      "src/paraiso-lindo/piscina/PLI_POOL_0014.jpg",
      "src/paraiso-lindo/piscina/PLI_POOL_0095.jpg",
      "src/paraiso-lindo/piscina/PLI_VIEWS_0009.jpg",
      "src/paraiso-lindo/piscina/PLI_VIEWS_0035.jpg",
      "src/paraiso-lindo/piscina/PLI_VIEWS_0037.jpg"
    ],

    restaurante: [
      "src/paraiso-lindo/Restaurante/PLI_GAST_0043.jpg",
      "src/paraiso-lindo/Restaurante/PLI_GAST_0085.jpg",
      "src/paraiso-lindo/Restaurante/PLI_GAST_0089.jpg",
      "src/paraiso-lindo/Restaurante/PLI_GAST_0098.jpg",
      "src/paraiso-lindo/Restaurante/PLI_GAST_0105.jpg"
    ]
  },

  "Iberostar Paraíso Maya": {
    banner: [
      "src/paraiso-maya/banner/paraisoMaya.jpg",
      "src/paraiso-maya/banner/PMY_OUTSIDE_0001.jpg",
      "src/paraiso-maya/banner/PMY_OUTSIDE_0005.jpg",
      "src/paraiso-maya/banner/PMY_POOL_0049.jpg",
      "src/paraiso-maya/banner/PMY_VIEWS_0016.jpg",
      "src/paraiso-maya/banner/PMY_VIEWS_0031.jpg",
      "src/paraiso-maya/banner/PMY_VIEWS_0032.jpg"
    ],

    habitaciones: [
      "src/paraiso-maya/habitaciones/PMY_ROOM_0151.jpg",
      "src/paraiso-maya/habitaciones/PMY_ROOM_0162.jpg",
      "src/paraiso-maya/habitaciones/PMY_ROOM_0167.jpg",
      "src/paraiso-maya/habitaciones/PMY_ROOM_0173.jpg",
      "src/paraiso-maya/habitaciones/PMY_ROOM_0175.jpg"
    ],

    piscinas: [
      "src/paraiso-maya/piscinas/PMY_POOL_0009.jpg",
      "src/paraiso-maya/piscinas/PMY_POOL_0034.jpg",
      "src/paraiso-maya/piscinas/PMY_POOL_0059.jpg",
      "src/paraiso-maya/piscinas/PMY_POOL_0118.jpg",
      "src/paraiso-maya/piscinas/PMY_VIEWS_0042.jpg"
    ],

    restaurante: [
      "src/paraiso-maya/restaurante/PMY_GAST_0231.jpg",
      "src/paraiso-maya/restaurante/PMY_GAST_0235.jpg",
      "src/paraiso-maya/restaurante/PMY_GAST_0262.jpg",
      "src/paraiso-maya/restaurante/PMY_GAST_0270.jpg",
      "src/paraiso-maya/restaurante/PMY_GAST_0296.jpg"
    ]
  }
};

const bookShell =
  document.getElementById("bookShell");

const pager =
  document.getElementById("pager");

const leftButton =
  document.querySelector(".nav-left");

const rightButton =
  document.querySelector(".nav-right");

let currentIndex = 0;
let currentPosition = null;
let activeMap = null;
let activeDirectionsRenderer = null;
let userMarker = null;
let routeLine = null;
let activeHotelDetail = null;
let activeRestaurantMenuIndex = null;
let returnPageIndex = null;

window.RevistaDigital = window.RevistaDigital || {};
window.RevistaDigital.state = window.RevistaDigital.state || {};

Object.defineProperties(window.RevistaDigital.state, {
  pages: { enumerable: true, get: () => pages },
  hotelCountryMenus: { enumerable: true, get: () => hotelCountryMenus },
  hotelCoordinates: { enumerable: true, get: () => hotelCoordinates },
  complexBounds: { enumerable: true, get: () => complexBounds },
  hotelMediaCatalog: { enumerable: true, get: () => hotelMediaCatalog },
  generalMapCenter: { enumerable: true, get: () => generalMapCenter },
  generalMapZoom: { enumerable: true, get: () => generalMapZoom },
  currentIndex: {
    enumerable: true,
    get: () => currentIndex,
    set: (value) => { currentIndex = value; }
  },
  currentPosition: {
    enumerable: true,
    get: () => currentPosition,
    set: (value) => { currentPosition = value; }
  },
  activeMap: {
    enumerable: true,
    get: () => activeMap,
    set: (value) => { activeMap = value; }
  },
  activeDirectionsRenderer: {
    enumerable: true,
    get: () => activeDirectionsRenderer,
    set: (value) => { activeDirectionsRenderer = value; }
  },
  userMarker: {
    enumerable: true,
    get: () => userMarker,
    set: (value) => { userMarker = value; }
  },
  routeLine: {
    enumerable: true,
    get: () => routeLine,
    set: (value) => { routeLine = value; }
  },
  activeHotelDetail: {
    enumerable: true,
    get: () => activeHotelDetail,
    set: (value) => { activeHotelDetail = value; }
  },
  activeRestaurantMenuIndex: {
    enumerable: true,
    get: () => activeRestaurantMenuIndex,
    set: (value) => { activeRestaurantMenuIndex = value; }
  },
  returnPageIndex: {
    enumerable: true,
    get: () => returnPageIndex,
    set: (value) => { returnPageIndex = value; }
  }
});

function slugify(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "hotel";
}

function getHotelMedia(pageName) {
  return (
    hotelMediaCatalog[pageName] || {
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

function renderHotelSectionPanel(
  pageName,
  sectionKey
) {
  const panelId =
    `hotel-panel-${slugify(pageName)}`;

  const panel =
    document.getElementById(panelId);

  const media =
    getHotelMedia(pageName)[sectionKey] || [];

  const title =
    getSectionName(sectionKey);

  if (!panel) return;

  panel.innerHTML = `
    <div class="hotel-panel-header">
      <span>${pageName}</span>
      <h3>${title}</h3>
      <button
        type="button"
        class="hotel-panel-close"
        data-close-panel="${panelId}"
      >×</button>
    </div>

    <div class="hotel-panel-grid">
      ${
        media.length
          ? media
              .map(
                (image) => `
                  <figure class="hotel-panel-item">
                    <img
                      src="${image}"
                      alt="${title} de ${pageName}"
                    />
                  </figure>
                `
              )
              .join("")
          : `
            <div class="hotel-panel-empty">
              No hay imágenes disponibles para
              ${title.toLowerCase()} en este hotel.
            </div>
          `
      }
    </div>
  `;

  panel.classList.add("visible");

  panel
    .querySelector(".hotel-panel-close")
    ?.addEventListener("click", () => {
      panel.classList.remove("visible");
    });
}

function initializeHotelCarousel(root) {
  const slides = [
    ...root.querySelectorAll(
      ".hotel-carousel-slide"
    )
  ];

  const indicators = [
    ...root.querySelectorAll(
      ".hotel-carousel-indicator"
    )
  ];

  const prev =
    root.querySelector(
      ".hotel-carousel-prev"
    );

  const next =
    root.querySelector(
      ".hotel-carousel-next"
    );

  if (!slides.length) return;

  let currentSlide = 0;
  let autoTimer = null;
  let touchStartX = 0;

  const showSlide = (index) => {
    currentSlide =
      (index + slides.length) %
      slides.length;

    slides.forEach(
      (slide, slideIndex) => {
        slide.classList.toggle(
          "active",
          slideIndex === currentSlide
        );
      }
    );

    indicators.forEach(
      (indicator, indicatorIndex) => {
        indicator.classList.toggle(
          "active",
          indicatorIndex === currentSlide
        );

        indicator.setAttribute(
          "aria-selected",
          String(
            indicatorIndex === currentSlide
          )
        );
      }
    );
  };

  const restartAutoPlay = () => {
    if (autoTimer) {
      clearInterval(autoTimer);
    }

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
      showSlide(
        Number(
          indicator.dataset.slideIndex
        )
      );

      restartAutoPlay();
    });
  });

  root.addEventListener(
    "touchstart",
    (event) => {
      touchStartX =
        event.touches[0].clientX;
    },
    { passive: true }
  );

  root.addEventListener(
    "touchend",
    (event) => {
      const deltaX =
        event.changedTouches[0].clientX -
        touchStartX;

      if (Math.abs(deltaX) > 50) {
        showSlide(
          currentSlide +
            (deltaX < 0 ? 1 : -1)
        );

        restartAutoPlay();
      }
    },
    { passive: true }
  );

  root.addEventListener(
    "mouseenter",
    () => clearInterval(autoTimer)
  );

  root.addEventListener(
    "mouseleave",
    restartAutoPlay
  );

  showSlide(0);
  restartAutoPlay();
}


/* =========================================================
   LEAFLET
   ========================================================= */

function loadLeaflet() {
  if (window.L) {
    return Promise.resolve(window.L);
  }

  if (leafletPromise) {
    return leafletPromise;
  }

  leafletPromise = new Promise(
    (resolve, reject) => {
      const stylesheet =
        document.createElement("link");

      stylesheet.rel = "stylesheet";

      stylesheet.href =
        "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

      document.head.appendChild(
        stylesheet
      );

      const script =
        document.createElement("script");

      script.src =
        "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

      script.onload = () =>
        resolve(window.L);

      script.onerror = reject;

      document.head.appendChild(script);
    }
  );

  return leafletPromise;
}

function loadGoogleMaps() {
  if (!GOOGLE_MAPS_API_KEY) {
    return Promise.resolve(null);
  }

  if (window.google?.maps) {
    return Promise.resolve(
      window.google.maps
    );
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise(
    (resolve, reject) => {
      const callbackName =
        "googleMapsReady";

      window[callbackName] = () =>
        resolve(
          window.google.maps
        );

      const script =
        document.createElement("script");

      script.src =
        `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=${callbackName}`;

      script.async = true;
      script.defer = true;

      script.onerror = reject;

      document.head.appendChild(
        script
      );
    }
  );

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
      `https://router.project-osrm.org/route/v1/foot/${start};${end}?overview=full&geometries=geojson`;

    fetch(routeRequest)
      .then((response) => response.json())
      .then((route) => {
        const osrmCoordinates =
          route.routes?.[0]?.geometry?.coordinates?.map(
            ([longitude, latitude]) =>
              [latitude, longitude]
          );

        // OSRM a veces "engancha" la ruta al camino peatonal más
        // cercano y no llega exactamente hasta la puerta del hotel.
        // Forzamos que la línea siempre empiece en tu ubicación real
        // y termine exactamente en la coordenada del hotel.
        const routeCoordinates =
          osrmCoordinates && osrmCoordinates.length
            ? [
                [
                  currentPosition.latitude,
                  currentPosition.longitude
                ],
                ...osrmCoordinates,
                destinationCoordinates
              ]
            : null;

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
  const hotelMedia =
    getHotelMedia(page.name);

  const bannerImages =
    hotelMedia.banner?.length
      ? hotelMedia.banner
      : [page.image];

  const stats =
    page.stats
      .map(([value, label]) => {
        const sectionKey = (() => {
          const normalized =
            String(label)
              .trim()
              .toLowerCase();

          if (
            normalized.includes("habitac")
          ) {
            return "habitaciones";
          }

          if (
            normalized.includes("restau")
          ) {
            return "restaurante";
          }

          if (
            normalized.includes("pisc")
          ) {
            return "piscinas";
          }

          return "habitaciones";
        })();

        return `
          <button
            class="hotel-stat-button"
            type="button"
            data-hotel-section="${sectionKey}"
            data-hotel-name="${page.name}"
          >
            <strong>${value}</strong>
            <small>${label}</small>
          </button>
        `;
      })
      .join("");

  const carouselSlides =
    bannerImages
      .map(
        (image, index) => `
        <div
          class="hotel-carousel-slide ${
            index === 0 ? "active" : ""
          }"
          style="background-image:linear-gradient(180deg,rgba(5,12,17,.12),rgba(5,12,17,.5)),url('${image}')"
        ></div>
      `
      )
      .join("");

  const carouselIndicators =
    bannerImages
      .map(
        (_, index) => `
        <button
          type="button"
          class="hotel-carousel-indicator ${
            index === 0 ? "active" : ""
          }"
          data-slide-index="${index}"
          aria-label="Ver imagen ${index + 1}"
          aria-selected="${index === 0}"
        ></button>
      `
      )
      .join("");

  const benefits =
    page.benefits
      .map(
        (item) =>
          `<li>${item}</li>`
      )
      .join("");

  const panelId =
    `hotel-panel-${slugify(page.name)}`;

  return `
    <div class="spread reference-spread hotel-spread">

      <article class="reference-left">

        <div
          class="reference-photo hotel-carousel"
          data-hotel-carousel="${page.name}"
        >

          ${carouselSlides}

          <div class="reference-photo-content">
            <small>
              Todo lo incluido · La esencia
            </small>

            <h1>
              ${page.name}
            </h1>
          </div>

          <button
            class="hotel-carousel-nav hotel-carousel-prev"
            type="button"
            aria-label="Imagen anterior"
          >
            ‹
          </button>

          <button
            class="hotel-carousel-nav hotel-carousel-next"
            type="button"
            aria-label="Imagen siguiente"
          >
            ›
          </button>

          <div class="hotel-carousel-indicators">
            ${carouselIndicators}
          </div>

        </div>

        <div class="reference-copy">

          <p>
            ${page.intro}
          </p>

          <div class="reference-stats hotel-stats">
            ${stats}
          </div>

          <div
            class="hotel-panel"
            id="${panelId}"
          ></div>

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
            Sabores para descubrir
          </h3>

          <button
            class="restaurant-menu-open"
            type="button"
            aria-label="Ver menú de restaurantes de ${page.name}"
          >
            Ver menú de restaurantes →
          </button>

        </div>

      </article>

    </div>
  `;
}

const restaurantMenuOptions = [
  {
    name: "Bella Italia",
    cuisine: "ITALIANA",
    hours: "18:00"
  },

  {
    name: "La Palapa",
    cuisine: "MEXICANA COSTERA",
    hours: "07:00"
  },

  {
    name: "El Gaucho",
    cuisine: "PARRILLA ARGENTINA",
    hours: "19:00"
  },

  {
    name: "Snack & Grill",
    cuisine: "CASUAL INTERNACIONAL",
    hours: "12:00"
  }
];

function renderRestaurantMenu(pageIndex) {
  const hotel = pages[pageIndex];

  if (
    !hotel ||
    hotel.type !== "hotel"
  ) {
    return "";
  }

  const hotelMedia =
    getHotelMedia(hotel.name);

  const heroImage =
    hotelMedia.banner?.[0] ||
    hotel.image;

  const restaurantCount =
    hotel.stats.find(
      ([, label]) =>
        String(label)
          .toLowerCase()
          .includes("restaurantes")
    )?.[0] ||
    restaurantMenuOptions.length;

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
}


/* =========================================================
   NUEVO - WORKSPACE
   ========================================================= */

function renderWorkspace() {
  return `
    <div class="spread workspace-spread">

      <div class="workspace-header">

        <div>
          <small>
            EXPERIENCIAS DE LA COMUNIDAD
          </small>

          <h1>
            Workspace
          </h1>
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

  const { data: items, error } =
    await supabaseClient
      .from("workspace")
      .select("*")
      .order("created_at", {
        ascending: false
      });

  if (error) {
    console.error(
      "ERROR AL CARGAR WORKSPACE:",
      error
    );

    return;
  }

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

  console.log(
    "EDITAR WORKSPACE:",
    id
  );

  const { data, error } =
    await supabaseClient
      .from("workspace")
      .select("*")
      .eq("id", id);

  if (error) {
    console.error(
      "ERROR AL BUSCAR WORKSPACE:",
      error
    );

    alert(
      "No se pudo cargar la experiencia."
    );

    return;
  }

  if (
    !data ||
    data.length === 0
  ) {
    console.error(
      "NO SE ENCONTRÓ EL WORKSPACE:",
      id
    );

    alert(
      "No se encontró esta experiencia."
    );

    return;
  }

  const item = data[0];

  document.getElementById(
    "workspaceEditId"
  ).value = item.id;

  document.getElementById(
    "workspaceHotel"
  ).value = item.hotel || "";

  document.getElementById(
    "workspaceTitle"
  ).value = item.title || "";

  document.getElementById(
    "workspaceText"
  ).value = item.text || "";

  document.getElementById(
    "workspaceProduct"
  ).value = item.product || "";

  document.getElementById(
    "workspaceForm"
  ).classList.add("visible");

  document.getElementById(
    "workspaceSaveButton"
  ).textContent =
    "GUARDAR CAMBIOS";
}

async function deleteWorkspace(id) {

  console.log(
    "ELIMINAR WORKSPACE:",
    id
  );

  const { error } =
    await supabaseClient
      .from("workspace")
      .delete()
      .eq("id", id);

  if (error) {

    console.error(
      "ERROR AL ELIMINAR WORKSPACE:",
      error
    );

    alert(
      "No se pudo eliminar la experiencia."
    );

    return;
  }

  console.log(
    "WORKSPACE ELIMINADO CORRECTAMENTE"
  );

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

  let imageUrl = null;

  // Obtener la imagen actual
  const { data: currentData, error: currentError } =
    await supabaseClient
      .from("workspace")
      .select("image")
      .eq("id", editId)
      .single();

  if (currentError) {

    console.error(
      "ERROR AL OBTENER IMAGEN ACTUAL:",
      currentError
    );

    alert(
      "No se pudo obtener la experiencia."
    );

    return;
  }

  imageUrl = currentData.image || null;

  // Si seleccionaste una imagen nueva
  if (imageFile) {

    const fileExt =
      imageFile.name.split(".").pop();

    const fileName =
      `${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } =
      await supabaseClient
        .storage
        .from("workspace-images")
        .upload(
          fileName,
          imageFile,
          {
            contentType: imageFile.type,
            upsert: false
          }
        );

    if (uploadError) {

      console.error(
        "ERROR AL SUBIR NUEVA IMAGEN:",
        uploadError
      );

      alert(
        "No se pudo subir la nueva imagen."
      );

      return;
    }

    const { data: publicUrlData } =
      supabaseClient
        .storage
        .from("workspace-images")
        .getPublicUrl(fileName);

    imageUrl =
      publicUrlData.publicUrl;
  }

  // Actualizar experiencia
  const { error } =
    await supabaseClient
      .from("workspace")
      .update({
        hotel,
        title,
        text,
        product,
        image: imageUrl
      })
      .eq("id", editId);
      
console.log("RESULTADO UPDATE:", error);

if (error) {

  console.error(
    "ERROR AL ACTUALIZAR WORKSPACE:",
    JSON.stringify(error, null, 2)
  );

  alert(
    "No se pudo actualizar la experiencia."
  );

  return;
}

} else {

  let imageUrl = null;

  if (imageFile) {

  const fileExt = imageFile.name.split(".").pop();

  const fileName =
    `${crypto.randomUUID()}.${fileExt}`;

  const { error: uploadError } =
    await supabaseClient
      .storage
      .from("workspace-images")
      .upload(fileName, imageFile, {
        contentType: imageFile.type,
        upsert: false
      });

  if (uploadError) {

    console.error(
      "ERROR AL SUBIR IMAGEN:",
      uploadError
    );

    alert(
      "No se pudo subir la imagen."
    );

    return;
  }

  const { data: publicUrlData } =
    supabaseClient
      .storage
      .from("workspace-images")
      .getPublicUrl(fileName);

  imageUrl =
    publicUrlData.publicUrl;
}

const { data, error } =
  await supabaseClient
    .from("workspace")
    .insert([
      {
        hotel,
        title,
        text,
        product,
        image: imageUrl
      }
    ])
    .select();

console.log(
  "RESULTADO INSERT:",
  data
);

console.log(
  "ERROR INSERT:",
  error
);

console.log("RESULTADO INSERT:", data);
console.log("ERROR INSERT:", error);

    if (error) {
      console.error(
        "ERROR AL PUBLICAR WORKSPACE:",
        error
      );

      alert(
        "No se pudo publicar la experiencia."
      );

      return;
    }
  }

  resetWorkspaceForm();

  form.classList.remove(
    "visible"
  );

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

const { data: items, error } =
  await supabaseClient
    .from("videos")
    .select("*, mimeType:mime_type")
    .order("created_at", {
      ascending: false
    });

if (error) {
  console.error(
    "ERROR AL CARGAR VIDEOS:",
    error
  );

  return;
}

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

  const { data: item, error } =
    await supabaseClient
      .from("videos")
      .select("*")
      .eq("id", id)
      .single();

  if (error) {
    console.error(
      "ERROR AL CARGAR VIDEO PARA EDITAR:",
      error
    );

    return;
  }

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

  const { error } =
    await supabaseClient
      .from("videos")
      .delete()
      .eq("id", id);

  if (error) {
    console.error(
      "ERROR AL ELIMINAR VIDEO:",
      error
    );

    return;
  }

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

        const { data: current, error: currentError } =
          await supabaseClient
            .from("videos")
            .select("*")
            .eq("id", editId)
            .single();

        if (currentError || !current) {
          console.error(
            "ERROR AL CARGAR VIDEO ACTUAL:",
            currentError
          );

          alert(
            "No se pudo cargar el video."
          );

          return;
        }

        let videoUrl =
          current.video;

        let mimeType =
          current.mime_type;

        if (file) {

          const fileExt =
            file.name
              .split(".")
              .pop();

          const fileName =
            `${crypto.randomUUID()}.${fileExt}`;

          const { error: uploadError } =
            await supabaseClient
              .storage
              .from("videos")
              .upload(
                fileName,
                file,
                {
                  contentType:
                    file.type ||
                    "video/mp4",
                  upsert: false
                }
              );

          if (uploadError) {
            console.error(
              "ERROR AL SUBIR VIDEO:",
              uploadError
            );

            alert(
              "No se pudo subir el nuevo video."
            );

            return;
          }

          const { data: publicUrlData } =
            supabaseClient
              .storage
              .from("videos")
              .getPublicUrl(
                fileName
              );

          videoUrl =
            publicUrlData.publicUrl;

          mimeType =
            file.type ||
            "video/mp4";
        }

        const { error: updateError } =
          await supabaseClient
            .from("videos")
            .update({
              hotel,
              title,
              video: videoUrl,
              mime_type: mimeType,
              start,
              end
            })
            .eq("id", editId);

        if (updateError) {
          console.error(
            "ERROR AL ACTUALIZAR VIDEO:",
            updateError
          );

          alert(
            "No se pudo actualizar el video."
          );

          return;
        }

      } else {

        const fileExt =
          file.name
            .split(".")
            .pop();

        const fileName =
          `${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } =
          await supabaseClient
            .storage
            .from("videos")
            .upload(
              fileName,
              file,
              {
                contentType:
                  file.type ||
                  "video/mp4",
                upsert: false
              }
            );

        if (uploadError) {
          console.error(
            "ERROR AL SUBIR VIDEO:",
            uploadError
          );

          alert(
            "No se pudo subir el video."
          );

          return;
        }

        const { data: publicUrlData } =
          supabaseClient
            .storage
            .from("videos")
            .getPublicUrl(
              fileName
            );

        const videoUrl =
          publicUrlData.publicUrl;

        const { error: insertError } =
          await supabaseClient
            .from("videos")
            .insert([
              {
                hotel,
                title,
                video: videoUrl,
                mime_type:
                  file.type ||
                  "video/mp4",
                start,
                end
              }
            ]);

        if (insertError) {
          console.error(
            "ERROR AL GUARDAR VIDEO:",
            insertError
          );

          alert(
            "El video se subió, pero no se pudo guardar en la base de datos."
          );

          return;
        }
      }{
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

function renderCountryMenu(page) {
  const countryKey = page.country || "mexico";
  const country = hotelCountryMenus[countryKey] || hotelCountryMenus.mexico;
  const heroCards = country.hotels
    .map((hotel, index) => `
      <button
        type="button"
        class="country-card"
        data-country="${countryKey}"
        data-hotel-index="${index}"
        tabindex="0"
        aria-label="Abrir ficha de ${hotel.name}"
      >
        <img src="${hotel.image}" alt="${hotel.name}" />
        <span class="country-card-label">${country.name}</span>
        <strong>${hotel.name}</strong>
        <em>${hotel.tagline}</em>
        <small>${hotel.description}</small>
        <span class="country-card-action">Ver ficha</span>
      </button>
    `)
    .join("");

  const menuSequence = pages
    .map((entry, index) => ({
      index,
      country: entry.country || null,
      type: entry.type
    }))
    .filter((entry) => entry.type === "country-menu");

  const currentMenuIndex = menuSequence.findIndex((entry) => entry.index === currentIndex);
  const previousIndex = menuSequence[(currentMenuIndex - 1 + menuSequence.length) % menuSequence.length]?.index ?? currentIndex;
  const nextIndex = menuSequence[(currentMenuIndex + 1) % menuSequence.length]?.index ?? currentIndex;

  return `
    <div class="spread country-menu-spread">
      <div class="country-header">
        <div class="country-header-line"></div>
        <div class="country-header-meta">${page.kicker || country.name.toUpperCase()}</div>
      </div>

      <div class="country-intro">
        <div>
          <span class="country-intro-label">HOTELERÍA</span>
          <h1>${country.name}</h1>
        </div>
        <p>${country.intro}</p>
      </div>

      <div class="country-grid">
        ${heroCards}
      </div>

      <div class="country-footer">
        <span>IBEROSTAR · REVISTA DIGITAL</span>
      </div>

      <button type="button" class="country-menu-nav country-nav-prev" data-direction="-1" data-target="${previousIndex}" aria-label="Ver país anterior">‹</button>
      <button type="button" class="country-menu-nav country-nav-next" data-direction="1" data-target="${nextIndex}" aria-label="Ver siguiente país">›</button>
      <div class="country-indicator" aria-label="Indicador de país">${country.name}</div>
    </div>
  `;
}

function openHotelDetail(countryKey, hotelIndex) {
  const country = hotelCountryMenus[countryKey];
  const hotel = country?.hotels?.[hotelIndex];

  if (!hotel) return;

  returnPageIndex = currentIndex;
  activeHotelDetail = {
    countryKey,
    hotelIndex,
    activeTab: "habitaciones",
    galleryIndex: 0
  };

  renderPage();
}

function getActiveHotelDetail() {
  if (!activeHotelDetail) return null;
  const country = hotelCountryMenus[activeHotelDetail.countryKey];
  if (!country) return null;
  return {
    ...activeHotelDetail,
    hotel: country.hotels[activeHotelDetail.hotelIndex] || null
  };
}

function renderHotelDetail() {
  const detail = getActiveHotelDetail();
  if (!detail || !detail.hotel) return "";

  const country = hotelCountryMenus[detail.countryKey];
  const hotel = detail.hotel;
  const tabs = [
    { key: "habitaciones", label: "Habitaciones" },
    { key: "restaurante", label: "Restaurantes" },
    { key: "piscinas", label: "Piscinas" },
    { key: "experiencias", label: "Experiencias" }
  ];
  const activeTabKey = detail.activeTab || "habitaciones";
  const activeTab = hotel.tabs?.[activeTabKey] || hotel.tabs?.habitaciones;
  const tabImages = (activeTab?.images || [hotel.image]).filter(Boolean);
  const currentImage = tabImages[detail.galleryIndex] || hotel.image;
  const galleryCounter = `${Math.min(detail.galleryIndex + 1, tabImages.length) || 1} / ${tabImages.length || 1}`;

  const tabsMarkup = tabs.map((tab) => `
    <button
      type="button"
      role="tab"
      aria-selected="${tab.key === activeTabKey ? "true" : "false"}"
      class="hotel-detail-tab ${tab.key === activeTabKey ? "is-active" : ""}"
      data-hotel-tab="${tab.key}"
    >
      ${tab.label}
    </button>
  `).join("");

  const thumbnails = tabImages.map((image, index) => `
    <button
      type="button"
      class="hotel-detail-thumb ${index === detail.galleryIndex ? "is-selected" : ""}"
      data-gallery-index="${index}"
      aria-label="Ver imagen ${index + 1}"
    >
      <img src="${image}" alt="${hotel.name} ${activeTab.title} ${index + 1}" />
    </button>
  `).join("");

  const prevHotelIndex = (detail.hotelIndex - 1 + country.hotels.length) % country.hotels.length;
  const nextHotelIndex = (detail.hotelIndex + 1) % country.hotels.length;

  return `
    <div class="spread hotel-detail-spread">
      <div class="hotel-detail-header">
        <div class="hotel-detail-header-line"></div>
        <span>${country.name}</span>
      </div>

      <section class="hotel-hero">
        <div class="hotel-hero-image-wrap">
          <img src="${currentImage}" alt="${hotel.name}" class="hotel-hero-image" />
        </div>

        <div class="hotel-hero-info">
          <small>${hotel.tagline}</small>
          <h1>${hotel.name}</h1>
          <p>${hotel.description}</p>
          <div class="hotel-detail-keypoints">
            ${((activeTab?.keyPoints || []).map((point) => `<span>${point}</span>`).join(""))}
          </div>
        </div>
      </section>

      <div class="hotel-detail-tabs" role="tablist" aria-label="Detalles del hotel">
        ${tabsMarkup}
      </div>

      <section class="hotel-detail-gallery">
        <div class="hotel-detail-gallery-main">
          <button type="button" class="hotel-detail-gallery-arrow hotel-detail-gallery-prev" data-gallery-nav="-1" aria-label="Imagen anterior">‹</button>
          <img src="${currentImage}" alt="${hotel.name} ${activeTab.title}" />
          <button type="button" class="hotel-detail-gallery-arrow hotel-detail-gallery-next" data-gallery-nav="1" aria-label="Imagen siguiente">›</button>
        </div>

        <div class="hotel-detail-gallery-meta">
          <div class="hotel-detail-gallery-counter">${galleryCounter}</div>
          <div class="hotel-detail-gallery-thumbs">${thumbnails}</div>
        </div>
      </section>

      <div class="hotel-detail-actions">
        <button type="button" class="hotel-detail-back" aria-label="Volver al menú de hoteles">Volver al menú de hoteles</button>
        <div class="hotel-detail-nav-arrows">
          <button type="button" class="hotel-detail-nav" data-hotel-index="${prevHotelIndex}" data-hotel-direction="-1" aria-label="Hotel anterior">‹</button>
          <button type="button" class="hotel-detail-nav" data-hotel-index="${nextHotelIndex}" data-hotel-direction="1" aria-label="Hotel siguiente">›</button>
        </div>
      </div>
    </div>
  `;
}

function syncBookRoute() {
  const page = pages[currentIndex];
  let nextPath = "/";

  if (activeRestaurantMenuIndex !== null) {
    const restaurantHotel = pages[activeRestaurantMenuIndex];
    if (restaurantHotel?.type === "hotel") {
      nextPath = `/restaurantes/${slugify(restaurantHotel.name)}`;
    }
  } else if (activeHotelDetail) {
    const countryKey = activeHotelDetail.countryKey;
    const hotel = hotelCountryMenus[countryKey]?.hotels?.[activeHotelDetail.hotelIndex];
    if (hotel) {
      nextPath = `/hoteles/${countryKey}/${slugify(hotel.name)}`;
    }
  } else if (page.type === "country-menu") {
    nextPath = `/hoteles/${page.country}`;
  } else if (page.type === "map") {
    nextPath = "/mapa-general";
  } else if (page.type === "mapamundi") {
    nextPath = "/mapa-mundi";
  } else if (page.type === "workspace") {
    nextPath = "/workspace";
  } else if (page.type === "media360") {
    nextPath = "/360";
  } else if (page.type === "videos") {
    nextPath = "/videos";
  }

  const projectBasePath = new URL(appBaseElement.href).pathname.replace(/\/+$/, "");
  const targetPath = nextPath === "/" ? `${projectBasePath}/` : `${projectBasePath}${nextPath}`;
  const currentPath = window.location.pathname || "/";

  if (currentPath !== targetPath) {
    history.pushState({ currentIndex, activeHotelDetail, returnPageIndex, activeRestaurantMenuIndex }, "", targetPath);
  }
}

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

  if (activeRestaurantMenuIndex !== null) {
    bookShell.innerHTML = window.RevistaDigital.restaurantes.renderMenu(
      pages[activeRestaurantMenuIndex]
    );
  }
  else if (activeHotelDetail) {
    bookShell.innerHTML = renderHotelDetail();
  }
  else if (page.type === "country-menu") {
    bookShell.innerHTML = renderCountryMenu(page);
  }
  else if (
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
            src="src/logo png-02.png"
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
          style="background-image:linear-gradient(180deg,rgba(255,255,255,.04) 42%,rgba(59,44,31,.35)),url('${page.image}')"
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
          src="mapa-mundi/index2.html"
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
    <div class="spread back-spread">

      <section class="back-quote" style="background-image:linear-gradient(rgba(4,24,39,.62),rgba(4,24,39,.62)),url('${page.image}')">
        <span>${page.kicker}</span>
        <h1>“${page.quote}”</h1>
        <span>KM. 309 · PLAYA DEL CARMEN, Q.ROO MÉXICO</span>
      </section>

      <section class="back-contact">
        <img class="cover-logo" src="src/logo png-02.png" alt="Logo">
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

  syncBookRoute();

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
          activeRestaurantMenuIndex = null;
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

function wireRestaurantInteractionsLegacy(root) {
  root.querySelectorAll(".restaurant-menu-open").forEach((button) => {
    button.addEventListener("click", () => {
      activeRestaurantMenuIndex = currentIndex;
      renderPage();
    });
  });

  root.querySelectorAll(".restaurant-menu-back").forEach((button) => {
    button.addEventListener("click", () => {
      activeRestaurantMenuIndex = null;
      renderPage();
    });
  });
}

function wirePageInteractions() {
  const map =
    bookShell.querySelector(
      ".map-canvas"
    );

  window.RevistaDigital.restaurantes.wireInteractions(bookShell, {
    open: () => {
      activeRestaurantMenuIndex = currentIndex;
      renderPage();
    },
    close: () => {
      activeRestaurantMenuIndex = null;
      renderPage();
    }
  });

  document.querySelectorAll(".hotel-carousel").forEach((carousel) => {
    initializeHotelCarousel(carousel);
  });

  document.querySelectorAll(".hotel-stat-button").forEach((button) => {
    button.addEventListener("click", () => {
      const hotelName = button.dataset.hotelName;
      const sectionKey = button.dataset.hotelSection;
      renderHotelSectionPanel(hotelName, sectionKey);
    });
  });

  bookShell.querySelectorAll(".country-card").forEach((card) => {
    const openCard = () => {
      const countryKey = card.dataset.country;
      const hotelIndex = Number(card.dataset.hotelIndex || 0);
      openHotelDetail(countryKey, hotelIndex);
    };

    card.addEventListener("click", openCard);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openCard();
      }
    });
  });

  bookShell.querySelectorAll(".country-menu-nav").forEach((button) => {
    button.addEventListener("click", () => {
      const nextIndex = Number(button.dataset.target || currentIndex);
      currentIndex = nextIndex;
      renderPage();
    });
  });

  bookShell.querySelectorAll(".hotel-detail-back").forEach((button) => {
    button.addEventListener("click", () => {
      activeHotelDetail = null;
      currentIndex = returnPageIndex ?? 0;
      returnPageIndex = null;
      renderPage();
    });
  });

  bookShell.querySelectorAll(".hotel-detail-nav").forEach((button) => {
    const direction = Number(button.dataset.hotelDirection || 0);
    const targetIndex = Number(button.dataset.hotelIndex ?? 0);
    button.addEventListener("click", () => {
      const detail = getActiveHotelDetail();
      if (!detail) return;
      activeHotelDetail = {
        ...detail,
        hotelIndex: targetIndex,
        galleryIndex: 0,
        activeTab: detail.activeTab || "habitaciones"
      };
      renderPage();
    });
    if (direction !== 0 && button.getAttribute("aria-label")) {
      button.setAttribute("tabindex", "0");
    }
  });

  bookShell.querySelectorAll("[data-hotel-tab]").forEach((tab) => {
    tab.addEventListener("click", () => {
      const detail = getActiveHotelDetail();
      if (!detail) return;
      detail.activeTab = tab.dataset.hotelTab;
      detail.galleryIndex = 0;
      activeHotelDetail = { ...detail };
      renderPage();
    });
    tab.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      const tabs = Array.from(bookShell.querySelectorAll("[data-hotel-tab]"));
      const currentIndexPosition = tabs.indexOf(tab);
      const nextIndex = event.key === "ArrowRight"
        ? (currentIndexPosition + 1) % tabs.length
        : (currentIndexPosition - 1 + tabs.length) % tabs.length;
      tabs[nextIndex]?.focus();
      tabs[nextIndex]?.click();
    });
  });

  bookShell.querySelectorAll("[data-gallery-index]").forEach((thumb) => {
    thumb.addEventListener("click", () => {
      const detail = getActiveHotelDetail();
      if (!detail) return;
      activeHotelDetail = { ...detail, galleryIndex: Number(thumb.dataset.galleryIndex || 0) };
      renderPage();
    });
  });

  bookShell.querySelectorAll("[data-gallery-nav]").forEach((button) => {
    button.addEventListener("click", () => {
      const detail = getActiveHotelDetail();
      if (!detail) return;
      const country = hotelCountryMenus[detail.countryKey];
      const hotel = country?.hotels?.[detail.hotelIndex];
      const activeTab = hotel?.tabs?.[detail.activeTab || "habitaciones"] || hotel?.tabs?.habitaciones;
      const total = (activeTab?.images || [hotel.image]).length || 1;
      const currentIndexPosition = detail.galleryIndex || 0;
      const nextPosition = (currentIndexPosition + Number(button.dataset.galleryNav || 0) + total) % total;
      activeHotelDetail = { ...detail, galleryIndex: nextPosition };
      renderPage();
    });
  });

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

      const streetLayer =
        L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            maxZoom: 19,
            attribution:
              "© OpenStreetMap contributors"
          }
        );

      streetLayer.addTo(
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

      const streetLayer =
        L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            maxZoom: 19,
            attribution:
              "© OpenStreetMap contributors"
          }
        );

      streetLayer.addTo(
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
  if (activeHotelDetail) return;
  activeRestaurantMenuIndex = null;

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
    if (activeRestaurantMenuIndex !== null) {
      if (event.key === "Escape") {
        activeRestaurantMenuIndex = null;
        renderPage();
      }
      return;
    }

    if (activeHotelDetail) {
      if (event.key === "Escape") {
        activeHotelDetail = null;
        currentIndex = returnPageIndex ?? 0;
        returnPageIndex = null;
        renderPage();
      }
      return;
    }

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
let startY = 0;
let swipeStartedOnMap = false;

magazineStage.addEventListener(
  "touchstart",
  (e) => {

    const touch =
      e.touches[0];

    startX =
      touch.clientX;

    startY =
      touch.clientY;

    swipeStartedOnMap =
      !!e.target.closest(
        ".leaflet-container, #hotelMapFrame, #generalMapFrame"
      );
  }
);

magazineStage.addEventListener(
  "touchend",
  (e) => {

    // Si el gesto comenzó dentro de un mapa,
    // NO cambiar de página.
    if (swipeStartedOnMap) {
      swipeStartedOnMap = false;
      return;
    }

    const touch =
      e.changedTouches[0];

    const endX =
      touch.clientX;

    const endY =
      touch.clientY;

    const distanceX =
      startX - endX;

    const distanceY =
      startY - endY;

    // Solo cambiar de página si el movimiento
    // es principalmente horizontal.
    if (
      Math.abs(distanceX) > 60 &&
      Math.abs(distanceX) > Math.abs(distanceY)
    ) {
      if (distanceX > 0) {
        movePage(1);
      } else {
        movePage(-1);
      }
    }

    swipeStartedOnMap = false;
  }
);


/* =========================================================
   INICIO
   ========================================================= */

requestCurrentLocation();
if (typeof window.RevistaDigital.routes?.restoreCurrentRoute === "function") {
  window.RevistaDigital.routes.restoreCurrentRoute();
} else {
  renderPage();
}
