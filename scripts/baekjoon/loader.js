import { ResultTable } from './documents/resulttable.js';
import { Description } from './documents/description.js';
import { Code } from './documents/code.js';
import { BlobBuilder } from './blobbuilder.js';
import { isEmpty, isNull } from '../utils/util.js';
import { Toast } from '../component/toast.js';
import { log } from '../utils/logger.js';
import { KnownError } from '../utils/error.js';
import { checkEnable } from '../enable.js';

class Loader{
    constructor() {
        this.powerSwitch = null
        this.loader = null
    }

    static newLoader() {
        return new Loader()
    }

    /* 
        문제 제출 맞음 여부를 확인하는 함수
        2초마다 문제를 파싱하여 확인
    */
    startLoader() {
        try{
            this.loader = setInterval(async () => {
                // 기능 Off시 작동하지 않도록 함
                this.stopIfNotEnabled();
                if (ResultTable.exists()) {
                    const table = ResultTable.parseSubmissionData()();
                    if (isEmpty(table)) return;
                    const data = table[0];
                    if (data.hasOwnProperty('username') && data.hasOwnProperty('resultCategory')) {
                        const { username, resultCategory } = data;
                        if (username === findUsername() && resultCategory.includes(RESULT_CATEGORY.RESULT_ACCEPTED)) {
                            this.stopLoader();
                            console.log('풀이가 맞았습니다. 업로드를 시작합니다.');
                            this.startUpload();
                            const bojData = await this.findData();
                            await this.#beginUpload(bojData);
                        }
                    }
                }
            }, 2000);
        } catch (error){
            if (error instanceof KnownError) {
                this.toastThenStopLoader(toastMessage)
            }
            else {
                log.error(error)
            }
        }
    }

    async #beginUpload(bojData) {
        log('bojData', bojData);
        if (isNotEmpty(bojData)) {
          const stats = await getStats();
          const hook = await getHook();
      
          const currentVersion = stats.version;
          /* 버전 차이가 발생하거나, 해당 hook에 대한 데이터가 없는 경우 localstorage의 Stats 값을 업데이트하고, version을 최신으로 변경한다 */
          if (isNull(currentVersion) || currentVersion !== getVersion() || isNull(await getStatsSHAfromPath(hook))) {
            await versionUpdate();
          }
      
          /* 현재 제출하려는 소스코드가 기존 업로드한 내용과 같다면 중지 */
          cachedSHA = await getStatsSHAfromPath(`${hook}/${bojData.directory}/${bojData.fileName}`)
          calcSHA = calculateBlobSHA(bojData.code)
          log('cachedSHA', cachedSHA, 'calcSHA', calcSHA)
      
          if (cachedSHA == calcSHA) {
            markUploadedCSS();
            console.log(`현재 제출번호를 업로드한 기록이 있습니다.` /* submissionID ${bojData.submissionId}` */);
            return;
          }
          /* 신규 제출 번호라면 새롭게 커밋  */
          await uploadOneSolveProblemOnGit(bojData, markUploadedCSS);
        }
      }

    stopLoader() {
        clearInterval(this.powerSwitch)
        this.loader=null
    }

    toastThenStopLoader(toastMessage, errorMessage){
        Toast.burnToast(toastMessage)
        stopLoader()
        throw log.error(errorMessage)
    }

    async stopIfNotEnabled(){
        const enable = await checkEnable();
        if (!enable) this.stopLoader();
    }

    /*
    bojData를 초기화하는 함수로 문제 요약과 코드를 파싱합니다.

    - 문제 설명: problemDescription
    - Github repo에 저장될 디렉토리: directory
    - 커밋 메시지: message 
    - 백준 문제 카테고리: category
    - 파일명: fileName
    - Readme 내용 : readme
    */
    async findData(data) {
        if (isNull(data)) {
            let table = ResultTable.parseSubmissionData()();
            if (isEmpty(table)) return null;
            table = filter(table, {
                'resultCategory': RESULT_CATEGORY.RESULT_ACCEPTED,
                'username': findUsername(),
                'language': table[0]["language"]
            })
            data = ResultTable.selectBestSubmissionList(table)[0];
        }

        if (isNaN(Number(data.problemId)) || Number(data.problemId) < 1000) 
            throw new KnownError(`정책상 대회 문제는 업로드 되지 않습니다. 대회 문제가 아니라고 판단된다면 이슈로 남겨주시길 바랍니다.\n문제 ID: ${data.problemId}`);

        data = { ...data, ...await this.findProblemInfoAndSubmissionCode(data.problemId, data.submissionId) };
        const detail = BlobBuilder.makeDetailMessageAndReadme(data);
        
        return { ...data, ...detail }; // detail 만 반환해도 되나, 확장성을 위해 모든 데이터를 반환합니다.
    }
    

    /**
     * 로딩 버튼 추가
     */
    startUpload() {
        let elem = document.getElementById('BaekjoonHub_progress_anchor_element');
        if (elem !== undefined) {
            elem = document.createElement('span');
            elem.id = 'BaekjoonHub_progress_anchor_element';
            elem.className = 'runcode-wrapper__8rXm';
            elem.style = 'margin-left: 10px;padding-top: 0px;';
        }
        elem.innerHTML = `<div id="BaekjoonHub_progress_elem" class="BaekjoonHub_progress"></div>`;
        const target = document.getElementById('status-table')?.childNodes[1].childNodes[0].childNodes[3] || document.querySelector('div.table-responsive > table > tbody > tr > td:nth-child(5)');
        target.append(elem);
        if (target.childNodes.length > 0) {
            target.childNodes[0].append(elem);
        }
        this.startUploadCountDown();
    }

    async findProblemInfoAndSubmissionCode(problemId, submissionId) {
        log('in find with promise');
        if (!isNull(problemId) && !isNull(submissionId)) {
          return Promise.all([Description.getById(problemId), Code.getById(submissionId)])
            .then(([description, code]) => {
              const { problem_description, problem_input, problem_output, problem_tags } = description;
              return { problemId, submissionId, code, problem_description, problem_input, problem_output, problem_tags };
            })
            .catch((err) => {
              console.log('error ocurred: ', err);
              uploadState.uploading = false;
              markUploadFailedCSS();
            });
        }
    }

    /**
     * 총 실행시간이 10초를 초과한다면 실패로 간주합니다.
     */
    startUploadCountDown() {
        uploadState.uploading = true;
        uploadState.countdown = setTimeout(() => {
        if (uploadState.uploading === true) {
            markUploadFailedCSS();
        }
        }, 10000);
    }
}

export { Loader }