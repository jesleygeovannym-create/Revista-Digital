(function () {
  window.RevistaDigital = window.RevistaDigital || {};

  const app = window.RevistaDigital.app || {};

  app.name = "Iberostar Destinos";
  app.version = "compat";

  app.start = function () {
    if (document.body.dataset.appMode) return;
    if (typeof window.RevistaDigital.routes?.restoreCurrentRoute === "function") {
      try {
        window.RevistaDigital.routes.restoreCurrentRoute();
      } catch (error) {
        console.warn("RevistaDigital: no se pudo restaurar la ruta.", error);
      }
      return;
    }

    if (typeof window.renderPage === "function") {
      try {
        window.renderPage();
      } catch (error) {
        console.warn("RevistaDigital: renderPage no pudo ejecutarse.", error);
      }
    }

    if (typeof window.RevistaDigital.location?.startNearbyContextWatch === "function") {
      try {
        window.RevistaDigital.location.startNearbyContextWatch();
      } catch (error) {
        console.warn("RevistaDigital: no se pudo iniciar la detección contextual.", error);
      }
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", app.start);
  } else {
    app.start();
  }

  window.RevistaDigital.app = app;
})();
