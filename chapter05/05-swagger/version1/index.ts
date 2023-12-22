import { 
    reqBody as tsReqBody, reqQuery as tsReqQuery, reqForm as tsReqForm, reqParam as tsReqParam, 
    getMapping as tsGetMapping, postMapping as tsPostMapping, requestMapping as tsRequestMapping, log
} from 'typespeed';
import * as swaggerUi from "swagger-ui-express";
type MethodMappingType = "post" | "get" | "all";
type RouterType = { method: MethodMappingType, clazz: string, target: any, propertyKey: string, path: string };
type ParamMapType = { paramKind: ParamIn, target: any, propertyKey: string, parameterIndex: number, paramName?: string };
type RequestBodyMapType = { target: any, propertyKey: string, parameterIndex: number };
type ParamIn = "query" | "path" | "formData";

const routerMap: Map<string, RouterType> = new Map();
const requestBodyMap: Map<string, RequestBodyMapType> = new Map();
const requestParamMap: Map<string, ParamMapType[]> = new Map();

function reqBody(target: any, propertyKey: string, parameterIndex: number) {
    const key = [target.constructor.name, propertyKey].toString();
    requestBodyMap.set(key, {
        "target": target,
        "propertyKey": propertyKey,
        "parameterIndex": parameterIndex
    });
    return tsReqBody(target, propertyKey, parameterIndex);
}

function reqParam(target: any, propertyKey: string, parameterIndex: number) {
    const key = [target.constructor.name, propertyKey].toString();
    if (!requestParamMap.has[key]) {
        requestParamMap.set(key, new Array());
    }
    requestParamMap.get(key).push({
        paramKind: "path", "target": target, "propertyKey": propertyKey, "parameterIndex": parameterIndex
    })
    return tsReqParam(target, propertyKey, parameterIndex);
}

function reqQuery(target: any, propertyKey: string, parameterIndex: number) {
    const key = [target.constructor.name, propertyKey].toString();
    if (!requestParamMap.has[key]) {
        requestParamMap.set(key, new Array());
    }
    requestParamMap.get(key).push({
        paramKind: "query", "target": target, "propertyKey": propertyKey, "parameterIndex": parameterIndex
    })
    return tsReqQuery(target, propertyKey, parameterIndex);
}

function reqForm(paramName: string) {
    const handler = tsReqForm(paramName);
    return (target: any, propertyKey: string, parameterIndex: number) => {
        const key = [target.constructor.name, propertyKey].toString();
        if (!requestParamMap.has[key]) {
            requestParamMap.set(key, new Array());
        }
        requestParamMap.get(key).push({
            paramKind: "formData", "target": target, "propertyKey": propertyKey, "parameterIndex": parameterIndex,
            "paramName": paramName
        });
        return handler(target, propertyKey, parameterIndex);
    }
}

function swaggerMiddleware(app: any, options?: {}) {
    log(routerMap);
    log(requestBodyMap);
    log(requestParamMap);
    app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(undefined, {
            swaggerOptions: {
                url: "/example.json"
            }
        })
    );
}
// 接管路由装饰器，收集信息
function toMapping(method: MethodMappingType, path: string, mappingMethod: Function) {
    // 调用TypeSpeed框架的路由装饰器，取得回调函数
    const handler = mappingMethod(path);
    return (target: any, propertyKey: string) => {
        // 收集信息，以便在显示JSDoc时分析
        const key = [target.constructor.name, propertyKey].toString();
        if (!routerMap.has(key)) {
            routerMap.set(key, {
                "method": method,
                "path": path,
                "clazz": target.constructor.name,
                "target": target,
                "propertyKey": propertyKey
            });
        }
        // 继续使用TypeSpeed框架的回调函数
        return handler(target, propertyKey);
    }
}
// 新的路由装饰器
const getMapping = (value: string) => toMapping("get", value, tsGetMapping);
const postMapping = (value: string) => toMapping("post", value, tsPostMapping);
const requestMapping = (value: string) => toMapping("all", value, tsRequestMapping);

export { reqBody, reqQuery, reqForm, reqParam, getMapping, postMapping, requestMapping, swaggerMiddleware };