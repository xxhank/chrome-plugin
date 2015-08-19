chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.action == "tab_id") {
            sendResponse({
                tabID: sender.tab.id,
                tabURL: sender.tab.url
            });
        }
    });
