var TabHistory = {
  CONTEXT_ID: [
    "tabcontext-tabHistory-separator-1",
    "tabcontext-tabHistory-history",
    "tabcontext-tabHistory-last",
    "tabcontext-tabHistory-start",
    "tabcontext-tabHistory-forward",
    "tabcontext-tabHistory-back",
    "tabcontext-tabHistory-separator-0"
  ],

  MENU: ["History", "Last", "Start", "Forward", "Back"],

  get prefs() {
    return Components.classes["@mozilla.org/preferences-service;1"]
                     .getService(Components.interfaces.nsIPrefBranch)
                     .getBranch("extensions.TabHistory.");
  },

  menuShown: function tabHist_getMenuPrefs(aMenu) {
    return this.prefs.getBoolPref("showMenu." + aMenu);
  },

  setStatusMessage: function tabHist_setStatusMessage(aNode) {
    document.getElementById("statusbar-display").label = aNode.statusText;
  },

  clearStatusMessage: function tabHist_clearStatusMessage() {
    document.getElementById("statusbar-display").label = "";
  },

  getBrowser: function tabHist_getTabBrowser() {
    return getBrowser().mContextTab
           ? getBrowser().mContextTab.localName == "tabs"
             ? getBrowser().mCurrentTab.linkedBrowser
             : getBrowser().mContextTab.linkedBrowser
           : getBrowser();
  },

  getHistory: function tabHist_getSessionHistory() {
    return this.getBrowser().webNavigation.sessionHistory;
  },

  getEntry: function tabHist_getHistoryEntry(aIndex) {
    return this.getHistory().getEntryAtIndex(aIndex, false);
  },

  gotoIndex: function tabHist_gotoIndex(aEvent) {
    var index = aEvent.target.value;
    if (!index) return;
    var where = whereToOpenLink(aEvent);
    if (where == "current") {
      return this.getBrowser().webNavigation.gotoIndex(index);
    } else {
      var url = this.getEntry(index).URI.spec;
      openUILinkIn(url, where, false);
    }
  },

  tabBack: function tabHist_BrowserBack(aEvent, aIgnoreAlt) {
    var where = whereToOpenLink(aEvent, false, aIgnoreAlt);
    if (where == "current") {
      try {
        this.getBrowser().goBack();
      } catch (ex) {
      }
    } else {
      var url = this.getEntry(this.getHistory().index - 1).URI.spec;
      openUILinkIn(url, where);
    }
  },

  tabForward: function tabHist_BrowserBack(aEvent, aIgnoreAlt) {
    var where = whereToOpenLink(aEvent, false, aIgnoreAlt);
    if (where == "current") {
      try {
        this.getBrowser().goForward();
      } catch (ex) {
      }
    } else {
      var url = this.getEntry(this.getHistory().index + 1).URI.spec;
      openUILinkIn(url, where);
    }
  },

  populateTabHistory: function tabHist_populateTabHistory(aNode) {
    while (aNode.lastChild) {
      aNode.removeChild(aNode.lastChild);
    }
    var count = this.getHistory().count;
    var hist = [];
    for (var i = count - 1; i >= 0; i--) {
      hist[i] = {
        title: this.getEntry(i).title,
        url:   this.getEntry(i).URI.spec
      }
    }
    for (var j in hist) {
      var mi = aNode.appendChild(document.createElement("menuitem"));
      mi.setAttribute("value", j);
      mi.setAttribute("label", hist[j].title);
      mi.tooltipText = hist[j].url;
      mi.statusText = hist[j].url;
      if (j == this.getHistory().index) {
        mi.setAttribute("type", "checkbox");
        mi.setAttribute("checked", true);
      }
    }
  },

  createTooltip: function tabHist_fixTabTooltip(aEvent) {
    aEvent.stopPropagation();
    var tn = document.tooltipNode;
    if (tn.localName != "tab") {
      return false;
    }
    if (tn.hasAttribute("label")) {
      aEvent.target.setAttribute("label", tn.getAttribute("label"));
      return true;
    }
    return false;
  },

  setItemAttributes: function tabHist_setItemAttr(aNode, aMenu, aCondition, aIndex) {
    aNode.setAttribute("disabled", aCondition);
    if (aCondition) {
      aNode.removeAttribute("tooltiptext");
    } else {
      aNode.tooltipText = this.getEntry(aIndex).title;
    }
    aNode.statusText = aCondition ? "" : this.getEntry(aIndex).URI.spec;
    aNode.hidden = !this.menuShown(this.MENU[aMenu]);
  },

  initTabContext: function tabHist_initiateTabContext(aEvent) {
    var browser = TabHistory.getBrowser();
    var canGoBack = browser.canGoBack;
    var canGoForward = browser.canGoForward;
    var index = TabHistory.getHistory().index;
    var count = TabHistory.getHistory().count;

    var mHist = document.getElementById(TabHistory.CONTEXT_ID[1]);
    mHist.setAttribute("disabled", count <= 1);
    mHist.hidden = !TabHistory.menuShown(TabHistory.MENU[0]);

    var mLast = document.getElementById(TabHistory.CONTEXT_ID[2]);
    mLast.value = count - 1;
    TabHistory.setItemAttributes(mLast, 1, !canGoForward, count - 1);

    var mStart = document.getElementById(TabHistory.CONTEXT_ID[3]);
    TabHistory.setItemAttributes(mStart, 2, !canGoBack, 0);

    var mForward = document.getElementById(TabHistory.CONTEXT_ID[4]);
    TabHistory.setItemAttributes(mForward, 3, !canGoForward, index + 1);

    var mBack = document.getElementById(TabHistory.CONTEXT_ID[5]);
    TabHistory.setItemAttributes(mBack, 4, !canGoBack, index - 1);

  }
}

window.addEventListener("load", function(e) {
  var tabContext = document.getAnonymousElementByAttribute(
                    gBrowser, "anonid", "tabContextMenu");
  //var sep = tabContext.getElementsByTagName("menuseparator")[0];
  var mID = TabHistory.CONTEXT_ID;
  for (var i in mID) {
    var mi = document.getElementById(mID[i]);
    //tabContext.insertBefore(mi, sep); // doesn't work on Fx3.0
    tabContext.insertBefore(mi, tabContext.firstChild);
  }

  tabContext.addEventListener("popupshowing", TabHistory.initTabContext, false);

  // fix tab tooltips bug
  if (typeof gBrowser.createTooltip != "function") {
    var tabTooltip = tabContext.parentNode.firstChild;
    tabTooltip.setAttribute("onpopupshowing",
                            "return TabHistory.createTooltip(event);");
  }

}, false);

