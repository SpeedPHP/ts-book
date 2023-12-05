import { getMapping, postMapping, reqQuery, reqBody, reqForm, reqParam } from "../index";
import { component, log, req, res } from "typespeed";
import DataC from "./entities/data-c.class";
import DataB from "./entities/data-b.class";
import DataA from "./entities/data-a.class";

@component
export default class Page {

    @getMapping("/request/res")
    testRes(@req req, @res res) {
        res.send("test res");
    }

    @getMapping("/request/query")
    async testQuery(req, res, @reqQuery("id") id: number): Promise<DataC> {
        log("id: " + id);
        return Promise.resolve(new DataC("value to C"));
    }

    @postMapping("/request/body")
    testBody(@res res, @reqBody body: object): DataB {
        log("body: " + JSON.stringify(body));
        return new DataB(100, new DataC("B to C"));
    }

    @postMapping("/request/form")
    testForm(@res res, @reqForm("name") name: string): void {
        log("form: " + JSON.stringify(name));
        res.send("test form");
    }

    @getMapping("/request/param/:id")
    testParam(@res res, @reqParam("id") id: number) : DataA {
        log("id: " + id);
        return new DataA(100, "A to B", new DataB(200, new DataC("AB to C")), [new DataC("A to C")]);
    }
}