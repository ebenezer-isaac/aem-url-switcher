document.addEventListener('DOMContentLoaded', function() {
    const serverListElem = document.getElementById('server-list');
    const addServerBtn = document.getElementById('add-server');
    const nicknameInput = document.getElementById('nickname');
    const urlInput = document.getElementById('url');

    // Load servers from storage
    loadServers();

    addServerBtn.addEventListener('click', function() {
        const nickname = nicknameInput.value.trim();
        let url = urlInput.value.trim();

        if (!nickname || !url) {
            alert('Both Nickname and Server URL are required.');
            return;
        }

        // Strip ending slash
        if (url.endsWith('/')) {
            url = url.slice(0, -1);
        }

        const urlPattern = /^(http|https):\/\/[^\s$.?#].[^\s]*$/gm;
        if (!url.match(urlPattern)) {
            alert('Please enter a valid URL.');
            return;
        }

        const newServer = { nickname, url };

        chrome.storage.sync.get('servers', function(data) {
            const servers = data.servers || [];
            servers.push(newServer);
            chrome.storage.sync.set({ servers }, function() {
                loadServers();
                nicknameInput.value = '';
                urlInput.value = '';
            });
        });
    });

    function loadServers() {
        serverListElem.innerHTML = '';
        chrome.storage.sync.get('servers', function(data) {
            const servers = data.servers || [];
            servers.forEach((server, index) => {
                addServerToList(server, index);
            });
        });
    }

    function addServerToList(server, index) {
        const serverDiv = document.createElement('div');
        serverDiv.classList.add('server-item');

        const nicknameInput = document.createElement('input');
        nicknameInput.type = 'text';
        nicknameInput.value = server.nickname;
        nicknameInput.classList.add('material-input', 'server-input');

        const urlInput = document.createElement('input');
        urlInput.type = 'text';
        urlInput.value = server.url;
        urlInput.classList.add('material-input', 'server-input');

        const saveBtn = document.createElement('button');
        saveBtn.classList.add('icon-button');
        saveBtn.innerHTML = '<span class="material-icons">save</span>';
        saveBtn.addEventListener('click', () => saveServer(index, nicknameInput.value, urlInput.value));

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('icon-button');
        deleteBtn.innerHTML = '<span class="material-icons">delete</span>';
        deleteBtn.addEventListener('click', () => deleteServer(index));

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('server-buttons');
        buttonContainer.appendChild(saveBtn);
        buttonContainer.appendChild(deleteBtn);

        serverDiv.appendChild(nicknameInput);
        serverDiv.appendChild(urlInput);
        serverDiv.appendChild(buttonContainer);

        serverListElem.appendChild(serverDiv);
    }

    function saveServer(index, nickname, url) {
        if (!nickname || !url) {
            alert('Nickname and URL cannot be empty.');
            return;
        }

        // Strip ending slash
        if (url.endsWith('/')) {
            url = url.slice(0, -1);
        }

        const urlPattern = /^(http|https):\/\/[^\s$.?#].[^\s]*$/gm;
        if (!url.match(urlPattern)) {
            alert('Please enter a valid URL.');
            return;
        }

        chrome.storage.sync.get('servers', function(data) {
            const servers = data.servers || [];
            servers[index] = { nickname, url };
            chrome.storage.sync.set({ servers }, function() {
                loadServers();
            });
        });
    }

    function deleteServer(index) {
        chrome.storage.sync.get('servers', function(data) {
            const servers = data.servers || [];
            servers.splice(index, 1);
            chrome.storage.sync.set({ servers }, function() {
                loadServers();
            });
        });
    }
});