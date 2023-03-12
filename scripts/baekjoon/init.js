(async () => {
    const src = chrome.runtime.getURL('scripts/baekjoon/main.js');
    const contentScript = await import(src);
    contentScript.main();
})();