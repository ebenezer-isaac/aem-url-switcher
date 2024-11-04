import { createServerItem } from './serverManager.js';
import { getAvailableColor } from './colorPickers.js';
import { Server } from './serverManager.js';

document.addEventListener('DOMContentLoaded', init);

async function init() {
    const nicknameInput = document.getElementById('nickname');
    const urlInput = document.getElementById('url');
    const addServerButton = document.getElementById('add-server');
    const servers = await Server.loadServers(); // Load servers here

    servers.forEach((server) => createServerItem(server));

    addServerButton.addEventListener('click', () => handleAddOrEditServer(nicknameInput, urlInput, servers));
}

async function handleAddOrEditServer(nicknameInput, urlInput, servers) {
    const nickname = nicknameInput.value.trim();
    const url = urlInput.value.trim();

    if (nickname && url) {
        const isEditMode = nicknameInput.dataset.editMode === 'true';
        if (isEditMode) {
            const serverId = nicknameInput.dataset.serverId;

            await updateServer(nickname, url, serverId, servers);
        } else {
            await addNewServer(nickname, url, servers);
        }
        nicknameInput.value = '';
        urlInput.value = '';
        nicknameInput.removeAttribute('data-edit-mode');
        nicknameInput.removeAttribute('data-server-id');
    } else {
        alert('Please fill in both fields.');
    }
}

async function updateServer(nickname, url, serverId, servers) {
    const updatedServer = new Server(serverId, nickname, url, servers[serverId].color); // Retain the existing color
    await Server.updateServer(updatedServer);
    refreshServerList();
}

async function addNewServer(nickname, url, servers) {
    const availableColor = getAvailableColor(servers);
    if (!availableColor) {
        alert('No available colors. Please change existing server colors.');
        return;
    }
    const newServer = new Server(null, nickname, url, availableColor);
    await Server.addServer(newServer);
    createServerItem(newServer);
}


function refreshServerList() {
    const serverList = document.getElementById('server-list');
    serverList.innerHTML = ''; // Clear existing items
    Server.loadServers().then((servers) => servers.forEach((server) => createServerItem(server)));
}

function showFeedback(message) {
    const feedbackElement = document.createElement('div');
    feedbackElement.innerText = message;
    feedbackElement.classList.add('feedback-message');
    document.body.appendChild(feedbackElement);

    setTimeout(() => feedbackElement.remove(), 3000);
}