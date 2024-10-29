// storage.js

// Promise-based wrapper around chrome.storage.sync.get
export const getServers = () => new Promise((resolve, reject) => {
    chrome.storage.sync.get('servers', (data) => {
        chrome.runtime.lastError ? reject(chrome.runtime.lastError) : resolve(data.servers || []);
    });
});

// Promise-based wrapper around chrome.storage.sync.set
export const saveServers = (servers) => new Promise((resolve, reject) => {
    chrome.storage.sync.set({ servers }, () => {
        chrome.runtime.lastError ? reject(chrome.runtime.lastError) : resolve();
    });
});

// Function to handle updating a server in storage
export const updateServer = async(servers, index, updatedServer) => {
    servers[index] = updatedServer;
    await saveServers(servers);
};

// Function to handle adding a new server to storage
export const addServer = async(servers, newServer) => {
    servers.push(newServer);
    await saveServers(servers);
};

// Function to handle deleting a server from storage
export const deleteServer = async(servers, index) => {
    servers.splice(index, 1);
    await saveServers(servers);
};