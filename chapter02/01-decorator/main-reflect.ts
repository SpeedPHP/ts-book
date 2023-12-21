import "reflect-metadata";

class MainReflect {
    // 使用Object注入对象
    @injectAge(10)
    private age: number;

    // 使用反射获取返回值类型
    @findReturn
    getAge(): Number {
        return this.age;
    }
}

const mainReflect = new MainReflect();
console.log("获得Age值：", mainReflect.getAge());

function injectAge(arg: Number) {
    return function (target: any, propertyKey: string) {
        // 设置对象属性
        Object.defineProperty(target, propertyKey, {get: () => {return arg;}});
    }
}

function findReturn(target: any, propertyKey: string) {
    // 获取返回值类型
    const returnType: any = Reflect.getMetadata("design:returntype", target, propertyKey);
    console.log(target[propertyKey].name, "的返回类型是：", returnType.name);
}