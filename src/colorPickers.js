import { COLORS } from './constants.js';
import { updateTabGroup } from './tabGroup.js'; // Import the updateTabGroup function
import { getServers, saveServers } from './storage.js'; // Import necessary functions from storage.js

let availableColors = [...COLORS]; // Initialize available colors from the COLORS constant

export function createColorPicker(serverIndex, currentColor, servers, serverItem) {
    const colorPicker = document.createElement('select');
    colorPicker.classList.add('material-input', 'server-input');

    populateColorPicker(colorPicker, currentColor, servers);

    // Set the event listener for color change
    colorPicker.addEventListener('change', async() => {
        const selectedColor = JSON.parse(colorPicker.value);
        serverItem.style.backgroundColor = selectedColor.value;

        try {
            // Save the updated color to the server immediately
            await updateColor(serverIndex, selectedColor, servers);

            // Update the other color pickers
            updateOtherColorPickers(servers, selectedColor.name, serverIndex);

            // Update the tab group's color if it exists
            if (servers[serverIndex].tabGroupId) {
                updateTabGroup(servers[serverIndex].nickname, selectedColor.name, servers[serverIndex].tabGroupId);
            }
        } catch (error) {
            console.error("Error updating color:", error);
        }
    });

    return colorPicker;
}

function populateColorPicker(colorPicker, selectedColor = {}, servers) {
    colorPicker.innerHTML = '';

    // Create the dropdown options for all colors
    availableColors.forEach((color) => {
        const option = document.createElement('option');
        option.value = JSON.stringify(color);
        option.textContent = color.name;
        option.style.backgroundColor = color.value;

        // Disable the color if it's already used by another server and it's not the current selection
        const isUsedByAnotherServer = servers.some((server, index) =>
            server.color.name === color.name && index !== selectedColor.index
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

async function updateColor(index, selectedColor, servers) {
    // Update the color in the servers array
    servers[index].color = selectedColor;

    // Save the updated servers array to chrome.storage using storage.js
    try {
        await saveServers(servers); // Use the storage function here
    } catch (error) {
        console.error("Error saving servers to storage:", error);
    }
}

function updateOtherColorPickers(servers, changedColorName, changedIndex) {
    const colorPickers = document.querySelectorAll('.server-item select');

    colorPickers.forEach((picker, index) => {
        // Repopulate each picker to reflect current available colors
        const currentColorData = JSON.parse(picker.value);
        populateColorPicker(picker, currentColorData, servers);
    });
}

export function getAvailableColor(servers) {
    return availableColors.find(color => !servers.some(server => server.color.name === color.name)) || COLORS[0]; // Fallback to first color if all are taken
}