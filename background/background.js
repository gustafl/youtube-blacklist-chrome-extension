var URL_PATTERN = '://www.youtube.com/watch?v=';

chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
    if (details.frameId === 0) {
        chrome.tabs.get(details.tabId, function (tab) {
            if (tab.url === details.url && tab.url.indexOf(URL_PATTERN) > -1) {
                console.log('onHistoryStateUpdated: ' + tab.url);
                chrome.pageAction.show(tab.id);
            }
        });
    }
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function (tab) {
        if (tab.url.indexOf(URL_PATTERN) > -1) {
            console.log('onActivated: ' + tab.url);
            chrome.pageAction.show(tab.id);
        }
    });
});

/*chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (tab.status == 'complete') {
        console.log(tab);
        chrome.tabs.get(tabId, function (tab) {
            if (tab.url.indexOf(URL_PATTERN) > -1) {
                console.log('onUpdated: ' + tab.url);
                chrome.pageAction.show(tab.id);
            }
        });
    }
});*/

/*chrome.runtime.onMessage.addListener(function (request, sender, response) {
    if (request.action == 'show') {
        console.info('runtime.onMessage');
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs.length > 0) {
                
            } 
        });
    }
});*/

/*chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete') {
        console.info('tabs.onUpdated');
        console.log(tabId);
        console.log(changeInfo);
        console.log(tab);
        
    }
});
*/