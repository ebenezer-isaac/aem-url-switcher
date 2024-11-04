import { createServerItem } from './serverManager.js';
import { getAvailableColor } from './colorPickers.js';
import { updateTabGroup } from './tabGroup.js';
import { getServers, saveServers, addServer, updateServer } from './storage.js';

document.addEventListener('DOMContentLoaded', init);

async function init() {
    const nicknameInput = document.getElementById('nickname');
    const urlInput = document.getElementById('url');
    const addServerButton = document.getElementById('add-server');

    await refreshServerList(); // Load servers on page load

    addServerButton.addEventListener('click', () => handleAddOrEditServer(nicknameInput, urlInput));

    // Fetch current shortcuts and update display on settings page
    chrome.commands.getAll(commands => {
        commands.forEach(command => {
            if (command.name === "_execute_action") return; // Skip internal Chrome command
            switch (command.name) {
                case "switch_to_editor":
                    document.getElementById("editor-shortcut").textContent = command.shortcut || "Not Set";
                    break;
                case "switch_to_publish":
                    document.getElementById("publish-shortcut").textContent = command.shortcut || "Not Set";
                    break;
                case "switch_to_crxde":
                    document.getElementById("crxde-shortcut").textContent = command.shortcut || "Not Set";
                    break;
                default:
                    console.warn(`Unknown command: ${command.name}`);
            }
        });
    });
}

async function handleAddOrEditServer(nicknameInput, urlInput) {
    const nickname = nicknameInput.value.trim();
    const url = urlInput.value.trim();
    const addServerButton = document.getElementById('add-server');

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

        // Revert button text to "Add Server" after saving changes
        addServerButton.innerHTML = '<span class="material-icons">add</span> &nbsp; Add Server';

        // Refresh server list to reflect changes
        await refreshServerList();
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
        await updateTabGroup(serverId);
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
}

async function refreshServerList() {
    const serverList = document.getElementById('server-list');
    serverList.innerHTML = ''; // Clear existing items
    const servers = await getServers();
    Object.values(servers).forEach((server) => createServerItem(server, servers));
}