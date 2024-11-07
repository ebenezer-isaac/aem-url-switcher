//storage.js

// servers = {
//     "server_1633548291_123": { // Unique ID for each server
//         id: "server_1633548291_123",
//         nickname: "local",
//         url: "http://localhost:4502",
//         color: {
//             name: "blue",      // Color name for the tab group
//             value: "#0000FF"   // Hex value or other representation if needed
//         },
//         tabGroupId: 1          // Chrome tab group ID for this server
//     }
// }

export const getServers = () => new Promise((resolve, reject) => {
    chrome.storage.sync.get('servers', (data) => {
        chrome.runtime.lastError ? reject(chrome.runtime.lastError) : resolve(data.servers || {});
    });
});

export const saveServers = (servers) => new Promise((resolve, reject) => {
    chrome.storage.sync.set({ servers }, () => {
        chrome.runtime.lastError ? reject(chrome.runtime.lastError) : resolve();
    });
});

export const updateServer = async(updatedServer) => {
    const servers = await getServers();
    servers[updatedServer.id] = updatedServer; // Use the unique ID as the key
    await saveServers(servers);
};

export const addServer = async(newServer) => {
    const servers = await getServers();
    newServer.id = `server_${Date.now()}_${Math.floor(Math.random() * 1000)}`; // Generate unique ID
    servers[newServer.id] = newServer;
    await saveServers(servers);
};

export const deleteServer = async(serverId) => {
    const servers = await getServers();
    delete servers[serverId];
    await saveServers(servers);
};