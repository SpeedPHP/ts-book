import { SocketIo, getMapping, component, io } from "../../src/typespeed";

@component
export default class TestSocket {

    // 准备两个用户名
    static names = ["LiLei", "HanMeiMei"];

    // 记录当前在线用户
    static loginUsers: Map<string, string> = new Map<string, string>();

    // 连接成功
    @SocketIo.onConnected
    public connected(socket, next) {
        // 取出用户名
        let name = TestSocket.names.pop();
        // 设置该用户在线状态
        TestSocket.loginUsers.set(socket.id, name);
        // 发送广播，通知所有用户
        io.sockets.emit("all", "We have a new member: " + name);
    }

    // 某个客户端断线
    @SocketIo.onDisconnect
    public disconnet(socket, reason) {
        // 发送广播，通知所有用户
        io.sockets.emit("all", "We lost a member by: " + reason);
    }

    // 该事件将触发错误
    @SocketIo.onEvent("test-error") 
    public testError(socket, message) {
        throw new Error("test-error");
    }

    // 错误处理
    @SocketIo.onError
    public error(socket, err) {
        // 发送广播，通知所有用户
        io.sockets.emit("all", "We have a problem!");
    }

    // 接收say事件，即客户端发送的消息
    @SocketIo.onEvent("say") 
    public say(socket, message) {
        // 发送广播，并附带当前发送消息者的ID
        io.sockets.emit("all", TestSocket.loginUsers.get(socket.id) + " said: " + message);
    }

    // 该事件会让客户端加入一个房间
    @SocketIo.onEvent("join") 
    public join(socket, message) {
        socket.join("private-room");
        // 对该房间发送广播，附带当前加入房间的客户端ID
        io.to("private-room").emit("all", TestSocket.loginUsers.get(socket.id) + " joined private-room");
    }

    // 该事件会让客户端离开一个房间
    @SocketIo.onEvent("leave") 
    public leave(socket, message) {
        socket.leave("private-room");
        // 给房间内余下的客户端发送广播，附带退出房间的客户端ID
        io.to("private-room").emit("all", TestSocket.loginUsers.get(socket.id) + " leaved private-room");
    }

    // 该事件会在房间内发送广播
    @SocketIo.onEvent("say-inroom") 
    public sayInRoom(socket, message) {
        io.to("private-room").emit("all", TestSocket.loginUsers.get(socket.id) + " said in Room: " + message);
    }

    // 显示Socket.IO测试页面
    @getMapping("/socketIo")
    public socketIoPage(req, res) {
        res.render("socket");
    }
}