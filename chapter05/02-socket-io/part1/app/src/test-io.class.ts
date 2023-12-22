import { SocketIo, resource, getMapping,value, component } from "../../src/typespeed";
@component
export default class TestIo {

    // 注入Socket.IO对象
    @resource()
    public socketIo: SocketIo;

    // 测试接收事件
    @SocketIo.onEvent("test")
    public connection(socket, message) {
        console.log(message);
        // 使用两种方式发送广播
        this.socketIo.sockets.emit("test","test-from-server2");
        socket.emit("test", "test-from-server3");
    }

    // 显示页面
    @getMapping("/socketIo")
    public socketIoPage(req, res) {
        res.render("socket");
    }
}