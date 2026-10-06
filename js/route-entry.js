const scriptUrl = document.currentScript?.src || "";
const projectBase = scriptUrl
  ? new URL("../", scriptUrl)
  : new URL("/", window.location.href);

const target = new URL(projectBase.href);
target.searchParams.set("route-entry", window.location.pathname);
window.location.replace(target.href);