//serverManager.js

import { createColorPicker } from './colorPickers.js';
import * as Storage from './storage.js';

export class Server {
    constructor(id, nickname, url, color) {
        this.id = id || Server.generateUniqueId(); // Unique ID, reused if provided
        this.nickname = nickname;
        this.url = url;
        this.color = color;
    }

    static generateUniqueId() {
        return `server_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    }
    static async loadServers() {
        const servers = await Storage.getServers();
        return Object.values(servers).map(
            serverData => new Server(serverData.id, serverData.nickname, serverData.url, serverData.color)
        );
    }

    static async updateServer(updatedServer) {
        const servers = await Storage.getServers();
        servers[updatedServer.id] = updatedServer;
        await Storage.saveServers(servers);
    }

    static async addServer(newServer) {
        const servers = await Storage.getServers();
        servers[newServer.id] = newServer;
        await Storage.saveServers(servers);
    }

    static async deleteServer(serverId) {
        const servers = await Storage.getServers();
        delete servers[serverId];
        await Storage.saveServers(servers);
    }
}

// Function to create a server item and manage event listeners
export async function createServerItem(server) {
    const serverItem = document.createElement('div');
    serverItem.classList.add('server-item');
    serverItem.style.backgroundColor = server.color.value || '';

    const nicknameElem = createInputElement('text', server.nickname);
    const urlElem = createInputElement('text', server.url);
    const colorPicker = createColorPicker(server.id, server.color);

    const buttonContainer = createButtonContainer(
        () => deleteServer(serverItem, server.id),
        () => handleEdit(nicknameElem, urlElem, server.id, server.color)
    );

    serverItem.append(nicknameElem, urlElem, colorPicker, buttonContainer);
    document.getElementById('server-list').appendChild(serverItem);
}

function createInputElement(type, value) {
    const input = document.createElement('input');
    Object.assign(input, { type, value, disabled: true });
    input.classList.add('material-input', 'server-input');
    return input;
}

function createButtonContainer(deleteHandler, editHandler) {
    const container = document.createElement('div');
    container.classList.add('server-buttons');
    container.append(createButton('delete', deleteHandler), createButton('edit', editHandler));
    return container;
}

function createButton(icon, clickHandler) {
    const button = document.createElement('button');
    button.classList.add('icon-button');
    button.innerHTML = `<span class="material-icons">${icon}</span>`;
    button.addEventListener('click', clickHandler);
    return button;
}

async function deleteServer(serverItem, serverId) {
    await Storage.deleteServer(serverId);
    serverItem.remove();
}

function handleEdit(nicknameElem, urlElem, serverId, color) {
    const nicknameInput = document.getElementById('nickname');
    const urlInput = document.getElementById('url');
    const addServerButton = document.getElementById('add-server');

    nicknameInput.value = nicknameElem.value;
    urlInput.value = urlElem.value;
    addServerButton.innerHTML = '<span class="material-icons">save</span> &nbsp; Save Changes';

    nicknameElem.disabled = false;
    urlElem.disabled = false;

    addServerButton.onclick = async() => {
        const updatedServer = new Server(
            serverId,
            nicknameInput.value,
            urlInput.value,
            color // Retain the original color
        );
        await Storage.updateServer(updatedServer);

        location.reload(); // Reload to reflect changes or implement a targeted update
    };
}