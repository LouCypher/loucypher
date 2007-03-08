var SaveURLBar = {
  get useCache() {
    return nsPreferences.getBoolPref("extensions.saveURLBar.useCache");
  },

  init: function saveURLBar_init() {
    var gURLBar = document.getElementById("urlbar");
    if (!gURLBar) return;
    gURLBar.addEventListener("popupshowing", SaveURLBar.addItem, false);
  },

  saveURL: function saveURLBar_saveURL() {
    var url = gURLBar.value;
    var stringBundle = document.getElementById("saveURLBar-strings");
    var ioService = Components.classes["@mozilla.org/network/io-service;1"]
                              .getService(Components.interfaces
                                                    .nsIIOService);
    try {
      var validURL = ioService.newURI(url, null, null);
    } catch(ex) {
      alert(stringBundle.getString("msgEnterValidURL"));
      return;
    }
    saveURL(url, "", null, this.useCache, false, null);
  },

  addItem: function saveURLBar_addItem(aEvent) {
    var stringBundle = document.getElementById("saveURLBar-strings");
    var itemLabel = stringBundle.getString("itemLabel");
    var itemKey = stringBundle.getString("itemKey");
    var itemId = "saveurlbar-item";
    var separatorId = "saveurlbar-separator";
    if (aEvent.originalTarget.localName == "menupopup" &&
        aEvent.originalTarget.parentNode.className == "textbox-input-box" &&
        !document.getElementById(itemId)) {
      var sep = document.createElement("menuseparator");
      sep.id = separatorId;
      var mi = document.createElement("menuitem");
      mi.setAttribute("id", itemId);
      mi.setAttribute("label", itemLabel);
      mi.setAttribute("accesskey", itemKey);
      mi.setAttribute("oncommand", "SaveURLBar.saveURL();");
      aEvent.originalTarget.appendChild(sep);
      aEvent.originalTarget.appendChild(mi);
    }
  }
}

window.addEventListener("load", SaveURLBar.init, false);

