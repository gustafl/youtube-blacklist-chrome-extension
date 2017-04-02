'use strict';

console.log('Hello from popup!');

var button = document.querySelector('button.disable');

var blacklisted = document.querySelector('.blacklisted');
var blacklistedDetails = document.querySelector('.blacklisted-details');
blacklisted.addEventListener('click', function () {
    if (blacklistedDetails.classList.contains('hidden')) {
        blacklistedDetails.classList.remove('hidden');
    } else {
        blacklistedDetails.classList.add('hidden');
    }
});


var whitelisted = document.querySelector('.whitelisted');
var whitelistedDetails = document.querySelector('.whitelisted-details');
whitelisted.addEventListener('click', function () {
    if (whitelistedDetails.classList.contains('hidden')) {
        whitelistedDetails.classList.remove('hidden');
    } else {
        whitelistedDetails.classList.add('hidden');
    }
});

