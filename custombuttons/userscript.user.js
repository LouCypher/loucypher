// ==UserScript==
// @name            Custom Buttons XML install confirmation
// @namespace       loucypher@mozillaca.com
// @desription      Ask to install new button when opening a Custom Buttons XML file
// @include         http://*
// @include         https://*
// @include         file://*        <-- apparently this doesn't work
// ==/UserScript==

var cbNS1 = "http://xsms.nm.ru/custombuttons/";
var cbNS2 = "http://xsms.nm.ru/custombuttons";

if (!(((document.contentType == "text/xml") ||
       (document.contentType == "application/xml")) &&
      ((document.documentElement.getAttribute("xmlns") == cbNS1) ||
       (document.documentElement.getAttribute("xmlns") == cbNS2) ||
       (document.documentElement.getAttribute("xmlns:cb") == cbNS1) ||
       (document.documentElement.getAttribute("xmlns:cb") == cbNS2)) &&
      (document.documentElement.localName == "custombutton"))) {
  return;
}

try {
  var xml = new XMLSerializer().serializeToString(document);
  location.href = "custombutton://" + escape(xml);
} catch (ex) {
}
