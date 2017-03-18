chrome.runtime.onMessage.addListener(function (request, sender, response) {
    console.log(request);
    console.log(sender);
    if (request.action == 'show') {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs.length > 0) {
                console.info(tabs[0].title);
                chrome.pageAction.show(tabs[0].id);
            } 
        });
    }
});
