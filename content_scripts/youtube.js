'use strict';

/**
 * Available functions in chrome.*
 * ===============================
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
    var users = [];
    var nodeList = document.querySelector('div.comment-renderer');
    for(var node of nodeList.values()) { 
        var element = node.querySelector('a');
        var userId = element.getAttribute('data-ytid');
        if (users.indexOf(userId) === -1) {
            users.push(userId);
        }
    }
    return users;
}

/**
 * Listens for various messages. Each message object (request.message) has a
 * name and data property.
 */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log(request);
    switch (request.message.name) {
        case 'getUsers':
            console.log(request.message.name);
            //var users = getUsers();
            var users = 'Gustaf';
            var message = { name: 'getUsers', data: users };
            sendResponse({ message: message });
            break;
        default:
            console.warn('Unknown message: ' + request.message.name);
            break;
    }
});

/**
 * Hides comments from blacklisted users.
 * @param {Array} blacklistedUsers 
 */
function hideComments(blacklistedUsers) {
    var comments = document.querySelector('div.comment-renderer');
    comments.forEach(function (currentValue, currentIndex, listObj, argument) {
        var element = currentValue.querySelector('a');
        var userId = element.getAttribute('data-ytid');
        if (blacklistedUsers.indexOf(userId) > -1) {
            element.classList.add('blacklisted-user');
        }
    });
}
