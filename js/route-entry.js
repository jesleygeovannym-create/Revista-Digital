const scriptUrl = document.currentScript?.src || window.location.href;
const projectBase = new URL("../", scriptUrl);
const target = new URL(projectBase.href);
const projectBasePath = decodeURIComponent(projectBase.pathname).replace(/\/+$/, "");
const projectBasePathRaw = projectBase.pathname.replace(/\/+$/, "");

function normalizeRoutePath(pathname) {
  let value = String(pathname || "/").replace(/\\/g, "/");

  for (const root of [projectBasePath, projectBasePathRaw]) {
    if (root && value.startsWith(root)) {
      value = value.slice(root.length) || "/";
      break;
    }
  }

  value = value.replace(/\/index\.html$/i, "");
  value = value.replace(/\/+$/, "") || "/";
  if (!value.startsWith("/")) value = `/${value}`;
  return value;
}

let routePath = normalizeRoutePath(window.location.pathname);
try {
  routePath = decodeURIComponent(routePath);
} catch {
  // Keep the original path if it contains malformed percent escapes.
}
const legacyRouteAliases = {
  "/hoteles/mexico/iberostar-selection-cancun/iberostar selection cancún": "/hoteles/mexico/iberostar-selection-cancun",
  "/hoteles/mexico/iberostar-selection-cancun/iberostar selection coral cancún": "/mexico/cancun/iberostar-selection-coral-cancun"
};
routePath = legacyRouteAliases[routePath.toLocaleLowerCase("es")] || routePath;
target.searchParams.set("route-entry", routePath || "/");
window.location.replace(target.href);
