// settings.js
import { createServerItem } from './serverManager.js';
import { getAvailableColor } from './colorPickers.js'; // Import the function
import { Server } from './serverManager.js';

document.addEventListener('DOMContentLoaded', init);

async function init() {
    const serverList = document.getElementById('server-list');
    const nicknameInput = document.getElementById('nickname');
    const urlInput = document.getElementById('url');
    const addServerButton = document.getElementById('add-server');
    let editIndex = null;
    let servers = await Server.loadServers();

    servers.forEach((server, index) => createServerItem(serverList, server, index, servers));

    addServerButton.addEventListener('click', () => handleAddServer(nicknameInput, urlInput, editIndex, servers));
}

async function handleAddServer(nicknameInput, urlInput, editIndex, servers) {
    const nickname = nicknameInput.value.trim();
    const url = urlInput.value.trim();

    if (nickname && url) {
        editIndex !== null ? await updateServer(nickname, url, servers, editIndex) : await addNewServer(nickname, url, servers);
        nicknameInput.value = '';
        urlInput.value = '';
    } else {
        alert('Please fill in both fields.');
    }
}

async function updateServer(nickname, url, servers, editIndex) {
    const updatedServer = new Server(nickname, url, servers[editIndex].color); // Retain the existing color
    await Server.updateServer(servers, editIndex, updatedServer);
}

async function addNewServer(nickname, url, servers) {
    const availableColor = getAvailableColor(servers);
    if (!availableColor) {
        alert('No available colors. Please change existing server colors.');
        return;
    }
    const newServer = new Server(nickname, url, availableColor);
    await Server.addServer(servers, newServer);
    createServerItem(document.getElementById('server-list'), newServer, servers.length, servers);
}

function showFeedback(message) {
    const feedbackElement = document.createElement('div');
    feedbackElement.innerText = message;
    feedbackElement.classList.add('feedback-message');
    document.body.appendChild(feedbackElement);

    setTimeout(() => feedbackElement.remove(), 3000);
}