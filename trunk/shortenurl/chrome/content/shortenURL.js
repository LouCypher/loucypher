/*
  Version: MPL 1.1/GPL 2.0/LGPL 2.1

  The contents of this file are subject to the Mozilla Public License Version
  1.1 (the "License"); you may not use this file except in compliance with
  the License. You may obtain a copy of the License at
  http://www.mozilla.org/MPL/

  Software distributed under the License is distributed on an "AS IS" basis,
  WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
  for the specific language governing rights and limitations under the
  License.

  The Original Code is Shorten URL extension

  The Initial Developer of the Original Code is LouCypher.
  Portions created by the Initial Developer are Copyright (C) 2008
  the Initial Developer. All Rights Reserved.

  Contributor(s):
  - LouCypher <me@loucypher.mp>

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

var ShortenURL = {

  get prefService() {
    return Cc["@mozilla.org/preferences-service;1"]
             .getService(Ci.nsIPrefBranch)
             .getBranch("extensions.shortenURL.");
  },

  get JSON() {
    return Cc["@mozilla.org/dom/json;1"].createInstance(Ci.nsIJSON);
  },

  get strings() {
    return document.getElementById("shorten-url-strings");
  },

  get baseNum() {
    return this.prefService.getIntPref("baseURL");
  },

  get autoCopy() {
    return this.prefService.getBoolPref("autocopy");
  },

  get autoTweet() {
    return this.prefService.getBoolPref("autotweet");
  },

  setStatus: function shortenURL_setStatus(aString) {
    document.getElementById("statusbar-display").label = aString;
  },

  alert: function shortenURL_alert(aString) {
    Cc["@mozilla.org/embedcomp/prompt-service;1"]
      .getService(Ci.nsIPromptService)
      .alert(null, "Shorten URL", aString);
  },

  isValidScheme: function shortenURL_isValidScheme(aProtocol) {
    var reg = new RegExp("^https?", "i");
    return reg.test(aProtocol);
  },

  getBaseURL: function shortenURL_getBaseURL(aBaseNum) {
    try {
      return this.prefService.getCharPref(aBaseNum);
    } catch(ex) {
      return this.prefService.getCharPref(0);
    }
  },

  copy: function shortenURL_copy(aString) {
    Cc["@mozilla.org/widget/clipboardhelper;1"]
      .getService(Ci.nsIClipboardHelper).copyString(aString);
  },

  tweet: function shortenURL_tweet(aString) {
    /*if (typeof TWITTERBAR == "object") {
      gURLBar.value = aString;
      TWITTERBAR.post(true);
    } else*/ if ((typeof gTwitterNotifier == "object") &&
        (gTwitterNotifier._util.accounts) &&
        (gTwitterNotifier._util.pref().getBoolPref("login"))) {
      var t = gTwitterNotifier.$("twitternotifier-message-input");
      t.setAttribute("rows", 5);
      t.setAttribute("multiline", true);
      gTwitterNotifier._util.notify("getRecent", {type: "timeline"});
      t.value = aString;
      t.focus();
    } else {
      gBrowser.loadOneTab("http://twitter.com/home/?status=" + aString +
                          "&source=shortenurl", null, null, null, false);
    }
  },

  isURLof: function shortenURL_isURLIndexOf(aURL, aString) {
    return aURL.indexOf(aString) > -1;
  },

  prefDialog: function tabSession_openPrefs() {
    openDialog("chrome://shortenurl/content/options.xul",
               "shortenurl-options",
               "chrome, dialog, centerscreen");
  },

  showShortenURL: function shortenURL_showShortenURL(aURL) {
    if (window.fullScreen) {
      FullScreen.mouseoverToggle(true);
    }
    if (focusAndSelectUrlBar()) {
      gURLBar.value = aURL;
      gURLBar.focus();
      return;
    }
    openDialog("chrome://browser/content/openLocation.xul",
               "_blank", "chrome, modal, titlebar",
               window, aURL);
  },

  shorten: function shortenURL_shorten(aURL, aBaseNum) {
    var url = aURL != undefined ? aURL : content.location.href;
    if (!this.isValidScheme(url)) {
      this.alert(this.strings.getString("invalid_url"));
      return;
    }

    var baseNum = aBaseNum != undefined ? aBaseNum : this.baseNum;
    var baseURL = this.getBaseURL(baseNum);
    try {
      var req = new XMLHttpRequest();
      req.open("GET", baseURL + (this.isURLof(baseURL, "a.gd")
                      ? encodeURIComponent(url) : url),
               false);
      req.send(null);

      if (req.status == 200) {
        var shortenURL = "";
        if (this.isURLof(baseURL, "pipes.yahoo.com")) {
          shortenURL = this.JSON.decode(req.responseText).value.items[0].link;
        } else if (this.isURLof(baseURL, "tr.im")) {
          shortenURL = this.JSON.decode(req.responseText).url;
        } else if (this.isURLof(baseURL, "digg.com")) {
          shortenURL = this.JSON.decode(req.responseText)
                           .shorturls[0].short_url;
        } else if (this.isURLof(baseURL, "zipmyurl.com")) {
          shortenURL = "http://zipmyurl.com/" +
                        this.JSON.decode(req.responseText).zipURL;
        } else if (this.isURLof(baseURL, "xrl.in")) {
          shortenURL = "http://xrl.in/" + req.responseText;
        } else if (this.isURLof(baseURL, "lin.cr")) {
          shortenURL = "http://lin.cr/" + req.responseText;
        } else {
          shortenURL = req.responseText;
        }

        if (shortenURL.indexOf("http") == 0) {
          if (this.isURLof(shortenURL, "snurl.com")) {
            shortenURL = shortenURL.replace(/snurl\.com/, "sn.im");
          }

          if (this.autoCopy) {
            this.copy(shortenURL);
          }

          if (this.autoTweet) {
            this.tweet(shortenURL);
          }

          this.showShortenURL(shortenURL);
          this.setStatus(shortenURL);

          if (shortenURL.length > url.length) {
            this.alert(this.strings.getFormattedString("is_shorter",
                                                       [url, shortenURL]));
          }
          return;

        }
      }
    } catch(ex) {}
    this.alert(this.strings.getString("shorten_fail"));
  },

  initContext: function shortenURL_initContext() {
    gContextMenu.showItem("context-shorten-linkURL",
                          gContextMenu.onLink &&
                          this.isValidScheme(gContextMenu.linkProtocol));

    gContextMenu.showItem("context-shorten-pageURL",
                          !(gContextMenu.isContentSelected ||
                            gContextMenu.onTextInput ||
                            gContextMenu.onLink ||
                            gContextMenu.onImage) &&
                          this.isValidScheme(content.document.
                                             location.protocol));

    gContextMenu.showItem("context-shorten-frameURL",
                          gContextMenu.inFrame &&
                          this.isValidScheme(gContextMenu.target.
                                             ownerDocument.location.protocol));

  },

  onLoad: function shortenURL_onLoad() {
    var cm = document.getElementById("contentAreaContextMenu");
    cm.addEventListener("popupshowing", function() {
      ShortenURL.initContext();
    }, false);
  }

}

window.addEventListener("load", ShortenURL.onLoad, false);

