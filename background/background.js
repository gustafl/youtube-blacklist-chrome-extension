var URL_PATTERN = '*://www.youtube.com/watch?v=*';

var contextMenuAdded = false;

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
 * Get blacklisted users from storage.
 */
function getBlacklistedUsers(users) {
    return users;
}

/**
 * Enables the toolbar button and requests an array of distinct users from the
 * content script.
 * @param {chrome.tabs.Tab} tab
 */
function doStuff(tab) {
    if (tab.url.indexOf(URL_PATTERN.replace(/\*/g, '')) > -1) {
        chrome.pageAction.show(tab.id);
        var message = { name: 'getUsers' };
        chrome.tabs.sendMessage(tab.id, { message: message }, function (response) {
            if (response) {
                var blacklisted = getBlacklistedUsers(response);
                var message = { name: 'filterComments', body: blacklisted };
                chrome.tabs.sendMessage(tab.id, { message: message });
            }
        });
        addContextMenuItems();
    }
}

function addContextMenuItems() {
    if (!contextMenuAdded) {
        var contextMenuItem = {
            type: 'normal',
            id: 'blacklistUser',
            title: 'Blacklist user',
            contexts: [ 'link', 'image' ],
            documentUrlPatterns: [ URL_PATTERN ]
        };
        chrome.contextMenus.create(contextMenuItem, function () {
            contextMenuAdded = true;
        });
    }
}

/**
 * Listens for various messages. Each message object (request.message) has a
 * name and body property.
 */
chrome.runtime.onMessage.addListener(function (request, sender, response) {
    switch (request.message.name) {
        case 'getUsers':
            var users = request.message.body;
            console.log(users);
            break;
        default:
            console.warn('Unknown message: ' + request.message.name);
            break;
    }
});

/**
 * Click listener for conext menu items.
 */
chrome.contextMenus.onClicked.addListener(function (info, tab) {
    console.log(info);
});
