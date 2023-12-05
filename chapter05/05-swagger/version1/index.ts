import { 
    reqBody as tsReqBody, reqQuery as tsReqQuery, reqForm as tsReqForm, reqParam as tsReqParam, 
    getMapping as tsGetMapping, postMapping as tsPostMapping, requestMapping as tsRequestMapping
} from 'typespeed';
import 'reflect-metadata';
import { reflect } from 'typescript-rtti';
import * as swaggerUi from "swagger-ui-express"


function reqBody(target: any, propertyKey: string, parameterIndex: number) {
    return tsReqBody(target, propertyKey, parameterIndex);
}

function toRequestParams(paramName: string, requestMethod: Function) {
    const handler = requestMethod(paramName);
    return (target: any, propertyKey: string, parameterIndex: number) => {
        return handler(target, propertyKey, parameterIndex);
    }
}

function swaggerMiddleware(app: any, options?: {}) {
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

function toMapping(value: string, mappingMethod: Function, responseClass?: any) {
    const handler = mappingMethod(value);
    return (target: any, propertyKey: string) => {
        const returnType = Reflect.getMetadata('design:returntype', target, propertyKey);
        if(responseClass !== undefined){
            getInfoByObjcet(responseClass);
        } else if (returnType !== undefined && returnType !== Promise) {
			getInfoByObjcet(returnType);
		} else {
			{};
		}
        return handler(target, propertyKey);
    }
}

const reqQuery = (paramName: string) => toRequestParams(paramName, tsReqQuery);
const reqForm = (paramName: string) => toRequestParams(paramName, tsReqForm);
const reqParam = (paramName: string) => toRequestParams(paramName, tsReqParam);
const getMapping = (value: string, responseClass?) => toMapping(value, tsGetMapping, responseClass);
const postMapping = (value: string, responseClass?) => toMapping(value, tsPostMapping, responseClass);
const requestMapping = (value: string, responseClass?) => toMapping(value, tsRequestMapping, responseClass);

function getInfoByObjcet(target) {
	console.log(target.name)
	const ref = reflect(target)
	const obj = new target;
	Object.getOwnPropertyNames(obj).forEach(k => {
		const params = ref.getParameter(k)
		console.log(k, params.type.ref)
		const relatObj = params.type
		if(/^class\s/.test(relatObj.ref)){
			getInfoByObjcet(relatObj.class)
		}
	})
}

export { reqBody, reqQuery, reqForm, reqParam, getMapping, postMapping, requestMapping, swaggerMiddleware };