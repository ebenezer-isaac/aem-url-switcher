import { getServers } from './storage.js';
import { constructNewUrl } from './popup.js'; // Ensure constructNewUrl is exported
import { openTabInGroup, createNewTabGroup } from './tabGroup.js';
import { getCurrentPath } from './popup.js'; // Directly use the pre-defined helper function

chrome.commands.onCommand.addListener(async function(command) {
    try {
        // Get the active tab
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const currentPath = await getCurrentPath(activeTab.url); // Using the pre-defined helper function

        // Load servers
        const servers = await getServers();
        if (Object.keys(servers).length === 0) {
            alert('No servers configured. Please add servers in the extension settings.');
            return;
        }

        // Determine mode based on command
        let mode;
        if (command === 'switch_to_editor') {
            mode = 'Editor';
        } else if (command === 'switch_to_publish') {
            mode = 'Publish';
        } else if (command === 'switch_to_crxde') {
            mode = 'CRXDE';
        }

        // Construct the new URL using the shared function
        const baseUrl = servers[0].url;
        const newUrl = constructNewUrl(baseUrl, currentPath, mode);

        // Open in an existing or new tab group as necessary
        const server = servers[0]; // Modify as needed to select a specific server
        if (server.tabGroupId) {
            await openTabInGroup(newUrl, server);
        } else {
            await createNewTabGroup(newUrl, server);
        }
    } catch (error) {
        console.error("Error in onCommand listener:", error);
    }
});