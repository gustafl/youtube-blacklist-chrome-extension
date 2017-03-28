// Match patterns
var MP_WATCH_PAGE = '*://www.youtube.com/watch?v=*';

/**
 * Asks the content script which users are present on the current page. Then
 * hands over to filterComments().
 * @param {chrome.tabs.Tab} tab
 */
function getUsers(tab) {
    var message = { name: 'getUsers' };
    chrome.tabs.sendMessage(tab.id, { message: message }, function (response) {
        if (response && response.message && response.message.data.length > 0) {
            var users = response.message.data;
            var text = 'Users loaded now: ' + users.length;
            console.log(text);
            /*var blacklisted = getBlacklistedUsers(users);
            console.info('%cgetBlacklistedUsers', 'font-weight: bold');
            console.log(blacklisted);
            var message = { name: 'filterComments', data: blacklisted };
            chrome.tabs.sendMessage(tab.id, { message: message });*/
        }
    });
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
    var message = { name: 'getUserId' };
    chrome.tabs.sendMessage(tab.id, { message: message }, function (response) {
        if (response && response.message) {
            if (response.message.data) {
                var userId = response.message.data;
                console.log('User ID found: ' + userId);
                // TODO: Store to chrome.storage.sync.
                chrome.notifications.create('storage.success', {
                    type: 'basic',
                    title: 'Bye bye!',
                    message: 'You won\'t see more from this clown.',
                    iconUrl: 'images/hidden.png'
                });
            } else {
                console.log('No user ID found.');
                chrome.notifications.create('storage.failure', {
                    type: 'basic',
                    title: 'Huh?',
                    message: 'That doesn\'t seem to be a comment.',
                    iconUrl: 'images/question.png'
                });
            }
        }
    });
});

chrome.contextMenus.create({
    type: 'normal',
    id: 'blacklistUser',
    title: 'Blacklist user',
    contexts: [ 'all' ],
    documentUrlPatterns: [ MP_WATCH_PAGE ],
    enabled: true
});

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
