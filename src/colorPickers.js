//colorPicker.js

import { COLORS } from './constants.js';
import { updateTabGroup } from './tabGroup.js';
import { getServers, saveServers } from './storage.js';

let availableColors = [...COLORS];

export function createColorPicker(serverId, currentColor, servers = {}, serverItem) {
    const colorPicker = document.createElement('select');
    colorPicker.classList.add('material-input', 'server-input');

    populateColorPicker(colorPicker, currentColor, servers);

    colorPicker.addEventListener('change', async() => {
        const selectedColor = JSON.parse(colorPicker.value);
        serverItem.style.backgroundColor = selectedColor.value;

        try {
            await updateServerColor(serverId, selectedColor);
            updateOtherColorPickers(servers, selectedColor.name, serverId);
            updateTabGroup(serverId);
        } catch (error) {
            console.error("Error updating color:", error);
        }
    });

    return colorPicker;
}

function populateColorPicker(colorPicker, selectedColor = {}, servers = {}) {
    colorPicker.innerHTML = '';

    availableColors.forEach((color) => {
        const option = document.createElement('option');
        option.value = JSON.stringify(color);
        option.textContent = color.name;
        option.style.backgroundColor = color.value;

        const isUsedByAnotherServer = Object.values(servers).some(
            (server) => server.color.name === color.name && server.id !== selectedColor.id
        );

        if (isUsedByAnotherServer) {
            option.disabled = true;
        }
        colorPicker.appendChild(option);
    });

    if (selectedColor.value) {
        colorPicker.value = JSON.stringify(selectedColor);
    }
}

async function updateServerColor(serverId, selectedColor) {
    let servers = await getServers();
    if (servers[serverId]) {
        servers[serverId].color = selectedColor;
        await saveServers(servers);
    }
}

function updateOtherColorPickers(servers = {}, changedColorName, changedServerId) {
    const colorPickers = document.querySelectorAll('.server-item select');
    colorPickers.forEach((picker) => {
        const currentColorData = JSON.parse(picker.value);
        populateColorPicker(picker, currentColorData, servers);
    });
}

export function getAvailableColor(servers) {
    return availableColors.find(color => !servers.some(server => server.color.name === color.name)) || COLORS[0];
}