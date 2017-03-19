'use strict';

/**
 * Available functions in the chrome.* API
 * =======================================
 * extension.inIncognitoContext
 * i18n.*
 * runtime.connect
 * runtime.getManifest
 * runtime.getURL
 * runtime.id
 * runtime.onConnect
 * runtime.onMessage
 * runtime.sendMessage
 * storage.*
 */

/**
 * Returns a list of distinct users (commenters) from the page. 
 */
function getUsers() {
    
    // Prepare an array of data-ytid strings
    var users = [];

    // Make sure we got a comment section
    var commentRoot = document.querySelector('#comment-section-renderer-items');
    if (!commentRoot) {
        return null;
    }

    // Make sure we got some comments
    var comments = commentRoot.querySelectorAll('div.comment-renderer');
    if (!comments) {
        return null;
    }

    // Loop through comments
    for(var node of comments.values()) { 
        var element = node.querySelector('a');
        var userId = element.getAttribute('data-ytid');
        if (users.indexOf(userId) === -1) {
            users.push(userId);
        }
    }

    return users;
}

/**
 * Hide the comments of the users in the input array.
 * @param {Array} users
 */
function filterComments(users) {
    for (var i = 0; i < users.length; i++) {
        var element = currentValue.querySelector('a');
        var userId = element.getAttribute('data-ytid');
        if (blacklistedUsers.indexOf(userId) > -1) {
            element.classList.add('blacklisted-user');
        }
    }
}

/**
 * Listens for various messages. Each message object (request.message) has a
 * name and data property.
 */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    switch (request.message.name) {
        case 'getUsers':
            var users = getUsers();
            var message = { name: 'getUsers', data: users };
            sendResponse({ message: message });
            break;
        case 'filterComments':
            var users = request.message.data;
            filterComments(users);
            break;
        default:
            console.warn('Unknown message: ' + request.message.name);
            break;
    }
});
