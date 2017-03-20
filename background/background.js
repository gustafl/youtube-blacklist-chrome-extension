var URL_PATTERN = '*://www.youtube.com/watch?v=*';

var contextMenuAdded = false;

/**
 * Fired when the page's DOM is fully constructed, but the referenced resources
 * may not finish loading.
 */
chrome.webNavigation.onDOMContentLoaded.addListener(function (details) {
    console.info('A webNavigation.onDOMContentLoaded event triggered.');
    console.log(details);

    // Find the right tab
    chrome.tabs.get(details.tabId, function (tab) {
        // Exclude everything but YouTube watch pages
        if (tab.url.indexOf(URL_PATTERN.replace(/\*/g, '')) == -1) {
            return;
        }

        // Ask if the comment section is loaded
        var message = { name: 'commentSectionIsLoaded' };
        chrome.tabs.sendMessage(tab.id, { message: message }, function (response) {
            console.info('The commentSectionIsLoaded request finished.');
            console.log(response);
            if (response && response.message && response.message.data == true) {
                getUsers(tab);
                addContextMenuItems();
            }
        });
    });
});

/**
 * 
 * @param {chrome.tabs.Tab} tab
 */
function getUsers(tab) {
    // Ask the content script which users are present on the page
    var message = { name: 'getUsers' };
    chrome.tabs.sendMessage(tab.id, { message: message }, function (response) {
        console.info('The getUsers request finished.');
        console.log(response);
        if (response && response.message && response.message.data.length > 0) {
            var users = response.message.data;
            filterComments(tab, users);
        } else {
            console.warn('The getUsers response is empty.');
        }
    });
}

/**
 * Ask the content script to filter out comments from blacklisted users.
 * @param {chrome.tabs.Tab} tab
 */
function filterComments(tab, users) {
    // Figure out which users are blacklisted
    var blacklisted = getBlacklistedUsers(users);
    console.info('The getBlacklistedUsers request finished.');
    console.log(blacklisted);
    var message = { name: 'filterComments', data: blacklisted };
    // Send blacklisted users back to content script
    chrome.tabs.sendMessage(tab.id, { message: message });
}

/**
 * Fires when the frame's history was updated to a new URL. We use this instead
 * of onUpdated, due to some particularities of YouTube.
 */
chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
    console.info('A webNavigation.onHistoryStateUpdated event triggered.');
    //console.log(details);
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
    console.info('A tabs.onActivated event triggered.');
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
    // Exclude everything but YouTube watch pages
    if (tab.url.indexOf(URL_PATTERN.replace(/\*/g, '')) == -1) {
        return;
    }
    // Enable the toolbar button
    chrome.pageAction.show(tab.id);
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
 * name and data property.
 */
chrome.runtime.onMessage.addListener(function (request, sender, response) {
    console.info('Background script received message named ' + request.message.name + '.');
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

/**
 * Click listener for conext menu items.
 */
chrome.contextMenus.onClicked.addListener(function (info, tab) {
    console.log(info);
});
