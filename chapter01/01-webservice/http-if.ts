import { createServer, IncomingMessage, ServerResponse } from "http";

// 使用 IF语句来判断请求的 URL
createServer((request: IncomingMessage, response: ServerResponse) => {
    if (request.url === "/first") {
        response.end("I am first page.");
    } else {
        response.end("I am main page.");
    }
}).listen(3000);