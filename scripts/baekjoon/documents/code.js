
class Code {

    constructor() {}

    static async getById(submissionId) {
        let code = await getSubmitCodeFromStats(submissionId);
        if (isNull(code)) {
            code = await this.fetchSubmitCodeById(submissionId);
            updateSubmitCodeFromStats({ submissionId, code }); // not await
        }
        return code;
    }

    static async fetchSubmitCodeById(submissionId) {
        return fetch(`https://www.acmicpc.net/source/download/${submissionId}`, { method: 'GET' })
          .then((res) => res.text())
    }
}

export { Code }