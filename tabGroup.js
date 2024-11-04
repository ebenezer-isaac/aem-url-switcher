//tabGroup.js

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
        console.log
        await chrome.tabGroups.update(server.tabGroupId, { title: server.nickname, color: server.color.name.toLowerCase() });
        console.log(`Tab group updated with title: ${server.nickname} and color: ${server.color.name}`);
    } catch (error) {
        console.error("Error updating tab group:", error);
    }
}

export async function createNewTabGroup(url, server) {
    try {
        const newTab = await chrome.tabs.create({ url: url });
        const groupId = await chrome.tabs.group({ tabIds: newTab.id });
        await chrome.tabGroups.update(groupId, { color: server.color.name.toLowerCase(), title: server.nickname });
        server.tabGroupId = groupId;
        await updateServer(server);
    } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.error("Error creating new tab group:", error);
    }
}

export async function openTabInGroup(url, server) {
    console.log(url, server, "openTabInGroup");
    const groupId = server.tabGroupId;

    try {
        // Check if the tab group ID exists
        await chrome.tabGroups.get(groupId);

        // If the group exists, proceed to open the tab in the existing group
        const newTab = await chrome.tabs.create({ url: url });
        await chrome.tabs.group({ tabIds: newTab.id, groupId: groupId });
        console.log(`Opened new tab in existing group ID: ${groupId}`);
    } catch (error) {
        // If groupId is invalid or does not exist, create a new tab group
        createNewTabGroup(url, server);
    }
}