// serverManager.js
import { createColorPicker } from './colorPickers.js';
import * as Storage from './storage.js'; // Import the storage module

export class Server {
    constructor(nickname, url, color) {
        this.nickname = nickname;
        this.url = url;
        this.color = color;
    }

    static async loadServers() {
        const serversData = await Storage.getServers();
        return serversData.map(server => new Server(server.nickname, server.url, server.color));
    }

    static async saveServers(servers) {
        await Storage.saveServers(servers);
    }

    static async updateServer(servers, index, updatedServer) {
        await Storage.updateServer(servers, index, updatedServer);
    }

    static async addServer(servers, newServer) {
        await Storage.addServer(servers, newServer);
    }

    static async deleteServer(servers, index) {
        await Storage.deleteServer(servers, index);
    }
}

// Function to create a server item and manage event listeners
export function createServerItem(serverList, server, index, servers) {
    const serverItem = document.createElement('div');
    serverItem.classList.add('server-item');
    serverItem.style.backgroundColor = server.color.value || '';

    const nicknameElem = createInputElement('text', server.nickname);
    const urlElem = createInputElement('text', server.url);
    const colorPicker = createColorPicker(index, server.color, servers, serverItem); // Call color picker creation

    const buttonContainer = createButtonContainer(
        () => deleteServer(serverItem, servers),
        () => handleEdit(nicknameElem, urlElem, index, servers)
    );

    serverItem.append(nicknameElem, urlElem, colorPicker, buttonContainer);
    serverList.appendChild(serverItem);
}

function createInputElement(type, value) {
    const input = document.createElement('input');
    Object.assign(input, { type, value, classList: ['material-input', 'server-input'], disabled: true });
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

async function deleteServer(serverItem, servers) {
    const index = Array.from(document.getElementById('server-list').children).indexOf(serverItem);
    await Server.deleteServer(servers, index); // Use the new deleteServer method
    serverItem.remove();
}

function handleEdit(nicknameElem, urlElem, index, servers) {
    document.getElementById('nickname').value = nicknameElem.value;
    document.getElementById('url').value = urlElem.value;
    document.getElementById('add-server').innerHTML = '<span class="material-icons">save</span> &nbsp; Save Changes';

    // Optionally, enable the input fields for editing
    nicknameElem.disabled = false;
    urlElem.disabled = false;

    // Add a click handler for saving changes
    document.getElementById('add-server').onclick = async() => {
        const updatedServer = new Server(
            document.getElementById('nickname').value,
            document.getElementById('url').value, { name: nicknameElem.color.name, value: nicknameElem.color.value } // Update color as well
        );
        await Server.updateServer(servers, index, updatedServer);

        // Refresh server list or any other necessary UI update here
        location.reload(); // Reload to reflect changes or you can implement a more targeted update
    };
}