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
  places: null,

  toString: function() {
    return "Tweet Context";
  },

  get stringBundle() {
    return document.getElementById("tweetcontext-strings");
  },

  get prefBranch() {
    return Services.prefs.getBranch("extensions.TweetContext.");
  },

  getBoolPref: function tweetContext_getBoolPref(aPrefString) {
    return this.prefBranch.getBoolPref(aPrefString);
  },

  getIntPref: function tweetContext_getIntPref(aPrefString) {
    return this.prefBranch.getIntPref(aPrefString);
  },

  setPref: function tweetContext_setPref(aPrefString, aPrefBoolValue) {
    return this.prefBranch.setBoolPref(aPrefString, aPrefBoolValue);
  },

  get intro() {
    return this.getBoolPref("intro")
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

  getSelection: function tweetContext_getSelection(aChars) {
//@https://addons.mozilla.org/en-US/firefox/files/browse/106796/file/chrome/content/contextsearch.js#L109
    let focusedElement = document.commandDispatcher.focusedElement;
    let selectedText = null;

    // Check if the focused element is an input element (input/textarea)
    let isTextInputNode;
    try {
      isTextInputNode = (focusedElement instanceof HTMLInputElement &&
                         focusedElement.type == "text") ||
                         focusedElement instanceof HTMLTextAreaElement;
    } catch(ex) {
      isTextInputNode = false;
    }

    // Check if texts are selected in an element
    let textSelectedInNode;
    try {
      textSelectedInNode = focusedElement.selectionStart < focusedElement.selectionEnd;
    } catch(ex) {
      textSelectedInNode = false;
    }

    // get text selection from input node
    if (isTextInputNode && textSelectedInNode) {
      let startPos = focusedElement.selectionStart;
      let endPos = focusedElement.selectionEnd;
      if (aChars && aChars < endPos - startPos) {
        endPos = startPos + (aChars <= 150 ? aChars : 150);
      }
      selectedText = focusedElement.value.substring(startPos, endPos);
    }
    return isTextInputNode ? selectedText : content.getSelection();
  },

  useTwitter: function tweetContext_useTwitter(aText, aURL) {
    let url = this.getParam(aURL);
    let text = this.getParam(aText);

    let tweetURL = (this.getBoolPref("https") ? "https" : "http") +
                    "://twitter.com/share?" + this.intro +
                    "&url=" + encodeURIComponent(url) +
                    "&text=" + encodeURIComponent(text);
    if (this.getBoolPref("openInTab")) {
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
  },

  share: function tweetContext_share(aText, aURL) {
    if (aURL && !this.isValidScheme(aURL)) {
      this.alert(this.stringBundle.getString("invalid_url"));
      return;
    }

    let url = this.getParam(aURL);
    let text = this.getParam(aText);

    switch (this.getIntPref("useAddon")) {
      case 2: // use HootBar
        if (typeof TWITTERBAR != "object") {
          this.useTwitter(text, url);
          return;
        }
        if (aText || aURL) {
          if (TWITTERBAR.prefs.getBoolPref("confirm")) {
            if (!TWITTERBAR.confirmPost()) return;
          }
          TWITTERBAR_UI.setBusy(true);
          TWITTERBAR.startPost(text + " " + url);
        } else {
          gURLBar.value = this.stringBundle.getString("tweet_anything");
          gURLBar.focus();
        }
        break;

      case 1: // use Echofon
        if (typeof EchofonCommon != "object") {
          this.useTwitter(text, url);
          return;
        }

        if (EchofonCommon.pref().getBoolPref("login") == false ||
            EchofonCommon.pref().getIntPref("activeUserId") == 0) {
          var accounts = EchofonCommon.pref().getCharPref("accounts");
          if (EchofonCommon.pref().getIntPref("activeUserId") == 0 &&
              accounts == "{}") {
            EchofonCommon.openPreferences();
            return;
          }
          EchofonCommon.pref().setBoolPref("login", true);
          if (EchofonCommon.pref().getIntPref("activeUserId") == 0) {
            EchofonCommon.pref().setIntPref("activeUserId",
                                            EchofonAccountManager.
                                            instance().
                                            getPrimaryAccount());
          }
          EchofonCommon.notify("initSession");
        }

        if (aText || aURL) {
          let loc = document.getElementById("identity-box");
          EchofonCommon.openComposeWindow(loc, text + " " + url, false);
        } else {
          EchofonOverlay.toggleWindow();
        }
        break;

      default: this.useTwitter(text, url);
    }
  },

  setTooltip: function tweetContext_setTooltip(aNode, aTitle, aURL) {
    aNode.tooltipText = aTitle + (aURL ? ("\n" + aURL) : "");
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
  },

  checkAddon: function tweetContext_checkAddon(aAddonId, aPrefBranch) {
    AddonManager.getAddonByID(aAddonId,
      function(aAddon) {
        try {
          TweetContext.setPref(aPrefBranch, aAddon.isActive);
        } catch(ex) {
          TweetContext.setPref(aPrefBranch, false);
        }
      }
    )
  }
}
