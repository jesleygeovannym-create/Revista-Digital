(function () {
  const parameters = new URLSearchParams(window.location.search);

  if (parameters.has("standalone")) return;

  const target = new URL("/", window.location.href);
  target.searchParams.set("route-entry", window.location.pathname);
  window.location.replace(target.href);
})();