(function () {

'use strict';

var button = document.querySelector('#filtering-enabled');

// Get all items from storage
chrome.storage.local.get(function (items) {
    // Load the enable/disable setting
    var extensionIsEnabled = items['config.extensionIsEnabled'];
    if (extensionIsEnabled) {

    }
    button.textContent = (items['config.extensionIsEnabled']) ? 'Disable' : 'Enable';
});

button.addEventListener('click', function () {
    if (button.value === 'enabled') {
        button.value = 'disabled';
        button.textContent = chrome.i18n.getMessage('popup_enable');
        chrome.storage.local.set({ 'config.extensionIsEnabled': false });
    } else {
        button.value = 'enabled';
        button.textContent = chrome.i18n.getMessage('popup_disable');
        chrome.storage.local.set({ 'config.extensionIsEnabled': true });
    }
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs.length > 0) {
            var message = { name: 'getUsers', data: tabs[0] };
            chrome.runtime.sendMessage({ message: message });
        } else {
            console.warn('No tab found.');
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
