
class Browser{

    static currentURL() {
        return window.location.href;
    }

    static urlMatches(regex){
        return this.currentURL().matches(regex) !== null;
    }

    static urlIncludes(condition){
        if (typeof condition === 'Array') {
            return condition.every((c) => this.currentURL().includes(c));
        } else {
            return this.currentURL().includes(condition) !== null;
        }
    }  
}

export { Browser };