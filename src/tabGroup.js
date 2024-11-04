import { getServers, updateServer } from './storage.js';

export async function updateTabGroup(serverId) {
    try {
        const servers = await getServers();
        const server = servers[serverId];

        if (!server || !server.tabGroupId) {
            console.error("No valid server or tabGroupId found for the provided ID.");
            return;
        }

        // Update the tab group using the server's nickname and color
        await chrome.tabGroups.update(server.tabGroupId, { title: server.nickname, color: server.color.name });
        console.log(`Tab group updated with title: ${server.nickname} and color: ${server.color.name}`);
    } catch (error) {
        console.error("Error updating tab group:", error);
    }
}

export async function createNewTabGroup(url, server) {
    try {
        const newTab = await chrome.tabs.create({ url: url });
        // Create a new tab group and assign the tab to it
        const groupId = await chrome.tabs.group({ tabIds: newTab.id });

        // Delay to ensure that the group is created and can be updated reliably
        await new Promise(resolve => setTimeout(resolve, 100));

        // Update the group with the correct color and title
        await chrome.tabGroups.update(groupId, { color: server.color.name.toLowerCase(), title: server.nickname });

        // Save the group ID to the server record
        server.tabGroupId = groupId;
        await updateServer(server);

        console.log(`New tab group created with title: ${server.nickname} and color: ${server.color.name}`);
    } catch (error) {
        console.error("Error creating new tab group:", error);
    }
}

export async function openTabInGroup(url, groupId) {
    try {
        const newTab = await chrome.tabs.create({ url: url });
        await chrome.tabs.group({ tabIds: newTab.id, groupId: groupId });
        console.log(`Opened new tab in existing group ID: ${groupId}`);
    } catch (error) {
        console.error("Error opening tab in group:", error);
    }
}