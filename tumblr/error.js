function showError() {
  if (/\/post\/$/.test(document.querySelector("link[rel='canonical']").href)
      && (location.pathname !== '/ask')) {
    document.documentElement.classList.add("error-404");
  }
}