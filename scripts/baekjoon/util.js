

/**
 * 업로드 완료 아이콘 표시
 */
export function markUploadedCSS() {
  uploadState.uploading = false;
  const elem = document.getElementById('BaekjoonHub_progress_elem');
  elem.className = 'markuploaded';
  // 1초후 창 닫기
  // setTimeout(() => {
  //   window.close();
  // }, 1000);
}

/**
 * 업로드 실패 아이콘 표시
 */
export function markUploadFailedCSS() {
  uploadState.uploading = false;
  const elem = document.getElementById('BaekjoonHub_progress_elem');
  elem.className = 'markuploadfailed';
}

/**
 * 제출 목록 비교함수입니다
 * @param {object} a - 제출 요소 피연산자 a
 * @param {object} b - 제출 요소 피연산자 b
 * @returns {number} - a와 b 아래의 우선순위로 값을 비교하여 정수값을 반환합니다.
 * 1. 실행시간(runtime)의 차이가 있을 경우 그 차이 값을 반환합니다.
 * 2. 사용메모리(memory)의 차이가 있을 경우 그 차이 값을 반환합니다.
 * 3. 코드길이(codeLength)의 차이가 있을 경우 그 차이 값을 반환합니다.
 * 4. 위의 요소가 모두 같은 경우 제출한 요소(submissionId)의 그 차이 값의 역을 반환합니다.
 * */
function compareSubmission(a, b) {
  // prettier-ignore-start
  /* eslint-disable */
  return a.runtime === b.runtime
          ? a.memory === b.memory
            ? a.codeLength === b.codeLength
              ? -(a.submissionId - b.submissionId)
              : a.codeLength - b.codeLength
            : a.memory - b.memory
          : a.runtime - b.runtime
  ;
  /* eslint-enable */
  // prettier-ignore-end
}

