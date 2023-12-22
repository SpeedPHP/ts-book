import { Server as IoServer } from "socket.io";
import { createServer } from "http";

let io: IoServer = null;
const listeners = { "event": [], "disconnect": null, "error": null, "connected": null };

class SocketIo {

    // 将Socket.IO服务绑定到Web服务
    public static setIoServer(app, ioSocketConfig) {
        const httpServer = createServer(app);
        // 创建Socket.IO服务，注意参数为Web服务对象
        io = new IoServer(httpServer, ioSocketConfig);
        // Socket.IO服务的全局中间件，其影响范围是整个服务
        io.use((socket, next) => {
            // 当新连接建立时，执行连接成功处理装饰器
            if (listeners["connected"] !== null) {
                listeners["connected"](socket, async (err) => {
                    if (listeners["error"] !== null && err) {
                        await listeners["error"](socket, err);
                    }
                });
            }
            next();
        });
        // 连接成功事件
        io.on("connection", (socket) => {
            // 当收到断线事件时，执行断线处理装饰器
            if (listeners["disconnect"] !== null) {
                socket.on("disconnect", async (reason) => {
                    await listeners["disconnect"](socket, reason);
                });
            }
            // Socket级中间件，其影响范围是当前连接
            socket.use(async ([event, ...args], next) => {
                try {
                    // 遍历事件监听器，分配事件到具体装饰器
                    for (let listener of listeners["event"]) {
                        if (listener[1] === event) {
                            await listener[0](socket, ...args);
                        }
                    }
                } catch (err) {
                    next(err);
                }
            });
            // 当出现错误时，执行错误处理装饰器
            if (listeners["error"] !== null) {
                socket.on("error", async (err) => {
                    await listeners["error"](socket, err);
                });
            }
        });
        // 返回Web服务对象
        return httpServer;
    }

    public static onEvent(event: string) {
        return (target: any, propertyKey: string) => {
            listeners["event"].push([target[propertyKey], event]);
        }
    }

    public static onError(target: any, propertyKey: string) {
        listeners["error"] = target[propertyKey];
    }

    public static onDisconnect(target: any, propertyKey: string) {
        listeners["disconnect"] = target[propertyKey];
    }

    public static onConnected(target: any, propertyKey: string) {
        listeners["connected"] = target[propertyKey];
    }
}

export { SocketIo, io }