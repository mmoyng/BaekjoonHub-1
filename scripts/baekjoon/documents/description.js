import { log } from '../../utils/logger.js';
import { convertImageTagAbsoluteURL, unescapeHtml } from '../../utils/util.js';


/** 문자열을 escape 하여 반환합니다. */
String.prototype.escapeHtml = function () {
    return escapeHtml(this);
};

class Description {

    /*
    Fetch를 사용하여 정보를 구하는 함수로 다음 정보를 확인합니다.

        - 문제 설명: problem_description
        - 문제 입력값: problem_input
        - 문제 출력값: problem_output
        - 제출 코드: code
        - 문제 제목: title
        - 문제 등급: level 
        - Github repo에 저장될 디렉토리: directory
        - 커밋 메시지: message 
        - 백준 문제 카테고리: category
    */
    static parseProblemDescription(doc = document) {
        convertImageTagAbsoluteURL(doc.getElementById('problem_description')); //이미지에 상대 경로가 있을 수 있으므로 이미지 경로를 절대 경로로 전환 합니다.
        const problemId = doc.getElementsByTagName('title')[0].textContent.split(':')[0].replace(/[^0-9]/, '');
        const problem_description = unescapeHtml(doc.getElementById('problem_description').innerHTML.trim());
        const problem_input = doc.getElementById('problem_input')?.innerHTML.trim?.().unescapeHtml?.() || 'Empty'; // eslint-disable-line
        const problem_output = doc.getElementById('problem_output')?.innerHTML.trim?.().unescapeHtml?.() || 'Empty'; // eslint-disable-line
        const problem_tags = Array.from(doc.getElementById('problem_tags').querySelectorAll('a.spoiler-link'), x => x.innerText)
        if (problemId && problem_description) {
            log.debug(`문제번호 ${problemId}의 내용을 저장합니다.`);
            updateProblemsFromStats({ problemId, problem_description, problem_input, problem_output, problem_tags});
            return { problemId, problem_description, problem_input, problem_output, problem_tags};
        }
        return {};
    }

    static async getById(problemId) {
        let problem = await getProblemFromStats(problemId);
        if (isNull(problem)) {
        problem = await fetchProblemDescriptionById(problemId);
        updateProblemsFromStats(problem); // not await
        }
        return problem;
    }


    /**
     * 문제의 상세 정보 목록을 문제 번호 목록으로 한꺼번에 반환합니다.
     * (한번 조회 시 2개씩 병렬로 진행)
     * @param {Array} problemIds
     * @returns {Promise<Array>}
     */
    static async fetchProblemDescriptionsByIds(problemIds) {
        return asyncPool(2, problemIds, async (problemId) => {
        return getProblemDescriptionById(problemId);
        })
    }


    static async fetchProblemDescriptionById(problemId) {
        return fetch(`https://www.acmicpc.net/problem/${problemId}`)
          .then((res) => res.text())
          .then((html) => {
            const doc = new DOMParser().parseFromString(html, 'text/html');
            return parseProblemDescription(doc);
          });
      }

}

export { Description }