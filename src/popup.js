document.addEventListener('DOMContentLoaded', function() {
    const pageTypeElem = document.getElementById('page-type');
    const switchBtnText = document.getElementById('switch-btn-text');
    const switchBtn = document.getElementById('switch-btn');
    const settingsBtn = document.getElementById('settings-btn');

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const currentUrl = tabs[0].url;

        let pageType = getPageType(currentUrl);
        pageTypeElem.innerText = pageType;
        if (pageType !== 'Unknown') {
            switchBtnText.innerText = pageType === 'Editor' ? 'Switch to Publish' : 'Switch to Editor';
        } else {
            switchBtnText.innerText = 'Disabled'
        }

        switchBtn.addEventListener('click', function() {
            const newUrl = togglePageType(currentUrl, pageType);
            chrome.tabs.create({ url: newUrl });
        });

        settingsBtn.addEventListener('click', function() {
            chrome.runtime.openOptionsPage();
        });
    });

    function getPageType(url) {
        if (url.includes('editor.html')) {
            switchBtn.disabled = false;
            return 'Editor';
        }
        if (url.includes('wcmmode=disabled')) {
            switchBtn.disabled = false;
            return 'Publish';
        } else {
            switchBtn.disabled = true;
            return 'Unknown';
        }
    }

    function togglePageType(url, type) {
        if (type === 'Editor') {
            return url.replace('/editor.html', '') + '?wcmmode=disabled';
        } else if (type === 'Publish') {
            return url.replace('?wcmmode=disabled', '').replace('/content', '/editor.html/content');
        }
        return url;
    }
});