async function main() {
    const tab = await chrome.tabs.getCurrent();
    const tabId = tab?.id;
    if (!tabId) {
        return;
    }

    await chrome.scripting.executeScript({
        target: {tabId: tabId},
        // files: ["content_scripts.js"],
        func: alert,
        args: ["OK"],
    });
}

main();
