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

TweetContext.init = {

  initMainContext: function tweetContext_initMainContext() {
    gContextMenu.showItem("context-tweetpage",
                          !(gContextMenu.isContentSelected ||
                            gContextMenu.onTextInput ||
                            gContextMenu.onLink ||
                            gContextMenu.onImage) &&
                          TweetContext.isValidScheme(content.document.
                                                     location.protocol));

    gContextMenu.showItem("context-tweetlink",
                          gContextMenu.onLink &&
                          TweetContext.isValidScheme(gContextMenu.
                                                     linkProtocol));

    gContextMenu.showItem("context-tweetframe",
                          gContextMenu.inFrame &&
                          TweetContext.isValidScheme(gContextMenu.target.
                                                     ownerDocument.location
                                                                  .protocol));

    gContextMenu.showItem("context-tweetimage",
                          gContextMenu.onImage &&
                          TweetContext.isValidScheme(gContextMenu.imageURL));

    gContextMenu.showItem("context-tweetselected",
                          TweetContext.getSelection() &&
                          (TweetContext.getSelection() != ""));
  },

  initTabContext: function tweetContext_initTabContext() {
    let item = document.getElementById("tabContext-tweetany");
    item.hidden = !TweetContext.isValidScheme(gBrowser.mContextTab.
                                              linkedBrowser.
                                              currentURI.scheme);
  },

  initBookmarkContext: function tweetContext_initBookmarkContext() {
    document.getElementById("placesContext-tweetbookmark").hidden =
        !TweetContext.isValidScheme(document.popupNode._placesNode.uri);
  },

  load: function tweetContext_init(aEvent) {
    let cm = document.getElementById("contentAreaContextMenu");
    cm.addEventListener("popupshowing",
                        TweetContext.init.initMainContext,
                        false);
    cm.removeEventListener("popuphiding",
                           TweetContext.init.initMainContext,
                           false);

    let tm = document.getElementById("tabContextMenu");
    tm && tm.addEventListener("popupshowing",
                              TweetContext.init.initTabContext,
                              false);
    tm && tm.removeEventListener("popuphiding",
                                 TweetContext.init.initTabContext,
                                 false);

    let bm = document.getElementById("placesContext");
    bm && bm.addEventListener("popupshowing",
                              TweetContext.init.initBookmarkContext,
                              false);
    bm && bm.removeEventListener("popuphiding",
                                 TweetContext.init.initBookmarkContext,
                                 false);

    TweetContext.checkAddon("twitternotifier@naan.net", "enableEchofon");
    TweetContext.checkAddon("{1a0c9ebe-ddf9-4b76-b8a3-675c77874d37}",
                          "enableHootBar");

  }
}

window.addEventListener("load", TweetContext.init.load, false);
window.removeEventListener("unload", TweetContext.init.load, false);
