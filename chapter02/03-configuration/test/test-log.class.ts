import { onClass, log, schedule } from "../src/speed";

@onClass
export default class TestLog {

    constructor() {
        log("TestLog constructor");
    }

    @schedule("* * * * * *")
    myTimer() {
        log("myTimer running");
    }
}