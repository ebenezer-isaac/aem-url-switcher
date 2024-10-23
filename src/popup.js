document.addEventListener('DOMContentLoaded', function() {
    const serverListElem = document.getElementById('server-list');
    const settingsBtn = document.getElementById('settings-btn');

    // Load servers from storage
    chrome.storage.sync.get('servers', async function(data) {
        const servers = data.servers || [];
        if (servers.length === 0) {
            serverListElem.innerHTML = '<p>No servers added. Please add servers in settings.</p>';
        } else {
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                let currentPath = tabs[0].url;
                let isValidServerPage = false;
                servers.forEach((server, index) => {
                    console.log(currentPath, server.url)
                    console.log(currentPath.includes(server.url));
                    if (currentPath.includes(server.url)) {
                        isValidServerPage = true;
                    }
                });
                console.log(isValidServerPage);
                servers.forEach((server, index) => {
                    addServerToPopup(server, index, isValidServerPage);
                });
            });
        }
    });

    settingsBtn.addEventListener('click', function() {
        chrome.runtime.openOptionsPage();
    });

    function addServerToPopup(server, index, isValidServerPage) {
        const serverDiv = document.createElement('div');
        serverDiv.classList.add('server-entry');

        const nickname = document.createElement('h4');
        nickname.textContent = server.nickname.substring(0, 15); // Limit nickname to 15 characters
        serverDiv.appendChild(nickname);

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('button-container');

        const editorBtn = createModeButton('edit', 'Editor', server.url);
        const publishBtn = createModeButton('public', 'Publish', server.url);
        const crxdeBtn = createModeButton('code', 'CRXDE', server.url);

        buttonContainer.appendChild(editorBtn);
        buttonContainer.appendChild(publishBtn);
        buttonContainer.appendChild(crxdeBtn);

        serverDiv.appendChild(buttonContainer);
        serverListElem.appendChild(serverDiv);

        // Disable and highlight the button for the current mode
        if (isValidServerPage) {
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                const activeTabUrl = tabs[0].url;
                if (isCurrentServer(activeTabUrl, server.url)) {
                    if (isCurrentMode(activeTabUrl, 'Editor')) {
                        editorBtn.classList.add('disabled', 'active');
                        editorBtn.disabled = true;
                    } else if (isCurrentMode(activeTabUrl, 'Publish')) {
                        publishBtn.classList.add('disabled', 'active');
                        publishBtn.disabled = true;
                    } else if (isCurrentMode(activeTabUrl, 'CRXDE')) {
                        crxdeBtn.classList.add('disabled', 'active');
                        crxdeBtn.disabled = true;
                    }
                }
            });
        } else {
            editorBtn.classList.add('disabled', 'active');
            editorBtn.disabled = true;
            publishBtn.classList.add('disabled', 'active');
            publishBtn.disabled = true;
            crxdeBtn.classList.add('disabled', 'active');
            crxdeBtn.disabled = true;
        }
    }

    function createModeButton(iconName, mode, baseUrl) {
        const btn = document.createElement('button');
        btn.classList.add('material-button', 'small-button');
        btn.innerHTML = `<span class="material-icons">${iconName}</span>`;
        btn.addEventListener('click', () => switchMode(baseUrl, mode));
        return btn;
    }

    function switchMode(baseUrl, mode) {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            let currentPath = tabs[0].url

            currentPath = currentPath.split('://')[1].split('/');

            currentPath.shift();

            currentPath = "/" + currentPath.join("/")
            console.log(currentPath)
                // Remove '/editor.html', '/editor/' or '/crx/de/index.jsp#' from the path
            currentPath = currentPath.replace(/\/editor\.html|\/editor\//, '/'); // Remove '/editor.html' or '/editor/'
            currentPath = currentPath.replace(/\/crx\/de\/index\.jsp#/, '/'); // Remove '/crx/de/index.jsp#'

            // Remove any trailing '.html' or '.html?wcmmode=disabled'
            currentPath = currentPath.replace(/(\.html)(\?wcmmode=disabled)?/, '');

            // Ensure there is only one leading slash
            currentPath = currentPath.replace(/^\/+/, '/'); // Ensure the path starts with one '/'

            let newUrl = '';

            // Handle different modes
            if (mode === 'Editor') {
                newUrl = `${baseUrl}/editor.html${currentPath}.html`; // Editor mode should append .html
            } else if (mode === 'Publish') {
                newUrl = `${baseUrl}${currentPath}.html?wcmmode=disabled`; // Publish mode appends '.html?wcmmode=disabled'
            } else if (mode === 'CRXDE') {
                newUrl = `${baseUrl}/crx/de/index.jsp#${currentPath}`; // CRXDE requires '#'
            }

            // Ensure there is no double slashes in the final URL
            newUrl = newUrl.replace(/([^:]\/)\/+/g, '$1'); // Replace any occurrence of double slashes, excluding the protocol part

            chrome.tabs.create({ url: newUrl });
        });
    }

    function isCurrentMode(url, mode) {
        if (mode === 'Editor' && url.includes('/editor.html')) {
            return true;
        } else if (mode === 'Publish' && url.includes('wcmmode=disabled')) {
            return true;
        } else if (mode === 'CRXDE' && url.includes('/crx/de/index.jsp#')) {
            return true;
        }
        return false;
    }

    function isCurrentServer(url, serverUrl) {
        return url.includes(serverUrl);
    }
});