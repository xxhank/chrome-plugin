// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// The onClicked callback function.
function onClickHandler(info, tab) {
    if (info.menuItemId == "check-watering") {
        //alert("thank you");
        //chrome.tabs.getCurrent(function(tab) {
        //    alert(tab.url);
        //});
        chrome.tabs.executeScript(null, {
            file: "jquery.js"
        });

         chrome.tabs.insertCSS(null, {
            file:"mystyles.css"
        });

        chrome.tabs.executeScript(null, {
            file: "myscript.js"
        });

    }
}

chrome.contextMenus.onClicked.addListener(onClickHandler);

// Set up context menu tree at install time.
chrome.runtime.onInstalled.addListener(function() {
    // Create one test item for each context type.

    chrome.contextMenus.create({
        "title": "check-water",
        "contexts": ["page"],
        "id": "check-watering"
    });

});
