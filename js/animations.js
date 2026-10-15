/* =========================================================
   ANIMACIONES DE LA REVISTA
   - Intro: el logo "carga" revelando primero los puntos que
     rodean la estrella (uno a uno, con destello de luz suave),
     luego la estrella y al final el logotipo completo con fade
     limpio. Todo se dibuja por fotograma para que sea fluido.
     Se mantiene el fondo oscuro (no negro) del overlay.
   - Entradas escalonadas al cambiar de página.
   - Parallax suave de la portada.
   Este archivo es aditivo: no modifica function.js.
   ========================================================= */

(function () {
  "use strict";

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     Config de la intro
     --------------------------------------------------------- */

  var DOT_STEP = 140;    // separación entre puntos (ms)
  var RISE_MS = 320;     // cada punto aparece GRANDE y se encoge hasta su sitio
  var FLASH_MS = 420;    // destello que acompaña al encendido del punto
  var STAR_PAUSE = 450;  // pausa tras encender todos los puntos
  var STAR_RISE = 620;   // aparición (crecimiento) de la estrella
  var STAR_FLASH = 750;  // destello de la estrella
  var FULL_WAIT = 380;   // pausa antes del fade final
  var FULL_FADE = 700;   // fade final del logotipo
  var SAFETY_MS = 8000;  // cierre de seguridad

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }
  function easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  function createCanvas(w, h) {
    var c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  }

  /* ---------------------------------------------------------
     1. INTRO: CARGA DE PUNTOS → ESTRELLA → LOGOTIPO
     --------------------------------------------------------- */

  function runIntro() {
    var overlay = document.getElementById("introOverlay");
    if (!overlay) return;

    var logo = document.getElementById("introLogo");
    var canvas = document.getElementById("introCanvas");
    var ctx = canvas ? canvas.getContext("2d") : null;

    var closed = false;
    function finishIntro() {
      if (closed) return;
      closed = true;
      overlay.classList.add("intro-done");
      document.body.classList.remove("intro-lock");
      window.setTimeout(function () {
        if (overlay && overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }, 800);
    }

    /* Cierre de seguridad: pase lo que pase, la intro no bloquea la revista. */
    window.setTimeout(finishIntro, SAFETY_MS);

    if (reduceMotion || !logo || !canvas || !ctx) {
      finishIntro();
      return;
    }

    document.body.classList.add("intro-lock");

    var W = 0;
    var H = 0;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var phase = "idle";
    var rafId = 0;
    var V = null;
    var dotItems = [];
    var starItems = [];
    var textItems = [];
    var dotsEndAt = -1;
    var starRiseAt = 0;
    var starFlashAt = 0;
    var fullAt = 0;

    function sizeCanvas() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    sizeCanvas();
    window.addEventListener("resize", sizeCanvas);

    window.requestAnimationFrame(function () {
      overlay.classList.add("intro-dark");
    });

    /* ---------- análisis del logo ---------- */
    function analyze() {
      var nw = logo.naturalWidth;
      var nh = logo.naturalHeight;
      if (!nw || !nh) return null;

      var lc = createCanvas(nw, nh);
      var lctx = lc.getContext("2d");
      lctx.drawImage(logo, 0, 0, nw, nh);

      var src = null;
      try {
        src = lctx.getImageData(0, 0, nw, nh).data;
      } catch (error) {
        src = null;
      }

      var mw = Math.min(W * 0.58, 360);
      var rect = {
        ox: (W - mw) / 2,
        oy: (H - mw * (nh / nw)) / 2,
        ow: mw,
        oh: mw * (nh / nw),
        scale: mw / nw
      };

      if (!src) {
        return {
          nw: nw,
          nh: nh,
          logoCanvas: lc,
          src: null,
          rect: rect,
          comps: [],
          dotIndexes: [],
          starIndexes: [],
          center: { x: nw / 2, y: nh / 2 }
        };
      }

      /* Componentes conexas (4-conexión) */
      var cols = nw;
      var rows = nh;
      var visited = new Uint8Array(cols * rows);
      var comps = [];

      for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
          var idx = y * cols + x;
          if (visited[idx] || src[idx * 4 + 3] <= 30) continue;

          var stack = [x, y];
          visited[idx] = 1;
          var pix = [];
          var cnt = 0;
          var sumX = 0;
          var sumY = 0;
          var mnX = x, mnY = y, mxX = x, mxY = y;

          while (stack.length) {
            var cy = stack.pop();
            var cx = stack.pop();
            var ci = cy * cols + cx;
            pix.push(cx, cy);
            cnt++;
            sumX += cx;
            sumY += cy;
            if (cx < mnX) mnX = cx;
            if (cx > mxX) mxX = cx;
            if (cy < mnY) mnY = cy;
            if (cy > mxY) mxY = cy;

            if (cx > 0 && !visited[ci - 1] && src[(ci - 1) * 4 + 3] > 30) { visited[ci - 1] = 1; stack.push(cx - 1, cy); }
            if (cx < cols - 1 && !visited[ci + 1] && src[(ci + 1) * 4 + 3] > 30) { visited[ci + 1] = 1; stack.push(cx + 1, cy); }
            if (cy > 0 && !visited[ci - cols] && src[(ci - cols) * 4 + 3] > 30) { visited[ci - cols] = 1; stack.push(cx, cy - 1); }
            if (cy < rows - 1 && !visited[ci + cols] && src[(ci + cols) * 4 + 3] > 30) { visited[ci + cols] = 1; stack.push(cx, cy + 1); }
          }

          comps.push({
            pixels: pix,
            cnt: cnt,
            cx: sumX / cnt,
            cy: sumY / cnt,
            w: mxX - mnX + 1,
            h: mxY - mnY + 1,
            mnX: mnX,
            mnY: mnY,
            mxX: mxX,
            mxY: mxY
          });
        }
      }

      if (!comps.length) {
        return {
          nw: nw,
          nh: nh,
          logoCanvas: lc,
          src: src,
          rect: rect,
          comps: comps,
          dotIndexes: [],
          starIndexes: [],
          center: { x: nw / 2, y: nh * 0.35 }
        };
      }

      /* La estrella es la componente más grande. */
      var starIdx = 0;
      for (var sI = 1; sI < comps.length; sI++) {
        if (comps[sI].cnt > comps[starIdx].cnt) starIdx = sI;
      }
      var star = comps[starIdx];
      var starW = star.w;
      var starH = star.h;
      var starR = Math.sqrt((starW / 2) * (starW / 2) + (starH / 2) * (starH / 2)) || 1;
      var starBottom = star.cy + starH * 1.6;
      var dotBig = clamp(Math.round(Math.min(starW, starH) * 0.7), 12, 90);
      var outerRing = Math.max(starR * 2.6, 16);

      /* Candidatos a puntos: círculos pequeños alrededor del emblema */
      var cands = [];
      var used = {};
      function collectDots(wTol, hTol, ratioMax, cntMin) {
        for (var ci = 0; ci < comps.length; ci++) {
          if (ci === starIdx || used[ci]) continue;
          var co = comps[ci];
          if (co.cy > starBottom) continue;
          var ratio = co.w >= co.h ? co.w / co.h : co.h / co.w;
          if (co.w > wTol || co.h > hTol || ratio >= ratioMax || co.cnt < cntMin) continue;
          var dist = Math.sqrt(
            (co.cx - star.cx) * (co.cx - star.cx) +
            (co.cy - star.cy) * (co.cy - star.cy)
          );
          if (dist > outerRing) continue;
          used[ci] = true;
          cands.push({ idx: ci, dist: dist });
        }
      }
      collectDots(dotBig, dotBig, 1.9, 6);
      collectDots(dotBig * 1.6, dotBig * 1.6, 2.6, 4);

      /* Forzamos exactamente 13 puntos: los que mejor forman
         el anillo alrededor de la estrella (misma distancia). */
      var TARGET_DOTS = 13;
      cands.sort(function (a, b) { return a.dist - b.dist; });
      var ringMed = cands.length ? cands[Math.floor(cands.length / 2)].dist : 0;
      cands.sort(function (a, b) {
        return Math.abs(a.dist - ringMed) - Math.abs(b.dist - ringMed);
      });
      var dotIndexes = cands
        .slice(0, Math.min(TARGET_DOTS, cands.length))
        .map(function (c) { return c.idx; });

      /* Todo lo grande / cercano al centro forma parte de la estrella */
      var starIndexes = [starIdx];
      var sX = star.cx * star.cnt;
      var sY = star.cy * star.cnt;
      var sCnt = star.cnt;

      for (var cj = 0; cj < comps.length; cj++) {
        if (cj === starIdx) continue;
        var so = comps[cj];
        var dD = Math.sqrt(
          (so.cx - star.cx) * (so.cx - star.cx) +
          (so.cy - star.cy) * (so.cy - star.cy)
        );
        if (so.cnt >= star.cnt * 0.12 && dD <= starR * 1.6 && so.cy <= star.cy + starH) {
          starIndexes.push(cj);
          sX += so.cx * so.cnt;
          sY += so.cy * so.cnt;
          sCnt += so.cnt;
        }
      }

      var focus = {
        x: sCnt ? sX / sCnt : star.cx,
        y: sCnt ? sY / sCnt : star.cy
      };

      /* Los puntos se van encendiendo en orden alrededor de la estrella */
      dotIndexes.sort(function (a, b) {
        return (
          Math.atan2(comps[a].cy - focus.y, comps[a].cx - focus.x) -
          Math.atan2(comps[b].cy - focus.y, comps[b].cx - focus.x)
        );
      });

      /* El logotipo completo aparece centrado en la pantalla */
      var mw2 = Math.min(W * 0.58, 360);
      var scale = Math.min(mw2 / nw, (H * 0.9) / nh);
      rect = {
        ox: (W - nw * scale) / 2,
        oy: (H - nh * scale) / 2,
        ow: nw * scale,
        oh: nh * scale,
        scale: scale
      };

      return {
        nw: nw,
        nh: nh,
        logoCanvas: lc,
        src: src,
        rect: rect,
        comps: comps,
        dotIndexes: dotIndexes,
        starIndexes: starIndexes,
        center: focus
      };
    }

    /* Recorte de un componente a su bounding box con su color/alfa real */
    function cropItem(compIndex) {
      var comp = V.comps[compIndex];
      var w = comp.w;
      var h = comp.h;
      var c = createCanvas(w, h);
      var cctx = c.getContext("2d");
      var img = cctx.createImageData(w, h);
      var buf = img.data;
      var pix = comp.pixels;
      var src = V.src;

      for (var k = 0; k < pix.length; k += 2) {
        var sx = pix[k];
        var sy = pix[k + 1];
        var sI = (sy * V.nw + sx) * 4;
        var dI = ((sy - comp.mnY) * w + (sx - comp.mnX)) * 4;
        buf[dI] = src[sI];
        buf[dI + 1] = src[sI + 1];
        buf[dI + 2] = src[sI + 2];
        buf[dI + 3] = src[sI + 3];
      }
      cctx.putImageData(img, 0, 0);

      return {
        canvas: c,
        comp: comp,
        cx: comp.cx,
        cy: comp.cy,
        r: Math.max(3, (comp.w + comp.h) / 4),
        state: "pending",
        rise: 0,
        flash: 0
      };
    }

    /* ---------- dibujado ---------- */
    function drawItem(item, alpha, popScale, offX, offY) {
      if (alpha <= 0.01) return;
      var comp = item.comp;
      var rect = V.rect;
      var k = popScale || 1;
      var w = comp.w * rect.scale * k;
      var h = comp.h * rect.scale * k;
      var cx = rect.ox + (comp.mnX + comp.w / 2) * rect.scale + (offX || 0);
      var cy = rect.oy + (comp.mnY + comp.h / 2) * rect.scale + (offY || 0);
      ctx.globalAlpha = clamp(alpha, 0, 1);
      ctx.drawImage(item.canvas, cx - w / 2, cy - h / 2, w, h);
      ctx.globalAlpha = 1;
    }

    function drawGlow(cx, cy, r, alpha) {
      if (alpha <= 0.01) return;
      var sc = V.rect.scale;
      var dx = V.rect.ox + cx * sc;
      var dy = V.rect.oy + cy * sc;
      var rad = Math.max(10, r * sc);
      var g = ctx.createRadialGradient(dx, dy, 0, dx, dy, rad);
      g.addColorStop(0, "rgba(255,238,196," + alpha + ")");
      g.addColorStop(0.45, "rgba(242,208,140," + (alpha * 0.35).toFixed(3) + ")");
      g.addColorStop(1, "rgba(216,184,120,0)");
      ctx.fillStyle = g;
      ctx.fillRect(dx - rad, dy - rad, rad * 2, rad * 2);
    }

    function drawDotFlash(item, now) {
      var p = clamp((now - item.rise) / RISE_MS, 0, 1);
      if (p >= 1) return;
      var pop = 1 + 5 * Math.pow(1 - easeOutCubic(p), 2);
      var grow = pop * (0.7 + 0.3 * p);
      drawGlow(item.cx, item.cy, item.r * grow, 0.9 * (1 - p));
    }

    /* ---------- máquina de estados por fotograma ---------- */
    function tick(now) {
      if (closed) return;

      ctx.clearRect(0, 0, W, H);

      if (phase === "dots" || phase === "star") {
        var anyPending = false;

        for (var i = 0; i < dotItems.length; i++) {
          var d = dotItems[i];
          if (d.state === "pending") {
            if (now >= d.charge) {
              d.state = "rising";
              d.rise = now;
              d.flash = now;
            } else {
              anyPending = true;
            }
          }
        }

        for (var j = 0; j < dotItems.length; j++) {
          var dj = dotItems[j];
          if (dj.state === "rising") {
            var p = clamp((now - dj.rise) / RISE_MS, 0, 1);
            var eo = easeOutCubic(p);
            var popScale = 1 + 5 * Math.pow(1 - eo, 2);
            drawItem(dj, eo, popScale);
            if (now - dj.flash < FLASH_MS) drawDotFlash(dj, now);
            if (p >= 1) dj.state = "lit";
          } else if (dj.state === "lit") {
            drawItem(dj, 1);
            drawGlow(dj.cx, dj.cy, dj.r * 1.7, 0.12);
          }
        }

        if (!anyPending && dotsEndAt < 0) {
          dotsEndAt = now;
        }
        if (dotsEndAt >= 0 && now >= dotsEndAt + STAR_PAUSE && phase === "dots") {
          phase = "star";
          starRiseAt = now;
          starFlashAt = now;
        }
      }

      if (phase === "star") {
        var sp = clamp((now - starRiseAt) / STAR_RISE, 0, 1);
        for (var s = 0; s < starItems.length; s++) {
          var sg = 0.5 + 0.5 * easeOutCubic(sp);
          drawItem(starItems[s], easeOutCubic(sp), sg);
        }
        var fp = clamp((now - starFlashAt) / STAR_FLASH, 0, 1);
        if (fp < 1) {
          drawGlow(V.center.x, V.center.y, 18 * (1 + fp * 1.6), 1 * (1 - fp));
        } else {
          drawGlow(V.center.x, V.center.y, 20, 0.15);
        }
        if (sp >= 1 && now >= starRiseAt + STAR_RISE + FULL_WAIT) {
          phase = "full";
          fullAt = now;
        }
      }

      if (phase === "full") {
        var fa = easeInOutCubic(clamp((now - fullAt) / FULL_FADE, 0, 1));
        if (fa >= 1) fa = 1;
        var slide = easeOutCubic(fa);
        var offY = 90 * (1 - slide);
        for (var t = 0; t < textItems.length; t++) {
          drawItem(textItems[t], fa, 1, 0, offY);
        }
        for (var g = 0; g < starItems.length; g++) {
          drawItem(starItems[g], 1);
        }
        for (var h2 = 0; h2 < dotItems.length; h2++) {
          drawItem(dotItems[h2], 1);
        }
        // un sutil destello mientras entran las letras
        drawGlow(V.center.x, V.center.y, 26 + 20 * (1 - slide), 0.18 * (1 - slide));
        if (fa >= 1) {
          overlay.classList.remove("intro-glow-on");
          overlay.classList.add("intro-fadeout");
          window.setTimeout(finishIntro, 380);
          phase = "done";
          return;
        }
      }

      rafId = window.requestAnimationFrame(tick);
    }

    /* ---------- arranque ---------- */
    function start() {
      V = analyze();
      if (!V || V.comps.length < 2 || V.dotIndexes.length < 3) {
        cleanReveal();
        return;
      }

      var t0 = performance.now();
      var i;
      for (i = 0; i < V.dotIndexes.length; i++) {
        var item = cropItem(V.dotIndexes[i]);
        item.charge = t0 + i * DOT_STEP;
        item.type = "dot";
        dotItems.push(item);
      }
      for (i = 0; i < V.starIndexes.length; i++) {
        var sItem = cropItem(V.starIndexes[i]);
        sItem.type = "star";
        starItems.push(sItem);
      }
      for (i = 0; i < V.comps.length; i++) {
        if (V.dotIndexes.indexOf(i) >= 0 || V.starIndexes.indexOf(i) >= 0) continue;
        var tItem = cropItem(i);
        tItem.type = "text";
        textItems.push(tItem);
      }

      overlay.classList.add("intro-glow-on");
      phase = "dots";
      rafId = window.requestAnimationFrame(tick);
    }

    function cleanReveal() {
      if (phase === "done") return;
      phase = "done";
      V = V || analyze();
      if (!V) {
        finishIntro();
        return;
      }
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(V.logoCanvas, V.rect.ox, V.rect.oy, V.rect.ow, V.rect.oh);
      canvas.style.transition = "opacity " + FULL_FADE + "ms ease";
      canvas.style.opacity = "0";
      void canvas.offsetWidth;
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          canvas.style.opacity = "1";
        });
      });
      window.setTimeout(function () {
        overlay.classList.add("intro-fadeout");
        finishIntro();
      }, 900 + FULL_FADE);
    }

    function loadOrContinue() {
      if (logo.complete && logo.naturalWidth > 0) {
        start();
        return;
      }
      logo.addEventListener("load", start, { once: true });
      logo.addEventListener(
        "error",
        function () {
          finishIntro();
        },
        { once: true }
      );
      window.setTimeout(function () {
        if (!V) cleanReveal();
      }, 2500);
    }
    loadOrContinue();

    /* Permitir saltar la intro con clic o tecla. */
    function skip(event) {
      if (event && event.type === "keydown") event.preventDefault();
      cancelAnimationFrame(rafId);
      phase = "done";
      finishIntro();
    }
    overlay.addEventListener("click", skip, { once: true });
    window.addEventListener(
      "keydown",
      function (event) {
        if (event.key === "Escape" || event.key === "Enter" || event.key === " ") {
          skip(event);
        }
      },
      { once: true }
    );
  }

  /* ---------------------------------------------------------
     2. ENTRADAS ESCALONADAS POR PÁGINA
     --------------------------------------------------------- */

  var staggerSelectors = [
    ".cover-left > *:not(.cover-logo)",
    ".cover-right > div > *",
    ".reference-photo-content > *",
    ".reference-copy > p",
    ".reference-copy > .reference-stats",
    ".reference-copy > ul",
    ".reference-right > header",
    ".food-panel > *",
    ".back-quote > *",
    ".back-contact > *:not(.cover-logo)",
    ".workspace-header",
    ".media-header",
    ".workspace-card",
    ".media-card",
    ".hotel-stat-button",
    ".food-list span",
    ".map-route-list button",
    ".portal-hero > div > *",
    ".portal-hero > img",
    ".portal-destination-hero > div > *",
    ".portal-destination-hero > img",
    ".portal-nav",
    ".portal-section > *",
    ".portal-section-heading > *",
    ".destination-card > *",
    ".portal-map-section > div > *",
    ".hotel-portal-hero-content > *"
  ].join(",");

  function applyStagger() {
    if (reduceMotion) return;

    var roots = [
      document.getElementById("bookShell"),
      document.getElementById("appView")
    ];

    roots.forEach(function (shell) {
      if (!shell) return;

      var nodes = shell.querySelectorAll(staggerSelectors);
      if (!nodes.length) return;

      /* Agrupamos por padre para reiniciar la cuenta en cada grupo. */
      var counters = new Map();

      Array.prototype.forEach.call(nodes, function (node) {
        var parent = node.parentNode;
        var index = counters.get(parent) || 0;
        counters.set(parent, index + 1);

        node.classList.remove("anim-rise");
        /* forzamos reflow para reiniciar la animación */
        void node.offsetWidth;

        node.style.animationDelay = Math.min(index * 70, 520) + "ms";
        node.classList.add("anim-rise");
      });
    });
  }

  function watchShell() {
    var roots = [
      document.getElementById("bookShell"),
      document.getElementById("appView")
    ];

    roots.forEach(function (shell) {
      if (!shell) return;

      var scheduled = false;
      var observer = new MutationObserver(function () {
        if (scheduled) return;
        scheduled = true;
        window.requestAnimationFrame(function () {
          scheduled = false;
          applyStagger();
        });
      });

      observer.observe(shell, { childList: true });
    });

    applyStagger();
  }

  /* ---------------------------------------------------------
     3. PARALLAX DE PORTADA
     --------------------------------------------------------- */

  function enableCoverParallax() {
    if (reduceMotion) return;

    var shell = document.getElementById("bookShell");
    if (!shell) return;

    var ticking = false;
    var lastX = 0;
    var lastY = 0;

    function update() {
      ticking = false;

      var cover = shell.querySelector(".cover-spread");
      if (!cover) return;

      var right = cover.querySelector(".cover-right");
      var left = cover.querySelector(".cover-left");
      var dx = (lastX / window.innerWidth - 0.5) * 2;
      var dy = (lastY / window.innerHeight - 0.5) * 2;

      if (right) {
        right.style.backgroundPosition =
          (50 + dx * 3).toFixed(2) + "% " + (50 + dy * 3).toFixed(2) + "%";
      }
      if (left) {
        left.style.transform =
          "translate(" + (dx * -6).toFixed(2) + "px," + (dy * -6).toFixed(2) + "px)";
      }
    }

    window.addEventListener("mousemove", function (event) {
      lastX = event.clientX;
      lastY = event.clientY;
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    });
  }

  /* ---------------------------------------------------------
     INICIO
     --------------------------------------------------------- */

  function boot() {
    runIntro();
    watchShell();
    enableCoverParallax();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();