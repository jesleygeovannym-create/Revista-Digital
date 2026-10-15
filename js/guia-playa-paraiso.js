// Guía interactiva del complejo Iberostar Playa Paraíso
// Catálogo verificado a partir del plano oficial + páginas oficiales
(function () {
  "use strict";
  window.RevistaDigital = window.RevistaDigital || {};
  window.RevistaDigital.guiapa = window.RevistaDigital.guiapa || {};

  const CATEGORIES = {
    hotel: { icon: "building", color: "#0057b8" },
    club: { icon: "star", color: "#0057b8" },
    restaurante: { icon: "utensils", color: "#d4af37" },
    bar: { icon: "cocktail", color: "#5f9ea0" },
    piscina: { icon: "swimming", color: "#1e90ff" },
    spa: { icon: "spa", color: "#8a2be2" },
    golf: { icon: "golf-ball", color: "#2e8b57" },
    playa: { icon: "umbrella-beach", color: "#f0e68c" },
    comer: { icon: "shopping-bag", color: "#cd853f" },
    deportes: { icon: "dumbbell", color: "#708090" },
    entretenimiento: { icon: "music", color: "#ff69b4" },
    servicio: { icon: "info", color: "#808080" },
    wellness: { icon: "spa", color: "#8a2be2" },
    kids: { icon: "child", color: "#ffb6c1" },
    conv: { icon: "building", color: "#a9a9a9" },
    discoteca: { icon: "music", color: "#ff1493" }
  };

  // Catálogo base alineado con lo verificado (se expandirá con coordenadas OSM)
  const POIS = [
    // Hoteles (reutilizarán hotelCoordinates existentes; marcados como verified si coords conocidas)
    {
      id: "del-mar",
      name: "Iberostar Waves Paraíso del Mar",
      category: "hotel",
      hotelId: "Iberostar Paraíso del Mar",
      lat: 20.7612389,
      lng: -86.9640931,
      description: "Hotel familiar",
      source: "official",
      verified: true
    },
    {
      id: "beach",
      name: "Iberostar Waves Paraíso Beach",
      category: "hotel",
      hotelId: "Iberostar Paraíso Beach",
      lat: 20.7584,
      lng: -86.9585,
      description: "Hotel familiar",
      source: "official",
      verified: true
    },
    {
      id: "lindo",
      name: "Iberostar Selection Paraíso Lindo",
      category: "hotel",
      hotelId: "Iberostar Paraíso Lindo",
      lat: 20.7596096,
      lng: -86.9639649,
      description: "Hotel Selection",
      source: "official",
      verified: true
    },
    {
      id: "maya",
      name: "Iberostar Selection Paraíso Maya",
      category: "hotel",
      hotelId: "Iberostar Paraíso Maya",
      lat: 20.7578835,
      lng: -86.9648766,
      description: "Hotel Selection",
      source: "official",
      verified: true
    },
    {
      id: "joia",
      name: "JOIA Paraíso by Iberostar",
      category: "hotel",
      hotelId: "Iberostar Paraíso JOIA",
      lat: 20.7563073,
      lng: -86.9629786,
      description: "Solo adultos (5*)",
      source: "official",
      verified: true
    }
  ];

  POIS.push({"id":"golf","name":"Iberostar Playa Paraíso Golf Club","category":"golf","lat":20.75946,"lng":-86.96714,"description":"Campo 18 hoyos","source":"osm","verified":true},
    {"id":"convention","name":"Centro de Convenciones","category":"conv","lat":20.76143,"lng":-86.96538,"description":"Centro de convenciones del complejo","source":"osm","verified":true},
    {"id":"spa","name":"Spa Sensations","category":"spa","lat":20.76032,"lng":-86.96629,"description":"Spa del complejo","source":"osm","verified":true},
    {"id":"starcamp","name":"Star Camp","category":"kids","lat":20.76071,"lng":-86.96471,"description":"Star Camp","source":"osm","verified":true},
    {"id":"galaxy","name":"Discoteca Galaxy","category":"discoteca","lat":20.75955,"lng":-86.966,"description":"Discoteca del complejo (+18)","source":"osm","verified":true},
    // Coco Bar: verificado como parte del resort VECINO "Vidanta Riviera Maya"
    // (su coordenada queda DENTRO del polígono de Vidanta y FUERA del complejo
    // Iberostar Playa Paraíso). Se conserva el registro pero se excluye del
    // explorador y del mapa (external: true).
    {"id":"cocobar","name":"Coco Bar","category":"bar","lat":20.7631,"lng":-86.9618,"description":"Coco Bar","source":"plano","verified":false},
    {"id":"starcafe","name":"Star Café","category":"bar","lat":20.7585,"lng":-86.963,"description":"Star Café","source":"osm","verified":true});
  POIS.push({"id":"theclub","name":"THE CLUB","category":"club","description":"Club premium del complejo","source":"plano","verified":false},
    {"id":"playa-mar-caribe","name":"Mar Caribe","category":"playa","description":"Mar Caribe / Caribbean Sea","source":"plano","verified":false});
  POIS.push(
    {"id":"hashiru","name":"Hashiru","category":"restaurante","description":"Restaurante japonés","source":"plano","verified":false},
    {"id":"la-dorada","name":"La Dorada","category":"restaurante","description":"Restaurante mediterráneo","source":"plano","verified":false},
    {"id":"rodizio","name":"Rodizio","category":"restaurante","description":"Restaurante de especialidad brasileño","source":"plano","verified":false},
    {"id":"el-mercado","name":"El Mercado","category":"restaurante","description":"Restaurante buffet","source":"plano","verified":false},
    {"id":"la-plaza","name":"La Plaza","category":"restaurante","description":"Restaurante buffet","source":"plano","verified":false},
    {"id":"la-hacienda","name":"La Hacienda","category":"restaurante","description":"Restaurante mexicano","source":"plano","verified":false},
    {"id":"trattoria","name":"Trattoria","category":"restaurante","description":"Restaurante de especialidad","source":"plano","verified":false},
    {"id":"el-puerto","name":"El Puerto","category":"restaurante","description":"Restaurante de especialidad","source":"plano","verified":false},
    {"id":"beach-grill","name":"Beach Grill","category":"restaurante","description":"Grill de playa","source":"plano","verified":false},
    {"id":"burgers","name":"Burgers","category":"restaurante","description":"Hamburguesas","source":"plano","verified":false},
    {"id":"antojitos-tacos","name":"Antojitos / Tacos","category":"restaurante","description":"Antojitos / Tacos","source":"plano","verified":false},
    {"id":"crepes","name":"Crepes & Ice Cream","category":"restaurante","description":"Crepas y helados","source":"plano","verified":false},
    {"id":"el-museo","name":"El Museo","category":"restaurante","description":"Restaurante gourmet","source":"plano","verified":false},
    {"id":"jambalaya","name":"Jambalaya","category":"restaurante","description":"Restaurante cajún","source":"plano","verified":false},
    {"id":"la-pagoda","name":"La Pagoda","category":"restaurante","description":"Restaurante buffet","source":"plano","verified":false},
    {"id":"el-fogon-steak","name":"El Fogón (Steak House)","category":"restaurante","description":"Steak house","source":"plano","verified":false},
    {"id":"el-fogon-italiano","name":"El Fogón (Italiano)","category":"restaurante","description":"Restaurante italiano","source":"plano","verified":false},
    {"id":"coco-buffet","name":"Coco Buffet","category":"restaurante","description":"Snack buffet","source":"plano","verified":false},
    {"id":"el-rancho","name":"El Rancho","category":"restaurante","description":"Steak house","source":"plano","verified":false},
    {"id":"la-geisha","name":"La Geisha","category":"restaurante","description":"Restaurante japonés","source":"plano","verified":false},
    {"id":"letoile","name":"L'Etoile","category":"restaurante","description":"Restaurante gourmet","source":"plano","verified":false},
    {"id":"la-marina","name":"La Marina","category":"restaurante","description":"Restaurante mediterráneo / buffet","source":"plano","verified":false},
    {"id":"el-tapatio","name":"El Tapatío","category":"restaurante","description":"Restaurante mexicano / buffet","source":"plano","verified":false},
    {"id":"venecia","name":"Venecia","category":"restaurante","description":"Restaurante italiano","source":"plano","verified":false},
    {"id":"bellavista","name":"Bellavista","category":"restaurante","description":"Restaurante buffet","source":"plano","verified":false},
    {"id":"latelier","name":"L'Atelier","category":"restaurante","description":"Restaurante gourmet","source":"plano","verified":false},
    {"id":"tonis","name":"Toni's","category":"restaurante","description":"Restaurante surf & turf","source":"plano","verified":false},
    {"id":"haiku","name":"Haiku","category":"restaurante","description":"Restaurante japonés","source":"plano","verified":false},
    {"id":"la-brisa","name":"La Brisa","category":"restaurante","description":"Caribbean raw bar & grill","source":"plano","verified":false},
    {"id":"baby-kitchen","name":"Baby Kitchen","category":"servicio","description":"Cocina para bebés","source":"plano","verified":false});
  POIS.push(
    {"id":"sports-bar-corner","name":"Sports Bar Corner","category":"bar","description":"Sports bar","source":"plano","verified":false},
    {"id":"heladeria-el-puente","name":"Heladería El Puente","category":"bar","description":"Heladería","source":"plano","verified":false},
    {"id":"heladeria-el-mirador","name":"Heladería El Mirador","category":"bar","description":"Heladería","source":"plano","verified":false},
    {"id":"star-rock-cafe","name":"Star Rock Café","category":"bar","description":"Star Rock Café","source":"plano","verified":false},
    {"id":"pool-bar-las-olas","name":"Pool Bar Las Olas","category":"bar","description":"Bar de piscina","source":"plano","verified":false},
    {"id":"lobby-bar-kukulkan","name":"Lobby Bar Kukulkán","category":"bar","description":"Lobby bar","source":"plano","verified":false},
    {"id":"music-bar-rhapsody","name":"Music Bar Rhapsody","category":"bar","description":"Music bar","source":"plano","verified":false},
    {"id":"lobby-bar-el-mirador","name":"Lobby Bar El Mirador","category":"bar","description":"Lobby bar","source":"plano","verified":false},
    {"id":"aqua-bar-la-sirenita","name":"Aqua Bar La Sirenita","category":"bar","description":"Aqua bar","source":"plano","verified":false},
    {"id":"health-bar-spa","name":"Health Bar SPA","category":"bar","description":"Health bar","source":"plano","verified":false},
    {"id":"aqua-bar-la-perla","name":"Aqua Bar La Perla","category":"bar","description":"Aqua bar","source":"plano","verified":false},
    {"id":"bar-teatro","name":"Bar Teatro","category":"bar","description":"Bar de teatro","source":"plano","verified":false},
    {"id":"lobby-bar-la-fuente","name":"Lobby Bar La Fuente","category":"bar","description":"Lobby bar","source":"plano","verified":false},
    {"id":"aqua-bar-las-olas","name":"Aqua Bar Las Olas","category":"bar","description":"Aqua bar","source":"plano","verified":false},
    {"id":"lobby-bar-la-cula","name":"Lobby Bar La Cúpula","category":"bar","description":"Lobby bar","source":"plano","verified":false},
    {"id":"aqua-bar-las-rocas","name":"Aqua Bar Las Rocas","category":"bar","description":"Aqua bar","source":"plano","verified":false},
    {"id":"lobby-bar-acuario","name":"Lobby Bar Acuario","category":"bar","description":"Lobby bar","source":"plano","verified":false},
    {"id":"cigar-bar","name":"Cigar Bar","category":"bar","description":"Cigar bar","source":"plano","verified":false});
  POIS.push(
    {"id":"waterfall-jacuzzi","name":"Cascada y jacuzzi","category":"piscina","description":"Water fall & jacuzzi","source":"plano","verified":false},
    {"id":"quiet-pool","name":"Piscina tranquila","category":"piscina","description":"Quiet pool","source":"plano","verified":false},
    {"id":"activities-pool","name":"Piscina de actividades","category":"piscina","description":"Activities pool","source":"plano","verified":false},
    {"id":"lazy-river","name":"Río lento","category":"piscina","description":"Lazy river","source":"plano","verified":false},
    {"id":"sports-pool","name":"Piscina deportiva","category":"piscina","description":"Sports pool","source":"plano","verified":false},
    {"id":"wave-pool","name":"Piscina de olas","category":"piscina","description":"Wave pool","source":"plano","verified":false},
    {"id":"jacuzzi","name":"Jacuzzi","category":"piscina","description":"Jacuzzi","source":"plano","verified":false},
    {"id":"private-pool","name":"Piscina privada","category":"piscina","description":"Private pool","source":"plano","verified":false},
    {"id":"indoor-pool","name":"Piscina cubierta","category":"piscina","description":"Indoor pool","source":"plano","verified":false},
    {"id":"main-pool","name":"Piscina principal","category":"piscina","description":"Main pool","source":"plano","verified":false},
    {"id":"mini-water-playground","name":"Mini parque acuático","category":"piscina","description":"Mini water playground","source":"plano","verified":false},
    {"id":"massage-palapa","name":"Palapas de masajes","category":"spa","description":"Massage palapa","source":"plano","verified":false});
  POIS.push(
    {"id":"tennis","name":"Tenis","category":"deportes","description":"Tennis","source":"plano","verified":false},
    {"id":"shooting-area","name":"Campo de tiro","category":"deportes","description":"Shooting area","source":"plano","verified":false},
    {"id":"diving-center","name":"Centro de buceo","category":"deportes","description":"Diving center","source":"plano","verified":false},
    {"id":"golf-club-house","name":"Golf Club House","category":"golf","description":"Golf club house","source":"plano","verified":false},
    {"id":"teatro-music-hall","name":"Teatro Music Hall","category":"entretenimiento","description":"Teatro","source":"plano","verified":false},
    {"id":"teatro-coliseo","name":"Teatro Coliseo","category":"entretenimiento","description":"Teatro","source":"plano","verified":false},
    {"id":"games-room","name":"Sala de juegos","category":"entretenimiento","description":"Games room","source":"plano","verified":false},
    {"id":"casino","name":"Casino","category":"entretenimiento","description":"Casino","source":"plano","verified":false},
    {"id":"shopping-mall","name":"Centro comercial","category":"comer","description":"Shopping mall","source":"plano","verified":false},
    {"id":"starmarket","name":"Starmarket","category":"comer","description":"Starmarket","source":"plano","verified":false},
    {"id":"pool-shop","name":"Tienda de piscina","category":"comer","description":"Pool shop","source":"plano","verified":false},
    {"id":"meeting-room","name":"Sala de juntas","category":"servicio","description":"Meeting room","source":"plano","verified":false},
    {"id":"agencies-phones","name":"Agencias y teléfonos","category":"servicio","description":"Agencies & phones","source":"plano","verified":false},
    {"id":"billiards-library","name":"Internet, billar, biblioteca","category":"servicio","description":"Billiards, library","source":"plano","verified":false},
    {"id":"medical-center","name":"Centro médico","category":"servicio","description":"Medical center","source":"plano","verified":false},
    {"id":"drugstore","name":"Farmacia","category":"servicio","description":"Drugstore","source":"plano","verified":false},
    {"id":"preview-gallery","name":"Preview Gallery","category":"servicio","description":"Preview Gallery","source":"plano","verified":false},
    {"id":"head-concierge","name":"Head Concierge","category":"servicio","description":"Head Concierge","source":"plano","verified":false},
    {"id":"star-prestige-lounge","name":"Star Prestige Lounge","category":"servicio","description":"Star Prestige Lounge","source":"plano","verified":false},
    {"id":"star-prestige-beach-club","name":"Star Prestige Beach Club","category":"servicio","description":"Star Prestige Beach Club","source":"plano","verified":false},
    {"id":"guest-service","name":"Relaciones públicas","category":"servicio","description":"Guest service","source":"plano","verified":false},
    {"id":"courtesy-room","name":"Duchas de cortesía","category":"servicio","description":"Courtesy room","source":"plano","verified":false},
    {"id":"paraiso-express-stop","name":"Paraíso Express Stop","category":"servicio","description":"Paraíso Express Stop","source":"plano","verified":false},
    {"id":"wedding-chapel","name":"Capilla de bodas","category":"servicio","description":"Wedding chapel","source":"plano","verified":false},
    {"id":"village-villas","name":"Village / Villas","category":"servicio","description":"Village / Villas","source":"plano","verified":false},
    {"id":"star-friends-desk","name":"Star Friends Desk","category":"kids","description":"Star Friends Desk","source":"plano","verified":false});

  // Coordenadas confirmadas con OpenStreetMap. Cada fila es
  // [id, lat, lng, nombre del elemento OSM]. Solo se incluyen elementos que
  // caen DENTRO del polígono del complejo (OSM way 138147423) y FUERA del
  // resort vecino Vidanta (OSM way 289799188). La procedencia queda en
  // source:"osm".
  var OSM_COORDS = [
    ["hashiru", 20.7606093, -86.9637212, "El Hashiru"],
    ["la-dorada", 20.76156, -86.9631079, "La Dorada"],
    ["rodizio", 20.76112, -86.9634612, "El Rodizio"],
    ["el-mercado", 20.7612549, -86.9626755, "El Mercado"],
    ["la-plaza", 20.7608481, -86.9629956, "La Plaza"],
    ["la-hacienda", 20.7614866, -86.9629864, "La Hacienda"],
    ["trattoria", 20.7570558, -86.9598844, "Trattoria Olivetti"],
    ["el-puerto", 20.7578601, -86.9591398, "El Puerto"],
    ["el-museo", 20.7589083, -86.9636421, "El Museo"],
    ["jambalaya", 20.7589371, -86.9634247, "Jambalaya"],
    ["la-pagoda", 20.7587578, -86.9632596, "Pagoda"],
    ["el-rancho", 20.7580548, -86.964155, "El Rancho"],
    ["la-geisha", 20.7572267, -86.9646975, "La Geisha"],
    ["letoile", 20.7570704, -86.9644942, "L'Etoile"],
    ["la-marina", 20.7578746, -86.9638876, "La Marina"],
    ["el-tapatio", 20.7567139, -86.960329, "El Tapatío"],
    ["venecia", 20.755841, -86.9626532, "Venecia"],
    ["bellavista", 20.7549173, -86.9612041, "Bella Vista"],
    ["tonis", 20.7549562, -86.9611689, "Tony’s"],
    ["haiku", 20.755212, -86.9610284, "Haiku"],
    ["la-brisa", 20.7546463, -86.9597269, "La Brisa"],
    ["burgers", 20.7598217, -86.9663036, "Star Hamburgers"],
    ["antojitos-tacos", 20.7604457, -86.9658435, "Tacos"],
    ["crepes", 20.7599822, -86.965172, "Crepes"],
    ["aqua-bar-la-perla", 20.7595721, -86.9600368, "La Perla"],
    ["aqua-bar-las-rocas", 20.7571518, -86.9604151, "Las Rocas"],
    ["lobby-bar-la-fuente", 20.7609293, -86.9639926, "La Fuente"],
    ["lobby-bar-la-cula", 20.762207, -86.9629327, "La Cupula Lobby Bar"],
    ["cigar-bar", 20.7593191, -86.9656938, "Vitolas"],
    ["sports-pool", 20.7580558, -86.9618529, "Sports Pool"],
    ["wave-pool", 20.7578053, -86.9615154, "Wave Pool"],
    ["lazy-river", 20.7582757, -86.9622815, "Lazy River"],
    ["mini-water-playground", 20.758176, -86.9631163, "Kids Waterpark"],
    ["wedding-chapel", 20.7605645, -86.9618901, "Wedding Chapel"],
    ["starmarket", 20.7574499, -86.9613521, "Star Market"],
    ["games-room", 20.759771, -86.9662607, "Video Games Room"],
    ["golf-club-house", 20.7586073, -86.9658668, "Golf Clubhouse"],
    ["diving-center", 20.7588638, -86.9575332, "Dressel Divers"]
  ];
  OSM_COORDS.forEach(function (row) {
    for (var i = 0; i < POIS.length; i += 1) {
      if (POIS[i].id === row[0]) {
        POIS[i].lat = row[1];
        POIS[i].lng = row[2];
        POIS[i].verified = true;
        POIS[i].source = "osm";
        POIS[i].osmFeature = row[3];
        break;
      }
    }
  });

  // "Mar Caribe" no es una instalación: es un área geográfica (el mar). Se
  // representa como ETIQUETA de área, no como POI con ruta. El ancla es el
  // punto medio del borde marítimo (este) del polígono del complejo, no una
  // ubicación inventada.
  (function markCaribbeanArea() {
    for (var i = 0; i < POIS.length; i += 1) {
      if (POIS[i].id === "playa-mar-caribe") {
        POIS[i].kind = "area";
        POIS[i].lat = 20.7585536;
        POIS[i].lng = -86.9574892;
        POIS[i].verified = true;
        POIS[i].source = "plano";
        break;
      }
    }
  })();

  window.RevistaDigital.guiapa.POIS = POIS;
  window.RevistaDigital.guiapa.CATEGORIES = CATEGORIES;
})();

// Minimal helpers for portal integration
(function () {
  var gp = window.RevistaDigital.guiapa || {};
  gp.createDivIcon = function (color) {
    var size = 30;
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="' + color + '" stroke="#fff" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="#fff"/></svg>';
    return (window.L && window.L.divIcon) ? window.L.divIcon({ html: '<div style="background-image:url(data:image/svg+xml;base64,' + btoa(svg) + ');width:' + size + 'px;height:' + size + 'px;background-size:contain;"></div>', className: 'gp-divicon', iconSize: [size, size], iconAnchor: [size/2, size/2], popupAnchor: [0, -size/2] }) : null;
  };
  gp.addPoiLayer = function (map, filterHotelId, options) {
    if (!map || !window.L) return null;
    var L = window.L;
    // Agrupación de marcadores (Leaflet.markercluster) cuando el plugin está
    // disponible: evita amontonar los POIs al abrir el complejo. Al acercar el
    // zoom los puntos se separan y siguen siendo seleccionables (popup/ruta).
    var clustered = typeof L.markerClusterGroup === "function";
    var clusterOptions = {
      maxClusterRadius: 55,
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      zoomToBoundsOnClick: true,
      // A partir del zoom de selección los puntos se muestran sueltos para
      // poder abrir su popup y calcular la ruta individualmente.
      disableClusteringAtZoom: 16,
      removeOutsideVisibleBounds: true
    };
    if (options && typeof options.disableClusteringAtZoom === "number") {
      clusterOptions.disableClusteringAtZoom = options.disableClusteringAtZoom;
    }
    var layer = clustered
      ? L.markerClusterGroup(clusterOptions)
      : (L.featureGroup ? L.featureGroup() : L.layerGroup());
    // Las etiquetas de área (p. ej. "Mar Caribe") no se agrupan: deben verse
    // siempre como rótulo del mapa.
    var labels = L.featureGroup ? L.featureGroup() : L.layerGroup();
    (gp.POIS || []).forEach(function (p) {
      if (p.category === "hotel") return;
      if (p.external === true) return;
      if (filterHotelId && p.hotelId && p.hotelId !== filterHotelId) return;
      if (p.lat == null || p.lng == null) return;
      if (p.kind === "area") {
        var labelHtml = '<span style="display:inline-block;transform:translate(-50%,-50%);white-space:nowrap;font-size:11px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#0b3d66;background:rgba(255,255,255,.72);border:1px solid rgba(11,61,102,.35);border-radius:999px;padding:2px 10px;">' + (p.name || "") + "</span>";
        var areaIcon = window.L.divIcon ? window.L.divIcon({ className: "gp-area-label", html: labelHtml, iconSize: [0, 0], iconAnchor: [0, 0] }) : null;
        var areaMarker = window.L.marker([p.lat, p.lng], areaIcon ? { icon: areaIcon } : {});
        areaMarker.bindPopup("<strong>" + (p.name || "") + "</strong><br><small>" + (p.description || "") + "</small>");
        gp.registerMarker(p.id, areaMarker);
        areaMarker.addTo(labels);
        return;
      }
      var cat = gp.CATEGORIES[p.category] || gp.CATEGORIES.servicio;
      var icon = gp.createDivIcon(cat.color);
      var m = window.L.marker([p.lat, p.lng], icon ? { icon: icon } : {});
      var name = p.name || "";
      var popup = '<strong>' + name + '</strong><br><small>' + (p.description||'') + '</small><br><button type="button" class="gp-dir" data-lat="' + p.lat + '" data-lng="' + p.lng + '" data-name="' + name.replace(/"/g,'&quot;') + '">Cómo llegar</button>';
      m.bindPopup(popup);
      gp.registerMarker(p.id, m);
      m.addTo(layer);
    });
    layer.addTo(map);
    try {
      if (labels.getLayers().length) labels.addTo(map);
    } catch (e) { /* ignore label layer errors */ }
    gp._poiLayer = layer;
    return layer;
  };
  window.RevistaDigital.guiapa = gp;
})();

// Explorador de POIs: leyenda, filtros, buscador, listado y selección en el mapa
(function () {
  "use strict";
  var gp = window.RevistaDigital.guiapa || (window.RevistaDigital.guiapa = {});

  gp._markers = gp._markers || {};

  // Mapa (instancia Leaflet) en el que el usuario centró un destino a mano.
  // La detección automática de ubicación no reencuadra ese mapa.
  gp._userFocusedMap = gp._userFocusedMap || null;

  gp.registerMarker = function (id, marker) {
    if (id && marker) gp._markers[id] = marker;
  };

  gp.bindMap = function (map) {
    if (map) gp._map = map;
  };

  gp.poiForHotel = function (hotelName) {
    var pois = gp.POIS || [];
    for (var i = 0; i < pois.length; i += 1) {
      var poi = pois[i];
      if (poi.category === "hotel" && (poi.hotelId === hotelName || poi.name === hotelName)) return poi;
    }
    return null;
  };

  var CATEGORY_LABELS = {
    hotel: "Hoteles",
    club: "THE CLUB",
    restaurante: "Restaurantes",
    bar: "Bares",
    piscina: "Piscinas",
    spa: "Spa",
    golf: "Golf",
    playa: "Playa",
    comer: "Compras",
    deportes: "Deportes",
    entretenimiento: "Entretenimiento",
    servicio: "Servicios",
    wellness: "Wellness",
    kids: "Niños",
    conv: "Convenciones",
    discoteca: "Discoteca"
  };

  function normalize(value) {
    return String(value == null ? "" : value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function categoryLabel(cat) {
    return CATEGORY_LABELS[cat] || cat || "Lugar";
  }

  function categoryColor(cat) {
    var entry = (gp.CATEGORIES || {})[cat];
    return (entry && entry.color) || "#808080";
  }

  function findPoi(id) {
    var pois = gp.POIS || [];
    for (var i = 0; i < pois.length; i += 1) {
      if (pois[i].id === id) return pois[i];
    }
    return null;
  }

  function canMap(poi) {
    return !!(poi && poi.verified === true && poi.lat != null && poi.lng != null);
  }

  function markerFor(poi) {
    if (!poi || !gp._markers) return null;
    var keys = [poi.id, poi.hotelId, poi.name];
    for (var i = 0; i < keys.length; i += 1) {
      if (keys[i] && gp._markers[keys[i]]) return gp._markers[keys[i]];
    }
    return null;
  }

  function includedPois() {
    return (gp.POIS || []).filter(function (p) { return p && p.external !== true; });
  }

  function presentCategories() {
    var seen = {};
    includedPois().forEach(function (p) { seen[p.category] = (seen[p.category] || 0) + 1; });
    var ordered = Object.keys(gp.CATEGORIES || {});
    var result = [];
    ordered.forEach(function (cat) { if (seen[cat]) result.push({ key: cat, count: seen[cat] }); });
    Object.keys(seen).forEach(function (cat) {
      if (ordered.indexOf(cat) === -1) result.push({ key: cat, count: seen[cat] });
    });
    return result;
  }

  function queryPois(options) {
    options = options || {};
    var filter = options.filter || "all";
    var query = normalize(options.query || "");
    return includedPois().filter(function (p) {
      if (filter !== "all" && p.category !== filter) return false;
      if (query) {
        var haystack = normalize([p.name, p.description, p.hotelId, categoryLabel(p.category)].join(" "));
        if (haystack.indexOf(query) === -1) return false;
      }
      return true;
    });
  }

  var state = { mount: null, filter: "all", query: "", selectedId: null };

  function categoryChips() {
    var chips = ['<button type="button" class="guide-chip is-active" data-guide-filter="all" aria-pressed="true">Todos <span>' + includedPois().length + "</span></button>"];
    presentCategories().forEach(function (entry) {
      chips.push('<button type="button" class="guide-chip" data-guide-filter="' + escapeHtml(entry.key) + '" aria-pressed="false"><span class="guide-chip-dot" style="background:' + categoryColor(entry.key) + '"></span>' + escapeHtml(categoryLabel(entry.key)) + " <span>" + entry.count + "</span></button>");
    });
    return chips.join("");
  }

  function legendMarkup() {
    var items = presentCategories().map(function (entry) {
      return '<li><span class="guide-dot" style="background:' + categoryColor(entry.key) + '"></span>' + escapeHtml(categoryLabel(entry.key)) + " <em>" + entry.count + "</em></li>";
    }).join("");
    return '<h3 class="guide-legend-title">Leyenda de categorías</h3><ul class="guide-legend-list">' + items + '</ul><p class="guide-legend-note"><span class="guide-dot guide-dot--pending"></span>Pendiente de verificación (sin ubicación confirmada)</p>';
  }

  function renderLegend() {
    if (!state.mount) return;
    var legend = state.mount.querySelector("#guideLegend");
    if (legend) legend.innerHTML = legendMarkup();
  }

  function renderList() {
    if (!state.mount) return;
    var list = state.mount.querySelector("#guideList");
    var count = state.mount.querySelector("#guideCount");
    if (!list) return;
    var pois = queryPois(state);
    if (count) count.textContent = pois.length + " de " + includedPois().length + " lugares";
    if (!pois.length) {
      list.innerHTML = '<li class="guide-empty">No hay lugares que coincidan con tu búsqueda.</li>';
      return;
    }
    list.innerHTML = pois.map(function (p) {
      var verified = p.verified === true;
      var active = p.id === state.selectedId ? " is-active" : "";
      var status = verified
        ? '<span class="guide-badge guide-badge--ok">Verificado</span>'
        : '<span class="guide-badge guide-badge--pending">Pendiente</span>';
      var meta = escapeHtml(categoryLabel(p.category)) + (p.hotelId ? " · " + escapeHtml(p.hotelId) : "");
      return '<li class="guide-item' + (verified ? "" : " is-pending") + active + '" data-id="' + escapeHtml(p.id) + '" tabindex="0" role="button">' +
        '<span class="guide-dot" style="background:' + categoryColor(p.category) + '"></span>' +
        '<span class="guide-item-body"><span class="guide-item-name">' + escapeHtml(p.name) + '</span><span class="guide-item-meta">' + meta + "</span></span>" +
        status + "</li>";
    }).join("");
  }

  gp._route = { status: "idle", targetId: null, targetName: null, info: null, line: null, abort: null };

  function removeRouteLine() {
    if (gp._route.line) {
      try { gp._route.line.remove(); } catch (e) { /* ignore */ }
      gp._route.line = null;
    }
    var shared = window.RevistaDigital && window.RevistaDigital.state;
    if (shared && shared.routeLine) {
      try { shared.routeLine.remove(); } catch (e) { /* ignore */ }
      shared.routeLine = null;
    }
  }

  function cancelRoute(silent) {
    if (gp._route.abort) {
      try { gp._route.abort.abort(); } catch (e) { /* ignore */ }
      gp._route.abort = null;
    }
    removeRouteLine();
    gp._route.status = "idle";
    gp._route.targetId = null;
    gp._route.targetName = null;
    gp._route.info = null;
    if (!silent) renderRouteStatus();
  }

  function formatRouteInfo(result) {
    var mode = result.profile === "pedestrian" ? "a pie" : (result.profile === "driving" ? "en coche" : (result.profile || "ruta"));
    var provider = result.provider === "valhalla" ? "Valhalla" : (result.provider === "osrm" ? "OSRM" : "");
    var parts = [mode + (provider ? " (" + provider + ")" : "")];
    if (result.distance) parts.push((result.distance / 1000).toFixed(1) + " km");
    if (result.duration) parts.push(Math.round(result.duration / 60) + " min");
    return parts.join(" · ");
  }

  function drawRoute(origin, poi, result) {
    var shared = window.RevistaDigital && window.RevistaDigital.state;
    var map = gp._map || (shared && shared.activeMap);
    if (!map || !window.L) return;
    removeRouteLine();
    var coordinates = [[origin.latitude, origin.longitude]].concat(result.coordinates, [[poi.lat, poi.lng]]);
    gp._route.line = window.L.polyline(coordinates, { color: "#0057b8", weight: 6, opacity: 0.95 }).addTo(map);
    if (shared) shared.routeLine = gp._route.line;
    try {
      // Prioriza el destino con un zoom cercano en lugar de alejar el mapa para
      // encuadrar toda la ruta; el usuario puede alejar con los controles.
      map.stop();
      var focusZoom = Math.max(map.getZoom() || 16, 16);
      map.setView([poi.lat, poi.lng], focusZoom, { animate: false });
      gp._userFocusedMap = map;
    } catch (e) { /* ignore */ }
  }

  function renderRouteStatus() {
    if (!state.mount) return;
    var box = state.mount.querySelector("#guideRouteBox");
    if (!box) return;
    var route = gp._route;
    if (!route || route.status === "idle") {
      box.innerHTML = "";
      return;
    }
    var name = escapeHtml(route.targetName || "el destino");
    var html = "";
    if (route.status === "locating") {
      html = '<p class="guide-route-status is-loading">' + escapeHtml(route.info || "Obteniendo tu ubicación…") + "</p>";
    } else if (route.status === "calculating") {
      html = '<p class="guide-route-status is-loading">Calculando ruta a ' + name + "…</p>";
    } else if (route.status === "ready") {
      html = '<p class="guide-route-status is-ready">Ruta ' + escapeHtml(route.info || "") + " hasta " + name + ".</p>";
    } else {
      html = '<p class="guide-route-status is-error">' + escapeHtml(route.info || "No se pudo calcular la ruta.") + "</p>";
    }
    html += '<button type="button" class="guide-route-cancel">Cancelar ruta</button>';
    box.innerHTML = html;
  }

  function setRouteStatus(status, id, name, info) {
    gp._route.status = status;
    gp._route.targetId = id;
    gp._route.targetName = name;
    gp._route.info = info || null;
    renderRouteStatus();
  }

  function routeToPoi(id) {
    var poi = findPoi(id);
    if (!poi) return;
    if (poi.kind === "area") {
      setRouteStatus("error", id, poi.name, "Es un área geográfica (mar); no se calcula una ruta.");
      return;
    }
    if (!canMap(poi)) {
      setRouteStatus("error", id, poi.name, "Este lugar aún no tiene coordenadas verificadas.");
      return;
    }
    var shared = window.RevistaDigital && window.RevistaDigital.state;
    var position = shared && shared.currentPosition;
    cancelRoute(true);
    gp._route.targetId = id;
    gp._route.targetName = poi.name;
    if (!position || position.latitude == null || position.longitude == null) {
      setRouteStatus("locating", id, poi.name, "Necesitamos tu ubicación para calcular la ruta.");
      try {
        if (typeof window.requestCurrentLocation === "function") window.requestCurrentLocation();
      } catch (e) { /* ignore */ }
      return;
    }
    var engine = window.RevistaDigital && window.RevistaDigital.mapas;
    if (!engine || typeof engine.computeRoute !== "function") {
      setRouteStatus("error", id, poi.name, "El servicio de rutas no está disponible.");
      return;
    }
    var controller = typeof AbortController === "function" ? new AbortController() : null;
    gp._route.abort = controller;
    setRouteStatus("calculating", id, poi.name, null);
    var preferRoute = typeof engine.isComplexDestination === "function" && engine.isComplexDestination([poi.lat, poi.lng])
      ? "pedestrian"
      : "driving";
    engine.computeRoute({
      origin: [position.latitude, position.longitude],
      destination: [poi.lat, poi.lng],
      prefer: preferRoute,
      signal: controller ? controller.signal : undefined
    }).then(function (result) {
      if (gp._route.targetId !== id) return;
      drawRoute(position, poi, result);
      setRouteStatus("ready", id, poi.name, formatRouteInfo(result));
    }).catch(function (error) {
      if (error && error.name === "AbortError") return;
      if (gp._route.targetId !== id) return;
      setRouteStatus("error", id, poi.name, "No se encontró una ruta disponible para ese destino.");
    });
  }

  gp.routeToPoi = routeToPoi;
  gp.cancelRoute = function () { cancelRoute(false); };

  function renderDetail(poi) {
    if (!state.mount) return;
    var detail = state.mount.querySelector("#guideDetail");
    if (!detail) return;
    if (!poi) {
      detail.innerHTML = '<p class="guide-detail-empty">Selecciona un lugar de la lista para ver su información.</p>';
      return;
    }
    var verified = poi.verified === true;
    var zone = poi.hotelId
      ? '<p class="guide-detail-row"><strong>Hotel</strong> ' + escapeHtml(poi.hotelId) + "</p>"
      : (poi.zone ? '<p class="guide-detail-row"><strong>Zona</strong> ' + escapeHtml(poi.zone) + "</p>" : "");
    var source = poi.source === "osm" ? "OpenStreetMap" : (poi.source === "official" ? "Oficial" : (poi.source === "plano" ? "Plano oficial" : (poi.source || "—")));
    var isArea = poi.kind === "area";
    if (isArea) source = "Plano oficial (área)";
    var actions;
    if (isArea) {
      actions = '<p class="guide-detail-desc">Se representa como <strong>área/etiqueta</strong> en el mapa: no es una instalación con ruta.</p>' +
        '<div class="guide-detail-actions"><button type="button" class="guide-focus" data-id="' + escapeHtml(poi.id) + '">Ver en el mapa</button></div>';
    } else if (verified) {
      actions = '<div class="guide-detail-actions">' +
        '<button type="button" class="guide-focus" data-id="' + escapeHtml(poi.id) + '">Ver en el mapa</button>' +
        '<button type="button" class="guide-route" data-id="' + escapeHtml(poi.id) + '">Cómo llegar</button>' +
        "</div>";
    } else {
      actions = '<p class="guide-pending-note">Ubicación pendiente de verificación: no se muestra en el mapa ni ofrece ruta.</p>';
    }
    detail.innerHTML = '<span class="guide-dot guide-dot--lg" style="background:' + categoryColor(poi.category) + '"></span>' +
      '<h3 class="guide-detail-title">' + escapeHtml(poi.name) + "</h3>" +
      '<p class="guide-detail-cat">' + escapeHtml(categoryLabel(poi.category)) + "</p>" +
      (poi.description ? '<p class="guide-detail-desc">' + escapeHtml(poi.description) + "</p>" : "") +
      zone +
      '<p class="guide-detail-row"><strong>Fuente</strong> ' + escapeHtml(source) + "</p>" +
      '<p class="guide-detail-row"><strong>Estado</strong> ' + (isArea ? "Área geográfica" : (verified ? "Verificado" : "Pendiente de verificación")) + "</p>" +
      actions +
      '<div class="guide-route-box" id="guideRouteBox" role="status" aria-live="polite"></div>';
    renderRouteStatus();
  }

  function selectPoi(id) {
    var poi = findPoi(id);
    if (!poi) return;
    state.selectedId = id;
    renderList();
    renderDetail(poi);
    if (!canMap(poi)) return;
    var map = gp._map;
    if (!map || typeof map.setView !== "function") return;
    var target = [poi.lat, poi.lng];
    // El zoom de selección debe alcanzar disableClusteringAtZoom para que el
    // punto quede suelto y su popup pueda abrirse individualmente.
    var disableAt = (gp._poiLayer && gp._poiLayer.options && typeof gp._poiLayer.options.disableClusteringAtZoom === "number")
      ? gp._poiLayer.options.disableClusteringAtZoom
      : 16;
    // Se usa exactamente el nivel en que se desagrupan los marcadores
    // (disableClusteringAtZoom), acotado al zoom máximo del mapa. Agrupar y
    // desagrupar de forma predecible evita que el punto quede dentro de un
    // grupo y su popup no pueda abrirse.
    var mapMaxZoom = (typeof map.getMaxZoom === "function") ? map.getMaxZoom() : disableAt;
    var targetZoom = Math.min(mapMaxZoom, Math.max(16, disableAt));
    var marker = markerFor(poi);
    try {
      map.stop();
      map.setView(target, targetZoom, { animate: false });
      gp._userFocusedMap = map;
      if (marker && typeof marker.openPopup === "function") marker.openPopup();
    } catch (e) { /* ignore map errors */ }
  }

  gp.renderExplorer = function (mount) {
    if (!mount) return null;
    state.mount = mount;
    state.filter = "all";
    state.query = "";
    state.selectedId = null;
    mount.innerHTML = '<div class="guide-explorer">' +
      '<div class="guide-explorer-head">' +
        '<div class="guide-explorer-title">' +
          '<p class="portal-kicker">GUÍA INTERACTIVA · THE CLUB</p>' +
          "<h2>Explora los lugares del complejo</h2>" +
          "<p>Busca por nombre o filtra por categoría. Selecciona un lugar verificado para verlo en el mapa.</p>" +
        "</div>" +
        '<label class="guide-search"><span aria-hidden="true">\uD83D\uDD0D</span>' +
          '<input id="guideSearchInput" type="search" placeholder="Buscar restaurante, bar, piscina…" aria-label="Buscar lugar por nombre" autocomplete="off" />' +
        "</label>" +
      "</div>" +
      '<div class="guide-filters" id="guideFilters" role="group" aria-label="Filtrar por categoría">' + categoryChips() + "</div>" +
      '<div class="guide-layout">' +
        '<div class="guide-panel guide-list-panel">' +
          '<div class="guide-list-head"><span id="guideCount"></span></div>' +
          '<ul class="guide-list" id="guideList"></ul>' +
        "</div>" +
        '<aside class="guide-panel guide-side">' +
          '<div class="guide-detail" id="guideDetail"></div>' +
          '<div class="guide-legend" id="guideLegend"></div>' +
        "</aside>" +
      "</div>" +
    "</div>";

    var input = mount.querySelector("#guideSearchInput");
    if (input) {
      input.addEventListener("input", function () {
        state.query = input.value;
        renderList();
      });
    }

    mount.addEventListener("click", function (event) {
      var chip = event.target.closest("[data-guide-filter]");
      if (chip) {
        state.filter = chip.getAttribute("data-guide-filter") || "all";
        mount.querySelectorAll("[data-guide-filter]").forEach(function (el) {
          var isActive = el === chip;
          el.classList.toggle("is-active", isActive);
          el.setAttribute("aria-pressed", isActive ? "true" : "false");
        });
        renderList();
        return;
      }
      var cancel = event.target.closest(".guide-route-cancel");
      if (cancel) {
        gp.cancelRoute();
        return;
      }
      var route = event.target.closest(".guide-route");
      if (route) {
        routeToPoi(route.getAttribute("data-id"));
        return;
      }
      var focus = event.target.closest(".guide-focus");
      if (focus) {
        selectPoi(focus.getAttribute("data-id"));
        return;
      }
      var item = event.target.closest(".guide-item");
      if (item) selectPoi(item.getAttribute("data-id"));
    });

    mount.addEventListener("keydown", function (event) {
      if (event.key !== "Enter" && event.key !== " ") return;
      var item = event.target.closest(".guide-item");
      if (item) {
        event.preventDefault();
        selectPoi(item.getAttribute("data-id"));
      }
    });

    renderLegend();
    renderList();
    renderDetail(null);
    return { selectPoi: selectPoi, queryPois: queryPois };
  };

  gp.selectPoi = selectPoi;
  gp.queryPois = queryPois;
  gp.canMapPoi = canMap;
})();
