var MP_WATCH_PAGE = '*://www.youtube.com/watch?v=*';

function getUsers(tab) {
    var message = { name: 'getUsers' };
    chrome.tabs.sendMessage(tab.id, { message: message }, function (response) {
        if (response && response.message && response.message.data.length > 0) {
            var users = response.message.data;
            var text = 'Users loaded now: ' + users.length;
            console.info(text);
            chrome.storage.local.get(function (items) {
                var blacklisted = [];
                for (var key in items) {
                    if (items.hasOwnProperty(key) && items[key] === 'B') {
                        blacklisted.push(key);
                    }
                }
                var message = { name: 'filterComments', data: blacklisted };
                chrome.tabs.sendMessage(tab.id, { message: message });
            });
        }
    });
}

// chrome.contextMenus.onClicked

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    var message = { name: 'getUserId' };
    chrome.tabs.sendMessage(tab.id, { message: message }, function (response) {
        if (response && response.message) {
            if (response.message.data) {
                var userId = response.message.data;
                console.log('User ID found: ' + userId);
                var record = {};
                record[userId] = 'B';
                chrome.storage.local.set(record);
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

// chrome.webRequest.onCompleted

var filters = {
    urls: [
        '*://*.youtube.com/watch_fragments_ajax?*&frags=comments*',
        '*://*.youtube.com/comment_service_ajax?action_get_comments=*',
        '*://*.youtube.com/comment_service_ajax?action_get_comment_replies=*'
    ],
    types: [
        'xmlhttprequest'
    ]
};

var options = [];

chrome.webRequest.onCompleted.addListener(function (details) {
    if (details.tabId > -1) {
        chrome.tabs.get(details.tabId, function (tab) {
            getUsers(tab);
        });
    }
}, filters, options);
