import { log } from '../../utils/logger.js';
import { isNull } from '../../utils/util.js';


// // If a new language is added, perform the update manually using the script below.
// // parsing all languages on https://help.acmicpc.net/language/info/all
// [...document.querySelectorAll('div.card')]
//   .map((x) => [x.querySelector('header > h3'), x.querySelector('ul > li:nth-child(2) > code')])
//   .filter((x) => !!x[0] && !!x[1])
//   .map((x) => x.map((el) => el.innerText))
//   .map((x) => [x[0].trim(), x[1].match(/Main\.(?!exe)(?!jar)([a-zA-Z]+)/)])
//   .filter((x) => !!x[0] && !!x[1])
//   .sort((a, b) => a[0].localeCompare(b[0]))
//   .forEach((x) => (languages[x[0]] = x[1][1]));
// languages['Coq'] = 'v';
// // sort languages by key
// languages = Object.entries(languages)
//   .sort((a, b) => a[0].localeCompare(b[0]))
//   .reduce((acc, cur) => {
//     acc[cur[0]] = cur[1];
//     return acc;
//   }, {});
// // get length of languages
// console.log("languages length: ", Object.keys(languages).length);
// console.log("languages: ", languages);

// BOJ Levels
const bj_level = {
    0: 'Unrated',
    1: 'Bronze V',
    2: 'Bronze IV',
    3: 'Bronze III',
    4: 'Bronze II',
    5: 'Bronze I',
    6: 'Silver V',
    7: 'Silver IV',
    8: 'Silver III',
    9: 'Silver II',
    10: 'Silver I',
    11: 'Gold V',
    12: 'Gold IV',
    13: 'Gold III',
    14: 'Gold II',
    15: 'Gold I',
    16: 'Platinum V',
    17: 'Platinum IV',
    18: 'Platinum III',
    19: 'Platinum II',
    20: 'Platinum I',
    21: 'Diamond V',
    22: 'Diamond IV',
    23: 'Diamond III',
    24: 'Diamond II',
    25: 'Diamond I',
    26: 'Ruby V',
    27: 'Ruby IV',
    28: 'Ruby III',
    29: 'Ruby II',
    30: 'Ruby I',
    31: 'Master',
};

class ResultTable {

    constructor(){}

    /*
    결과 테이블의 존재 여부를 확인합니다.
    */
    static exists() {
        return document.getElementById('status-table') !== null;
    }
    
    /*
    제출 화면의 데이터를 파싱하는 함수로 다음 데이터를 확인합니다.
        - 유저이름: username
        - 실행결과: result
        - 메모리: memory
        - 실행시간: runtime
        - 제출언어: language
        - 제출시간: submissionTime
        - 제출번호: submissionId
        - 문제번호: problemId
        - 해당html요소 : element
    */
    static parseSubmissionData() {
        if (!this.exists()) {
        log('Result table not found');
        }
        return this.#parsingResultTableList(document);
    }

    /**
     * user가 "맞았습니다!!" 결과를 맞은 중복되지 않은 제출 결과 리스트를 가져오는 함수
     * @param username: 백준 아이디
     * @returns Promise<Array<Object>>
     */
    static async findUniqueResultTableListByUsername(username) {
        return this.selectBestSubmissionList(await findResultTableListByUsername(username));
    }

    /*
    결과 테이블을 파싱하는 함수입니다.
    */
    static #parsingResultTableList(doc) {
        const table = doc.getElementById('status-table');
        if (table === null || table === undefined || table.length === 0) return [];
        const headers = Array.from(table.rows[0].cells, (x) => this.convertResultTableHeader(x.innerText.trim()));
    
        const list = [];
        for (let i = 1; i < table.rows.length; i++) {
        const row = table.rows[i];
        const cells = Array.from(row.cells, (x, index) => {
            switch (headers[index]) {
            case 'result':
                return { result: x.innerText.trim(), resultCategory: x.firstChild.getAttribute('data-color').replace('-eng', '').trim() };
            case 'language':
                return x.innerText.unescapeHtml().replace(/\/.*$/g, '').trim();
            case 'submissionTime':
                const el = x.querySelector('a.show-date');
                if (isNull(el)) return null;
                return el.getAttribute('data-original-title');
            case 'problemId':
                const img = x.querySelector('img.solvedac-tier');
                const a = x.querySelector('a.problem_title');
                if (isNull(a)) return null;
                if (isNull(img)){
                    const msg = "[백준허브 연동 에러] 현재 백준 업로드는 Solved.ac 연동이 필수입니다. 만약 Solved.ac 연동 후에도 이 창이 보인다면 개발자에게 리포팅해주세요."
                    const err = "SolvedAC is not integrated with this BOJ account"
                    toastThenStopLoader(msg, err)
                }
                const idx = img.getAttribute('src').match('[0-9]+\\.svg')[0].replace('.svg', '')
                const level = bj_level[idx]
                return {
                    problemId: a.getAttribute('href').replace(/^.*\/([0-9]+)$/, '$1'),
                    title: a.getAttribute('data-original-title'),
                    level: level
                };
            default:
                return x.innerText.trim();
            }
        });
        let obj = {};
        obj.elementId = row.id;
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = cells[j];
        }
        obj = { ...obj, ...obj.result, ...obj.problemId};
        list.push(obj);
        }
        log('TableList', list);
        return list;
    }

    /**
     * 파싱된 문제별로 최고의 성능의 제출 내역을 하나씩 뽑아서 배열로 반환합니다.
     * @param {array} submissions - 제출 목록 배열
     * @returns {array} - 목록 중 문제별로 최고의 성능 제출 내역을 담은 배열
     */
    static selectBestSubmissionList(submissions) {
        if (isNull(submissions) || submissions.length === 0) return [];
        return maxValuesGroupBykey(submissions, 'problemId', (a, b) => -compareSubmission(a, b));
    }

    static convertResultTableHeader(header) {
        switch (header) {
          case '문제번호':
          case '문제':
            return 'problemId';
          case '난이도':
            return 'level';
          case '결과':
            return 'result';
          case '문제내용':
            return 'problemDescription';
          case '언어':
            return 'language';
          case '제출 번호':
            return 'submissionId';
          case '아이디':
            return 'username';
          case '제출시간':
          case '제출한 시간':
            return 'submissionTime';
          case '시간':
            return 'runtime';
          case '메모리':
            return 'memory';
          case '코드 길이':
            return 'codeLength';
          default:
            return 'unknown';
        }
      }
}

export { ResultTable };