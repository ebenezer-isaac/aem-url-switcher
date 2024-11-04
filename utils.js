// utils.js

export function constructNewUrl(baseUrl, currentPath, mode) {
    // Normalize baseUrl to remove trailing slashes and currentPath to remove leading slashes
    const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
    const normalizedPath = currentPath.replace(/^\/+/, '');

    let newUrl = '';

    if (mode === 'Editor') {
        newUrl = `${normalizedBaseUrl}/editor.html/${normalizedPath}.html`;
    } else if (mode === 'Publish') {
        newUrl = `${normalizedBaseUrl}/${normalizedPath}.html?wcmmode=disabled`;
    } else if (mode === 'CRXDE') {
        newUrl = `${normalizedBaseUrl}/crx/de/index.jsp#${normalizedPath}`;
    }

    // Remove any accidental double slashes in the constructed URL, except after "http(s):"
    return newUrl.replace(/([^:])\/{2,}/g, '$1/');
}


export async function getCurrentPath() {
    const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    let currentPath = currentTab.url.split('://')[1].split('/');
    currentPath.shift();

    return (
        '/' +
        currentPath
        .join('/')
        .replace(/^editor\.html\//, '')
        .replace(/^crx\/de\/index.jsp#/, '')
        .replace(/\.html(\?wcmmode=disabled)?$/, '')
    );
}

export function getCurrentMode(url) {
    if (url.includes('/editor.html')) return 'Editor';
    if (url.includes('wcmmode=disabled')) return 'Publish';
    if (url.includes('/crx/de/index.jsp#')) return 'CRXDE';
    return '';
}