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

                servers.forEach((server, index) => {
                    let isCurrentServerPage = currentPath.includes(server.url);

                    addServerToPopup(server, index, isCurrentServerPage, currentPath);
                });
            });
        }
    });

    settingsBtn.addEventListener('click', function() {
        chrome.runtime.openOptionsPage();
    });

    function addServerToPopup(server, index, isCurrentServerPage, currentPath) {
        const serverDiv = document.createElement('div');
        serverDiv.classList.add('server-entry');
        serverDiv.style.backgroundColor = server.color;
        console.log(server.color)
        console.log(server)

        const nickname = document.createElement('h4');
        nickname.textContent = server.nickname.substring(0, 15); // Limit nickname to 15 characters
        serverDiv.appendChild(nickname);

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('button-container');

        const editorBtn = createModeButton('edit', 'Editor', server.url, `editor-${index}`);
        const publishBtn = createModeButton('public', 'Publish', server.url, `publish-${index}`);
        const crxdeBtn = createModeButton('code', 'CRXDE', server.url, `crxde-${index}`);

        buttonContainer.appendChild(editorBtn);
        buttonContainer.appendChild(publishBtn);
        buttonContainer.appendChild(crxdeBtn);

        serverDiv.appendChild(buttonContainer);
        serverListElem.appendChild(serverDiv);

        // Disable and highlight buttons based on the current page and mode
        if (isCurrentServerPage) {
            // Only disable buttons for the current server
            if (isCurrentMode(currentPath, 'Editor')) {
                editorBtn.classList.add('disabled', 'active');
                editorBtn.disabled = true;
            } else if (isCurrentMode(currentPath, 'Publish')) {
                publishBtn.classList.add('disabled', 'active');
                publishBtn.disabled = true;
            } else if (isCurrentMode(currentPath, 'CRXDE')) {
                crxdeBtn.classList.add('disabled', 'active');
                crxdeBtn.disabled = true;
            }
        }
    }

    function createModeButton(iconName, mode, baseUrl, uniqueId) {
        const btn = document.createElement('button');
        btn.classList.add('material-button', 'small-button');
        btn.id = uniqueId; // Assign unique ID to button
        btn.innerHTML = `<span class="material-icons">${iconName}</span>`;
        btn.addEventListener('click', () => switchMode(baseUrl, mode));
        return btn;
    }

    function switchMode(baseUrl, mode) {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            let currentPath = tabs[0].url;

            currentPath = currentPath.split('://')[1].split('/');
            currentPath.shift(); // remove the protocol part

            currentPath = "/" + currentPath.join("/");

            // Remove mode-specific parts of the URL
            currentPath = currentPath.replace(/\/editor\.html|\/editor\//, '/');
            currentPath = currentPath.replace(/\/crx\/de\/index\.jsp#/, '/');
            currentPath = currentPath.replace(/(\.html)(\?wcmmode=disabled)?/, '');

            // Build the new URL for the selected mode
            let newUrl = '';
            if (mode === 'Editor') {
                newUrl = `${baseUrl}/editor.html${currentPath}.html`;
            } else if (mode === 'Publish') {
                newUrl = `${baseUrl}${currentPath}.html?wcmmode=disabled`;
            } else if (mode === 'CRXDE') {
                newUrl = `${baseUrl}/crx/de/index.jsp#${currentPath}`;
            }

            newUrl = newUrl.replace(/([^:]\/)\/+/g, '$1'); // Fix double slashes

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
});