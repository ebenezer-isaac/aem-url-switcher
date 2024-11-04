//settings.js

import { createServerItem } from './serverManager.js';
import { getAvailableColor } from './colorPickers.js';
import { getServers, saveServers, addServer, updateServer } from './storage.js';

document.addEventListener('DOMContentLoaded', init);

async function init() {
    const nicknameInput = document.getElementById('nickname');
    const urlInput = document.getElementById('url');
    const addServerButton = document.getElementById('add-server');
    const servers = await getServers(); // Load servers from storage

    Object.values(servers).forEach((server) => createServerItem(server));

    addServerButton.addEventListener('click', () => handleAddOrEditServer(nicknameInput, urlInput));
}

async function handleAddOrEditServer(nicknameInput, urlInput) {
    const nickname = nicknameInput.value.trim();
    const url = urlInput.value.trim();

    if (nickname && url) {
        const isEditMode = nicknameInput.dataset.editMode === 'true'; // Check if edit mode
        if (isEditMode) {
            const serverId = nicknameInput.dataset.serverId;
            await updateServerDetails(nickname, url, serverId);
        } else {
            await createNewServer(nickname, url);
        }

        // Reset input fields and edit mode attributes after save
        nicknameInput.value = '';
        urlInput.value = '';
        nicknameInput.removeAttribute('data-edit-mode');
        nicknameInput.removeAttribute('data-server-id');

        // Refresh server list without page reload
        refreshServerList();
    } else {
        alert('Please fill in both fields.');
    }
}

async function updateServerDetails(nickname, url, serverId) {
    const servers = await getServers();
    const existingServer = servers[serverId];
    if (existingServer) {
        existingServer.nickname = nickname;
        existingServer.url = url;
        await updateServer(existingServer); // Save updated server details
        refreshServerList(); // Refresh without reloading
    }
}

async function createNewServer(nickname, url) {
    const servers = await getServers();
    const availableColor = getAvailableColor(Object.values(servers));
    if (!availableColor) {
        alert('No available colors. Please change existing server colors.');
        return;
    }
    const newServer = {
        id: `server_${Date.now()}_${Math.floor(Math.random() * 1000)}`, // Generate unique ID
        nickname,
        url,
        color: availableColor,
        tabGroupId: null // Initialize with no tab group ID
    };
    await addServer(newServer);
    createServerItem(newServer);
}

function refreshServerList() {
    const serverList = document.getElementById('server-list');
    serverList.innerHTML = ''; // Clear existing items
    getServers().then((servers) =>
        Object.values(servers).forEach((server) => createServerItem(server))
    );
}