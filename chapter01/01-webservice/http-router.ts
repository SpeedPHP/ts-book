import { createServer, IncomingMessage, ServerResponse } from "http";
// 页面接口
interface Page {
    display(request: IncomingMessage, response: ServerResponse): void;
}
// 第一个页面类
class First implements Page {
    display(request: IncomingMessage, response: ServerResponse): void {
        response.end("I am first page.");
    }
}
// 默认页面类
class Root implements Page {
    display(request: IncomingMessage, response: ServerResponse): void {
        response.end("I am main page.");
    }
}

const router = new Map<string, Page>();
// 设置访问地址与页面类的关系
router.set("/first", new First());
router.set("/main", new Root());
createServer((request: IncomingMessage, response: ServerResponse) => {
    let page = router.get(request.url === undefined ? "" : request.url);
    if (page === undefined) {
        page = new Root();
    }
    page.display(request, response);
}).listen(3000);
