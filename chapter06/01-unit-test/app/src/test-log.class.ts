import { component, getMapping, error } from "../../";

@component
export default class TestLog {

    @getMapping("/test/error")
    testError() {
        //error("This is a error log");
        return "This is a error log";
    }
}