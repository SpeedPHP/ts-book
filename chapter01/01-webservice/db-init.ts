import { createServer, IncomingMessage, ServerResponse } from "http";
import { createConnection, Connection } from "mysql2";

interface Page {
    page(response: ServerResponse): void;
}

class First implements Page {
    page(response: ServerResponse): void {
        response.end("I am first page.");
    }
}

class User implements Page {
    page(response: ServerResponse): void {
        const connection: Connection = createConnection({ host: 'localhost', user: 'root', "password": "123456", database: 'test' });
        connection.query('SELECT * FROM `user`', (err, results) => {
            console.log(err)
            response.end(JSON.stringify(results));
        });
    }
}

class Root implements Page {
    page(response: ServerResponse): void {
        response.end("I am main page.");
    }
}

const router = new Map<string, Page>();
router.set("/first", new First());
router.set("/main", new Root());
router.set("/user", new User());
createServer((request: IncomingMessage, response: ServerResponse) => {
    let page = router.get(request.url === undefined ? "" : request.url);
    if (page === undefined) {
        page = new Root();
    }
    page.page(response);
}).listen(3000);