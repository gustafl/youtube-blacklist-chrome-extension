(function () {

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

    // Pinned
    var pinned = comment.querySelector('div.comment-renderer-pinned-comment-badge');
    if (pinned) {
        pinned.classList.add('ytbl-hide');  // Hiding
    }

    // Username
    var commentHeader = comment.querySelector('div.comment-renderer-header');
    if (commentHeader) {
        var creator = commentHeader.querySelector('span.creator');
        if (!creator) {
            var username = commentHeader.querySelector('a.comment-author-text');
            username.classList.add('ytbl-hide');  // Hiding
            var span = document.createElement('span');
            span.textContent = chrome.i18n.getMessage('youtube_replacement_text_username');
            span.classList.add('comment-author-text');
            span.classList.add('ytbl-filler');
            commentHeader.insertBefore(span, commentHeader.firstChild);
        } else {
            // Clone <span> containing the <a>
            var clone = creator.cloneNode();
            clone.classList.add('ytbl-filler');
            commentHeader.insertBefore(clone, commentHeader.firstChild);

            // Hide the original span
            creator.classList.add('ytbl-hide');  // Hiding

            // Hide the <a> in the <span> clone
            var username = commentHeader.querySelector('a.comment-author-text');

            // Add <span> to replace the inner <a> element in the clone
            var span = document.createElement('span');
            span.textContent = chrome.i18n.getMessage('youtube_replacement_text_username');
            span.classList.add('comment-author-text');
            span.classList.add('ytbl-filler');
            clone.insertBefore(span, clone.firstChild);
        }
    }

    // Verified badge
    var verified = commentHeader.querySelector('span.comment-author-verified-badge');
    if (verified) {
        verified.classList.add('ytbl-hide');  // Hiding
    }

    // Time
    var commentTime = commentHeader.querySelector('span.comment-renderer-time');
    if (commentTime) {
        var a = commentTime.querySelector('a');
        a.classList.add('ytbl-hide');  // Hiding
        var span = document.createElement('span');
        span.textContent = a.textContent;
        span.classList.add('ytbl-filler');
        commentTime.insertBefore(span, commentTime.firstChild);
    }
}

function HideCommentImage(comment) {
    var img = comment.querySelector('span.comment-author-thumbnail img');
    if (img) {
        var parent = img.parentNode;
        var clone = img.cloneNode();
        img.classList.add('ytbl-hide');  // Hiding
        var path = chrome.runtime.getURL('images/hidden.png');
        clone.setAttribute('src', path);
        clone.setAttribute('alt', chrome.i18n.getMessage('youtube_replacement_text_username'));
        clone.classList.add('ytbl-filler');
        parent.insertBefore(clone, parent.firstChild);
    }
}

function HideCommentText(comment) {
    var commentText = comment.querySelector('div.comment-renderer-text-content');
    if (commentText) {
        var parent = commentText.parentNode;
        var clone = commentText.cloneNode();
        commentText.classList.add('ytbl-hide');  // Hiding
        clone.innerHTML = chrome.i18n.getMessage('youtube_replacement_text_comment');
        clone.classList.add('ytbl-filler');
        parent.insertBefore(clone, parent.firstChild);
        // Show text button
        var div = document.createElement('div');
        div.setAttribute('style', 'margin-top: -8px');
        div.classList.add('ytbl-filler');
        clone.parentNode.insertBefore(div, clone.nextSibling);
        var button = document.createElement('button');
        button.classList.add('yt-uix-button-link');
        button.textContent = 'Show';
        div.appendChild(button);
        div.addEventListener('click', function () {
            showComment(comment);
        });
    }
    var readMore = comment.querySelector('div.comment-text-toggle');
    if (readMore) {
        readMore.classList.add('ytbl-hide');  // Hiding
    }
}

function HideCommentFooter(comment) {
    var actionButtons = comment.querySelector('div.comment-action-buttons-toolbar');
    if (actionButtons) {
        actionButtons.classList.add('ytbl-hide');  // Hiding
    }
}

// Show a hidden comment using the Show button
function showComment(comment) {
    var hidden = comment.querySelectorAll('.ytbl-hide');
    for (var i = 0; i < hidden.length; i++) {
        hidden[i].classList.remove('ytbl-hide');
        hidden[i].classList.add('ytbl-show');
    }
    var filler = comment.querySelectorAll('.ytbl-filler');
    for (var j = 0; j < filler.length; j++) {
        filler[j].remove();
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
                    // Prevent attempting to hide already hidden comments
                    if (element.querySelectorAll('.ytbl-hide, .ytbl-show').length == 0) {
                        HideCommentHeader(element);
                        HideCommentImage(element);
                        HideCommentText(element);
                        HideCommentFooter(element);
                    }
                }
            }
        }
    }
}

function getExtensionUser() {
    var a = document.querySelector('[data-name="g-personal"][data-ytid]');
    if (a) {
        var userId = a.getAttribute('data-ytid');
        return userId;
    }
}

// chrome.runtime.onMessage

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (!(request.message && request.message.name)) {
        console.warn('The content script received a malformed message:');
        console.log(request);
    }
    console.info('The content script received a message named ' + request.message.name + '.');
    switch (request.message.name) {
        case 'filterComments':
            var users = request.message.data;
            filterComments(users);
            break;
        case 'getExtensionUser':
            var userId = getExtensionUser();
            var message = { name: 'getExtensionUser', data: userId };
            sendResponse({ message: message });
            break;
        case 'getContextData':
            var message = { name: 'getContextData', data: contextData };
            sendResponse({ message: message });
            contextData = {};
            break;
        case 'getUsers':
            var users = getUsers();
            var message = { name: 'getUsers', data: users };
            sendResponse({ message: message });
            break;
        default:
            console.warn('Unknown message type: ' + request.message.name);
            break;
    }
});

var message =  { name: 'pageActionShow' };
chrome.runtime.sendMessage({ message: message });

// Context menu

var contextData = {};

document.addEventListener('contextmenu', function (event) {
    var comment = clickInsideElement(event);
    if (comment) {
        var link = comment.querySelector('a.comment-author-text');
        if (link) {
            contextData.userId = link.getAttribute('data-ytid');
            contextData.userName = link.textContent;
            contextData.comment = comment.getAttribute('data-cid');
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

})();