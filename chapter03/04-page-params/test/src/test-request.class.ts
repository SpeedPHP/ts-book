import { component, getMapping, postMapping, log, req, res, reqQuery, reqBody, reqForm, reqParam } from "../../";
import MutilUsers from "./entities/mutil-users.class";
import UserDto from "./entities/user-dto.class";


@component
export default class TestRequest {

    // 测试用装饰器获取Request和Response对象
    @getMapping("/request/res")
    testRes(@req req, @res res) {
        res.send("test res");
    }

    // 测试用装饰器获取Query参数id
    @getMapping("/request/query")
    async testQuery(req, res, @reqQuery id: number): Promise<MutilUsers> {
        log("id: " + id);
        return Promise.resolve(new MutilUsers("group", [new UserDto(1, "name"), new UserDto(2, "name")]));
    }

    // 测试用装饰器获取请求体对象
    @postMapping("/request/body")
    testBody(@res res, @reqBody body: object):MutilUsers {
        log("body: " + JSON.stringify(body));
        return new MutilUsers("group", [new UserDto(1, "name"), new UserDto(2, "name")]);
    }

    // 测试用装饰器获取表单参数
    @postMapping("/request/form")
    testForm(@res res, @reqForm("name") name: string) {
        log("form: " + JSON.stringify(name));
        res.send("test form");
    }

    // 测试用装饰器获取路径参数id
    @getMapping("/request/param/:id")
    testParam(@res res, @reqParam id: number) {
        log("id: " + id);
        res.send("test param");
    }
}