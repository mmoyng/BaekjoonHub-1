import { isNull, isEmpty } from '../../utils/util.js';

class Profile {

    constructor() {}

    static usernameIsNotNull() {
        return !isNull(Profile.findUsername());
    }

    /*
    현재 로그인된 유저를 파싱합니다.
    */
    static findUsername() {
        const el = document.querySelector('a.username');
        if (isNull(el)) return null;
        const username = el?.innerText?.trim();
        if (isEmpty(username)) return null;
        return username;
    }
    
    /*
        유저 정보 페이지에서 유저 이름을 파싱합니다.
    */
    static findUsernameOnUserInfoPage() {
        const el = document.querySelector('div.page-header > h1');
        if (isNull(el)) return null;
        const username = el.textContent.trim();
        if (isEmpty(username)) return null;
        return username;
    }
}

export { Profile }