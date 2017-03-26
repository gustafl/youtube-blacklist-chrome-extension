// Match patterns
var MP_WATCH_PAGE = '*://www.youtube.com/watch?v=*';

// TODO: These will probably need to be in an object array with one object per tab
var contextMenuAdded = false;
var commentSectionIsLoaded = false;
var loadMoreButtonIsLoaded = false;

/**
 * Does stuff.
 * @param {Object} details 
 */
function doStuff(details) {
    chrome.tabs.get(details.tabId, function (tab) {
        if (tab && isYouTubeWatchPage(tab)) {
            // Get users once they are loaded
            var message = { name: 'commentSectionIsLoaded' };
            chrome.tabs.sendMessage(tab.id, { message: message }, function (response) {
                if (response && response.message && response.message.data == true) {
                    console.info('%ccommentSectionIsLoaded', 'font-weight: bold');
                    console.log(response);  
                    chrome.pageAction.show(tab.id);
                    getUsers(tab);
                }
            });
        }
    });
}

/**
 * Checks if the tab URL is a YouTube watch page.
 */
function isYouTubeWatchPage(tab) {
    if (tab.url.indexOf(MP_WATCH_PAGE.replace(/\*/g, '')) > -1) {
        return true;
    } else {
        return false;
    }
}

/**
 * Asks the content script which users are present on the current page. Then
 * hands over to filterComments().
 * @param {chrome.tabs.Tab} tab
 */
function getUsers(tab) {
    console.warn(getUsers);
    var message = { name: 'getUsers' };
    chrome.tabs.sendMessage(tab.id, { message: message }, function (response) {
        console.info('%cgetUsers', 'font-weight: bold');
        console.log(response);
        if (response && response.message && response.message.data.length > 0) {
            var users = response.message.data;
            var text = 'Users loaded now: ' + users.length;
            console.log(text);
            //filterComments(tab, users);
        }
    });
}

/**
 * Ask the content script to filter out comments from blacklisted users.
 * @param {chrome.tabs.Tab} tab
 */
function filterComments(tab, users) {
    var blacklisted = getBlacklistedUsers(users);
    console.info('%cgetBlacklistedUsers', 'font-weight: bold');
    console.log(blacklisted);
    var message = { name: 'filterComments', data: blacklisted };
    chrome.tabs.sendMessage(tab.id, { message: message });
}

/**
 * Get blacklisted users from storage.
 */
function getBlacklistedUsers(users) {
    var blacklisted = [];
    for (i = 0; i < users.length; i++) {
        var key = 'user.' + users[i];
        chrome.storage.local.get(key, function (items) {
            if (items.length > 0) {
                console.info('storage.local.get');
                console.log(items);
                //blacklisted.push(users[i]);
            }
        });
    }
    return blacklisted;
}

/**
 * ----------------------------------------------------------------------------
 * Context menu
 * ----------------------------------------------------------------------------
 */

/**
 * Click listener for conext menu items.
 */
chrome.contextMenus.onClicked.addListener(function (info, tab) {
    console.log(info);
    var message = { name: 'getClickedElement' };
    chrome.tabs.sendMessage(tab.id, message, function (response) {
        console.info('The getBlacklistedUsers request finished.');
        console.log(response);
        if (response && response.message && response.message.data > 0) {
            var element = response.message.data;
            console.log(element);
        }
    });
});

var contextMenu = {
    type: 'normal',
    id: 'blacklistUser',
    title: 'Blacklist user',
    contexts: [ 'link', 'image' ],
    documentUrlPatterns: [ MP_WATCH_PAGE ],
    enabled: false
};

chrome.contextMenus.create(contextMenu);

/**
 * ----------------------------------------------------------------------------
 * webRequest event handlers
 * ----------------------------------------------------------------------------
 */

var filters = {
    urls: [
        '*://*.youtube.com/watch_fragments_ajax?*&frags=comments*',
        '*://*.youtube.com/comment_service_ajax?action_get_comments=*'
    ],
    types: [
        'xmlhttprequest'
    ]
};

var options = [];

/**
 * Fired when a request is completed.
 */
chrome.webRequest.onCompleted.addListener(function (details) {
    if (details.tabId > -1) {
        chrome.tabs.get(details.tabId, function (tab) {
            getUsers(tab);
        });
    }
}, filters, options);
