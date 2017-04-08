'use strict';

var MP_WATCH_PAGE = '*://www.youtube.com/watch?v=*';

chrome.runtime.onInstalled.addListener(function (details) {
    chrome.storage.sync.set({ 'config.extensionIsEnabled': true });
});

function getUsers(tab) {
    if (!(tab && tab.id)) {
        console.warn('getUsers() got an invalid argument.');
        console.log(tab);
        return;
    }
    var message = { name: 'getUsers' };
    chrome.tabs.sendMessage(tab.id, { message: message }, function (response) {
        if (response && response.message && response.message.data.length > 0) {
            var users = response.message.data;
            console.info('Users loaded now: ' + users.length);
            // Filter comments if extension is enabled
            var key = 'config.extensionIsEnabled';
            chrome.storage.sync.get(key, function (items) {
                if (items[key]) {
                    filterComments(tab, users);
                }
            });
        }
    });
}

function getExtensionUser(tab) {
    var message = { name: 'getExtensionUser' };
    chrome.tabs.sendMessage(tab.id, { message: message }, function (response) {
        if (response && response.message && response.message.data) {
            extensionUser = response.message.data;
            console.info('Extension user: ' + extensionUser);
        }
    });
}

function filterComments(tab, users) {
    chrome.storage.local.get(function (items) {
        // Make a list of blacklisted users on the current page
        var blacklisted = [];
        for (var key in items) {
            if (items.hasOwnProperty(key)) {
                if (users.indexOf(key) > -1) {
                    blacklisted.push(key);
                }
            }
        }
        // If there are blacklisted users on the page...
        if (blacklisted.length > 0) {
            // ...send a filter message to the content script
            var message = { name: 'filterComments', data: blacklisted };
            chrome.tabs.sendMessage(tab.id, { message: message });
        }
    });
}

// chrome.contextMenus.onClicked

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    var message = { name: 'getContextData' };
    chrome.tabs.sendMessage(tab.id, { message: message }, function (response) {
        if (response && response.message) {
            if (response.message.data) {
                // If we got a user ID
                var contextData = response.message.data;
                console.log('User ID found: ' + contextData.userId);
                // Save user record to Chrome's local storage 
                var record = {};
                var object = {};
                object.action = 'B';
                object.author = contextData.userName;
                object.reason = info.menuItemId;
                object.video = /youtube.com\/watch\?v=(.+)/.exec(tab.url)[1];
                object.comment = contextData.comment;
                object.user = extensionUser;
                object.time = Date.now();
                record[contextData.userId] = object;
                chrome.storage.local.set(record);
                // Hide this user's comments
                var users = [];
                users.push(contextData.userId);
                // Filter comments if extension is enabled
                var key = 'config.extensionIsEnabled';
                chrome.storage.sync.get(key, function (items) {
                    if (items[key]) {
                        filterComments(tab, users);
                    }
                });
                // Notify user of success
                chrome.notifications.create('storage.success', {
                    type: 'basic',
                    title: 'Bye bye!',
                    message: 'You won\'t see more from this clown.',
                    iconUrl: 'images/hidden.png'
                });
            } else {
                // If the user clicked something other than a comment
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
    id: 'root',
    title: 'Blacklist user',
    documentUrlPatterns: [ MP_WATCH_PAGE ],
    contexts: ['all'],
    enabled: true
});

chrome.contextMenus.create({
    type: 'normal',
    id: 'default',
    parentId: 'root',
    title: 'Default',
    documentUrlPatterns: [ MP_WATCH_PAGE ],
    contexts: ['all'],
    enabled: true
});

chrome.contextMenus.create({
    type: 'separator',
    parentId: 'root',
    contexts: ['all']
});

chrome.contextMenus.create({
    type: 'normal',
    id: 'irrelevant',
    parentId: 'root',
    title: 'Irrelevant',
    documentUrlPatterns: [ MP_WATCH_PAGE ],
    contexts: ['all'],
    enabled: true
});

chrome.contextMenus.create({
    type: 'normal',
    id: 'inappropriate',
    parentId: 'root',
    title: 'Inappropriate',
    documentUrlPatterns: [ MP_WATCH_PAGE ],
    contexts: ['all'],
    enabled: true
});

chrome.contextMenus.create({
    type: 'normal',
    id: 'hateful',
    parentId: 'root',
    title: 'Hateful',
    documentUrlPatterns: [ MP_WATCH_PAGE ],
    contexts: ['all'],
    enabled: true
});

chrome.contextMenus.create({
    type: 'normal',
    id: 'insulting',
    parentId: 'root',
    title: 'Insulting',
    documentUrlPatterns: [ MP_WATCH_PAGE ],
    contexts: ['all'],
    enabled: true
});

chrome.contextMenus.create({
    type: 'normal',
    id: 'misleading',
    parentId: 'root',
    title: 'Misleading',
    documentUrlPatterns: [ MP_WATCH_PAGE ],
    contexts: ['all'],
    enabled: true
});

chrome.contextMenus.create({
    type: 'normal',
    id: 'nonsensical',
    parentId: 'root',
    title: 'Nonsensical',
    documentUrlPatterns: [ MP_WATCH_PAGE ],
    contexts: ['all'],
    enabled: true
});

// chrome.webRequest.onCompleted

var filters = {
    urls: [
        '*://*.youtube.com/watch_fragments_ajax?*&frags=comments*',
        '*://*.youtube.com/watch_fragments_ajax?*&frags=guide*',
        '*://*.youtube.com/comment_service_ajax?action_get_comments=*',
        '*://*.youtube.com/comment_service_ajax?action_get_comment_replies=*'
    ],
    types: [
        'xmlhttprequest'
    ]
};

var options = [];
var extensionUser = null;

chrome.webRequest.onCompleted.addListener(function (details) {
    if (details.tabId > -1) {
        chrome.tabs.get(details.tabId, function (tab) {
            getUsers(tab);
            if (!extensionUser) {
                extensionUser = getExtensionUser(tab);
            }
        });
    }
}, filters, options);

// chrome.runtime.onMessage

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (!(request.message && request.message.name)) {
        console.warn('Background script received a malformed message:');
        console.log(request);
    }
    console.info('Background script received a message named ' + request.message.name + '.');
    switch (request.message.name) {
        case 'pageActionShow':
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.pageAction.show(tabs[0].id);
            });
            break;
        case 'getUsers':
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                getUsers(tabs[0]);
            });
            break;
        case 'getUsersInStorage':
            chrome.storage.sync.get(key, function (items) {
                sendResponse(items);
            });
            break;
        default:
            console.warn('Unknown message: ' + request.message.name);
            break;
    }
});
