'use strict';

var COMMENT_SECTION = '#comment-section-renderer-items';
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

// Returns a list of distinct users from the page. 
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
    var comments = commentRoot.querySelectorAll('div.' + COMMENT_CLASS);
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

function HideCommentHeader(comment) {
    // Username
    var commentHeader = comment.querySelector('div.comment-renderer-header');
    if (commentHeader) {
        var username = commentHeader.querySelector('a.comment-author-text');
        username.setAttribute('style', 'display: none');
        var span = document.createElement('span');
        span.classList.add('comment-author-text');
        span.classList.add('blacklisted');
        span.setAttribute('style', 'color: gray');
        span.textContent = 'Blacklisted user';
        commentHeader.insertBefore(span, commentHeader.firstChild);
    }
    // Time
    var commentTime = commentHeader.querySelector('span.comment-renderer-time');
    if (commentTime) {
        var a = commentTime.querySelector('a');
        a.setAttribute('style', 'display: none');
        var span = document.createElement('span');
        span.classList.add('blacklisted');
        span.setAttribute('style', 'color: gray');
        span.textContent = a.textContent;
        commentTime.insertBefore(span, commentTime.firstChild);
    }
}

function HideCommentImage(comment) {
    var img = comment.querySelector('span.comment-author-thumbnail img');
    if (img) {
        var parent = img.parentNode;
        var clone = img.cloneNode();
        img.setAttribute('style', 'display: none');
        var path = chrome.runtime.getURL('images/hidden_75.png');
        clone.setAttribute('src', path);
        clone.setAttribute('alt', 'Blacklisted user');
        clone.classList.add('blacklisted');
        parent.insertBefore(clone, parent.firstChild);
    }
}

function HideCommentText(comment) {
    var commentText = comment.querySelector('div.comment-renderer-text-content');
    if (commentText) {
        var parent = commentText.parentNode;
        var clone = commentText.cloneNode();
        commentText.setAttribute('style', 'display: none');
        clone.classList.add('blacklisted');
        clone.setAttribute('style', 'color: gray; font-style: italic');
        clone.innerHTML = 'This comment was removed because the user is blacklisted.&#65279;';
        parent.insertBefore(clone, parent.firstChild);
    }
}

function HideCommentFooter(comment) {
    var actionButtons = comment.querySelector('div.comment-action-buttons-toolbar');
    if (actionButtons) {
        actionButtons.setAttribute('style', 'display: none');
    }
}

// Hides the comments of users in the input array.
function filterComments(users) {
    var commentSection = document.querySelector(COMMENT_SECTION);
    if (commentSection) {
        // Loop through blacklisted users
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            // Find all comments by user
            var query = 'a.comment-author-text[data-ytid="' + user + '"]';
            var elementList = commentSection.querySelectorAll(query);
            if (elementList.length > 0) {
                // Loop through comments by user
                for (var j = 0; j < elementList.length; j++) {
                    var element = elementList[j];
                    // Find the ancestor with the comment class (the full comment)
                    while (element = element.parentNode) {
                        if (element.classList && element.classList.contains(COMMENT_CLASS)) {
                            break;
                        }
                    }
                    HideCommentHeader(element);
                    HideCommentImage(element);
                    HideCommentText(element);
                    HideCommentFooter(element);
                }
            }
        }
    }
}

// chrome.runtime.onMessage

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (!(request.message && request.message.name)) {
        console.warn('Content script received a malformed message:');
        console.log(request);
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

// Context menu

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
