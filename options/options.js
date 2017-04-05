'use strict';

chrome.storage.local.get(function (items) {
    console.log(items);
    var table = document.querySelector('table');
    var tbody = document.querySelector('tbody');
    for (var key in items) {
        if (items.hasOwnProperty(key)) {
            console.log(key);
            console.log(items[key]);
            if (key.indexOf('config.') < 0) {
                var tr = document.createElement('tr');
                tbody.appendChild(tr);
                var td = document.createElement('td');
                tr.appendChild(td);
                var author = items[key].author;
                td.textContent = author;
                td.setAttribute('data-ytid', key);
                td = document.createElement('td');
                tr.appendChild(td);
                var img = document.createElement('img');
                td.appendChild(img);
                img.setAttribute('src', chrome.runtime.getURL('images/remove.png'));
                img.setAttribute('alt', 'Remove');
                img.setAttribute('title', 'Remove ' + author + ' from the blacklist.');
            }
        }
    }
    table.appendChild(tbody);
});
