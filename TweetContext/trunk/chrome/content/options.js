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

const Cc = Components.classes;
const Ci = Components.interfaces;

Components.utils.import("resource://gre/modules/AddonManager.jsm");

function $(aSelector) {
  return document.querySelector(aSelector);
}

function $all(aSelector) {
  return document.querySelectorAll(aSelector);
}

let prefService = Cc["@mozilla.org/preferences-service;1"].
                  getService(Ci.nsIPrefService).
                  getBranch("extensions.TweetContext.");

function getBoolPref(aPrefString) {
  return prefService.getBoolPref(aPrefString);
}

function getIntPref(aPrefString) {
  return prefService.getIntPref(aPrefString);
}

function disableEchofon(aAddon) {
  let echofonEnable = null;
  try {
    echofonEnable = aAddon.isActive;
  } catch(ex) {
    echofonEnable = false;
  }
  $("#tweetcontext-echofon").hidden = echofonEnable;
  $("#echofon-options").hidden = !echofonEnable;
  $("#echofon").disabled = !echofonEnable;
}

function disableHootBar(aAddon) {
  let hootbarEnable = null;
  try {
    hootbarEnable = aAddon.isActive;
  } catch(ex) {
    hootbarEnable = false;
  }
  $("#tweetcontext-hootbar").hidden = hootbarEnable;
  $("#hootbar-options").hidden = !hootbarEnable;
  $("#hootbar").disabled = !hootbarEnable;
}

function disableTwitter(aBoolean) {
  let checkbox = $all("#twitter-options checkbox");
  for (var i = 0; i < checkbox.length; i++) {
    checkbox[i].disabled = aBoolean;
  }
  //$("#echofon-options").disabled = !aBoolean;
  //$("#hootbar-options").disabled = !aBoolean;
}

function getAddon(aAddonId, aCallback) {
  AddonManager.getAddonByID(aAddonId, aCallback);
}

function getMostRecentWindow(aWinType) {
  return Cc["@mozilla.org/appshell/window-mediator;1"].
         getService(Ci.nsIWindowMediator).getMostRecentWindow(aWinType);
}

function getWindowEnumerator() {
  return Cc["@mozilla.org/embedcomp/window-watcher;1"].
         getService(Ci.nsIWindowWatcher).getWindowEnumerator();
}

function openURL(aURL) {
  let win = getMostRecentWindow("navigator:browser");
  let browser = win.gBrowser;
  if ((browser.mCurrentBrowser.currentURI.spec == "about:blank") &&
      !browser.mIsBusy) {
    browser.loadURI(aURL);
  } else {
    browser.loadOneTab(aURL, null, null, null, false);
  }
}

function openPrefs(aAddon) {
  let optionsURL = aAddon.optionsURL;
  switch (optionsURL) {
    case "chrome://hootbar/content/options.xul":
      let index = 1;
      let em = Cc["@mozilla.org/embedcomp/window-watcher;1"].
               getService(Ci.nsIWindowWatcher).getWindowEnumerator();
      while (em.hasMoreElements()) {
        let win = em.getNext();
        if (win.document.documentElement.id == "twitterbar-preference-window") {
          win.focus();
          return;
        }
      }
      index++;
      break;
    case "chrome://echofon/content/preferences/preferences.xul":
      let win = getMostRecentWindow("Echofon:preferences");
      if (win) {
        win.focus();
        return;
      }
  }
  window.openDialog(optionsURL, "",
                    "chrome, dialog=yes, titlebar, toolbar, " +
                    "centerscreen, resizable=no");
}

function onLoad() {
  getAddon("twitternotifier@naan.net", disableEchofon);
  getAddon("{1a0c9ebe-ddf9-4b76-b8a3-675c77874d37}", disableHootBar);
  disableTwitter((getIntPref("useAddon") > 0) &&
                 (getBoolPref("enableEchofon") ||
                  getBoolPref("enableHootBar")));
}

window.addEventListener("load", onLoad, false);
window.removeEventListener("unload", onLoad, false);