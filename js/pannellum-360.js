(function () {
  window.RevistaDigital = window.RevistaDigital || {};
  const pannellum360 = window.RevistaDigital.pannellum360 || {};

  /* Prueba de Exploración 360°: solo los hoteles de Playa Paraíso. */
  const PLAYA_PARISO_HOTELS = [
    "Iberostar Paraíso del Mar",
    "Iberostar Paraíso Maya",
    "Iberostar Paraíso Lindo",
    "Iberostar Paraíso Beach",
    "Iberostar Paraíso JOIA"
  ];

  const ZONES = [
    { key: "restaurantes", label: "Restaurantes", blurb: "Ambientes gastronómicos del hotel." },
    { key: "exteriores", label: "Exteriores", blurb: "Jardines y áreas al aire libre." },
    { key: "playa", label: "Playas", blurb: "La franja de arena y el mar Caribe." },
    { key: "piscinas", label: "Piscinas", blurb: "Piscinas y zonas de sol." }
  ];

  const RESTAURANTES_PARAISO = {
    "Iberostar Paraíso del Mar": [
      ["La Plaza", "Buffet principal"],
      ["La Hacienda", "Cocina mexicana"],
      ["El Colonial", "Cocina francesa"],
      ["Hashiru", "Teppanyaki / Sushi"],
      ["El Rodizio", "Brasileño"],
      ["La Dorada", "Mediterránea"],
      ["Smoke House", "Cortes texanos ahumados"],
      ["Trattoria El Faro", "Cocina italiana"],
      ["El Puerto", "Buffet / Brasería"]
    ],
    "Iberostar Paraíso Maya": [
      ["La Geisha", "Teppanyaki"],
      ["L'Etoile", "Cocina francesa"],
      ["La Marina", "Marisquería"],
      ["Under the Sea American Grill", "Grill/Brasserie"],
      ["Olivetti", "Italiana"],
      ["Lemon & Spices", "Cocina griega"],
      ["El Rancho", "Steak House"],
      ["La Pagoda", "Buffet principal"],
      ["El Museo", "Cocina italiana"],
      ["El Tapatío", "Cocina mexicana"]
    ],
    "Iberostar Paraíso Lindo": [
      ["Under the Sea American Grill", "Grill/Brasserie"],
      ["Lemon & Spices", "Cocina griega"],
      ["Olivetti", "Italiana"],
      ["La Pagoda", "Buffet principal"],
      ["El Rancho", "Steak House"],
      ["El Tapatío", "Cocina mexicana"],
      ["El Museo", "Cocina italiana"],
      ["Hashiru", "Teppanyaki"],
      ["El Colonial", "Cocina francesa"],
      ["La Geisha", "Teppanyaki"]
    ],
    "Iberostar Paraíso Beach": [
      ["La Plaza", "Buffet principal"],
      ["El Colonial", "Cocina francesa"],
      ["La Hacienda", "Cocina mexicana"],
      ["Hashiru", "Teppanyaki"],
      ["Smoke House", "Cortes ahumados"],
      ["El Rodizio", "Brasileño"],
      ["La Dorada", "Mediterránea"],
      ["El Puerto", "Buffet"],
      ["El Mercado", "Buffet"],
      ["Trattoria El Faro", "Italiana"]
    ],
    "Iberostar Paraíso JOIA": [
      ["Legado", "Cocina mexicana/brasserie"],
      ["L'Atelier", "Alta cocina"],
      ["Venecia", "Cocina italiana"],
      ["Haiku", "Cocina asiática"],
      ["Ember Steak House", "Steak House"],
      ["Bella Vista", "Buffet"]
    ]
  };

  const VIEW = {
    playa: { yaw: 0, pitch: -6, hfov: 100 },
    piscinas: { yaw: 0, pitch: -12, hfov: 90 },
    restaurantes: { yaw: 0, pitch: -4, hfov: 78 },
    exteriores: { yaw: 60, pitch: -6, hfov: 92 }
  };

  const PALETTES = {
    playa: { skyTop: "#2e6fb4", skyBottom: "#cfe8f6", groundTop: "#0e6f8c", groundBottom: "#2bb3cc" },
    piscinas: { skyTop: "#2a86b8", skyBottom: "#d9eef3", groundTop: "#17b7c8", groundBottom: "#5fdfe6" },
    restaurantes: { skyTop: "#20394d", skyBottom: "#d9a05f", groundTop: "#8a5434", groundBottom: "#4a2d1c" },
    exteriores: { skyTop: "#6bb1dd", skyBottom: "#e2f3da", groundTop: "#457c3c", groundBottom: "#82b169" }
  };

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    })[character]);
  }

  function paletteFor(zoneKey) {
    return PALETTES[zoneKey] || PALETTES.exteriores;
  }

  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /* ---------- decoración por zona ---------- */

  function drawSea(ctx, W, H, horizon) {
    const sandY = H * 0.78;
    ctx.fillStyle = "#e7d3a0";
    ctx.fillRect(0, sandY, W, H - sandY);
    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.lineWidth = Math.max(2, H * 0.010);
    for (let x = -40; x < W + 40; x += 90) {
      ctx.beginPath();
      ctx.ellipse(x, sandY, 70, H * 0.016, 0, Math.PI * 0.95, Math.PI * 1.05);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(255,255,255,0.28)";
    ctx.lineWidth = Math.max(2, H * 0.007);
    for (let i = 1; i <= 3; i++) {
      const yy = horizon + (sandY - horizon) * (i / 4);
      ctx.beginPath();
      for (let x = 0; x <= W; x += 16) {
        const y = yy + Math.sin(x * 0.02 + i) * H * 0.012;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }

  function drawPool(ctx, W, H, horizon) {
    const deckY = H * 0.82;
    ctx.fillStyle = "#d9e2d2";
    ctx.fillRect(0, deckY, W, H - deckY);
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    for (let i = 0; i < 4; i++) {
      const x = W * (0.42 + i * 0.05);
      ctx.fillRect(x - 2, horizon + H * 0.02, 4, deckY - horizon - H * 0.02);
    }
    [0.2, 0.5, 0.8].forEach((k) => {
      const x = W * k;
      const y = deckY + H * 0.02;
      ctx.fillStyle = "#c2b894";
      ctx.fillRect(x - W * 0.045, y - H * 0.012, W * 0.09, H * 0.012);
      ctx.fillStyle = "#f0e6c8";
      ctx.fillRect(x - W * 0.045, y, W * 0.09, H * 0.028);
    });
  }

  function drawDining(ctx, W, H, horizon) {
    [-120, -60, 0, 60, 120].forEach((yaw) => {
      const x = W * (0.5 + yaw / 360);
      const y = horizon + H * 0.12;
      ctx.fillStyle = "rgba(20,12,6,0.85)";
      ctx.beginPath();
      ctx.ellipse(x, y, W * 0.055, H * 0.030, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,214,130,0.9)";
      ctx.beginPath();
      ctx.arc(x, y - H * 0.012, Math.max(3, H * 0.010), 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(70,40,26,0.9)";
      [-1, 1].forEach((side) => {
        ctx.beginPath();
        ctx.arc(x + side * W * 0.075, y + H * 0.02, Math.max(4, H * 0.014), 0, Math.PI * 2);
        ctx.fill();
      });
    });
  }

  function drawGarden(ctx, W, H, horizon) {
    ctx.fillStyle = "#cdb280";
    ctx.beginPath();
    ctx.moveTo(W / 2 - W * 0.05, horizon);
    ctx.lineTo(W / 2 + W * 0.05, horizon);
    ctx.lineTo(W * 0.68, H);
    ctx.lineTo(W * 0.32, H);
    ctx.closePath();
    ctx.fill();
    [0.12, 0.30, 0.70, 0.88].forEach((k) => {
      const x = W * k;
      const y = horizon + H * 0.10;
      ctx.strokeStyle = "#5d3a24";
      ctx.lineWidth = Math.max(4, H * 0.016);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + W * 0.02, y + H * 0.12, x + W * 0.045, y + H * 0.24);
      ctx.stroke();
      ctx.fillStyle = "#1f5c33";
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2 + 0.4;
        const len = H * 0.085;
        const side = i % 2 ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(
          x + Math.cos(ang) * len * 0.5,
          y + Math.sin(ang) * len * 0.4 - H * 0.01,
          x + Math.cos(ang) * len,
          y + Math.sin(ang) * len * 0.55 - H * 0.02
        );
        ctx.quadraticCurveTo(
          x + Math.cos(ang) * len * 0.5 + side * H * 0.02,
          y + Math.sin(ang) * len * 0.4 - H * 0.012,
          x,
          y
        );
        ctx.fill();
      }
    });
  }

  /* ---------- generación del equirectangular 2:1 ---------- */

  function buildPanorama(hotelName, zoneKey, label, width, height) {
    const W = width || 2048;
    const H = height || 1024;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    const pal = paletteFor(zoneKey);
    const horizon = H * 0.5;

    const sky = ctx.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, pal.skyTop);
    sky.addColorStop(1, pal.skyBottom);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, horizon);

    const sunX = W * 0.25;
    const sunY = H * 0.34;
    const sunR = Math.min(W, H) * 0.42;
    const glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR);
    glow.addColorStop(0, "rgba(255,250,220,0.95)");
    glow.addColorStop(0.25, "rgba(255,238,170,0.55)");
    glow.addColorStop(1, "rgba(255,238,170,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(sunX - sunR, sunY - sunR, sunR * 2, sunR * 2);

    const ground = ctx.createLinearGradient(0, horizon, 0, H);
    ground.addColorStop(0, pal.groundTop);
    ground.addColorStop(1, pal.groundBottom);
    ctx.fillStyle = ground;
    ctx.fillRect(0, horizon, W, H - horizon);

    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = Math.max(2, H * 0.006);
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    ctx.lineTo(W, horizon);
    ctx.stroke();

    if (zoneKey === "playa") drawSea(ctx, W, H, horizon);
    else if (zoneKey === "piscinas") drawPool(ctx, W, H, horizon);
    else if (zoneKey === "restaurantes") drawDining(ctx, W, H, horizon);
    else drawGarden(ctx, W, H, horizon);

    const bw = Math.min(W * 0.62, 1500);
    const bh = H * 0.16;
    ctx.fillStyle = "rgba(7,14,26,0.38)";
    roundRect(ctx, (W - bw) / 2, H * 0.315, bw, bh, 40);
    ctx.fill();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.font = `700 ${Math.round(H * 0.066)}px 'EB Garamond', Georgia, serif`;
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 18;
    ctx.fillText(String(label || zoneKey).toUpperCase(), W / 2, H * 0.40);
    ctx.shadowBlur = 0;

    ctx.font = `500 ${Math.round(H * 0.028)}px Arial, sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.fillText("Playa Paraíso · " + hotelName, W / 2, H * 0.47);

    return canvas;
  }

  function buildPreview(hotelName, zoneKey, label) {
    return buildPanorama(hotelName, zoneKey, label, 512, 256).toDataURL("image/jpeg", 0.72);
  }

  /* ---------- librería Pannellum (carga bajo demanda) ---------- */

  let pannellumReady = null;

  function libUrl() {
    const base = (document.querySelector("base") && document.querySelector("base").href) || document.baseURI;
    return new URL("libs/pannellum/", base).href;
  }

  function ensurePannellum() {
    if (pannellumReady) return pannellumReady;
    pannellumReady = new Promise((resolve, reject) => {
      function ensureScript() {
        if (typeof window.pannellum !== "undefined" && window.pannellum) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = libUrl() + "pannellum.js";
        script.dataset.pannellum = "1";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Pannellum no se pudo cargar"));
        document.head.appendChild(script);
      }
      if (document.querySelector('link[data-pannellum-css]')) {
        ensureScript();
        return;
      }
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = libUrl() + "pannellum.css";
      link.dataset.pannellumCss = "1";
      link.onload = ensureScript;
      link.onerror = () => reject(new Error("CSS de Pannellum no se pudo cargar"));
      document.head.appendChild(link);
    });
    return pannellumReady;
  }

  /* ---------- visor ---------- */

  pannellum360.open = function (hotelName, zoneKey, label) {
    ensurePannellum().then(() => {
      const view = VIEW[zoneKey] || VIEW.exteriores;
      const url = buildPanorama(hotelName, zoneKey, label, 2048, 1024).toDataURL("image/jpeg", 0.85);

      const modal = document.createElement("div");
      modal.className = "pano-360-modal";
      modal.setAttribute("role", "dialog");
      modal.setAttribute("aria-modal", "true");
      modal.innerHTML =
        '<div class="pano-360-bar">' +
          "<strong>" + escapeHtml(label) + " · " + escapeHtml(hotelName) + "</strong>" +
          '<button type="button" class="pano-360-close" aria-label="Cerrar recorrido">×</button>' +
        "</div>" +
        '<div class="pano-360-stage"><div id="pano360Stage"></div></div>';

      document.body.appendChild(modal);
      document.body.classList.add("pano-360-open");

      let viewer = null;

      function closeModal() {
        try {
          if (viewer && typeof viewer.destroy === "function") viewer.destroy();
        } catch (error) {
          /* noop */
        }
        if (modal.parentNode) modal.parentNode.removeChild(modal);
        document.body.classList.remove("pano-360-open");
        document.removeEventListener("keydown", onKey);
      }

      function onKey(event) {
        if (event.key === "Escape") closeModal();
      }

      try {
        const panoElement = document.getElementById("pano360Stage");
        if (!panoElement) {
          closeModal();
          return;
        }
        viewer = window.pannellum.viewer("pano360Stage", {
          type: "equirectangular",
          panorama: url,
          autoLoad: true,
          autoRotate: -2,
          compass: true,
          showZoomCtrl: true,
          showFullscreenCtrl: true,
          yaw: view.yaw,
          pitch: view.pitch,
          hfov: view.hfov,
          minPitch: -85,
          maxPitch: 85
        });
      } catch (error) {
        console.warn("Pannellum360:", error);
        closeModal();
        return;
      }

      document.addEventListener("keydown", onKey);
      modal.querySelector(".pano-360-close").addEventListener("click", closeModal);
      modal.addEventListener("click", (event) => {
        if (event.target === modal) closeModal();
      });
    }).catch((error) => {
      console.warn("No se pudo abrir el recorrido 360°:", error);
    });
  };

  /* ---------- sección en la ficha del hotel ---------- */

  pannellum360.isPlayaParaiso = function (hotelName) {
    return PLAYA_PARISO_HOTELS.indexOf(hotelName) >= 0;
  };

  pannellum360.getRestaurantes = function (hotelName) {
    return RESTAURANTES_PARAISO[hotelName] || [];
  };

  /* Datos por restaurante para construir fichas visuales: nombre, cocina,
     imagen de vista previa y disponibilidad de recorrido 360°. Solo los
     hoteles del complejo Playa Paraíso tienen recorrido 360° hoy. */
  pannellum360.getRestaurantFicheData = function (hotelName) {
    if (!pannellum360.isPlayaParaiso(hotelName)) return [];
    return pannellum360.getRestaurantes(hotelName).map(([name, cuisine]) => ({
      name,
      cuisine: cuisine || "Restaurante",
      image: buildPreview(hotelName, "restaurantes", name),
      has360: true
    }));
  };

  pannellum360.renderRestaurantCards = function (hotelName) {
    if (!pannellum360.isPlayaParaiso(hotelName)) return "";
    const restaurants = pannellum360.getRestaurantes(hotelName);
    if (!restaurants.length) return "";
    const cards = restaurants.map(([name, cuisine]) => {
      const preview = buildPreview(hotelName, "restaurantes", name);
      return `
        <button type="button" class="pano-360-ficha pano-360-ficha-restaurante" data-hotel="${escapeHtml(hotelName)}" data-zone="restaurantes" data-label="${escapeHtml(name)}">
          <span class="pano-360-ficha-media">
            <img src="${preview}" alt="Recorrido 360° de ${escapeHtml(name)} en ${escapeHtml(hotelName)}" loading="lazy" decoding="async" />
            <b>360°</b>
          </span>
          <span class="pano-360-ficha-copy">
            <strong>${escapeHtml(name)}</strong>
            <small>${escapeHtml(cuisine)}</small>
          </span>
        </button>
      `;
    }).join("");

    return `
      <p class="pano-360-restaurant-heading">Recorrido virtual de cada restaurante</p>
      <div class="pano-360-list pano-360-list-restaurantes">
        ${cards}
      </div>
    `;
  };

  pannellum360.renderSection = function (hotelName) {
    if (!pannellum360.isPlayaParaiso(hotelName)) return "";
    const cards = ZONES.map((zone) => {
      const preview = buildPreview(hotelName, zone.key, zone.label);
      return `
        <button type="button" class="pano-360-ficha" data-hotel="${escapeHtml(hotelName)}" data-zone="${zone.key}" data-label="${escapeHtml(zone.label)}">
          <span class="pano-360-ficha-media">
            <img src="${preview}" alt="Vista 360° de ${escapeHtml(zone.label)} en ${escapeHtml(hotelName)}" loading="lazy" decoding="async" />
            <b>360°</b>
          </span>
          <span class="pano-360-ficha-copy">
            <strong>${escapeHtml(zone.label)}</strong>
            <small>${escapeHtml(zone.blurb)}</small>
          </span>
        </button>
      `;
    }).join("");

    const restaurantPanel = pannellum360.renderRestaurantCards(hotelName)
      ? `\n        <div class="pano-360-restaurantes-panel" id="hotel-restaurantes-360">\n          ${pannellum360.renderRestaurantCards(hotelName)}\n        </div>`
      : "";

    return `
      <section class="hotel-360-section">
        <div class="hotel-360-heading">
          <small>RECORRIDO VIRTUAL</small>
          <h2>Exploración 360°</h2>
          <p>Asómate a ${escapeHtml(hotelName)}: restaurantes, exteriores, playa y piscinas en panorámica 360°.</p>
        </div>
        <div class="pano-360-list">
          ${cards}
        </div>
        ${restaurantPanel}
      </section>
    `;
  };

  window.pannellum360Open = pannellum360.open;
  window.RevistaDigital.pannellum360 = pannellum360;
})();
