import { getServers, saveServers } from './storage.js';

export async function updateTabGroup(serverIndex) {
    try {
        const servers = await getServers(); // Fetch servers from storage
        const server = servers[serverIndex];

        if (!server || !server.tabGroupId) {
            console.error("No valid server or tabGroupId found for the provided index.");
            return;
        }

        // Update the tab group using the server's nickname and color
        await chrome.tabGroups.update(server.tabGroupId, { title: server.nickname, color: server.color.name });
        console.log(`Tab group updated with title: ${server.nickname} and color: ${server.color.name}`);
    } catch (error) {
        console.error("Error updating tab group:", error);
    }
}

export async function createNewTabGroup(url, serverIndex) {
    try {
        const servers = await getServers(); // Fetch servers from storage
        const newTab = await chrome.tabs.create({ url: url });

        const groupId = await chrome.tabs.group({ tabIds: newTab.id });

        const server = servers[serverIndex];
        if (server) {
            // Create the tab group with the server's color and nickname
            await chrome.tabGroups.update(groupId, { color: server.color.name, title: server.nickname });

            // Update the server entry with the new tabGroupId
            server.tabGroupId = groupId;

            // Save updated servers with the new tabGroupId to chrome.storage.sync
            await saveServers(servers);
        } else {
            console.error("No valid server found for the provided index.");
        }
    } catch (error) {
        console.error("Error creating new tab group:", error);
    }
}