/*
  Version: MPL 1.1/GPL 2.0/LGPL 2.1

  The contents of this file are subject to the Mozilla Public License
  Version 1.1 (the "License"); you may not use this file except in
  compliance with the License. You may obtain a copy of the License at
  http://www.mozilla.org/MPL/

  Software distributed under the License is distributed on an "AS IS" basis,
  WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
  for the specific language governing rights and limitations under the
  License.

  The Original Code is Tweet Context extension.

  The Initial Developer of the Original Code is LouCypher.
  Portions created by the Initial Developer are Copyright (C) 2011
  the Initial Developer. All Rights Reserved.

  Contributor(s) (alphabetical order):
  - LouCypher <loucypher@mozillaca.com>

  Alternatively, the contents of this file may be used under the terms of
  either the GNU General Public License Version 2 or later (the "GPL"), or
  the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
  in which case the provisions of the GPL or the LGPL are applicable instead
  of those above. If you wish to allow use of your version of this file only
  under the terms of either the GPL or the LGPL, and not to allow others to
  use your version of this file under the terms of the MPL, indicate your
  decision by deleting the provisions above and replace them with the notice
  and other provisions required by the GPL or the LGPL. If you do not delete
  the provisions above, a recipient may use your version of this file under
  the terms of any one of the MPL, the GPL or the LGPL.
*/

var TweetContext = {

  init: null,

  toString: function() {
    return "Tweet Context";
  },

  get prefBranch() {
    return Services.prefs.getBranch("extensions.TweetContext.");
  },

  getPref: function tweetContext_getPref(aPrefString) {
    return this.prefBranch.getBoolPref(aPrefString);
  },

  setPref: function tweetContext_setPref(aPrefString, aPrefBoolValue) {
    return this.prefBranch.setBoolPref(aPrefString, aPrefBoolValue);
  },

  get intro() {
    return this.getPref("intro")
           ? "&related=" +
             encodeURIComponent("zoolcar9:Tweet Context developer")
           : "";
  },

  alert: function tweetContext_alert(aString) {
    Services.prompt.alert(null, "Tweet Context", aString);
  },

  isValidScheme: function tweetContext_isValidScheme(aURL) {
    return /^(https?|ftp)/i.test(aURL);
  },

  getParam: function tweetContext_getParam(aStr) {
    return aStr ? aStr : "";
  },

  share: function tweetContext_share(aText, aURL) {
    var strings = document.getElementById("tweetcontext-strings");
    if (aURL && !this.isValidScheme(aURL)) {
      this.alert(strings.getString("invalid_url"));
      return;
    }

    let url = this.getParam(aURL);
    let text = this.getParam(aText)

    if (this.getPref("useEchofon") &&
        (typeof gEchofon == "object") && ("insertURL" in gEchofon)) {

      // Use Echofon if available
      if (aText && aURL) {
        gEchofon.insertURL(text + " " + url);
      } else {
        gEchofon.toggleWindow();
      }

    } else {

      // Open Twitter Share page
      let tweetURL = (this.getPref("https")
                      ? "https" : "http") +
                      "://twitter.com/share?" + this.intro +
                      ((aURL && aText)
                        ? "&url=" + encodeURIComponent(url) +
                          "&text=" + encodeURIComponent(text)
                        : "");

      if (this.getPref("openInTab")) {

        // Open in new tab
        gBrowser.loadOneTab(tweetURL, null, null, null, false);

      } else {

        // Open in new window
        window.open(tweetURL,
                    "twitter_share",
                    "width=600, height=400, toolbar=no, location=yes, " +
                    "dialog, minimizable, resizable");
      }

      this.setPref("intro", false);

    }
  },

  setTooltip: function tweetContext_setTooltip(aNode, aTitle, aURL) {
    aNode.tooltipText = aTitle + "\n" + aURL;
  },

  openPref: function tweetContext_openPref() {
    var wenum = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
                          .getService(Components.interfaces.nsIWindowWatcher)
                          .getWindowEnumerator();

    var index = 1;
    while (wenum.hasMoreElements()) {
      var win = wenum.getNext();
      if (win.name == "tweetcontext-options") {
        win.focus();
        return;
      }
      index++
    }

    openDialog("chrome://tweetcontext/content/options.xul",
               "tweetcontext-options",
               "chrome, dialog=no, close, titlebar, centerscreen");
  }
}
