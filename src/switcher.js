chrome.commands.onCommand.addListener(function(command) {
    if (command === '_execute_action') {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            const currentUrl = tabs[0].url;
            const pageType = currentUrl.includes('editor.html') ? 'Editor' : 'Publish';
            const newUrl = pageType === 'Editor' ?
                currentUrl.replace('editor.html', '') + '?wcmmode=disabled' :
                currentUrl.replace('?wcmmode=disabled', 'editor.html');
            chrome.tabs.create({ url: newUrl });
        });
    }
});