chrome.commands.onCommand.addListener(function(command) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const activeTab = tabs[0];
        chrome.storage.sync.get('servers', function(data) {
            const servers = data.servers || [];
            if (servers.length === 0) {
                alert('No servers configured. Please add servers in the extension settings.');
                return;
            }
            const baseUrl = servers[0].url; // Default to the first server
            let currentPath = activeTab.url.split('.com')[1] || activeTab.url.split('.com')[0];
            currentPath = currentPath.replace(/(\.html)(\?wcmmode=disabled)?/, '');

            let newUrl = '';

            if (command === 'switch_to_editor') {
                newUrl = `${baseUrl}/editor.html${currentPath}.html`;
            } else if (command === 'switch_to_publish') {
                newUrl = `${baseUrl}${currentPath}.html?wcmmode=disabled`;
            } else if (command === 'switch_to_crxde') {
                newUrl = `${baseUrl}/crx/de/index.jsp#${currentPath}`;
            }

            chrome.tabs.create({ url: newUrl });
        });
    });
});