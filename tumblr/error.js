function showError() {
  if (/\/(post\/|ask)$/.test(document.querySelector("link[rel='canonical']").href)) {
    document.documentElement.classList.add("error-404");
  }
}