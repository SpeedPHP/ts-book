const chaiObj = require('chai');
chaiObj.use(require("chai-http"));
import { io as Client } from "socket.io-client";
const expect = chaiObj.expect;

describe("Test Socket IO", () => {
    const testAddr = `http://${process.env.LOCAL_HOST || "localhost"}:8081`;
    // 准备两个客户端
    let clientHanMeiMei, clientLiLei;
    before((done) => {
        // 两个客户端分别先建立连接
        clientHanMeiMei = Client(testAddr);
        clientLiLei = Client(testAddr);
        clientHanMeiMei.on("connect", done);
    });
    after(() => {
        // 结束测试时，关闭两个客户端
        clientHanMeiMei.close();
        clientLiLei.close();
    });
    // 测试发送和接收广播信息
    it("send and receive message", (done) => {
        clientHanMeiMei.on("all", (arg) => {
            expect(arg).to.be.include("LiLei");
            // 清理当前客户端所有监听事件，以免造成冲突
            clientHanMeiMei.removeAllListeners("all");
            done();
        });
        clientLiLei.emit("say", "test-from-client-1");
    });
    // 测试加入房间
    it("test join room", (done) => {
        clientHanMeiMei.emit("join", "");
        clientHanMeiMei.on("all", (arg) => {
            expect(arg).to.be.include("joined private-room");
            clientHanMeiMei.removeAllListeners("all");
            done();
        });
    });
    // 测试房间内广播和接收信息
    it("test say in room", (done) => {
        const message = "I said in Room";
        clientHanMeiMei.on("all", (arg) => {
            expect(arg).to.be.include(message);
            clientHanMeiMei.removeAllListeners("all");
            done();
        });
        clientHanMeiMei.emit("say-inroom", message);
    });
    // 测试触发错误信息
    it("test error catching", (done) => {
        clientHanMeiMei.on("all", (arg) => {
            expect(arg).to.be.include("We have a problem!");
            clientHanMeiMei.removeAllListeners("all");
            done();
        });
        clientHanMeiMei.emit("test-error", "");
    });
    // 测试当客户端断开连接时，另一个客户端是否收到通知
    it("test disconnecting", (done) => {
        clientLiLei.on("all", (arg) => {
            expect(arg).to.be.include("lost a member");
            clientLiLei.removeAllListeners("all");
            done();
        });
        clientHanMeiMei.disconnect();
    });
});

