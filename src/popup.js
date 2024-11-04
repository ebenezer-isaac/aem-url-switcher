//popup.js

import { COLORS } from './constants.js';
import { createNewTabGroup, openTabInGroup } from './tabGroup.js';
import { getServers } from './storage.js';

document.addEventListener('DOMContentLoaded', async function() {
    const serverListElem = document.getElementById('server-list');
    const settingsBtn = document.getElementById('settings-btn');

    // Load servers from storage
    const servers = await getServers();
    if (Object.keys(servers).length === 0) {
        serverListElem.innerHTML = '<p>No servers added. Please add servers in settings.</p>';
    } else {
        serverListElem.innerHTML = '';
        const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const currentPath = currentTab.url;

        Object.keys(servers).forEach((serverId) => {
            const server = servers[serverId];
            const isCurrentServerPage = currentPath.includes(server.url);
            const isContentPage = currentPath.includes('/content');
            addServerToPopup(server, serverId, isCurrentServerPage, isContentPage, currentPath);
        });
    }

    settingsBtn.addEventListener('click', function() {
        chrome.runtime.openOptionsPage();
    });

    function addServerToPopup(server, serverId, isCurrentServerPage, isContentPage, currentPath) {
        const serverDiv = document.createElement('div');
        serverDiv.classList.add('server-entry');

        const colorHex = COLORS.find(c => c.name.toLowerCase() === server.color.name.toLowerCase()).value;
        serverDiv.style.backgroundColor = colorHex;

        const nicknameLink = document.createElement('a');
        nicknameLink.href = server.url; // Set the URL as the href
        nicknameLink.target = "_blank"; // Optional: opens the link in a new tab
        nicknameLink.style.textDecoration = "none"; // Optional: removes underline for styling
        const nicknameHeading = document.createElement('h4');
        nicknameHeading.textContent = server.nickname.substring(0, 15); // Limit to 15 characters if needed
        nicknameLink.appendChild(nicknameHeading); // Add <h4> inside <a>
        serverDiv.appendChild(nicknameLink);

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('button-container');

        const editorBtn = createModeButton('edit', 'Editor', serverId, `editor-${serverId}`);
        const publishBtn = createModeButton('public', 'Publish', serverId, `publish-${serverId}`);
        const crxdeBtn = createModeButton('code', 'CRXDE', serverId, `crxde-${serverId}`);

        buttonContainer.append(editorBtn, publishBtn, crxdeBtn);
        serverDiv.append(buttonContainer);
        serverListElem.appendChild(serverDiv);

        if (!isContentPage) {
            disableAllButtons({ editorBtn, publishBtn, crxdeBtn });
        } else if (isCurrentServerPage) {
            const mode = getCurrentMode(currentPath);
            disableButtonForMode(mode, { editorBtn, publishBtn, crxdeBtn });
        }
    }

    function createModeButton(iconName, mode, serverId, uniqueId) {
        const btn = document.createElement('button');
        btn.classList.add('material-button', 'small-button');
        btn.id = uniqueId;
        btn.innerHTML = `<span class="material-icons">${iconName}</span>`;
        btn.addEventListener('click', () => switchMode(mode, serverId));
        return btn;
    }

    async function switchMode(mode, serverId) {
        try {
            const servers = await getServers();
            const server = servers[serverId];

            const currentPath = await getCurrentPath();
            let newUrl = constructNewUrl(server.url, currentPath, mode);
            newUrl = newUrl.replace(/([^:]\/)\/+/g, '$1');

            if (server.tabGroupId) {
                // Open in existing tab group
                await openTabInGroup(newUrl, server);
            } else {
                // Create a new tab group if it doesn't exist
                await createNewTabGroup(newUrl, server);
            }
        } catch (error) {
            console.error("Error in switchMode:", error);
        }
    }

    function disableButtonForMode(mode, buttons) {
        const { editorBtn, publishBtn, crxdeBtn } = buttons;
        if (mode === 'Editor') editorBtn.classList.add('disabled', 'active');
        if (mode === 'Publish') publishBtn.classList.add('disabled', 'active');
        if (mode === 'CRXDE') crxdeBtn.classList.add('disabled', 'active');
    }

    function disableAllButtons(buttons) {
        const { editorBtn, publishBtn, crxdeBtn } = buttons;
        editorBtn.classList.add('disabled', 'active');
        publishBtn.classList.add('disabled', 'active');
        crxdeBtn.classList.add('disabled', 'active');
    }

    function getCurrentMode(url) {
        if (url.includes('/editor.html')) return 'Editor';
        if (url.includes('wcmmode=disabled')) return 'Publish';
        if (url.includes('/crx/de/index.jsp#')) return 'CRXDE';
        return '';
    }

    function constructNewUrl(baseUrl, currentPath, mode) {
        let newUrl = '';
        if (mode === 'Editor') newUrl = `${baseUrl}/editor.html${currentPath}.html`;
        if (mode === 'Publish') newUrl = `${baseUrl}${currentPath}.html?wcmmode=disabled`;
        if (mode === 'CRXDE') newUrl = `${baseUrl}/crx/de/index.jsp#${currentPath}`;
        return newUrl;
    }

    async function getCurrentPath() {
        const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        let currentPath = currentTab.url.split('://')[1].split('/');
        currentPath.shift();
        return "/" + currentPath.join("/").replace(/\/editor\.html|\/editor\//, '/').replace(/\/crx\/de\/index.jsp#/, '/').replace(/(\.html)(\?wcmmode=disabled)?/, '');
    }
});