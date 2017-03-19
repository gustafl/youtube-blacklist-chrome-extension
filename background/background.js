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
    if (tab.url.indexOf(URL_PATTERN) > -1) {
        chrome.pageAction.show(tab.id);
        var message = { name: 'getUsers' };
        chrome.tabs.sendMessage(tab.id, { message: message }, function (response) {
            if (response != null) {
                var blacklisted = getBlacklistedUsers(response);
                console.log(blacklisted);
                var message = { name: 'filterUsers', data: blacklisted };
                chrome.tabs.sendMessage(tab.id, { message: message });
            }
        });
        addContextMenu();
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

// A generic onclick callback function for the context menu
function contextMenuListener(info, tab) {
    
    console.log(info);
    console.log(tab);

    // Add user to blacklist


}

/**
 * Add a context menu.
 */
function addContextMenu() {
    // If context menu exists, don't add it
    // Create one test item for each context type.
    var contexts = [ 'link', 'image' ];
    for (var i = 0; i < contexts.length; i++) {
        var context = contexts[i];
        var title = "Test '" + context + "' menu item";
        var id = chrome.contextMenus.create({"title": title, "contexts":[context],"onclick": contextMenuListener});
    }

    chrome.contextMenus.ACTION_MENU_TOP_LEVEL_LIMIT = 2;
    var blacklist = chrome.contextMenus.create({ title: 'Blacklist user' });
    var reason1 = chrome.contextMenus.create({ title: 'Nonsense', parentId: blacklist, onclick: contextMenuListener });
    var reason2 = chrome.contextMenus.create({ title: 'Insult', parentId: blacklist, onclick: contextMenuListener });
    var reason3 = chrome.contextMenus.create({ title: 'Stupid', parentId: blacklist, onclick: contextMenuListener });
    var whitelist = chrome.contextMenus.create({ title: 'Whitelist user' });
    var reason4 = chrome.contextMenus.create({ title: 'Useful', parentId: whitelist, onclick: contextMenuListener });
    var reason5 = chrome.contextMenus.create({ title: 'Kind', parentId: whitelist, onclick: contextMenuListener });
}
