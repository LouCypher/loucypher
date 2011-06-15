/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
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
 * Original code is Export Button to XML File/Import XML File As New Button
 * for Custom Buttons extension
 *
 * The Initial Developer of the Original Code is LouCypher.
 * Portions created by the Initial Developer are Copyright (C) 2011
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 * - LouCypher: original code
 * - Morat: onDestroy event, bug report
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"),
 * in which case the provisions of the GPL are applicable instead of those
 * above.
 *
 * ***** END LICENSE BLOCK ***** */

const nsIFilePicker = Ci.nsIFilePicker;

function $(aId) {
  return document.getElementById(aId);
}

function saveFile(aFileName, aStrData) {
  var fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
  fp.appendFilters(nsIFilePicker.filterXML);
  fp.init(window, "Export button to XML file", nsIFilePicker.modeSave);
  fp.defaultString = aFileName;
  var res = fp.show();
  if(res == nsIFilePicker.returnOK || res == nsIFilePicker.returnReplace) {
    var ostream = Cc["@mozilla.org/network/file-output-stream;1"].
                  createInstance(Ci.nsIFileOutputStream);
    ostream.init(fp.file, 0x02 | 0x08 | 0x20, 0664, 0);
    var charset = "UTF-8";
    var os = Cc["@mozilla.org/intl/converter-output-stream;1"].
             createInstance(Ci.nsIConverterOutputStream);
    os.init(ostream, charset, 4096, 0x0000);
    os.writeString(aStrData);
    os.close();
  }
}

function readFile(file) {
  var data = "";
  var fstream = Cc["@mozilla.org/network/file-input-stream;1"]
    .createInstance(Ci.nsIFileInputStream);
  fstream.init(file, -1, 0, 0);
  var charset = "UTF-8";
  const replacementChar = Ci.nsIConverterInputStream
                            .DEFAULT_REPLACEMENT_CHARACTER;
  var is = Cc["@mozilla.org/intl/converter-input-stream;1"]
    .createInstance(Ci.nsIConverterInputStream);
  is.init(fstream, charset, 1024, replacementChar);
  var str = {};
  while (is.readString(4096, str) != 0) {
    data += str.value;
  }
  is.close();

  return data;
}

function stringToDOM(aString) {
// https://developer.mozilla.org/en/Parsing_and_serializing_XML
  var parser = new DOMParser();
  var dom = parser.parseFromString(aString, "text/xml");
  if (dom.documentElement.nodeName == "parsererror") {
    return null;
  } else {
    return dom.documentElement;
  }
}

function importXMLtoButton(aStrXMLData) {
  loadURI("custombutton://" + escape(aStrXMLData));
}

this.checkDocumentForCBXML = function(aDocument) {
  if (((aDocument.contentType == "text/xml") ||
       (aDocument.contentType == "application/xml"))&&
      (aDocument.documentElement.localName == "custombutton")) {
    var serializer = new XMLSerializer();
    var xml = serializer.serializeToString(aDocument);
    importXMLtoButton(xml);
  } else {
    this.loadXML();
  }
}

this.saveXML = function(aStrURI) {
  var cbURI = (aStrURI != undefined) ? aStrURI : readFromClipboard();
  if (!cbURI || !/^custombutton\:\/\//.test(cbURI)) {
    custombuttons.uChelpButton(this);
    return;
  }

  var cbXML = cbURI.replace(/^custombutton\:\/\//, "");
  var decodeXML = unescape(cbXML);
  var btnName = decodeXML.match(/\<name\/?.+/).toString();
  var name = "untitled";
  if (!/\<name\/\>/.test(btnName)) {
    name = btnName.replace(/\<\/?\w+\>/g, "").toString();
  }
  var image = decodeXML.match(/\<image\/?.+/).toString();
  var icon = "";
  if (!/\<\image.*\[\].*\>$/.test(image)) {
    icon = image.match(/[^\[\]]+/g)[2].toString()
                .replace(/custombuttons\-stdicon\-\d/, "").toString();
  }
  
  var xmlTemplate = "custombuttons/\"\n\
              xmlns:html=\"http://www.w3.org/1999/xhtml\">\n\
  <html:head>\n\
    <html:title><![CDATA[" + name + "]]></html:title>\n\
    <html:link rel=\"shortcut icon\" href=\"" + icon + "\"/>\n\
    <html:style type=\"text/css\"><![CDATA[\
body { font-size: medium; margin: 0; }\n\
body, code:before, help:before, initcode:before {\n\
  font-family: \"Verdana\", sans-serif;\n\
} \n\
#wrapper { position: fixed; top: 1em; right: 1em; text-align: center; }\n\
p { font-size: small; text-align: center; }\n\
#button {\n\
  background-image: -moz-linear-gradient(center top, rgb(147, 200, 94) 30%, rgb(85, 168, 2) 55%);\n\
  border: 1px outset rgb(58, 116, 4);\n\
  border-radius: 1em;\n\
  padding: 0;\n\
  text-shadow: 0pt -1px 0pt rgb(58, 116, 4);\n\
  margin-bottom: 1em;\n\
}\n\
#button a {\n\
  color: rgb(255, 255, 255);\n\
  padding: 1em;\n\
  text-decoration: none;\n\
}\n\
#button a, code, code:before, initcode, initcode:before, help, help:before {\n\
  display: block;\n\
}\n\
#credits { position: fixed; bottom: 1em; right: 1em; font-size: small; }\n\
custombutton { background-color: rgb(171, 171, 171); margin: 1em; }\n\
image, mode, accelkey { display: none; }\n\
name { font-weight: bold; font-size: x-large; }\n\
code:before, help:before, initcode:before {\n\
  font-weight: bold;\n\
  font-size: large;\n\
  margin: 0 0 1em;\n\
  padding: .5em;\n\
}\n\
code:before { content: \"CODE\"; }\n\
help:before { content: \"Help\"; }\n\
initcode:before { content: \"Initialization Code\"; }\n\
code, initcode, help {\n\
  background-color: rgb(255, 255, 255);\n\
  border: 1px inset rgb(170, 170, 170);\n\
  font: medium monospace;\n\
  margin: 1em 1em 2em 0;\n\
  padding: 1em;\n\
  text-align: left;\n\
  width: 840px;\n\
  white-space: pre-wrap;\n\
  word-wrap: break-word;\n\
}\n\
.clear { clear: both; }\n\
]]></html:style>\n\
  </html:head>\n\
  <html:body>\n\
    <html:div id=\"wrapper\">\n\
      <html:div id=\"button\">\n\
        <html:a href=\"" + cbURI + "\" title=\"" + name + "\">\n\
        <![CDATA[Install this button]]>\n\
        </html:a>\n\
      </html:div>\n\
      <html:a href=\"https://addons.mozilla.org/addon/custom-buttons/\">\n\
        <![CDATA[What's this?]]>\n\
      </html:a>\n\
      <html:div id=\"credits\">\n\
        <html:a href=\"http://custombuttons.mozdev.org/drupal/node/484\">\n\
          <![CDATA[Custom Buttons XML]]><html:br/><![CDATA[Exporter/Importer]]>\n\
        </html:a>\n\
      </html:div>\n\
    </html:div>\n\
  </html:body>\n";

  decodeXML = decodeXML.replace(/custombuttons\/\"\>/, xmlTemplate);

  name += ".xml";
  saveFile(name, decodeXML);
}

this.loadXML = function() {
  var fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
  fp.init(window,
          "Import an XML file and install it as a new button",
          nsIFilePicker.modeOpen);
  fp.appendFilters(nsIFilePicker.filterXML);
  fp.appendFilter("All Files", "*.*");
  fp.displayDirectory = gLastOpenDirectory.path;
  if (fp.show() == nsIFilePicker.returnOK) {
    if (fp.file && fp.file.exists()) {
      gLastOpenDirectory.path = fp.file.parent.QueryInterface(Ci.nsILocalFile);
    }
  } else {
    return;
  }
  var xmlData = readFile(fp.file);
  var xmlDOM = stringToDOM(xmlData);
  if (!xmlDOM) {
    //Application.console.log(xmlDOM);
    custombuttons.alertBox("Import Fail", "Not an XML file!");
    return;
  }

  if ((xmlDOM.localName == "custombutton") &&
      ((xmlDOM.getAttribute("xmlns:cb") == "http://xsms.nm.ru/custombuttons/") ||
       (xmlDOM.getAttribute("xmlns:cb") == "http://xsms.nm.ru/custombuttons") ||
       (xmlDOM.getAttribute("xmlns") == "http://xsms.nm.ru/custombuttons/") ||
       (xmlDOM.getAttribute("xmlns") == "http://xsms.nm.ru/custombuttons"))) {
    importXMLtoButton(xmlData);
  } else {
    custombuttons.alertBox("Import Fail", "Not a valid Custom Buttons XML!");
  }
}


//---------- Start initiating toolbarbuttons ----------//

this.onDestroy = function(aReason) {
  if (aReason == "delete") {
    var el = document.getElementById(this.id + "-toolbaritem");
    if (el) el.parentNode.removeChild(el);
  }
}

// presuming there are no 100+ toolbaritems :p
var tbitm = document.getElementsByTagName("toolbaritem");
for (var i = tbitm.length - 1; i >= 0; i--) {
  let el = tbitm[i];
  if ((el.id == this.id + "-toolbaritem") && (el.nextSibling.id != this.id)) {
    el.parentNode.removeChild(el);
  }
}

while ((this.previousSibling.localName == "toolbaritem") &&
       (this.previousSibling.id.indexOf(this.id) >= 0)) { //*
  this.parentNode.removeChild(this.previousSibling);
}

var saveImg = "data:image/x-icon;base64,\
AAABAAEAEBAAAAAAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAQAQAAAAAAAAAAAAAAAAA\
AAAAAAD///8B////Af///wH///8BAAAAHQAAACUXaE1dE55y/xOecv8XaE1dAAAAJQAAAB3///8B\
////Af///wH///8B////Af///wH///8B////Af///wEmrX85F6J2/xHEj/8RxI//GKF2/yatfzn/\
//8B////Af///wH///8B////Af///wH///8B////Af///wEmrX85Hqd6/xHHkv8Rx5L/EceS/xHH\
kv8ep3r/Jq1/Of///wH///8B////Af///wH///8B////Af///wEhs4RJJq1//xHHkv8Rx5L/EceS\
/xHHkv8Rx5L/EciT/yatgP8mrX85////Af///wH///8B////Af///wEjsYJBLLKE/xHNlv8RyJP/\
EciT/xHIk/8RyJP/EciT/xHKlf8Rzpn/LLOE/yatfzn///8B////Af///wEmrX85MbaH/xTcqP8V\
3qv/Fd2q/xHKlf8RypX/EcqV/xHKlf8W4a7/Fd6r/xTZpf8xtof/Jq1/Of///wEmrX1pMbaH/zG3\
iP8xt4j/MbeI/xfWov8RzJj/EcyY/xHMmP8RzJj/H8SR/zG3iP8xt4j/MbeI/zG2h/8mrX85////\
Af///wH///8B////Af///wEuuov/Ec+a/xHPmv8Rz5r/FNCc/xbUoPEisH7v////Af///wH///8B\
////Af///wH///8B////Af///wH///8BLrqL/xHTnv8R057/EdOe/xXUoP8a2KT3H7J/4ymaaSUp\
mmklKZppJSmaaSX///8B////Af///wH///8B////AS66i/8R1aH/EdWh/xHVof8U1qL/Idyp/ySh\
b+0koW/tJKJw6ySlc+0noG/5////Af///wH///8B////Af///wEuuov/Edej/xHXo/8R16P/Edej\
/yzgsP8ZsH//GrOB/xm6hv8ZwI3/JqFw6////wH///8B////Af///wH///8BLrqL/xHapf8R2qX/\
Edql/xHapf895bf/KbCC/yCpef8gsH7/Hb6M/yidbNP///8B////Af///wH///8B////ASPNmv8Y\
3ar/Edyn/xHcp/8V3aj/VerA/1DNpP8moHH/JqJz/yG7ifsvv5L/////Af///wH///8B////Af//\
/wEizJn1b+/J/2nux/9k7cX/b+/J/3Dvyf9r7cb/MJ9x/yype/8jt4XzL7+S/////wH///8B////\
Af///wH///8BFL+KOTjWp/9B6Lv/Oea4/zjmuP9G6Lz/WuzD/1rcs/9B0aT7L7+S/////wH///8B\
////Af///wH///8B////Af///wEXwo5lFMWQzxPFkNUTxZDZE8WQ0xXEkNcmxJPVQsie/////wH/\
//8BAAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA\
//8AAP//AAD//w==";

var loadImg = "data:image/x-icon;base64,\
AAABAAEAEBAAAAAAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAQAQAAAAAAAAAAAAAAAAA\
AAAAAAD///8B////Af///wH///8B////AQAAAB+yg2l71ZRt+daTa//Wk2v/1pNr/9aTa//Wk2v/\
v4NlywYEAycAAAAX////Af///wH///8B////Af///wHdo4M53Zx3/+Sgef/innb/4p52/+Kedv/l\
o3r/5aR6/+mqgfvPj27N////Af///wH///8B////Af///wH///8B4KSD8+mmff/opH3/56N6/+Wh\
ef/no3r/66qB/8KBXf/Fg1//0Y5s78+Pbqn///8B////Af///wH///8B////AeGlg//trIX/7ayE\
/+6thP/urIX/9bWL/8eFYf/GhF//yYZh/9SPa/nkn3j/////Af///wH///8B////Af///wHkn3j/\
76+G/+6uh//vrob/76+G//W3jP/GhF//y4di/9ONZ//XkWr/5J94/////wH///8B////Af///wH/\
//8B5J94/++wif/wsIj/8LGJ//CxiP/0toz/y4di/8+KZf/vroP/766D/+SfeP////8B////Af//\
/wH///8B////AeSfeP/xs4v/8bOL//Cziv/ws4v/87WL/9CNa+3QjWvt3p96/96fev/en3r/////\
Af///wH///8B////Af///wHkn3j/8rWN//K2jf/ytY3/8rWN//O2jvfdo4Lj0I5sJdCObCXQjmwl\
0I5sJf///wH///8B////Af///wH///8B5J94//O3j//zuI//87iP//O4j//zuZDx3aOD7////wH/\
//8B////Af///wHdo4M/5J94/+SfeP/kn3j/5J94/++2j//zupH/9LqR//O6kv/0upL/87qR/+Sf\
eP/kn3j/5J94/+SfeP////8B////Af///wHkoXr/9cCY//W8k//0vJT/9L2T//S8lP/0vZT/9LyU\
//S8lP/1vJT/9cCY/+Shev////8B////Af///wH///8B9b+WC+SjfP/2yqP/9b+W//a/lf/2v5X/\
9b6V//W+lv/1vpX/9sqj/+SjfP////8B////Af///wH///8B////Af///wH2wZgX5aZ+//fTrP/2\
wJj/9sCY//bAmP/2wZj/99Os/+Smf/////8B////Af///wH///8B////Af///wH///8B////Af//\
/wHkqYH/99ax//fCmv/3wpn/99aw/+Sogf////8B////Af///wH///8B////Af///wH///8B////\
Af///wH///8B////AeWrhP/317L/99ey/+WrhP////8B////Af///wH///8B////Af///wH///8B\
////Af///wH///8B////Af///wH///8B5a2F/+Wthf////8B////Af///wH///8B////Af///wH/\
//8BAAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA\
//8AAP//AAD//w==";

var xul = <toolbaritem
              xmlns={xulns} id={this.id + "-toolbaritem"}
              class="chromeclass-toolbar-additional"
              context="custombuttons-contextpopup"
              onclick="if (event.button == 2) document.popupNode = this.nextSibling;">
            <toolbarbutton
                label="Export Button to XML File"
                tooltiptext="Export Button to XML File"
                class="toolbarbutton-1 chromeclass-toolbar-additional"
                image={saveImg}
                oncommand="this.parentNode.nextSibling.saveXML();"/>
            <toolbarbutton
                label="Import XML File As New Button"
                tooltiptext="Import XML File As New Button"
                class="toolbarbutton-1 chromeclass-toolbar-additional"
                image={loadImg}
                oncommand="this.parentNode.nextSibling.checkDocumentForCBXML(content.document);"/>
          </toolbaritem>;

this.parentNode.insertBefore(cbu.makeXML(xul), this);

// Applying stylesheet for this button (and these buttons)
// https://developer.mozilla.org/en/Using_the_Stylesheet_Service
var css = "\
@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\
#navigator-toolbox:not([customizing=\"true\"]) #" + this.id + ",\
#navigator-toolbox[customizing=\"true\"] #" + this.id + "-toolbaritem\
{ display: none; }";
var sss = Cc["@mozilla.org/content/style-sheet-service;1"].
          getService(Ci.nsIStyleSheetService);
var ios = Cc["@mozilla.org/network/io-service;1"].
          getService(Ci.nsIIOService);
var uri = ios.newURI("data:text/css," + encodeURIComponent(css), null, null);
if (sss.sheetRegistered(uri, sss.USER_SHEET)) {
  sss.unregisterSheet(uri, sss.USER_SHEET);
}
sss.loadAndRegisterSheet(uri, sss.USER_SHEET);

//---------- End initiating toolbarbuttons ----------//


//---------- Start initiating CB contextmenu ----------//

var cIDs = ["custombuttons-contextpopup-exportXML",
            "custombuttons-contextpopup-exportXML-sub"];

var bIDs = ["custombuttons-contextpopup-bookmarkButton",
            "custombuttons-contextpopup-bookmarkButton-sub"];

for (var i = 0; i < cIDs.length; i++) {
  if ($(cIDs[i])) $(cIDs[i]).parentNode.removeChild($(cIDs[i]));

  let item = cbu.makeXML(<menuitem xmlns={xulns}
                id={cIDs[i]}
                class="menuitem-iconic"
                image={saveImg}
                label="Export to XML"
                oncommand={"document.getElementById('" + this.id +
"').saveXML(document.popupNode.URI);"}/>);

  if (i == 0) {
    item.setAttribute("observes", "custombuttons-contextbroadcaster-primary");
  }

  $(bIDs[i]).parentNode.insertBefore(item, $(bIDs[i]).nextSibling);

}

//---------- End initiating CB contextmenu ----------//

