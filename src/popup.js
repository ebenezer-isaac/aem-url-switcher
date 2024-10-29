import { COLORS } from './constants.js';
import { createNewTabGroup, updateTabGroup } from './tabGroup.js';

document.addEventListener('DOMContentLoaded', function() {
    const serverListElem = document.getElementById('server-list');
    const settingsBtn = document.getElementById('settings-btn');

    chrome.storage.sync.get('servers', function(data) {
        console.log(data); // Debug log to check what is being retrieved
        const servers = data.servers || [];

        if (servers.length === 0) {
            serverListElem.innerHTML = '<p>No servers added. Please add servers in settings.</p>';
        } else {
            serverListElem.innerHTML = ''; // Clear previous content
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

        const colorHex = COLORS.find(c => c.name.toLowerCase() === server.color.name.toLowerCase()).value;
        serverDiv.style.backgroundColor = colorHex; // Use hex code for popup display

        const nickname = document.createElement('h4');
        nickname.textContent = server.nickname.substring(0, 15);
        serverDiv.appendChild(nickname);

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('button-container');

        const editorBtn = createModeButton('edit', 'Editor', server.url, server.nickname, server.color.name.toLowerCase(), `editor-${index}`);
        const publishBtn = createModeButton('public', 'Publish', server.url, server.nickname, server.color.name.toLowerCase(), `publish-${index}`);
        const crxdeBtn = createModeButton('code', 'CRXDE', server.url, server.nickname, server.color.name.toLowerCase(), `crxde-${index}`);

        buttonContainer.appendChild(editorBtn);
        buttonContainer.appendChild(publishBtn);
        buttonContainer.appendChild(crxdeBtn);

        serverDiv.appendChild(buttonContainer);
        serverListElem.appendChild(serverDiv);

        if (isCurrentServerPage) {
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

    function createModeButton(iconName, mode, baseUrl, nickname, colorName, uniqueId) {
        const btn = document.createElement('button');
        btn.classList.add('material-button', 'small-button');
        btn.id = uniqueId;
        btn.innerHTML = `<span class="material-icons">${iconName}</span>`;
        btn.addEventListener('click', () => switchMode(baseUrl, mode, nickname, colorName));
        return btn;
    }

    function switchMode(baseUrl, mode, nickname, colorName) {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            let currentTab = tabs[0];
            let currentPath = currentTab.url;

            // Normalize the path
            currentPath = currentPath.split('://')[1].split('/');
            currentPath.shift();
            currentPath = "/" + currentPath.join("/");

            currentPath = currentPath.replace(/\/editor\.html|\/editor\//, '/');
            currentPath = currentPath.replace(/\/crx\/de\/index.jsp#/, '/');
            currentPath = currentPath.replace(/(\.html)(\?wcmmode=disabled)?/, '');

            let newUrl = '';
            if (mode === 'Editor') {
                newUrl = `${baseUrl}/editor.html${currentPath}.html`;
            } else if (mode === 'Publish') {
                newUrl = `${baseUrl}${currentPath}.html?wcmmode=disabled`;
            } else if (mode === 'CRXDE') {
                newUrl = `${baseUrl}/crx/de/index.jsp#${currentPath}`;
            }
            newUrl = newUrl.replace(/([^:]\/)\/+/g, '$1');

            // Retrieve updated server information from storage
            chrome.storage.sync.get('servers', function(data) {
                const servers = data.servers || [];
                const server = servers.find(s => s.nickname === nickname);

                if (server && server.tabGroupId) {
                    // Attempt to use the updated tabGroupId
                    chrome.tabGroups.get(server.tabGroupId, function(group) {
                        if (chrome.runtime.lastError || group.color !== colorName || group.title !== nickname) {
                            // Create a new group if the existing one is invalid or mismatched
                            createNewTabGroup(newUrl, nickname, colorName, servers, server);
                        } else {
                            // Use the existing, valid tab group
                            openTabInGroup(newUrl, server.tabGroupId);
                        }
                    });
                } else {
                    // No valid tabGroupId, create a new group
                    createNewTabGroup(newUrl, nickname, colorName, servers, server);
                }
            });
        });
    }

    function openTabInGroup(url, groupId) {
        chrome.tabs.create({ url: url }, function(newTab) {
            chrome.tabs.group({ tabIds: newTab.id, groupId: groupId });
        });
    }

    // Function to create a new tab group, update color and title, and save the group ID
    function createNewTabGroup(url, nickname, colorName, servers, server) {
        chrome.tabs.create({ url: url }, function(newTab) {
            chrome.tabs.group({ tabIds: newTab.id }, function(groupId) {
                chrome.tabGroups.update(groupId, { color: colorName, title: nickname });

                // Update the server entry with the new tabGroupId
                if (server) {
                    server.tabGroupId = groupId;
                } else {
                    servers.push({ nickname: nickname, color: { name: colorName }, tabGroupId: groupId });
                }

                // Save updated servers with the new tabGroupId to chrome.storage.sync
                chrome.storage.sync.set({ servers: servers });
            });
        });
    }

    function isCurrentMode(url, mode) {
        if (mode === 'Editor' && url.includes('/editor.html')) return true;
        if (mode === 'Publish' && url.includes('wcmmode=disabled')) return true;
        if (mode === 'CRXDE' && url.includes('/crx/de/index.jsp#')) return true;
        return false;
    }
});