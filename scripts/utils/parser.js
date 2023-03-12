
class Parser {
    /**
     * url에 해당하는 html 문서를 가져오는 함수
     * @param url: url 주소
     * @returns html document
     */
    static async findHtmlDocumentByUrl(url) {
        return fetch(url, { method: 'GET' })
        .then((html) => html.text())
        .then((text) => {
            const parser = new DOMParser();
            return parser.parseFromString(text, 'text/html');
        });
    }
}

export { Parser }