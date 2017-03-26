'use strict';

var MP_WATCH_PAGE = '*://www.youtube.com/watch?v=*';
var COMMENT_SECTION = '#comment-section-renderer-items';
var COMMENT = 'div.comment-renderer';

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

var clickedElement = null;
var useCapture = true;  // Bypass event-bubbling

var commentSectionIsLoaded = null;

console.info('Content script reached...');

/**
 * Listen for right-mouse clicks.
 */
document.addEventListener('mousedown', function (event) {
    if (event.button == 2) {
        clickedElement = event.target;
    }
}, useCapture);

/**
 * Returns a list of distinct users (commenters) from the page. 
 */
function getUsers() {
    
    // Prepare an array of data-ytid strings
    var users = [];

    // Make sure we got a comment section
    var commentRoot = document.querySelector(COMMENT_SECTION);
    if (!commentRoot) {
        console.warn('No comment section found.');
        return [];
    }

    // Make sure we got some comments
    var comments = commentRoot.querySelectorAll(COMMENT);
    if (!comments) {
        console.warn('No comments found.');
        return [];
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
        var user = users[i];
        console.log(user);
/*        var element = currentValue.querySelector('a');
        var userId = element.getAttribute('data-ytid');
        if (blacklistedUsers.indexOf(userId) > -1) {
            element.classList.add('blacklisted-user');
        }*/
    }
}

/**
 * Listens for various messages. Each message object (request.message) has a
 * name and data property.
 */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (!(request.message && request.message.name)) {
        console.warn('Content script received a malformed message:');
        console.warn(request);
    }
    console.info('Content script received a message named ' + request.message.name + '.');
    switch (request.message.name) {
        case 'commentSectionIsLoaded':
            if (!commentSectionIsLoaded) {
                commentSectionIsLoaded = document.querySelector(COMMENT_SECTION) ? true : false;
                var message = { name: 'commentSectionIsLoaded', data: commentSectionIsLoaded };
                sendResponse({ message: message });
            }
            break;
        case 'getUsers':
            var users = getUsers();
            var message = { name: 'getUsers', data: users };
            sendResponse({ message: message });
            break;
        case 'filterComments':
            var users = request.message.data;
            filterComments(users);
            break;
        case 'getClickedElement':
            var message = { name: 'getClickedElement', data: clickedElement.value };
            sendResponse({ message: message });
            break;
        default:
            console.warn('Unknown message: ' + request.message.name);
            break;
    }
});