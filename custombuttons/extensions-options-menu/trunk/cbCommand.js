var url = "chrome://mozapps/content/extensions/extensions.xul";

if (gBrowser.mCurrentTab.linkedBrowser.currentURI.spec == "about:blank") {
  loadURI(url);
  return;
}

var tabs = gBrowser.mTabs;
for (var i = 0; i < tabs.length; i++) {
  if (tabs[i].linkedBrowser.currentURI.spec == url) {
    gBrowser.selectedTab = tabs[i];
    return;
  }
}

gBrowser.loadOneTab(url, null, null, null, false);

