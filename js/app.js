(function () {
  window.RevistaDigital = window.RevistaDigital || {};

  const app = window.RevistaDigital.app || {};

  app.name = "Revista Digital";
  app.version = "compat";

  app.start = function () {
    if (typeof window.renderPage === "function") {
      try {
        window.renderPage();
      } catch (error) {
        console.warn("RevistaDigital: renderPage no pudo ejecutarse.", error);
      }
    }

    if (typeof window.syncBookRoute === "function") {
      try {
        window.syncBookRoute(window.RevistaDigital.state?.currentIndex ?? 0);
      } catch (error) {
        console.warn("RevistaDigital: syncBookRoute no pudo ejecutarse.", error);
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
