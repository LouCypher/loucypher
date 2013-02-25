function showError() {
  if (/^Not Found/.test(document.querySelector("meta[name='description']").content)) {
    document.querySelector("article#post-").classList.addClass("error-404");
  }
}