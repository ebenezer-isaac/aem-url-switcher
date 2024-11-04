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
    servers[updatedServer.id] = updatedServer;
    await saveServers(servers);
};

export const addServer = async(newServer) => {
    const servers = await getServers();
    servers[newServer.id] = newServer;
    await saveServers(servers);
};

export const deleteServer = async(serverId) => {
    const servers = await getServers();
    delete servers[serverId];
    await saveServers(servers);
};