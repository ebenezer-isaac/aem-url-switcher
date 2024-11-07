import { getServers } from './storage.js';
import { constructNewUrl, getCurrentPath } from './utils.js';
import { openTabInGroup, createNewTabGroup } from './tabGroup.js';

chrome.commands.onCommand.addListener(async function(command) {
    try {
        // Get the active tab
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!activeTab || !activeTab.url) {
            console.error('No active tab with a valid URL found.');
            return;
        }

        // Extract current path from active tab URL
        const currentPath = await getCurrentPath(activeTab.url);

        // Load servers from storage
        const servers = await getServers();
        if (Object.keys(servers).length === 0) {
            alert('No servers configured. Please add servers in the extension settings.');
            return;
        }

        // Identify the server that matches the active tab URL
        const server = Object.values(servers).find((server) => activeTab.url.startsWith(server.url));
        if (!server) {
            console.error('No matching server found for the current tab URL.');
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

        // Construct the new URL using the matched server's base URL and the mode
        const newUrl = constructNewUrl(server.url, currentPath, mode);

        // Open in an existing or new tab group as necessary
        if (server.tabGroupId) {
            await openTabInGroup(newUrl, server);
        } else {
            await createNewTabGroup(newUrl, server);
        }
    } catch (error) {
        console.error("Error in onCommand listener:", error);
    }
});