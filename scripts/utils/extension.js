
class Extension {

    /**
        * 현재 익스텐션의 버전정보를 반환합니다.
        * @returns {string} - 현재 익스텐션의 버전정보
    */
    static getVersion() {
        return chrome.runtime.getManifest().version;
    }
    
    static async versionUpdate() {
        log('start versionUpdate');
        const stats = await updateLocalStorageStats();
        // update version.
        stats.version = getVersion();
        await saveStats(stats);
        log('stats updated.', stats);
      }
}

export { Extension }