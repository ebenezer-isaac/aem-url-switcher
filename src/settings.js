document.addEventListener('DOMContentLoaded', () => {
    const serverList = document.getElementById('server-list');
    const nicknameInput = document.getElementById('nickname');
    const urlInput = document.getElementById('url');
    const addServerButton = document.getElementById('add-server');
    let editIndex = null; // To track which server is being edited

    // Available colors
    const colors = [
        { name: 'Red', value: '#FF5733' },
        { name: 'Green', value: '#33FF57' },
        { name: 'Blue', value: '#5733FF' },
        { name: 'Yellow', value: '#FFC300' },
        { name: 'Light Green', value: '#DAF7A6' },
        { name: 'Pink', value: '#FF33A6' },
        { name: 'Cyan', value: '#33FFF2' },
        { name: 'Orange', value: '#FF8C33' },
        { name: 'Purple', value: '#333EFF' },
        { name: 'Lime', value: '#57FF33' }
    ];

    let selectedColors = [];

    // Load servers from storage and populate the UI
    chrome.storage.sync.get('servers', function(data) {
        const servers = data.servers || [];
        servers.forEach((server, index) => {
            createServerItem(server.nickname, server.url, server.color, index);
        });
    });

    // Function to create a new server item
    function createServerItem(nickname, url, color = '', index = null) {
        const serverItem = document.createElement('div');
        serverItem.classList.add('server-item');

        const nicknameElem = document.createElement('input');
        nicknameElem.type = 'text';
        nicknameElem.value = nickname;
        nicknameElem.classList.add('material-input', 'server-input');
        nicknameElem.disabled = true;

        const urlElem = document.createElement('input');
        urlElem.type = 'text';
        urlElem.value = url;
        urlElem.classList.add('material-input', 'server-input');
        urlElem.disabled = true;

        const colorPicker = document.createElement('select');
        colorPicker.classList.add('material-input', 'server-input');
        populateColorPicker(colorPicker, color);

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('server-buttons');

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('icon-button');
        deleteButton.innerHTML = '<span class="material-icons">delete</span>';

        const editButton = document.createElement('button');
        editButton.classList.add('icon-button');
        editButton.innerHTML = '<span class="material-icons">edit</span>';

        buttonContainer.appendChild(editButton);
        buttonContainer.appendChild(deleteButton);
        serverItem.appendChild(nicknameElem);
        serverItem.appendChild(urlElem);
        serverItem.appendChild(colorPicker);
        serverItem.appendChild(buttonContainer);
        serverList.appendChild(serverItem);

        // Event listener for the delete button
        deleteButton.addEventListener('click', () => {
            const selectedColor = colorPicker.value;
            selectedColors = selectedColors.filter(c => c !== selectedColor);
            serverItem.remove();
            saveServers();
            updateAllColorPickers();
        });

        // Event listener for the edit button
        editButton.addEventListener('click', () => {
            nicknameInput.value = nicknameElem.value;
            urlInput.value = urlElem.value;
            editIndex = index;
            addServerButton.innerHTML = '<span class="material-icons">save</span> &nbsp; Save Changes'; // Change button to "Save Changes"
        });

        colorPicker.addEventListener('change', () => {
            updateAllColorPickers();
            saveServers();
        });
    }

    // Populate color picker with available colors
    function populateColorPicker(colorPicker, selectedColor = '') {
        colorPicker.innerHTML = '';
        colors.forEach(color => {
            const option = document.createElement('option');
            option.value = color.value;
            option.textContent = color.name;
            option.style.backgroundColor = color.value;
            if (selectedColors.includes(color.value)) {
                option.disabled = true;
            }
            colorPicker.appendChild(option);
        });

        if (selectedColor) {
            colorPicker.value = selectedColor;
            selectedColors.push(selectedColor);
        }
    }

    // Update all color pickers to reflect available colors
    function updateAllColorPickers() {
        const colorPickers = document.querySelectorAll('.server-item select');
        selectedColors = Array.from(colorPickers).map(picker => picker.value);

        colorPickers.forEach(picker => {
            const currentColor = picker.value;
            populateColorPicker(picker);
            picker.value = currentColor;
        });
    }

    // Save servers to chrome.storage.sync
    function saveServers() {
        const servers = [];
        document.querySelectorAll('.server-item').forEach(item => {
            const nickname = item.querySelectorAll('input[type="text"]')[0].value;
            const url = item.querySelectorAll('input[type="text"]')[1].value;
            const color = item.querySelector('select').value;
            servers.push({ nickname, url, color });
        });
        chrome.storage.sync.set({ servers }, function() {
            console.log('Servers saved:', servers);
        });
    }

    addServerButton.addEventListener('click', () => {
        const nickname = nicknameInput.value.trim();
        const url = urlInput.value.trim();

        if (nickname && url) {
            if (editIndex !== null) {
                // Edit existing server
                chrome.storage.sync.get('servers', function(data) {
                    let servers = data.servers || [];
                    servers[editIndex] = { nickname, url, color: servers[editIndex].color }; // Keep the current color
                    chrome.storage.sync.set({ servers }, function() {
                        // Reset the UI
                        serverList.innerHTML = '';
                        servers.forEach((server, index) => {
                            createServerItem(server.nickname, server.url, server.color, index);
                        });
                        // After edits are saved, reset the button text
                        addServerButton.innerHTML = '<span class="material-icons">add_circle</span> &nbsp; Add Server';
                        editIndex = null; // Reset edit index
                    });
                });
            } else {
                // Add new server
                createServerItem(nickname, url);
                saveServers();
            }

            // Clear inputs
            nicknameInput.value = '';
            urlInput.value = '';
        }
    });
});