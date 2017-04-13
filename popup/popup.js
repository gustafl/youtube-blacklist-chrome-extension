(function () {

'use strict';

var button = document.querySelector('#filtering-enabled');

// Get all items from storage
chrome.storage.local.get(function (items) {
    // Load the enable/disable setting
    var extensionIsEnabled = items['config.extensionIsEnabled'];
    if (extensionIsEnabled) {
        button.value = 'enabled';
        button.textContent = chrome.i18n.getMessage('popup_disable');
    } else {
        button.value = 'disabled';
        button.textContent = chrome.i18n.getMessage('popup_enable');
    }
});

button.addEventListener('click', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs.length > 0) {
            if (button.value === 'enabled') {
                // Change button
                button.value = 'disabled';
                button.textContent = chrome.i18n.getMessage('popup_enable');
                // Change storage setting
                chrome.storage.local.set({ 'config.extensionIsEnabled': false });
                // Disable filter
                var message = { name: 'cs.disableFilter' }
                chrome.tabs.sendMessage(tabs[0].id, { message: message });
                // Disable context menu
                var updateProperties = { enabled: false };
                message = { name: 'bg.updateContextMenu', data: updateProperties };
                chrome.runtime.sendMessage({ message: message });
            } else {
                // Change button
                button.value = 'enabled';
                button.textContent = chrome.i18n.getMessage('popup_disable');
                // Change storage setting
                chrome.storage.local.set({ 'config.extensionIsEnabled': true });
                // Enable filter
                var message = { name: 'cs.enableFilter' }
                chrome.tabs.sendMessage(tabs[0].id, { message: message });
                // Enable context menu
                var updateProperties = { enabled: true };
                message = { name: 'bg.updateContextMenu', data: updateProperties };
                chrome.runtime.sendMessage({ message: message });
            }
        } else {
            console.warn('Failed to find the active tab.');
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    var links = document.getElementsByTagName('a');
    for (var i = 0; i < links.length; i++) {
        (function () {
            var a = links[i];
            var href = a.href;
            a.onclick = function () {
                chrome.tabs.create({ active: true, url: href });
            };
        })();
    }
});

})();
