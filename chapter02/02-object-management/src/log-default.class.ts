import { bean } from "../src/speed";
import LogFactory from "./log-factory.class";

export default class LogDefault extends LogFactory {

    // 提供一个默认的日志对象
    @bean
    createLog(): LogFactory {
        return new LogDefault();
    }

    // 日志输出到控制台
    public log(message?: any, ...optionalParams: any[]): void {
        console.log("console.log : " + message);
    }

}