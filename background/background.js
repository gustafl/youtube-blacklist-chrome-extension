var URL_PATTERN = '://www.youtube.com/watch?v=';

/**
 * Fires when the frame's history was updated to a new URL. We use this instead
 * of onUpdated, due to some particularities of YouTube.
 */
chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
    if (details.frameId === 0) {
        chrome.tabs.get(details.tabId, function (tab) {
            if (tab.url === details.url) {
                doStuff(tab);
            }
        });
    }
});

/**
 * Fires when the active tab in a window changes.
 */
chrome.tabs.onActivated.addListener(function (activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function (tab) {
        doStuff(tab);
    });
});

/**
 * Enables the toolbar button and requests an array of distinct users from the
 * content script.
 * @param {chrome.tabs.Tab} tab
 */
function doStuff(tab) {
    if (tab.url.indexOf(URL_PATTERN) > -1) {
        chrome.pageAction.show(tab.id);
        var message = { name: 'getUsers' };
        chrome.tabs.sendMessage(tab.id, { message: message }, function (response) {
            console.log(response);
        });
    }
}

/**
 * Listens for various messages. Each message object (request.message) has a
 * name and data property.
 */
chrome.runtime.onMessage.addListener(function (request, sender, response) {
    switch (request.message.name) {
        case 'getUsers':
            var users = request.message.data;
            console.log(users);
            break;
        default:
            console.warn('Unknown message: ' + request.message.name);
            break;
    }
});
