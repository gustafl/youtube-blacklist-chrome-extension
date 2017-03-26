// Match patterns
var MP_WATCH_PAGE = '*://www.youtube.com/watch?v=*';
var MP_MORE_COMMENTS_REQUEST = '*://www.youtube.com/comment_service_ajax?action_get_comments=*'

// TODO: These will probably need to be in an object array with one object per tab
var contextMenuAdded = false;
var commentSectionIsLoaded = false;
var loadMoreButtonIsLoaded = false;

var webRequestFilters = {
    urls: [
        MP_MORE_COMMENTS_REQUEST
    ],
    types: [
        "main_frame",
        "sub_frame",
        "stylesheet",
        "script",
        "image",
        "font",
        "object",
        "xmlhttprequest",
        "ping",
        "other"
    ]
};
var webRequestOptions = [];

/**
 * Fired when a tab is updated.
 */
/*chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    console.info('tabs.onUpdated');
    console.log(changeInfo);
});*/

/**
 * Conditions that the URL being navigated to must satisfy. The 'schemes' and
 * 'ports' fields of UrlFilter are ignored for this event.
 */
/*chrome.webNavigation.onBeforeNavigate.addListener(function (details) {
    console.info('webNavigation.onBeforeNavigate');
    console.log(details);
    doStuff(details);
});*/

/**
 * Fired when a navigation is committed. The document (and the resources it
 * refers to, such as images and subframes) might still be downloading, but at
 * least part of the document has been received from the server and the browser
 * has decided to switch to the new document.
 */
/*chrome.webNavigation.onCommitted.addListener(function (details) {
    console.info('webNavigation.onCommitted');
    console.log(details);
    doStuff(details);
});*/

/**
 * Fired when a document, including the resources it refers to, is completely
 * loaded and initialized.
 */
/*chrome.webNavigation.onCompleted.addListener(function (details) {
    console.info('webNavigation.onCompleted');
    console.log(details);
    doStuff(details);
});*/

/**
 * Fired when the page's DOM is fully constructed, but the referenced resources
 * may not finish loading.
 */
chrome.webNavigation.onDOMContentLoaded.addListener(function (details) {
    console.info('webNavigation.onDOMContentLoaded');
    console.log(details);
    doStuff(details);
});

/**
 * Fired when an error occurs and the navigation is aborted. This can happen if
 * either a network error occurred, or the user aborted the navigation.
 */
chrome.webNavigation.onErrorOccurred.addListener(function (details) {
    console.error('webNavigation.onErrorOccurred');
    console.log(details);
    doStuff(details);
});

/**
 * Fires when the frame's history was updated to a new URL. We use this instead
 * of onUpdated, due to some particularities of YouTube.
 */
chrome.webNavigation.onHistoryStateUpdated.addListener(function (details) {
    console.info('webNavigation.onHistoryStateUpdated');
    console.log(details);
    doStuff(details);
});

/**
 * Fired when the reference fragment of a frame was updated. All future events
 * for that frame will use the updated URL.
 */
/*chrome.webNavigation.onReferenceFragmentUpdated.addListener(function (details) {
    console.info('webNavigation.onReferenceFragmentUpdated');
    console.log(details);
    doStuff(details);
});*/

/**
 * Fired when a request is about to occur.
 */
chrome.webRequest.onBeforeRequest.addListener(function (details) {
    console.info('webRequest.onBeforeRequest');
    console.log(details);
}, webRequestFilters, webRequestOptions);

/**
 * Click listener for conext menu items.
 */
/*chrome.contextMenus.onClicked.addListener(function (info, tab) {
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
});*/

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
                    //addContextMenuItems();
                    getUsers(tab);
                }
            });
/*            // Listen for clicks on 'button.yt-uix-load-more' once the button is loaded
            var message = { name: 'loadMoreButtonIsLoaded' };
            chrome.tabs.sendMessage(tab.id, { message: message }, function (response) {
                if (response && response.message && response.message.data == true) {
                    console.info('%cloadMoreButtonIsLoaded', 'font-weight: bold');
                    console.log(response);
                    chrome.tabs.executeScript(null, { file: "background/eventListeners.js" });
                }
            });*/
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
    console.log(tab);
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

function addContextMenuItems() {
    if (!contextMenuAdded) {
        var contextMenuItem = {
            type: 'normal',
            id: 'blacklistUser',
            title: 'Blacklist user',
            contexts: [ 'link', 'image' ],
            documentUrlPatterns: [ MP_WATCH_PAGE ],
            enabled: false
        };
        /*chrome.contextMenus.create(contextMenuItem, function () {
            contextMenuAdded = true;
        });*/
    }
}

/**
 * Fired when a request is about to occur.
 */
chrome.webRequest.onBeforeRequest.addListener(function (details) {
    console.info('webRequest.onBeforeRequest');
    console.log(details);
}, webRequestFilters, webRequestOptions);

/**
 * Fired before sending an HTTP request, once the request headers are
 * available. This may occur after a TCP connection is made to the server, but
 * before any HTTP data is sent.
 */
chrome.webRequest.onBeforeSendHeaders.addListener(function (details) {
    console.info('webRequest.onBeforeSendHeaders');
    console.log(details);
}, webRequestFilters, webRequestOptions);

/**
 * Fired when HTTP response headers of a request have been received.
 */
chrome.webRequest.onHeadersReceived.addListener(function (details) {
    console.info('webRequest.onHeadersReceived');
    console.log(details);
}, webRequestFilters, webRequestOptions);

/**
 * Fired when an authentication failure is received. The listener has three
 * options: it can provide authentication credentials, it can cancel the
 * request and display the error page, or it can take no action on the
 * challenge. If bad user credentials are provided, this may be called multiple
 * times for the same request. Note, only one of 'blocking' or 'asyncBlocking'
 * modes must be specified in the extraInfoSpec parameter.
 */
chrome.webRequest.onAuthRequired.addListener(function (details, asyncCallback) {
    console.info('webRequest.onAuthRequired');
    console.log(details);
    console.log(asyncCallback);
}, webRequestFilters, webRequestOptions);

/**
 * Fired when the first byte of the response body is received. For HTTP
 * requests, this means that the status line and response headers are
 * available.
 */
chrome.webRequest.onResponseStarted.addListener(function (details) {
    console.info('webRequest.onResponseStarted');
    console.log(details);
}, webRequestFilters, webRequestOptions);

/**
 * Fired when a server-initiated redirect is about to occur.
 */
chrome.webRequest.onBeforeRedirect.addListener(function (details) {
    console.info('webRequest.onBeforeRedirect');
    console.log(details);
}, webRequestFilters, webRequestOptions);

/**
 * Fired when a request is completed.
 */
chrome.webRequest.onCompleted.addListener(function (details) {
    console.warn('webRequest.onCompleted');
    console.log(details);
    if (details.tabId > -1) {
        chrome.tabs.get(details.tabId, function (tab) {
            //if (tab && isYouTubeWatchPage(tab)) {
            if (tab) {
                getUsers(tab);
            }
        });
    } else {
        console.log('No fucking tabId!');
    }
}, webRequestFilters, webRequestOptions);

/**
 * Fired when an error occurs.
 */
chrome.webRequest.onErrorOccurred.addListener(function (details) {
    console.error('webRequest.onErrorOccurred');
    console.log(details);
}, webRequestFilters);
