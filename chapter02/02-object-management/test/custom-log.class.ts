import { bean } from "../src/speed";
import * as tracer from "tracer";
import LogFactory from "../src/log-factory.class";

export default class CustomLog extends LogFactory {

    // 使用tracer库定义新的日志格式
    private logger = tracer.console({
        format: "[{{title}}] {{timestamp}} {{file}}:{{line}} ({{method}}) {{message}}",
        dateformat: "yyyy-mm-dd HH:MM:ss",
        stackIndex: 2,
        preprocess: function (data) {
            data.title = data.title.toUpperCase();
        }
    });

    // 提供新的日志对象
    @bean
    public createLog(): LogFactory {
        return new CustomLog();
    }

    // 用tracer库打印日志
    public log(message?: any, ...optionalParams: any[]) : void{
        this.logger.log(message, ...optionalParams);
    }
}