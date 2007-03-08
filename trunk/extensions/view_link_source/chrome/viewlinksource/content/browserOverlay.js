var viewLinkSource = {
  open: function(aEvent) {
    var url = gContextMenu.linkURL;
    if(aEvent) {
      aEvent.stopPropagation();
      switch(aEvent.button) {
        case 1: //middle click
          var newTab = gBrowser.addTab("view-source:" + url); //view source in new tab
          if(!nsPreferences.getBoolPref("browser.tabs.loadInBackground"))
            gBrowser.selectedTab = newTab;  //focus new tab
          break;
        case 2: //right click
          openWebPanel(url, "view-source:" + url); //view source in sidebar
      }
      closeMenus(aEvent.target);
    } else {
      if(typeof gViewSourceUtils == 'object') //if Firefox 2.0
        ViewSourceOfURL(url);
      else
        BrowserViewSourceOfURL(url);
    }
  },

  initItem: function() {
    var schemes = "https?|ftp|file|data|resource|chrome|about|jar";
    var regScheme = new RegExp(schemes, "i");
    var isLinkViewable = regScheme.test(gContextMenu.linkProtocol);
    gContextMenu.showItem("context-viewlinksource", gContextMenu.onLink && isLinkViewable);
  },

  initPopup: function() {
    var cm = document.getElementById("contentAreaContextMenu");
    cm.addEventListener("popupshowing", viewLinkSource.initItem, false);
  }
}

window.addEventListener("load", viewLinkSource.initPopup, false);

