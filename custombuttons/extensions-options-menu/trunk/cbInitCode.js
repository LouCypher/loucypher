this.label = "Extensions";
this.tooltipText = this.label;

/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * Original code is Extensions Options Menu for Custom Buttons
 *
 * The Initial Developer of the Original Code is LouCypher.
 * Portions created by the Initial Developer are Copyright (C) 2011
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *  LouCypher <loucypher@mozillaca.com>
 *
 * ***** END LICENSE BLOCK ***** */

function $(aId) {
  return document.getElementById(aId);
}

function $xml(aXML) {
  return cbu.makeXML(aXML);
}

function sort(aArray) {
  aArray.sort(function(a, b) {
    a = a.name.toLowerCase();
    b = b.name.toLowerCase();
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  })
}

this.openDialog = function(aURL) {
  openDialog(aURL, "", "chrome, dialog, close, titlebar, toolbar," +
                       "scrollbars, minimizable, centerscreen");
}

this.setStatus = function(aString) {
  document.getElementById("statusbar-display").label = aString;
}

this.onclick = function inspectExtensions(aEvent) {
  if ((typeof inspectObject != "function") ||
      (aEvent.button != 1)) return;
  AddonManager.getAllAddons(function(aAddons) {
    var extensions = [];
    for (var i = 0; i < aAddons.length; i++) {
      if (aAddons[i].type == "extension") {
        extensions.push(aAddons[i]);
      }
    }
    sort(extensions);
    inspectObject(extensions);
  })
}

this.addonsMgr = function(aPopup, aCallback) {
  AddonManager.getAllAddons(function(aAddons) {
    var extensions = [];
    for (var i = 0; i < aAddons.length; i++) {
      aAddons[i].toString = function() { return this.name; }
      if ((aAddons[i].type == "extension") &&
          (aAddons[i].optionsURL != null) &&
          aAddons[i].isActive) {
        extensions.push(aAddons[i]);
      }
    }
    sort(extensions);
    aCallback(aPopup, extensions);
  })
}

function getExtensionObject(aId, aCallback) {
  AddonManager.getAllAddons(function(aAddons) {
    for (var i = 0; i < aAddons.length; i++) {
      if (aAddons[i].id == aId) {
        aCallback(aAddons[i]);
        return;
      }
    }
  })
}

function addItem(aNode, aId, aLabel, aURL, aIcon, aHomePage, aDesc) {
  aNode.appendChild($xml(<menuitem xmlns={xulns} class="menuitem-iconic"
                           GUID={aId} label={aLabel}
                           image={aIcon} homepage={aHomePage}
                           statustext={aURL} tooltiptext={aDesc}/>));
}

var popup = $xml(<menupopup xmlns={xulns} context="cb-extensions-menu"
                  oncommand="event.stopPropagation(); this.parentNode.openDialog(event.target.statusText);"
                  onmouseover="this.parentNode.setStatus(event.target.statusText);"
                  onmouseout="this.parentNode.setStatus('');"/>);

this.populate = function(aPopup, aExtensions) {
  for (var i = 0; i < aExtensions.length; i++) {
    let ext = aExtensions[i];
    addItem(aPopup, ext.id, ext.name + " " + ext.version, ext.optionsURL,
                    (ext.iconURL ? ext.iconURL : "chrome://mozapps/skin/extensions/extensionGeneric-16.png"),
                    (ext.homepageURL ? ext.homepageURL : ext.reviewURL.replace(/\/reviews/, "").toString()),
                    ext.description);
  }
}

this.addonsMgr(popup, this.populate);

this.appendChild(popup);
this.type = "menu-button";

//---------------------------------

this.copyId = function(aId) {
  Cc["@mozilla.org/widget/clipboardhelper;1"].
  getService(Ci.nsIClipboardHelper).copyString(aId);
}

this.goHome = function(aURL) {
  gBrowser.loadOneTab(aURL);
}

this.inspect = function(aId) {
  getExtensionObject(aId, inspectObject);
}

this.explore = function(aId) {
  var dirService = Cc["@mozilla.org/file/directory_service;1"].
                   getService(Ci.nsIProperties);
  var dir = dirService.get("ProfD", Ci.nsIFile);
  dir.append("extensions");
  dir.append(aId);
  if (!dir.exists()) {
    alert("Directory " + dir.path + " doesn't exist!");
    return;
    //dir.append(".xpi");
    //Application.console.log(dir.path);
  }
  var localFileInterface = Cc["@mozilla.org/file/local;1"].
                           createInstance(Ci.nsILocalFile);
  localFileInterface.initWithPath(dir.path);
  var iDirectory = localFileInterface;
  try {
    iDirectory.reveal();
  } catch(ex) {
    var uri = Cc["@mozilla.org/network/io-service;1"].
              getService(Ci.nsIIOService).newFileURI(iDirectory);
    var protocolSvc = Cc["@mozilla.org/uriloader/external-protocol-service;1"].
                      getService(Ci.nsIExternalProtocolService);
    protocolSvc.loadUrl(uri);
  }
}

if ($("cb-extensions-menu")) {
  $("cb-extensions-menu").parentNode.removeChild($("cb-extensions-menu"));
}

this.checkForDOMI = function(aEvent) {
  if (typeof inspectObject != "function") {
    aEvent.target.getElementsByTagName("menuitem")[2].hidden = true;
  }
}

var popupset = document.getElementById("mainPopupSet");
var context = popupset.appendChild(
                $xml(<menupopup xmlns={xulns} id="cb-extensions-menu" onclick="event.stopPropagation();"
                                onpopupshowing={"document.getElementById('" + this.id + "').checkForDOMI(event);"}>
                      <menuitem label="Visit Home Page"
                                onmouseover={"document.getElementById('" + this.id + "').setStatus(document.popupNode.getAttribute('homepage'));"}
                                onmouseout={"document.getElementById('" + this.id + "').setStatus('');"}
                                oncommand={"document.getElementById('" + this.id + "').goHome(document.popupNode.getAttribute('homepage'));"}/>
                      <menuitem label="Copy GUID"
                                onmouseover={"document.getElementById('" + this.id + "').setStatus(document.popupNode.getAttribute('GUID'));"}
                                onmouseout={"document.getElementById('" + this.id + "').setStatus('');"}
                                oncommand={"document.getElementById('" + this.id + "').copyId(document.popupNode.getAttribute('GUID'));"}/>
                      <menuitem label="Inspect Extension"
                                onmouseover={"document.getElementById('" + this.id + "').setStatus(document.popupNode.getAttribute('GUID'));"}
                                onmouseout={"document.getElementById('" + this.id + "').setStatus('');"}
                                oncommand={"document.getElementById('" + this.id + "').inspect(document.popupNode.getAttribute('GUID'));"}/>
                      <menuitem label="Browse Install Directory"
                                onmouseover={"document.getElementById('" + this.id + "').setStatus(document.popupNode.getAttribute('GUID'));"}
                                onmouseout={"document.getElementById('" + this.id + "').setStatus('');"}
                                oncommand={"document.getElementById('" + this.id + "').explore(document.popupNode.getAttribute('GUID'));"}/>
                     </menupopup>));

