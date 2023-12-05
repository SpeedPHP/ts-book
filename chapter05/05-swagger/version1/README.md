# typespeed-swagger 

[![typescript](https://badgen.net/badge/icon/TypeScript?icon=typescript&label)](https://www.npmjs.com/package/typespeed)
[![license](https://badgen.net/github/license/speedphp/typespeed)](https://github.com/SpeedPHP/typespeed/blob/main/LICENSE)

**The Swagger plugin for the TypeSpeed framework.**

### Install

```
npm install typespeed-swagger
```

### Usage

1. Modify the imports of the following decorators in the original TypeSpeed project and replace them with the path from typespeed-swagger. The decorators that need to be replaced are: `@getMapping`, `@postMapping`, `@requestMapping`, `@reqBody`, `@reqQuery`, `@reqForm`, `@reqParam`.
2. The three *Mapping decorators have a second optional parameter. If the response object is a Promise, please put the return type in the second parameter.
3. Please put the `swaggerMiddleware` into TypeSpeed's middleware list so that it can support Swagger web page access.

### Link

- **TypeSpeed Framework** <https://www.npmjs.com/package/typespeed>

- **Swagger UI** <https://swagger.io>

- **typescript-rtti** <https://www.npmjs.com/package/typescript-rtti>

### License

- [MIT](LICENSE) © speedphp