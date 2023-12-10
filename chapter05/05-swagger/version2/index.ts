import {
    reqBody as tsReqBody, reqQuery as tsReqQuery, reqForm as tsReqForm, reqParam as tsReqParam,
    getMapping as tsGetMapping, postMapping as tsPostMapping, requestMapping as tsRequestMapping, error
} from 'typespeed';
import * as fs from 'fs';
import 'reflect-metadata';
import { reflect } from 'typescript-rtti';
import * as swaggerUi from "swagger-ui-express";

type MethodType = "post" | "get" | "put" | "delete" | "options" | "head" | "patch" | "all";
type MethodMappingType = "post" | "get" | "all";
type TypeKind = "string" | "number" | "boolean" | "$ref" | "object";
type RouterType = { method: MethodMappingType, clazz: string, target: any, propertyKey: string, path: string };
type ParamMapType = { paramKind: ParamIn, target: any, propertyKey: string, parameterIndex: number, paramName?: string };
type RequestBodyMapType = { target: any, propertyKey: string, parameterIndex: number };
type ParamIn = "query" | "path" | "formData";

const schemaMap: Map<string, ApiSchema> = new Map();
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

function swaggerMiddleware(app: any, options?: { path: string, "allow-ip": string[] }, packageJsonPath?: string) {
    const path = options && options.path || "/docs";
    const swaggerJsonPath = path + "/swagger.json";
    const checkAllowIp = (req, res, next) => {
        const allowIp = options && options["allow-ip"] || ["127.0.0.1", "::1"];
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        if (allowIp.indexOf(ip) !== -1) return next();
        res.status(403).send("Forbidden");
    }
    const swggerOptions = { swaggerOptions: { url: swaggerJsonPath } }
    app.get(swaggerJsonPath, checkAllowIp, (req, res) => res.json(swaggerDocument(packageJsonPath)));
    app.use(path, checkAllowIp, swaggerUi.serveFiles(null, swggerOptions), swaggerUi.setup(null, swggerOptions));
}

function toMapping(method: MethodMappingType, path: string, mappingMethod: Function) {
    const handler = mappingMethod(path);
    return (target: any, propertyKey: string) => {
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
        return handler(target, propertyKey);
    }
}

function swaggerDocument(packageJsonPath?: string): object {
    if (routerMap.size === 0) return;
    const apiDocument = new ApiDocument();
    if (packageJsonPath && fs.existsSync(packageJsonPath)) {
        try {
            const jsonContents = fs.readFileSync(packageJsonPath, 'utf8');
            const packageJson = JSON.parse(jsonContents);
            apiDocument.title = packageJson.name;
            apiDocument.description = packageJson.description;
            apiDocument.version = packageJson.version;
            apiDocument.license = packageJson.license;
            apiDocument.openapi = packageJson.openapi;
        } catch (err) {
            error(`Error reading file from disk: ${err}`);
        }
    }

    routerMap.forEach((router, key) => {
        const apiPath = createApiPath(router);
        if (requestBodyMap.has(key)) {
            handleRequestBody(apiPath, requestBodyMap.get(key));
        }
        if (requestParamMap.has(key)) {
            handleRequestParams(apiPath, requestParamMap.get(key));
        }
        apiDocument.addPath(router.path, apiPath);
    });
    schemaMap.forEach((schema) => {
        apiDocument.addSchema(schema);
    });
    return apiDocument.toDoc();
};

const getMapping = (value: string) => toMapping("get", value, tsGetMapping);
const postMapping = (value: string) => toMapping("post", value, tsPostMapping);
const requestMapping = (value: string) => toMapping("all", value, tsRequestMapping);

function handleRealType(realType: any, callback: Function) {
    if (typeof realType === "function") {
        if (/^class\s/.test(realType.toString())) {
            handleComponent(realType);
            callback(ApiItem.fromType("$ref", realType.name));
        } else {
            callback(ApiItem.fromType(realType.name.toLowerCase()));
        }
    } else if (realType["TΦ"] === 'V') {
        callback();
    } else if (realType["TΦ"] === 'O') {
        callback(ApiItem.fromType("object"));
    } else if (realType["TΦ"] === '~') {
        callback(ApiItem.fromType("string"));
    } else if (realType["TΦ"] === '[') {
        const deepRealType = realType["e"];
        if (/^class\s/.test(deepRealType.toString())) {
            handleComponent(deepRealType);
            callback(ApiItem.fromArray("$ref", deepRealType.name));
        } else {
            callback(ApiItem.fromArray(deepRealType.name.toLowerCase()));
        }
    } else {
        callback(ApiItem.fromType("string"));
    }
}

function handleRequestParams(apiPath: ApiPath, params: ParamMapType[]) {
    params.forEach(param => {
        const paramType = reflect(param.target[param.propertyKey]).parameters[param.parameterIndex];
        //if(!paramType || !paramType.type || paramType.type["_ref"]) return;
        const realType = paramType.type["_ref"];
        handleRealType(realType, (item: ApiItem) => {
            apiPath.addParameter(param.paramKind, param.paramName || paramType.name, item);
        })
    });
}

function handleRequestBody(apiPath: ApiPath, bodyParam: RequestBodyMapType) {
    const { target, propertyKey, parameterIndex } = bodyParam;
    const paramType = reflect(target[propertyKey]).parameters[parameterIndex];
    //if(!paramType || !paramType.type || paramType.type["_ref"]) return;
    const realType = paramType.type["_ref"];
    handleRealType(realType, (item: ApiItem) => {
        apiPath.addRequestBody(item);
    })
}

function createApiPath(router: RouterType): ApiPath {
    const { method, clazz, target, propertyKey } = router;
    const apiPath = new ApiPath(method, clazz, propertyKey);
    const responseType = reflect(target[propertyKey]).returnType;
    if(!responseType || !responseType["_ref"]){
        apiPath.addResponse("200", "OK");
        return apiPath;
    }
    let realType = responseType["_ref"];
    if (responseType.isPromise()) {
        realType = responseType["_ref"]["p"][0];
    }
    handleRealType(realType, (item?: ApiItem) => {
        if (item === undefined) {
            apiPath.addResponse("200", "OK");
        } else {
            apiPath.addResponse("200", "OK", item);
        }
    })
    return apiPath;
}

function handleComponent(target) {
    const ref = reflect(target)
    const obj = new target;
    const apiSchema = new ApiSchema(target.name);
    Object.getOwnPropertyNames(obj).forEach(k => {
        const params = ref.getParameter(k)
        if (params && params.type && params.type["_ref"]) {
            handleRealType(params.type["_ref"], (item: ApiItem) => {
                apiSchema.addProperty(k, item);
            });
        }
    })
    schemaMap.set(target.name, apiSchema);
}

class ApiSchema {
    public title: string;
    public properties: object = {};

    constructor(title: string) {
        this.title = title;
    }

    addProperty(name: string, item: ApiItem) {
        this.properties[name] = item.toDoc();
    }

    toDoc() {
        return {
            "title": this.title,
            "type": "object",
            "properties": this.properties
        }
    }
}

class ApiPath {
    public tagName: string;
    public summary: string;
    public method: MethodType;
    public responses: object = {};
    public parameters: object[] = [];
    public requestBody: object;

    constructor(method: MethodType, tagName: string, summary: string) {
        this.method = method;
        this.summary = summary;
        this.tagName = tagName;
    }

    addResponse(statusCode: string, description: string, itemObject?: ApiItem) {
        if (!itemObject) {
            this.responses[statusCode] = {
                "description": description
            }
            return;
        }
        this.responses[statusCode] = {
            "description": description,
            "content": {
                "*/*": {
                    "schema": itemObject.toDoc()
                }
            }
        }
    }

    addParameter(paramIn: "query" | "path" | "formData", name: string, itemObject: ApiItem) {
        this.parameters.push({
            "name": name,
            "in": paramIn,
            "style": "form",
            "required": true,
            "schema": itemObject.toDoc()
        });
    }

    addRequestBody(itemObject: ApiItem) {
        this.requestBody = {
            "content": {
                "*/*": {
                    "schema": itemObject.toDoc()
                }
            }
        }
    }

    toDoc() {
        const doc = {
            "tags": [this.tagName],
            "summary": this.summary,
            "operationId": this.summary + this.method.charAt(0).toUpperCase() + this.method.slice(1),
            "responses": this.responses,
        }
        if (this.requestBody) doc["requestBody"] = this.requestBody;
        if (this.parameters.length > 0) doc["parameters"] = this.parameters;

        return doc;
    }
}

class ApiDocument {
    title: string;
    description: string;
    license: string;
    version: string;
    openapi: string;

    private tags: object = {};
    private schemas: object = {};
    private paths: object = {};

    addSchema(schema: ApiSchema) {
        this.schemas[schema.title] = schema.toDoc();
    }

    addPath(path: string, pathObject: ApiPath) {
        this.tags[pathObject.tagName] = { "name": pathObject.tagName };
        if (!this.paths[path]) this.paths[path] = {};
        this.paths[path][pathObject.method] = pathObject.toDoc();
    }

    toDoc() {
        return {
            "openapi": this.openapi || "3.0.0",
            "info": {
                "title": this.title || "API under construction",
                "description": this.description || "",
                "license": {
                    "name": this.license || "UNLICENSED",
                },
                "version": this.version || "1.0.0",
            },
            "tags": Array.from(Object.values(this.tags)),
            "paths": this.paths,
            "components": {
                "schemas": this.schemas
            }
        }
    }
}

class ApiItem {
    public typeKey: TypeKind;
    public isArray?: boolean = false;
    public typeRef?: string;

    static fromArray(typeKey: TypeKind, typeRef?: string) {
        const item = new ApiItem();
        item.typeKey = typeKey;
        item.isArray = true;
        item.typeRef = typeRef;
        return item;
    }

    static fromType(typeKey: TypeKind, typeRef?: string) {
        const item = new ApiItem();
        item.typeKey = typeKey;
        item.typeRef = typeRef;
        return item;
    }

    public toDoc() {
        let items = {};
        if (this.typeKey === "$ref") {
            items = {
                "$ref": "#/components/schemas/" + this.typeRef
            };
        } else {
            items = {
                "type": this.typeKey
            };
        }
        if (this.isArray) {
            items = {
                "type": "array",
                "items": items
            }
        }
        return items;
    }
}

export { reqBody, reqQuery, reqForm, reqParam, getMapping, postMapping, requestMapping, swaggerMiddleware };