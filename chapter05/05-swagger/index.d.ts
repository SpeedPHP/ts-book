import "reflect-metadata";
/** request.body 对象装饰器，作为路由页面方法参数，获取 request.body 对象 */
declare function reqBody(target: any, propertyKey: string, parameterIndex: number) : void;
/** request.param 值装饰器，作为路由页面方法参数，获取 request.params 内容 */
declare function reqParam(target: any, propertyKey: string, parameterIndex: number) : void;
/** request.query 值装饰器，作为路由页面方法参数，获取 request.query 内容 */
declare function reqQuery(target: any, propertyKey: string, parameterIndex: number) : void;
/** request 表单值装饰器，作为路由页面方法参数，获取 request.body 表单内容 */
declare function reqForm(paramName: string) : (target: any, propertyKey: string, parameterIndex: number) => void;
/**
 * GET 请求装饰器
 * @param value 请求路径
 */
declare const getMapping: (value: string) => (target: any, propertyKey: string) => void;
/**
 * POST 请求装饰器
 * @param value 请求路径
 */
declare const postMapping: (value: string) => (target: any, propertyKey: string) => void;
/**
 * 请求装饰器，不区分请求类型
 * @param value 请求路径
 */
declare const requestMapping: (value: string) => (target: any, propertyKey: string) => void;
/**
 * Swagger UI 中间件装配函数
 * @param app Express 实例
 * @param options Swagger UI 配置项
 * @param packageJsonPath package.json 文件路径，方便导入项目信息
 */
declare function swaggerMiddleware(app: any, options?: {}, packageJsonPath?: string) : void;

export { reqBody, reqQuery, reqForm, reqParam, getMapping, postMapping, requestMapping, swaggerMiddleware };