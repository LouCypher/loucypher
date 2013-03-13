function showError() {
  if ((document.querySelector("link[rel='canonical']").href === "/post/") &&
      (location.pathname !== '/ask')) {
    document.documentElement.classList.add("error-404");
  }
}