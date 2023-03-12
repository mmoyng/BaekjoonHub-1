
class BlobBuilder {

    /**
     * 문제의 상세 정보를 가지고, 문제의 업로드할 디렉토리, 파일명, 커밋 메시지, 문제 설명을 파싱하여 반환합니다.
     * @param {Object} data
     * @returns {Object} { directory, fileName, message, readme, code }
     */
    static makeDetailMessageAndReadme(data) {
      const { problemId, submissionId, title, level, problem_tags,
        problem_description, problem_input, problem_output,
        code, language, memory, runtime } = data;

      const directory = `백준/${level.replace(/ .*/, '')}/${problemId}. ${convertSingleCharToDoubleChar(title)}`;
      const message = `[${level}] Title: ${title}, Time: ${runtime} ms, Memory: ${memory} KB -BaekjoonHub`;
      const category = problem_tags.join(', ');
      const fileName = `${convertSingleCharToDoubleChar(title)}.${languages[language]}`;
      // prettier-ignore-start
      const readme = `# [${level}] ${title} - ${problemId} \n\n`
        + `[문제 링크](https://www.acmicpc.net/problem/${problemId}) \n\n`
        + `### 성능 요약\n\n`
        + `메모리: ${memory} KB, `
        + `시간: ${runtime} ms\n\n`
        + `### 분류\n\n`
        + `${category || "Empty"}\n\n` + (!!problem_description ? ''
          + `### 문제 설명\n\n${problem_description}\n\n`
          + `### 입력 \n\n ${problem_input}\n\n`
          + `### 출력 \n\n ${problem_output}\n\n` : '');
      // prettier-ignore-end
      return {
        directory,
        fileName,
        message,
        readme,
        code
      };
    }
}

export { BlobBuilder }