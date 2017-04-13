(function () {

'use strict';

chrome.storage.local.get(function (items) {

    var table = document.querySelector('table');
    var tbody = document.querySelector('tbody');
    table.appendChild(tbody);

    // Convert 'items' object to an array, because only arrays can be sorted
    var array = [];
    for (var key in items) {
        // Skip configuration items
        if (key.indexOf('config.') < 0) {
            var object = {};
            object[key] = items[key];
            array.push(object);
        }
    }

    // Show the total number of users
    var totalUsers = document.querySelector('.total-users');
    totalUsers.textContent = array.length;

    // Sort the objects in the array on the 'author' property
    array.sort(function (a, b) {
        var aKey = Object.keys(a)[0];
        var aValue = a[aKey];
        var bKey = Object.keys(b)[0];
        var bValue = b[bKey];
        if (aValue.author.toUpperCase() < bValue.author.toUpperCase()) {
            return -1;
        }
        if (aValue.author.toUpperCase() > bValue.author.toUpperCase()) {
            return 1;
        }
        return 0;
    });

    // Output sorted author names in table
    for (var i = 0; i < array.length; i++) {
        var object = array[i];
        var key = Object.keys(object)[0];
        var value = object[key];
        var tr = document.createElement('tr');
        tbody.appendChild(tr);
        var td = document.createElement('td');
        tr.appendChild(td);
        td.textContent = value.author;
        td.setAttribute('data-ytid', key);
        td = document.createElement('td');
        tr.appendChild(td);
        var img = document.createElement('img');
        td.appendChild(img);
        img.setAttribute('src', chrome.runtime.getURL('images/remove.png'));
        img.setAttribute('alt', chrome.i18n.getMessage('options_remove_user'));
        img.setAttribute('title', chrome.i18n.getMessage('options_remove_user'));
        img.addEventListener('click', function (event) {
            var td = event.target.parentElement.previousSibling;
            var userId = td.getAttribute('data-ytid');
            chrome.storage.local.remove(userId);
            tr = td.parentElement;
            tr.remove();
            totalUsers.textContent -= 1;
        });
    }

    // Handle replace/hide setting
    var replaceOrHide = items['config.replaceOrHide'];
    var replaceRadioButton = document.querySelector('#replace');
    var hideRadioButton = document.querySelector('#hide');
    // If there is a setting in storage
    if (replaceOrHide) {
        if (replaceOrHide === 'replace') {
            replaceRadioButton.checked = true;
        } else {
            hideRadioButton.checked = true;
        }
    } else {
        // If there is no setting, set default value
        replaceRadioButton.checked = true;
        chrome.storage.local.set({ 'config.replaceOrHide': 'replace' });
    }

    // Handle clicks on the replace/ride radio buttons
    var replaceOrHideButtons = document.querySelectorAll('input[name="replaceOrHide"]');
    replaceOrHideButtons.forEach(function (element) {
        element.addEventListener('click', function (event) {
            var input = event.target;
            var value = input.getAttribute('value');
            chrome.storage.local.set({ 'config.replaceOrHide': value });
        });
    });
});

})();
