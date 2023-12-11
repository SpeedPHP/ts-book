import { createServer, IncomingMessage, ServerResponse } from "http";

interface Page {
    display(request: IncomingMessage, response: ServerResponse): void;
}

class First implements Page {
    display(request: IncomingMessage, response: ServerResponse): void {
        response.end("I am first page.");
    }
}

class Root implements Page {
    display(request: IncomingMessage, response: ServerResponse): void {
        response.end("I am main page.");
    }
}

const router = new Map<string, Page>();
router.set("/first", new First());
router.set("/main", new Root());
createServer((request: IncomingMessage, response: ServerResponse) => {
    let page = router.get(request.url === undefined ? "" : request.url);
    if (page === undefined) {
        page = new Root();
    }
    page.display(request, response);
}).listen(3000);
