chrome.runtime.onMessage.addListener(function (request, sender, response) {
    if (request.action === 'checkForClowns') {
        console.info('A checkForClowns action was triggered.');
    }
});

chrome.runtime.sendMessage({ action: 'show' });
