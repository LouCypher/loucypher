var TabHistory = {
  setStatusMessage: function tabHistory_setStatusMessage(aNode) {
    document.getElementById("statusbar-display").label = aNode.statusText;
  },

  clearStatusMessage: function tabHistory_clearStatusMessage() {
    document.getElementById("statusbar-display").label = "";
  },

  getBrowser: function tabHistory_getTabBrowser() {
    return getBrowser().mContextTab
           ? getBrowser().mContextTab.localName == "tabs"
             ? getBrowser().mCurrentTab.linkedBrowser
             : getBrowser().mContextTab.linkedBrowser
           : getBrowser();
  },

  getHistory: function tabHistory_getSessionHistory() {
    return this.getBrowser().webNavigation.sessionHistory;
  },

  getEntry: function tabHistory_getHistoryEntry(aIndex) {
    return this.getHistory().getEntryAtIndex(aIndex, false);
  },

  gotoIndex: function tabHistory_gotoIndex(aEvent) {
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

  tabBack: function tabHistory_BrowserBack(aEvent, aIgnoreAlt) {
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

  tabForward: function tabHistory_BrowserBack(aEvent, aIgnoreAlt) {
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

  populateTabHistory: function tabHistory_populateTabHistory(aNode) {
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

  createTooltip: function tabHistory_fixTabTooltip(aEvent) {
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

  setItemAttributes: function tabHistory_setItemAttr(aNode, aCondition, aIndex) {
    aNode.setAttribute("disabled", aCondition);
    if (aCondition) {
      aNode.removeAttribute("tooltiptext");
    } else {
      aNode.tooltipText = TabHistory.getEntry(aIndex).title;
    }
    aNode.statusText = aCondition ? "" : TabHistory.getEntry(aIndex).URI.spec;
  },

  initTabContext: function tabHistory_initiateTabContext(aEvent) {
    var browser = TabHistory.getBrowser();
    var canGoBack = browser.canGoBack;
    var canGoForward = browser.canGoForward;
    var index = TabHistory.getHistory().index;
    var count = TabHistory.getHistory().count;

    var mBack = document.getElementById("tabcontext-tabBack");
    TabHistory.setItemAttributes(mBack, !canGoBack, index - 1);

    var mForward = document.getElementById("tabcontext-tabForward");
    TabHistory.setItemAttributes(mForward, !canGoForward, index + 1);

    var mStart = document.getElementById("tabcontext-tabStart");
    TabHistory.setItemAttributes(mStart, !canGoBack, 0);

    var mLast = document.getElementById("tabcontext-tabLast");
    mLast.value = count - 1;
    TabHistory.setItemAttributes(mLast, !canGoForward, count - 1);

    var mHist = document.getElementById("tabcontext-tabHistory");
        mHist.setAttribute("disabled", count <= 1);

  }
}

window.addEventListener("load", function(e) {
  var mID = [
    "tabcontext-tabHistory-separator-1",
    "tabcontext-tabHistory",
    "tabcontext-tabLast",
    "tabcontext-tabForward",
    "tabcontext-tabBack",
    "tabcontext-tabStart",
    "tabcontext-tabHistory-separator-0"
  ];

  var tabContext = document.getAnonymousElementByAttribute(
                    gBrowser, "anonid", "tabContextMenu");
  //var sep = tabContext.getElementsByTagName("menuseparator")[0];
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

