/* =========================================================
   MAPAMUNDI ANIMADO · Iberostar Destinos
   Sección SPA "/mapa-hoteles" (Mapa general de hoteles). Muestra
   los destinos Iberostar sobre un mapa mundial con 8 animaciones y ciclo de vida
   explícito: mount() al entrar en la sección, unmount() al
   salir (cancela temporizadores, animaciones y elimina el
   mapa para no dejar instancias huérfanas).

   ANIMACIONES (registradas en MAPAMUNDI_ANIMATIONS):
     1 mapaMundiIn     entrada del marco (fade + escala)
     2 mapaMundiSweep  barrido de luz sobre el mapa
     3 mapaMundiRise   aparición escalonada de cabecera/leyenda
     4 mapaMundiPulse  pulso continuo de los destinos
     5 mapaMundiArc    arcos de conexión que se dibujan
     6 mapaMundiDrift  deriva lenta del mapa
     7 mapaMundiCount  contadores de totales
     8 mapaMundiOut    salida (fade + blur) al abandonar

   No sustituye al planisferio estático (mapa-mundi/index2.html),
   que sigue disponible desde el menú "Planisferio Interactivo".
   ========================================================= */

(function () {
  "use strict";

  window.RevistaDigital = window.RevistaDigital || {};

  var DESTINATIONS = [
    { n: "Palm Beach", c: "Aruba", lat: 12.58, lon: -70.05, joia: 1 },
    { n: "Praia do Forte", c: "Brasil", lat: -12.58, lon: -38.0, waves: 1, selection: 1 },
    { n: "Amazonas", c: "Brasil", lat: -3.1, lon: -60.02, joia: 1 },
    { n: "Puerto Plata", c: "Rep. Dominicana", lat: 19.79, lon: -70.69, waves: 1 },
    { n: "Bávaro · Punta Cana", c: "Rep. Dominicana", lat: 18.68, lon: -68.42, waves: 2, selection: 2, joia: 1 },
    { n: "Bayahíbe", c: "Rep. Dominicana", lat: 18.36, lon: -68.83, selection: 1 },
    { n: "Rose Hall · Montego Bay", c: "Jamaica", lat: 18.52, lon: -77.83, waves: 1, selection: 1, joia: 1 },
    { n: "Cancún", c: "México", lat: 21.13, lon: -86.75, selection: 3 },
    { n: "Cozumel", c: "México", lat: 20.42, lon: -86.92, waves: 1 },
    { n: "Riviera Maya · Playa Paraíso", c: "México", lat: 20.6, lon: -87.1, waves: 4, selection: 2, joia: 1 },
    { n: "Punta Mita", c: "México", lat: 20.77, lon: -105.52, selection: 1 },
    { n: "Miami Beach", c: "Estados Unidos", lat: 25.79, lon: -80.13, waves: 2 },
    { n: "Zanzíbar", c: "Tanzania", lat: -6.13, lon: 39.3, selection: 1 },
    { n: "Marrakech", c: "Marruecos", lat: 31.63, lon: -7.99, waves: 1 },
    { n: "Saïdia", c: "Marruecos", lat: 35.1, lon: -2.23, waves: 1 },
    { n: "Agadir", c: "Marruecos", lat: 30.42, lon: -9.6, waves: 1 },
    { n: "Hammamet", c: "Túnez", lat: 36.4, lon: 10.62, waves: 1 },
    { n: "Djerba", c: "Túnez", lat: 33.8, lon: 10.9, waves: 1, selection: 1 },
    { n: "Port El Kantaoui", c: "Túnez", lat: 35.89, lon: 10.6, selection: 2 },
    { n: "Monastir · Mahdia", c: "Túnez", lat: 35.63, lon: 10.95, selection: 2 },
    { n: "Creta", c: "Grecia", lat: 35.35, lon: 24.8, waves: 1, selection: 1 },
    { n: "Budva", c: "Montenegro", lat: 42.29, lon: 18.84, waves: 2 },
    { n: "Herceg Novi", c: "Montenegro", lat: 42.45, lon: 18.53, waves: 1 },
    { n: "Lagos · Algarve", c: "Portugal", lat: 37.1, lon: -8.67, selection: 1 },
    { n: "Lisboa", c: "Portugal", lat: 38.72, lon: -9.14, selection: 1 },
    { n: "Cádiz", c: "España · Andalucía", lat: 36.4, lon: -6.16, waves: 1, selection: 1 },
    { n: "Málaga · Marbella", c: "España · Andalucía", lat: 36.51, lon: -4.88, waves: 1, selection: 1 },
    { n: "Ibiza", c: "España · Baleares", lat: 38.98, lon: 1.53, selection: 1 },
    { n: "Mallorca", c: "España · Baleares", lat: 39.6, lon: 3.0, waves: 9, selection: 7 },
    { n: "Fuerteventura", c: "España · Canarias", lat: 28.36, lon: -14.05, waves: 2, selection: 1 },
    { n: "Lanzarote", c: "España · Canarias", lat: 28.92, lon: -13.66, selection: 1 },
    { n: "Tenerife", c: "España · Canarias", lat: 28.1, lon: -16.72, waves: 2, selection: 2, joia: 3 }
  ];

  var CATEGORIES = [
    { key: "waves", label: "Iberostar Waves", color: "#cf4a5f" },
    { key: "selection", label: "Iberostar Selection", color: "#2fa898" },
    { key: "joia", label: "JOIA · Grand Collection", color: "#1358a5" }
  ];

  var HUB = { name: "Madrid", lat: 40.4168, lon: -3.7038 };

  DESTINATIONS.forEach(function (d) {
    d.total = (d.waves || 0) + (d.selection || 0) + (d.joia || 0);
  });

  var TOTALS = {
    waves: DESTINATIONS.reduce(function (t, d) { return t + (d.waves || 0); }, 0),
    selection: DESTINATIONS.reduce(function (t, d) { return t + (d.selection || 0); }, 0),
    joia: DESTINATIONS.reduce(function (t, d) { return t + (d.joia || 0); }, 0)
  };
  TOTALS.all = TOTALS.waves + TOTALS.selection + TOTALS.joia;

  /* Las 8 animaciones, en orden, para poder verificarlas. */
  var MAPAMUNDI_ANIMATIONS = [
    { key: "mapaMundiIn", label: "Entrada del mapa (fade + escala)" },
    { key: "mapaMundiSweep", label: "Barrido de luz" },
    { key: "mapaMundiRise", label: "Aparición escalonada de cabecera y leyenda" },
    { key: "mapaMundiPulse", label: "Pulso de los destinos" },
    { key: "mapaMundiArc", label: "Arcos de conexión dibujados" },
    { key: "mapaMundiDrift", label: "Deriva lenta del encuadre" },
    { key: "mapaMundiCount", label: "Contadores de totales" },
    { key: "mapaMundiOut", label: "Salida (fade + blur)" }
  ];

  var mapamundi = window.RevistaDigital.mapamundi || {};
  mapamundi.ANIMATIONS = MAPAMUNDI_ANIMATIONS;
  mapamundi.DESTINATIONS = DESTINATIONS;
  mapamundi.TOTALS = TOTALS;

  var instance = null;

  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
    });
  }

  function categoryColor(destination) {
    if (destination.joia) return CATEGORIES[2].color;
    if (destination.selection) return CATEGORIES[1].color;
    return CATEGORIES[0].color;
  }

  function categoryNames(destination) {
    return CATEGORIES.filter(function (category) { return destination[category.key]; })
      .map(function (category) { return category.label; }).join(" · ");
  }

  function totalsMarkup() {
    var items = [
      { label: "Waves", value: TOTALS.waves, color: CATEGORIES[0].color },
      { label: "Selection", value: TOTALS.selection, color: CATEGORIES[1].color },
      { label: "JOIA & Grand", value: TOTALS.joia, color: CATEGORIES[2].color },
      { label: "Hoteles", value: TOTALS.all, color: "" }
    ];
    return '<div class="mapamundi-totals">' + items.map(function (item) {
      return '<div class="mapamundi-tot"><b data-count-to="' + item.value + '"' +
        (item.color ? ' style="color:' + item.color + '"' : "") + ">0</b><span>" + escapeHtml(item.label) + "</span></div>";
    }).join("") + "</div>";
  }

  function legendMarkup() {
    return '<div class="mapamundi-legend">' + CATEGORIES.map(function (category) {
      return '<span><i style="background:' + category.color + '"></i>' + escapeHtml(category.label) + "</span>";
    }).join("") + "</div>";
  }

  function buildMarkup() {
    return '<div class="mapamundi-page" data-anim="in">' +
      '<div class="mapamundi-head">' +
        "<div>" +
          '<p class="mapamundi-kicker">IBEROSTAR · DESTINOS</p>' +
          '<h1 class="mapamundi-title">Mapamundi</h1>' +
          '<p class="mapamundi-note">' + DESTINATIONS.length + " destinos · " + TOTALS.all + " hoteles. Cada punto es un destino Iberostar.</p>" +
        "</div>" +
        totalsMarkup() +
      "</div>" +
      legendMarkup() +
      '<div class="mapamundi-frame">' +
        '<div class="mapamundi-map" id="mapamundiMap" role="application" aria-label="Mapamundi de destinos Iberostar"></div>' +
        '<div class="mapamundi-actions">' +
          '<a class="mapamundi-btn" href="mapa-mundi/index2.html">Planisferio Interactivo (D3) ↗</a>' +
          '<button type="button" class="mapamundi-btn" data-mapamundi-replay>Repetir animaciones</button>' +
        "</div>" +
      "</div>" +
      '<p class="mapamundi-note">Las animaciones se detienen al salir de la sección. Respeta la preferencia del sistema de movimiento reducido.</p>' +
    "</div>";
  }

  /* ---------- animaciones ---------- */

  function runCountUp(root) {
    var nodes = root.querySelectorAll("[data-count-to]");
    if (!nodes.length) return;
    /* Evita duplicar la animación si se repite o se re-entra en la sección. */
    if (instance && instance.timers.countRaf) {
      window.cancelAnimationFrame(instance.timers.countRaf);
      instance.timers.countRaf = null;
    }
    if (prefersReducedMotion()) {
      nodes.forEach(function (node) { node.textContent = node.getAttribute("data-count-to"); });
      return;
    }
    var owner = instance;
    if (!owner) return;
    var duration = 900;
    var start = performance.now();
    function frame(now) {
      if (!instance || instance !== owner) return;
      var progress = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - progress, 3);
      nodes.forEach(function (node) {
        var target = Number(node.getAttribute("data-count-to")) || 0;
        node.textContent = String(Math.round(target * eased));
      });
      if (progress < 1) {
        owner.timers.countRaf = window.requestAnimationFrame(frame);
      }
    }
    owner.timers.countRaf = window.requestAnimationFrame(frame);
  }

  function startDrift() {
    if (prefersReducedMotion() || !instance || !instance.map) return;
    /* Un solo bucle de deriva: si ya había uno, se cancela antes de reanudar. */
    stopDrift();
    var owner = instance;
    owner.userInteracted = false;
    var map = owner.map;
    var SPEED = 7; /* píxeles por segundo */
    var accumulator = 0;
    var last = performance.now();
    function step(now) {
      if (!instance || instance !== owner || !owner.map || owner.userInteracted) return;
      var delta = Math.min(64, now - last);
      last = now;
      accumulator += (SPEED * delta) / 1000;
      var shift = Math.round(accumulator);
      if (shift !== 0) {
        accumulator -= shift;
        try {
          map.panBy([shift, 0], { animate: false, noMoveStart: true });
        } catch (error) { /* el mapa pudo cerrarse */ }
      }
      owner.timers.driftRaf = window.requestAnimationFrame(step);
    }
    owner.timers.driftRaf = window.requestAnimationFrame(step);
  }

  function stopDrift(target) {
    var owner = target || instance;
    if (!owner || !owner.timers) return;
    if (owner.timers.driftRaf) {
      window.cancelAnimationFrame(owner.timers.driftRaf);
      owner.timers.driftRaf = null;
    }
    if (owner.timers.drift) {
      window.clearInterval(owner.timers.drift);
      owner.timers.drift = null;
    }
  }

  function buildMap(root, owner) {
    var engine = window.RevistaDigital.mapas;
    if (!engine || typeof engine.loadLeaflet !== "function") {
      root.querySelector("#mapamundiMap").innerHTML =
        '<p class="mapamundi-note" style="padding:20px">No se pudo cargar el mapa mundial.</p>';
      return null;
    }

    return engine.loadLeaflet().then(function (L) {
      var element = root.querySelector("#mapamundiMap");
      if (!element || instance !== owner) return null;

      /* Deriva continua: la animación CSS "mapaMundiDrift" original dura ~32 s
         (2 iteraciones) y después detenía el movimiento. Se reutiliza el mismo
         keyframe existente en bucle para mantener un vaivén sutil y sin saltos.
         El modo de movimiento reducido (CSS !important) la sigue desactivando. */
      if (!prefersReducedMotion()) {
        element.style.animation = "mapaMundiDrift 16s ease-in-out infinite";
      }

      var map = L.map(element, {
        zoomControl: true,
        worldCopyJump: true,
        minZoom: 2,
        maxZoom: 6,
        scrollWheelZoom: true,
        zoomAnimation: !prefersReducedMotion()
      }).setView([24, -30], prefersReducedMotion() ? 2 : 3);

      var state = window.RevistaDigital.state;
      if (state) {
        state.activeMap = map;
        state.userMarker = null;
        state.routeLine = null;
      }

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 6,
        attribution: "© OpenStreetMap contributors"
      }).addTo(map);

      map.on("dragstart zoomstart", function () {
        if (instance !== owner) return;
        instance.userInteracted = true;
        stopDrift(owner);
      });

      /* Con un popup abierto, se detiene la deriva para que la información
         permanezca fija y visible; al cerrarlo se reanuda si el usuario no ha
         interactuado manualmente con el mapa. */
      map.on("popupopen", function () {
        if (instance !== owner) return;
        stopDrift(owner);
      });
      map.on("popupclose", function () {
        if (instance !== owner || owner.userInteracted) return;
        startDrift();
      });

      /* 5 · arcos de conexión desde el hub europeo */
      var arcTargets = DESTINATIONS.filter(function (d) { return d.total >= 2; });
      arcTargets.forEach(function (destination) {
        var from = L.latLng(HUB.lat, HUB.lon);
        var to = L.latLng(destination.lat, destination.lon);
        var mid = L.latLng((from.lat + to.lat) / 2, (from.lng + to.lng) / 2);
        var steps = 32;
        var coordinates = [];
        for (var i = 0; i <= steps; i += 1) {
          var t = i / steps;
          var lat = (1 - t) * (1 - t) * from.lat + 2 * (1 - t) * t * mid.lat + t * t * to.lat;
          var lng = (1 - t) * (1 - t) * from.lng + 2 * (1 - t) * t * mid.lng + t * t * to.lng;
          coordinates.push([lat, lng]);
        }
        var line = L.polyline(coordinates, {
          color: "#c7a95e",
          weight: 1.4,
          opacity: 0.5,
          dashArray: "5 7",
          className: "mapamundi-arc"
        }).addTo(map);
        try {
          var length = line._path ? line._path.getTotalLength() : 900;
          line._path.style.setProperty("--arc-length", length);
        } catch (error) { /* SVG no disponible */ }
      });

      /* 4 · destinos: entrada escalonada + pulso */
      var reduced = prefersReducedMotion();
      DESTINATIONS.forEach(function (destination, index) {
        var popup = '<span class="mapamundi-hotspot"><i style="background:' + categoryColor(destination) + '"></i>' +
          escapeHtml(destination.n) + "</span><br><small>" + escapeHtml(destination.c) + " · " + destination.total +
          " hotel" + (destination.total > 1 ? "es" : "") + "<br>" + escapeHtml(categoryNames(destination)) + "</small>";

        var marker = L.marker([destination.lat, destination.lon], {
          riseOnHover: true,
          icon: L.divIcon({
            className: "mapamundi-dot",
            html: '<span class="mapamundi-pulse" style="background:' + categoryColor(destination) + '55"></span>' +
                  '<span class="mapamundi-hotspot"><i style="background:' + categoryColor(destination) + '"></i>' +
                  escapeHtml(destination.n) + "</span>",
            iconSize: [0, 0],
            iconAnchor: [0, 0],
            popupAnchor: [0, -6]
          })
        })
          /* Hover (ratón): información rápida. */
          .bindTooltip(popup, {
            direction: "top",
            offset: [0, -8],
            opacity: 0.97,
            sticky: false,
            className: "mapamundi-tooltip"
          })
          /* Clic o toque: contenido que permanece visible hasta cerrarlo. */
          .bindPopup(popup);

        if (reduced) {
          marker.addTo(map);
        } else {
          owner.timers.stagger.push(window.setTimeout(function () {
            if (instance === owner) marker.addTo(map);
          }, 260 + index * 55));
        }
      });

      return map;
    });
  }

  /* ---------- ciclo de vida ---------- */

  mapamundi.mount = function (container) {
    if (!container) return null;
    mapamundi.unmount();

    var owner = {
      container: container,
      map: null,
      userInteracted: false,
      timers: { stagger: [], countRaf: null, drift: null, driftRaf: null, exit: null }
    };
    instance = owner;

    container.innerHTML = buildMarkup();
    var root = container.querySelector(".mapamundi-page");
    owner.root = root;

    runCountUp(root);

    var replay = root.querySelector("[data-mapamundi-replay]");
    if (replay) {
      replay.addEventListener("click", function () {
        if (instance !== owner) return;
        root.setAttribute("data-anim", "in");
        runCountUp(root);
        startDrift();
      });
    }

    buildMap(root, owner).then(function (map) {
      if (!instance || instance !== owner) {
        if (map) map.remove();
        return;
      }
      owner.map = map;
      startDrift();
    }).catch(function (error) {
      console.warn("Mapamundi: no se pudo inicializar el mapa.", error);
    });

    return owner;
  };

  mapamundi.unmount = function () {
    if (!instance) return;

    var current = instance;
    instance = null;

    (current.timers.stagger || []).forEach(function (id) { window.clearTimeout(id); });
    if (current.timers.countRaf) window.cancelAnimationFrame(current.timers.countRaf);
    stopDrift(current);
    if (current.timers.exit) window.clearTimeout(current.timers.exit);

    if (current.map) {
      try { current.map.remove(); } catch (error) { /* ya eliminado */ }
    }

    var state = window.RevistaDigital.state;
    if (state && state.activeMap === current.map) {
      state.activeMap = null;
      state.userMarker = null;
      state.routeLine = null;
    }

    if (current.root && current.root.parentNode) {
      current.root.setAttribute("data-anim", "out");
      var doomed = current.root;
      current.timers.exit = window.setTimeout(function () {
        if (doomed.parentNode) doomed.parentNode.removeChild(doomed);
      }, 320);
    }

    if (current.container && !current.container.querySelector(".mapamundi-page")) {
      current.container.innerHTML = "";
    }
  };

  mapamundi.isMounted = function () {
    return !!instance;
  };

  window.RevistaDigital.mapamundi = mapamundi;
})();
