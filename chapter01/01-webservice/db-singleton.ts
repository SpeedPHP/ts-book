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
        // 用getInstance()方法取得两个数据库连接对象
        const database: Database = Database.getInstance();
        const databaseCopy: Database = Database.getInstance();
        console.log("两个对象是否一致：", database === databaseCopy)
        database.query('SELECT * FROM `user`', (err, results) => {
            response.end(JSON.stringify(results));
        });
    }
}

class Root implements Page {
    page(response: ServerResponse): void {
        response.end("I am main page.");
    }
}

class Database {
    private static instance: Database;
    private connection: Connection;
    private constructor(connection: Connection) {
        this.connection = connection;
    }
    // 单例模式
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database(createConnection({ host: 'localhost', user: 'root', "password": "root", database: 'test' }));
        }
        return Database.instance;
    }
    // 数据库查询方法，参数为sql语句和回调函数
    query(sql: string, callback: (err: any, results: any) => void): void {
        this.connection.query('SELECT * FROM `user`', callback);
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
