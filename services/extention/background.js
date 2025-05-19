chrome.tabs.onUpdated.addListener(async (tabId) => {
    const tab = await chrome.tabs.get(tabId);

    
    if (tab.url && tab.url.includes("amazon.com")){
        chrome.scripting.executeScript({
            target: {tabId: tabId},
            files: ['content-script.js'],
        })
    }
})