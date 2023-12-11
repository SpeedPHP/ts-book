import {createServer, IncomingMessage, ServerResponse} from "http";

// 简单的 HTTP 服务
createServer((request: IncomingMessage, response: ServerResponse) => {
    response.end("Hello World");
}).listen(3000);
