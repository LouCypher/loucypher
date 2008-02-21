var FoxieWire = {

  isValidScheme: function foxiewire_isValidScheme(aProtocol) {
    var reg = new RegExp("^https?|^ftp", "i");
    return reg.test(aProtocol);
  },

  submit: function foxiewire_submit(aURL) {
    if (this.isValidScheme(aURL)) {
      gBrowser.loadOneTab("http://www.foxiewire.com/submit.php?url=" +
                          encodeURIComponent(aURL) +
                          "&sourceid=FoxieWire+Extension")
    } else {
      var STRINGS = document.getElementById("foxiewire-strings");
      var scheme = [aURL.match(/^\S[^\:]+\:/).toString()];
      var string = STRINGS.getFormattedString("invalidScheme", scheme);

      var PROMPTS = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                              .getService(Components.interfaces.nsIPromptService);
      PROMPTS.alert(null, "FoxieWire", string);
    }
  },

  setStatus: function foxiewire_setStatus(aString) {
    document.getElementById("statusbar-display").label = aString;
  },

  initContext: function foxiewire_initContext(aEvent) {
    gContextMenu.showItem("context-foxiewire-link",
                          gContextMenu.onLink &&
                          this.isValidScheme(gContextMenu.linkProtocol));

    gContextMenu.showItem("context-foxiewire-page",
                          !(gContextMenu.isContentSelected ||
                            gContextMenu.onTextInput ||
                            gContextMenu.onLink ||
                            gContextMenu.onImage) &&
                          this.isValidScheme(content.document
                                                    .location.protocol));

    gContextMenu.showItem("context-foxiewire-frame",
                          gContextMenu.inFrame &&
                          this.isValidScheme(gContextMenu.target
                                                          .ownerDocument
                                                          .location.protocol));
  },

  init: function foxiewire_init(aEvent) {
    var cm = document.getElementById("contentAreaContextMenu");
    cm.addEventListener("popupshowing", function(e) {
      FoxieWire.initContext(e);
    }, false);
  }
}

window.addEventListener("load", FoxieWire.init, false);

