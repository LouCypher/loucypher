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

TweetContext.places = {
  getNode: function tw_getNode(aNode) {
    return PlacesUIUtils.getViewForNode(aNode).selectedNode;
  },

  initContext: function tw_initContext() {
    let node = TweetContext.places.getNode(document.popupNode);

    let bmItem = document.getElementById("tweetcontext-bookmark");
    bmItem.hidden = (!TweetContext.isValidScheme(node.uri)) ||
                    (node.itemId < 0);

    let hsItem = document.getElementById("tweetcontext-history");
    hsItem.hidden = (!TweetContext.isValidScheme(node.uri)) ||
                    (node.itemId >= 0);
  },

  onLoad: function tw_onLoad() {
    let win = getTopWin();
    if (typeof gBrowser != 'object') { 
      gBrowser = win.gBrowser;
    }

    if (typeof win.EchofonCommon == "object") {
      EchofonCommon = win.EchofonCommon;
    }

    if (typeof win.TWITTERBAR == "object") {
      TWITTERBAR = win.TWITTERBAR;
    }

    if (typeof win.TWITTERBAR_UI == "object") {
      TWITTERBAR_UI = win.TWITTERBAR_UI;
    }

    if (typeof win.gTwitterNotifier == "object") {
      gTwitterNotifier = win.gTwitterNotifier;
    }

    let popup = document.getElementById("placesContext");
    popup.addEventListener("popupshowing",
                           TweetContext.places.initContext,
                           false);
    popup.removeEventListener("popuphiding",
                              TweetContext.places.initContext,
                              false);
  }
}

window.addEventListener("load", TweetContext.places.onLoad, false);
window.removeEventListener("unload", TweetContext.places.onLoad, false);
