document.addEventListener('DOMContentLoaded', function() {
    const serverListElem = document.getElementById('servers');
    const addServerBtn = document.getElementById('add-server');
    const nicknameInput = document.getElementById('nickname');
    const urlInput = document.getElementById('url');

    // Load servers from storage
    chrome.storage.sync.get('servers', function(data) {
        const servers = data.servers || [];
        servers.forEach((server, index) => {
            addServerToList(server, index);
        });
    });

    addServerBtn.addEventListener('click', function() {
        const nickname = nicknameInput.value.trim();
        const url = urlInput.value.trim();

        if (!nickname || !url) {
            alert('Both Nickname and Server URL are required.');
            return;
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
                addServerToList(newServer, servers.length - 1);
                nicknameInput.value = '';
                urlInput.value = '';
            });
        });
    });

    function addServerToList(server, index) {
        const li = document.createElement('li');
        li.textContent = `${server.nickname} - ${server.url} (Shortcut: Ctrl+Alt+${index + 1})`;
        li.classList.add('server-item');
        serverListElem.appendChild(li);
    }
});