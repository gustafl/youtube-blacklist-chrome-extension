'use strict';

console.info('Content script reached...');

var MP_WATCH_PAGE = '*://www.youtube.com/watch?v=*';
var COMMENT_SECTION = '#comment-section-renderer-items';
var COMMENT = 'div.comment-renderer';
var COMMENT_CLASS = 'comment-renderer';

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
 * Returns the whole comment element given any element within it.
 * @param {Element} element 
 */
function getWholeComment(element) {
    var element = element.target;
    if (element.classList.contains(COMMENT_CLASS)) {
        return element;
    } else {
        while (element = element.parentNode) {
            if (element.classList && element.classList.contains(COMMENT_CLASS)) {
                return element;
            }
        }
    }
    return false;
}

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
    var commentSection = document.querySelector(COMMENT_SECTION);
    if (commentSection) {
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            var query = 'div.comment-renderer a[data-ytid="' + user + '"]';
            var element = commentSection.querySelector(query);
            if (element) {
                var comment = element.parentNode;  // div.comment-renderer

                // Replace user name and link
                query = 'div.comment-renderer-header a.comment-author-text';
                element = comment.querySelector(query);
                if (element) {
                    var parent = element.parentNode;  // div.comment-renderer-header
                    element.remove();
                    var span = document.createElement('span');
                    span.classList.add('comment-author-text')
                    span.setAttribute('data-ytid', user);
                    span.setAttribute('style', 'color: gray');
                    span.textContent = 'Blacklisted user';
                    parent.insertBefore(span, parent.firstChild);
                }

                // Replace image
                query = 'span.comment-author-thumbnail img';
                element = comment.querySelector(query);
                if (element) {
                    var parent = element.parentNode;  // div.comment-renderer-text
                    var clone = element.cloneNode();
                    element.setAttribute('style', 'display: none');
                    var path = chrome.runtime.getURL('images/hidden_75.png');
                    clone.setAttribute('src', path);
                    clone.setAttribute('alt', 'Blacklisted user');
                    parent.insertBefore(clone, parent.firstChild);
                }

                // Replace text
                query = 'div.comment-renderer-text-content';
                element = comment.querySelector(query);
                if (element) {
                    var parent = element.parentNode;  // div.comment-renderer-text
                    element.setAttribute('style', 'display: none');
                    var sibling = document.createElement('div');
                    sibling.classList.add('comment-renderer-text-content');
                    sibling.setAttribute('style', 'color: gray; font-style: italic');
                    sibling.innerHTML = 'This comment was removed because the user is blacklisted.&#65279;';
                    parent.insertBefore(sibling, parent.firstChild);
                    parent.setAttribute('style', 'background-color: white');
                    parent.parentNode.setAttribute('style', 'background-color: white');
                    parent.parentNode.parentNode.setAttribute('style', 'background-color: white');
                }

                query = 'div.comment-action-buttons-toolbar';
                element = comment.querySelector(query);
                if (element) {
                    element.setAttribute('style', 'display: none');
                }

                query = 'comment-renderer-time a'
                element = comment.querySelector(query);
                if (element) {
                    element.setAttribute('style', 'color: silver');
                }
            }
        }
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
        case 'getUsers':
            var users = getUsers();
            var message = { name: 'getUsers', data: users };
            sendResponse({ message: message });
            break;
        case 'filterComments':
            var users = request.message.data;
            filterComments(users);
            break;
        case 'getUserId':
            var message = { name: 'getUserId', data: userId };
            sendResponse({ message: message });
            userId = null;
            break;
        default:
            console.warn('Unknown message: ' + request.message.name);
            break;
    }
});

/**
 * ----------------------------------------------------------------------------
 * Context menu
 * ----------------------------------------------------------------------------
 */
var userId = null;

document.addEventListener('contextmenu', function (event) {
    var commentElement = clickInsideElement(event);
    if (commentElement) {
        var link = commentElement.querySelector('a[data-ytid]');
        if (link) {
            userId = link.getAttribute('data-ytid');
        }
    }
});

function clickInsideElement(event) {
    var element = event.target;
    if (element.classList.contains(COMMENT_CLASS)) {
        return element;
    } else {
        while (element = element.parentNode) {
            if (element.classList && element.classList.contains(COMMENT_CLASS)) {
                return element;
            }
        }
    }
    return false;
}
