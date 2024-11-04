import { COLORS } from './constants.js';
import { updateTabGroup } from './tabGroup.js';
import { getServers, saveServers } from './storage.js';

let availableColors = [...COLORS];

export function createColorPicker(serverId, servers, serverItem) {
    const colorPicker = document.createElement('select');
    colorPicker.classList.add('material-input', 'server-input');
    const usedColors = findUsedColors(servers)
        // Populate color picker based on current server state
    const serverColor = JSON.stringify(servers[serverId].color);
    populateColorPicker(colorPicker, usedColors, serverColor);
    colorPicker.addEventListener('change', async() => {
        const selectedColor = JSON.parse(colorPicker.value);
        serverItem.style.backgroundColor = selectedColor.value;
        try {

            const servers = await updateServerColor(serverId, selectedColor);
            // Update color pickers for all servers

            updateOtherColorPickers(servers);
            updateTabGroup(serverId);
        } catch (error) {
            console.error("Error updating color:", error);
        }
    });

    return colorPicker;
}

function populateColorPicker(colorPicker, usedColors, selectedColor) {
    colorPicker.innerHTML = ''; // Clear previous options

    availableColors.forEach((color) => {
        const option = document.createElement('option');
        option.value = JSON.stringify(color);
        option.textContent = color.name;
        option.style.backgroundColor = color.value;

        // Disable colors already used by other servers, except for the current server
        const isUsedByAnotherServer = usedColors.has(color.name);
        option.disabled = isUsedByAnotherServer;

        colorPicker.appendChild(option);
    });

    // Set the current selected color after populating options
    if (selectedColor) {
        colorPicker.value = selectedColor;
    }

}



async function updateServerColor(serverId, selectedColor) {
    const servers = await getServers();
    if (servers[serverId]) {
        servers[serverId].color = selectedColor;
        await saveServers(servers);
    }
    return servers
}

function updateOtherColorPickers(servers) {
    const colorPickers = document.querySelectorAll('.server-item select');
    colorPickers.forEach((picker) => {
        const usedColors = findUsedColors(servers)
        populateColorPicker(picker, usedColors, picker.value)
            // const currentColorData = JSON.parse(picker.value);
            // populateColorPicker(picker, currentColorData, servers, serverId);
    });
}

function findUsedColors(servers) {
    return new Set(Object.values(servers).map(server => server.color.name));
}

export function getAvailableColor(servers) {
    const usedColors = new Set(Object.values(servers).map(server => server.color.name));
    // Find the first color not in use
    const availableColor = availableColors.find(color => !usedColors.has(color.name));
    // If all colors are used, return null to indicate no availability
    return availableColor || null;
}