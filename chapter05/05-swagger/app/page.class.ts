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
    async testQuery(req, res, @reqQuery id: number, @reqParam name:string): Promise<DataC[]> {
        log("id: " + id);
        return Promise.resolve([new DataC("value to C")]);
    }

    @getMapping("/request/queryArray")
    async queryArray(req, res, @reqQuery id: number): Promise<string[]> {
        log("id: " + id);
        return Promise.resolve(["test for c"]);
    }

    @getMapping("/request/queryDataC")
    async queryDataC(req, res, @reqQuery id: number): Promise<DataC> {
        log("id: " + id);
        return Promise.resolve(new DataC("value to C"));
    }

    @getMapping("/request/void")
    async testVoid(req, res, @reqQuery id: number): Promise<void> {
        log("id: " + id);
        res.send("test void");
    }

    @getMapping("/request/string")
    async testString(req, res, @reqQuery id: number): Promise<string> {
        log("id: " + id);
        return Promise.resolve("test string");
    }

    @getMapping("/request/boolean")
    async testBoolean(req, res, @reqQuery id: number): Promise<boolean> {
        log("id: " + id);
        return Promise.resolve(true);
    }

    @getMapping("/request/any")
    async testAny(req, res, @reqQuery id: number): Promise<any> {
        log("id: " + id);
        return Promise.resolve(true);
    }

    @getMapping("/request/object")
    async testObject(req, res, @reqQuery id: number): Promise<{}> {
        log("id: " + id);
        return Promise.resolve({ "test": 123 });
    }

    @getMapping("/request/objectValue")
    async testObjectValue(req, res, @reqQuery id: number): Promise<{test:number}> {
        log("id: " + id);
        return Promise.resolve({ "test": 123 });
    }

    @postMapping("/request/body")
    testBody(@res res, @reqBody body: DataB): DataB {
        log("body: " + JSON.stringify(body));
        return new DataB(100, new DataC("B to C"));
    }

    @postMapping("/request/stringvalue")
    testValueString(@res res, @reqBody body: DataB[]): string {
        log("body: " + JSON.stringify(body));
        return "test string value";
    }

    @postMapping("/request/stringany")
    testValueAny(@res res, @reqBody body: string): any {
        log("body: " + JSON.stringify(body));
        return "test string value";
    }

    @postMapping("/request/stringvoid")
    testValueVoid(@res res, @reqBody body: any): void {
        log("body: " + JSON.stringify(body));
        res.send("test string value");
    }

    @postMapping("/request/stringobjcet")
    testValueObject(@res res, @reqBody body: object): void {
        log("body: " + JSON.stringify(body));
        res.send("test string value");
    }

    @postMapping("/request/stringobjcetstring")
    testValueObjectString(@res res, @reqBody body: {}): void {
        log("body: " + JSON.stringify(body));
        res.send("test string value");
    }

    @postMapping("/request/form")
    testForm(@res res, @reqForm("name") name: string): string[] {
        log("form: " + JSON.stringify(name));
        res.send("test form");
        return ["eee"]
    }

    @getMapping("/request/param/:id")
    testParam(@res res, @reqParam id: number) : DataA[] {
        log("id: " + id);
        return [new DataA(100, "A to B", new DataB(200, new DataC("AB to C")), [new DataC("A to C")])];
    }
}