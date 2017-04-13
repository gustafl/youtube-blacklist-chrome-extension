(function () {

'use strict';

var button = document.querySelector('button.disable');

chrome.storage.local.get('config.extensionIsEnabled', function (items) {
    button.textContent = (items['config.extensionIsEnabled']) ? 'Disable' : 'Enable';
});

button.addEventListener('click', function () {
    if (button.textContent === 'Disable') {
        button.textContent = 'Enable';
        chrome.storage.local.set({ 'config.extensionIsEnabled': false });
        var message =  { name: 'getUsers' };
        chrome.runtime.sendMessage({ message: message });
    } else {
        button.textContent = 'Disable';
        chrome.storage.local.set({ 'config.extensionIsEnabled': true });
        var message =  { name: 'getUsers' };
        chrome.runtime.sendMessage({ message: message });
    }
});

var blacklisted = document.querySelector('.blacklisted');
var blacklistedDetails = document.querySelector('.blacklisted-details');
blacklisted.addEventListener('click', function () {
    if (blacklistedDetails.classList.contains('hidden')) {
        blacklistedDetails.classList.remove('hidden');
    } else {
        blacklistedDetails.classList.add('hidden');
    }
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
