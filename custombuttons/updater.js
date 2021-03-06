////////////////////////////////////////////////////////////////////////////
/////////////////////////// Start Button updater ///////////////////////////

/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0
 *
 * The contents of this file are subject to the Mozilla Public License
 * Version 1.1 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/1.1/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * Original code is Button Updater for Custom Buttons extension
 *
 * The Initial Developer of the Original Code is LouCypher.
 * Portions created by the Initial Developer are Copyright (C) 2011
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 * - LouCypher: original code
 *
 * Alternatively, the contents of this file may be used under the terms of
 * the GNU General Public License Version 2 or later (the "GPL"), in which
 * case the provisions of the GPL are applicable instead of those above.
 *
 * ***** END LICENSE BLOCK ***** */

this.updater = {
  btnClick: self.onclick,
  btnType: self.type,
  btnImage: self.image,
  btnTooltip: self.tooltipText,

  baseURL: "https://loucypher.googlecode.com/svn/custombuttons/xml/",

  get updateURL() {
    return this.baseURL + encodeURIComponent(self.name.replace(/(\/|:)/g, "-"))
                        + ".xml";
  },

  openUpdateURL: function updater_openUpdateURL() {
    switchToTabHavingURI(this.updateURL);
  },

  get stdIcon() {
    var stdIcon = parseInt(self.cbStdIcon.match(/\d/));
    switch (stdIcon) {
       case 4: return "chrome://custombuttons/skin/stdicons/bbutton.png";
       case 3: return "chrome://custombuttons/skin/stdicons/gbutton.png";
       case 2: return "chrome://custombuttons/skin/stdicons/rbutton.png";
      default: return "chrome://custombuttons/skin/button.png";
    }
  },

  get bsyIcon() {
    switch (Application.id) {
      case "{ec8030f7-c20a-464f-9b0e-13a3a9e97384}":
        if (Application.version >= "4") {
          return "chrome://browser/skin/tabbrowser/connecting.png";
        } else {
          return "chrome://global/skin/icons/loading_16.png";
        }
      case "{92650c4d-4b8e-4d2a-b7eb-24ecf4f6b63a}":
        return "chrome://communicator/skin/icons/loading.gif";
      default:
        return "chrome://global/skin/icons/loading_16.png";
    }
  },

  // DOM parser
  makeXML: function makeXML(aXMLString) {
    return (new DOMParser).parseFromString(aXMLString, "application/xml")
                          .documentElement;
  },

  // Check if the URI is Custom Button URI (custombutton://...)
  isValidCbURI: function updater_isValidCbURI(aURL) {
    if (!aURL) return false;
    return /^custombutton\:\/\//.test(aURL);
  },

  // Convert 'custombutton:' URI to DOM
  convertURItoDOM: function updater_convertURItoDOM(aURL) {
    if (!this.isValidCbURI(aURL)) {
      custombuttons.alertBox(self.name, "Not a Custom Buttons link!");
      return;
    }
    var string = unescape(aURL.replace(/^custombutton\:\/\//, "").toString());
    var parser = new DOMParser();
    var dom = parser.parseFromString(string, "text/xml");
    if (dom.documentElement.nodeName == "parsererror") {
      return null;
    } else {
      return dom.documentElement;
    }
  },

  // Get value from XML element
  getParamValue: function updater_getParamValue(aDocument, aNodeName) {
    var node = aDocument.querySelector(aNodeName);
    if (!node) return "";
    if (!node.firstChild || (node.firstChild &&
        (node.firstChild.nodeType == node.TEXT_NODE))) {
      return node.textContent;
    } else {
      return node.firstChild.textContent;
    }
  },

  // Set button parameters from XML alement
  getButtonParameters: function updater_getButtonParameters(aButtonLink, aURL) {
    var dom = this.convertURItoDOM(aURL);
    var params = custombuttons.cbService.getButtonParameters(aButtonLink)
                                        .wrappedJSObject;
    params.name             = this.getParamValue(dom, "name")
    params.date             = this.getParamValue(dom, "date") || "";
    params.image            = this.getParamValue(dom, "image") ||
                              this.getParamValue(dom, "stdicon");
    params.code             = this.getParamValue(dom, "code")
    params.initCode         = this.getParamValue(dom, "initcode")
    params.help             = this.getParamValue(dom, "help")
    params.accelkey         = this.getParamValue(dom, "accelkey")
    params.mode             = this.getParamValue(dom, "mode")
    params.wrappedJSObject  = params;
    return params;
  },

  // Reset button attribute if user click the button during update
  resetAttributes: function updater_resetAttributes() {
    self.image = this.btnImage;
    self.tooltipText = self.name;
    self.removeAttribute("busy");
    self.onclick = this.btnClick;
    self.type = this.btnType;
    self.tooltipText = this.btnTooltip;
  },

  // Check button for update
  checkForUpdate: function updater_checkForUpdate(aCallback) {
    if (!navigator.onLine) {                // If browser is in offline mode
                                            // ask to switch to online
      var online = custombuttons.confirmBox(self.name,
                             "Firefox is currently in offline mode.\n"
                           + "Switch to online mode and try again?",
                             "Yes", "No");
      if (!online) return;
      BrowserOffline.toggleOfflineStatus(); // switch to online
    }

    var url = this.updateURL + "?" + Date.now();
    var req = new XMLHttpRequest();
    req.open("GET", url, true);
    if (self.hasAttribute("busy")) {
      this.resetAttributes();
      return
    }
    var updater = this;
    req.onreadystatechange = function (aEvent) {
      self.onclick = function(aEvent) {
        aEvent.preventDefault();
        req.abort();
        self.updater.resetAttributes();
      }
      self.image = updater.bsyIcon;
      self.setAttribute("busy", "");
      self.removeAttribute("type");
      self.tooltipText = "Checking for update...\nClick to abort.";
      if (req.readyState == 4 && req.status == 200) {
        updater.resetAttributes();
        aCallback(req.responseXML);
      }
    }
    req.send(null);
  },

  // Get update from XML
  getUpdate: function updater_getUpdate(aDocument) {
    if (aDocument.documentElement.localName != "custombutton") {
      custombuttons.alertBox(self.name,
                             "Not a valid Custom Buttons XML file!");
      return;
    }

    //inspectDOMDocument(aDocument); return;
    let icon = self.updater.btnImage ? self.updater.btnImage
                                     : self.updater.stdIcon;
    let button = aDocument.getElementById("button");
    let link = button.getElementsByTagNameNS(xhtmlns, "a")[0];
    if (link.href == self.URI) {
      let as = Cc['@mozilla.org/alerts-service;1'].
               getService(Ci.nsIAlertsService);
      as.showAlertNotification(icon, "No update found!",
                               "Finish checking", false, "", null);
      return;
    } 

    var install = custombuttons.confirmBox(self.name, "Update found! " +
                                           "Update this button?",
                                           "Yes", "No");
    if (!install) return;
    let btnLink = custombuttons.makeButtonLink("update", self.id);
    let params = self.updater.getButtonParameters(btnLink, link.href);
    //inspectObject(params); return;
    custombuttons.cbService.installButton(params);
    custombuttons.alertBox(self.name, "Button updated!");
    self.setAttribute("cb-edit-state", "active");
  },

  init: function updater_onLoad() {

    var icon = this.btnImage ? this.btnImage : this.stdIcon;

    function $(aId) {
      return document.getElementById(aId);
    }

    function addMenuItem(aNewIDs, aNodeIDs, aSeparator) {
      // Remove previously created menuitems if any
      if ($(aNewIDs)) {
        if (aSeparator &&
            ($(aNewIDs).nextSibling.localName == "menuseparator")) {
          $(aNewIDs).parentNode.removeChild($(aNewIDs).nextSibling);
        }
        $(aNewIDs).parentNode.removeChild($(aNewIDs));
      }

      var mi = this.makeXML(
                    '<menuitem xmlns="' + xulns + '"'
                  + ' id="' + aNewIDs + '"'
                  + ' class="menuitem-iconic"'
                  + ' image="' + icon + '"'
                  + ' label="Check for updates for this button"'
                  + ' onclick="if (event.button == 1) {'
                  + ' var btn = document.getElementById(\''
                  + self.id + '\'); btn.updater.openUpdateURL(); }" '
                  + ' oncommand="var btn = document.getElementById(\''
                  + self.id + '\'); btn.updater.checkForUpdate('
                  + 'btn.updater.getUpdate);"'
                  + ' observes="custombuttons-contextbroadcaster-primary"/>');
      $(aNodeIDs).parentNode.insertBefore(mi, $(aNodeIDs).nextSibling);
      if (aSeparator) {
        var sep = this.makeXML('<menuseparator xmlns="' + xulns + '"'
                             + ' id="' + mi.id + '-separator"/>');
        mi.parentNode.insertBefore(sep, mi.nextSibling);
      }
    }

    function initUpdaterCbPopup(aEvent) {
      var popupNode = "triggerNode" in aEvent.target
                        ? aEvent.target.triggerNode : document.popupNode;
      $(kIDs).hidden = (popupNode != self);
      ($(kIDs).nextSibling.id == $(kIDs).id + "-separator") &&
      ($(kIDs).nextSibling.hidden = (popupNode != self));
    }

    var kIDs = self.id + "-checkForUpdate";
    var uIDs = "custombuttons-contextpopup-updateButton";

    // Add 'Check for Update...' menuitem to CB contextmenu
    addMenuItem(kIDs, uIDs, true);

    $(uIDs).parentNode.addEventListener("popupshowing",
                                           initUpdaterCbPopup, false);
    $(uIDs).parentNode.removeEventListener("popuphiding",
                                              initUpdaterCbPopup, false);

    self.onDestroy = function(aReason) {
      if (aReason != "delete") return;
      $(uIDs).parentNode.removeEventListener("popupshowing",
                                             initUpdaterCbPopup, false);
      $(kIDs).parentNode.removeChild($(kIDs + "-separator"));
      $(kIDs).parentNode.removeChild($(kIDs));
    }
  }
}

this.updater.init();

//////////////////////////// End Button updater ////////////////////////////
////////////////////////////////////////////////////////////////////////////