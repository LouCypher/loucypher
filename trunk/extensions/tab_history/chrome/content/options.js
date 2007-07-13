var thConfig = {
  get prefs() {
    return Components.classes["@mozilla.org/preferences-service;1"]
                     .getService(Components.interfaces.nsIPrefBranch)
                     .getBranch("extensions.TabHistory.");
  },

  disableBaFo: function(aBoolean) {
    var id = ["extensions.TabHistory.showMenu.contentBack-check",
              "extensions.TabHistory.showMenu.contentForward-check"];
    var checkbox;
    for (var i in id) {
      checkbox = document.getElementById(id[i]);
      checkbox.disabled = aBoolean;
    }
  },

  setLastTab: function(aNode) {
    this.prefs.setIntPref("options.lastTab", aNode.parentNode.selectedIndex);
  },

  getLastTab: function() {
    try {
      return this.prefs.getIntPref("options.lastTab");
    } catch(ex) {
      return 0;
    }
  },

  init: function() {
    var allowHidingContent = this.prefs.getBoolPref("allowHidingContentBackForward");
    this.disableBaFo(!allowHidingContent);

    var tabbox = document.getElementsByTagName("tabbox")[0];
    tabbox._tabs.selectedIndex = this.getLastTab();
  }
}

