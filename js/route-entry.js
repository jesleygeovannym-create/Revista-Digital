const scriptUrl = document.currentScript?.src || "";
const projectBase = scriptUrl
  ? new URL("../", scriptUrl)
  : new URL("/", window.location.href);

const target = new URL(projectBase.href);
const projectBasePath = projectBase.pathname.replace(/\/+$/, "");
let routePath = window.location.pathname;
if (projectBasePath && routePath.startsWith(`${projectBasePath}/`)) {
  routePath = routePath.slice(projectBasePath.length);
}
target.searchParams.set("route-entry", routePath || "/");
window.location.replace(target.href);
