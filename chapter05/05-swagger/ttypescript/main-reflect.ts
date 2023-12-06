import "reflect-metadata";
class MainReflect {
    @injectReflect
    getAge(): Number {
        return 1;
    }
    @injectReflect
    getPromise(): Promise<string> {
        return Promise.resolve('promise');
    }
    @injectReflect
    getArray(): Array<string> {
        return ['array'];
    }
}
function injectReflect(target: any, propertyKey: string) {
    const returnType: any = Reflect.getMetadata("design:returntype", target, propertyKey);
    console.log(target[propertyKey].name, "的返回类型是：", returnType.name);
}