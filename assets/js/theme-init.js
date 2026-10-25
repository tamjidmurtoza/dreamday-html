/*=================================================
  Theme Init Function
 ===================================================*/
(function () {
  var root = document.documentElement;
  root.classList.remove("no-js");

  function read(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  try {
    var params = new URLSearchParams(location.search);
    var theme = params.get("theme") || read("dreamday-theme") || "system";
    var prefersDark = window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
    if (theme === "dark" || (theme !== "light" && prefersDark)) {
      root.setAttribute("data-theme", "dark");
    }

    var dir = params.get("dir") || read("dreamday-dir");
    if (dir === "rtl") root.setAttribute("dir", "rtl");
  } catch (e) {
  }
})();
