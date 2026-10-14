(function () {
  'use strict';
  window.RevistaDigital = window.RevistaDigital || {};
  var portal = window.RevistaDigital.portal || {};
  var state = function () { return window.RevistaDigital.state; };
  function slugify(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'hotel';
  }
  function renderHome() {
    var container = document.getElementById('contenido') || document.getElementById('bookShell') || document.querySelector('.book-shell');
    if (!container) return;
    var menus = state().hotelCountryMenus || {};
    var countries = Object.keys(menus).map(function (key) {
      return { key: key, name: menus[key].name || key, hotels: menus[key].hotels || [] };
    });
    var totalHoteles = countries.reduce(function (sum, c) { return sum + (c.hotels ? c.hotels.length : 0); }, 0);
    var html = '<main class="portal-app"><section class="portal-hero"><div class="portal-hero-content"><p class="portal-kicker">IBEROSTAR THE CLUB</p><h1 class="portal-title">Encuentra tu próximo destino</h1><p class="portal-subtitle">Viaja a tu manera</p></div></section><section class="portal-section"><div class="portal-section-heading"><h2>Destinos y hoteles</h2><p>' + totalHoteles + ' hoteles disponibles</p></div><div class="portal-country-grid">';
    countries.forEach(function (country) {
      var hotels = country.hotels || [];
      html += '<article class="portal-country-card" data-country="' + country.key + '"><header><h3>' + country.name + '</h3><p>' + hotels.length + (hotels.length === 1 ? ' hotel' : ' hoteles') + '</p></header><div class="portal-hotel-list">';
      hotels.slice(0, 4).forEach(function (hotel) {
        var name = hotel.name || '';
        var hslug = slugify(name);
        html += '<a href="#/hoteles/' + country.key + '/' + hslug + '" class="portal-hotel-link">' + name + '</a>';
      });
      if (hotels.length > 4) html += '<a href="#/hoteles/' + country.key + '" class="portal-more">Ver todos</a>';
      html += '</div></article>';
    });
    html += '</div></section></main>';
    container.innerHTML = html;
  }
  function renderApp(route) {
    var r = route || (typeof getAppRoute === 'function' ? getAppRoute() : (window.location.hash ? window.location.hash.replace(/^#/, '') : window.location.pathname));
    var norm = (r || '/').replace(/\/+$/, '') || '/';
    if (norm === '/' || norm === '/destinos' || norm === '/home') {
      if (typeof renderHome === 'function') return renderHome();
    }
    if (typeof window.renderPage === 'function') window.renderPage();
  }
  portal.renderHome = renderHome;
  portal.renderDestinos = renderHome;
  portal.renderApp = renderApp;
  window.RevistaDigital.portal = portal;
})();
