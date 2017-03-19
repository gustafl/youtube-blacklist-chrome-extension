'use strict';

chrome.runtime.sendMessage({ action: 'show' });

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
 * If your script definitely needs to run after window.onload, you can check
 * if onload has already fired by using the document.readyState property.
 */

/**
 * Returns a list of distinct users (commenters) from the page. 
 */
function getUsers() {
    var users = [];
    var comments = document.querySelector('div.comment-renderer');
    comments.forEach(function (currentValue, currentIndex, listObj, argument) {
        var element = currentValue.querySelector('a');
        var userId = element.getAttribute('data-ytid');
        if (users.indexOf(userId) === -1) {
            users.push(userId);
        }
    });
    return users;
}

/**
 * Receive array of blacklisted users
 */
chrome.runtime.onMessage.addListener(function (request, sender, response) {
    if (request.blacklistedUsers) {
        console.info('We got some blacklisted users!');
        hideComments(request.blacklistedUsers);
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
