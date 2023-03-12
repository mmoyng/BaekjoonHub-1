import { Profile } from "./documents/profile.js";
import { Browser } from "../utils/browser.js";
import { Loader } from "./loader.js";
import { Description } from "./documents/description.js";

// 문제 제출 사이트의 경우에는 로더를 실행하고, 유저 페이지의 경우에는 버튼을 생성한다.
// 백준 사이트 로그인 상태이면 username이 있으며, 아니면 없다.

if (Profile.usernameIsNotNull()) {
  const username = Profile.findUsername();
  if (Browser.urlIncludes(['status', `user_id=${username}`, 'problem_id', 'from_mine=1'])){
    var loader = Loader.newLoader()
    loader.startLoader()
  }
  else if (Browser.urlMatches(/\.net\/problem\/\d+/)) Description.parseProblemDescription();
}
