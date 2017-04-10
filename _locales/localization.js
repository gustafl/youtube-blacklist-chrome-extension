(function () {

    var regex = /__MSG_(\w+)__/g;

    // Loop through all elements
    var elements = document.getElementsByTagName('*');
    for (var i = 0; i < elements.length; i++)
    {
        // Search text nodes
        var childNodes = elements[i].childNodes;
        for (var j = 0; j < childNodes.length; j++) {
            if (childNodes[j].nodeType === 3) {
                if (childNodes[j].textContent.trim().length > 0) {
                    var text = childNodes[j].textContent;
                    text = text.replace(regex, function (match, messageName) {
                        return messageName ? chrome.i18n.getMessage(messageName) : '';
                    });
                    childNodes[j].textContent = text;
                }
            }
        }

        // Search attribute values
        var attributes = elements[i].attributes;
        for (var k = 0; k < attributes.length; k++) {
            var text = attributes[k].value;
            text = text.replace(regex, function (match, messageName) {
                return messageName ? chrome.i18n.getMessage(messageName) : '';
            });
            attributes[k].value = text;
        }
    }

})();
