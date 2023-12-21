import { before, log, onClass, after } from "../src/speed";
import FirstPage from "./first-page.class";

@onClass
export default class AopTest {

    // 前置切面装饰器，在FirstPage的index()方法调用前执行
    @before(FirstPage, "index")
    public FirstIndex() {
        log("Before FirstPage index run, at AopTest FirstIndex.");
        log("AopTest FirstIndex run over." + this.getWordsFromAopTest());
        return "FirstIndex";
    }

    // 测试切面装饰器里再调用其他方法
    public getWordsFromAopTest() {
        return "getWordsFromAopTest";
    }

    // 前置切面装饰器，在FirstPage的getTestFromFirstPage()方法调用前执行
    @before(FirstPage, "getTestFromFirstPage")
    public testGetTestFromFirstPage() {
        log("AopTest testGetTestFromFirstPage run over.");
    }

    // 后置切面装饰器，在FirstPage的index()方法调用后执行
    @after(FirstPage, "index")
    public testFirstIndexAfter(result) {
        log("AopTest testFirstIndexAfter run over, result: " + result);
        log(result);
    }
}