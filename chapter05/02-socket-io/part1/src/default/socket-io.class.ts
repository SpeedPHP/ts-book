import { Server as IoServer } from "socket.io";

// 创建Socket.IO对象
const ioObj:IoServer = new IoServer({
    cors: {
      origin: "http://localhost:8080"
    }
  });

class SocketIo extends IoServer {

    constructor() {
        super();
        return ioObj;
    }

    // 监听事件的装饰器
    public static onEvent(event: string) {
        console.log("onEvent");
        return (target: any, propertyKey: string) => {
            console.log("onEvent-callback");
            ioObj.on("connection", (socket) => {
                console.log("onEvent-connection")
                // 监听事件
                socket.on(event, (message) => {
                    console.log("onEvent-socket",event, message)
                    ioObj.emit("test", "test-from-server1");
                    target[propertyKey](socket, message);
                });
            });
            // 启动Socket.IO服务
            ioObj.listen(8085);
        }
    }



}

export { SocketIo }