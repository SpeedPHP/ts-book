# typespeed-swagger 

[![typescript](https://badgen.net/badge/icon/TypeScript?icon=typescript&label)](https://www.npmjs.com/package/typespeed)
[![license](https://badgen.net/github/license/speedphp/typespeed)](https://github.com/SpeedPHP/typespeed/blob/main/LICENSE)
[![GitHub Build Status](https://img.shields.io/github/actions/workflow/status/speedphp/typespeed-swagger/test.yml)](https://github.com/SpeedPHP/typespeed-swagger/commits/main)
[![Codecov](https://img.shields.io/codecov/c/github/speedphp/typespeed-swagger)
](https://codecov.io/gh/SpeedPHP/typespeed-swagger)

**The Swagger plugin for the TypeSpeed framework.**

- **NO NEED** to add redundant annotations of methods and variables on existing web applications. 
- **NO NEED** to add redundant definitions to any entity classes.
- **Simply** modify the import path of some decorators, then the application will have a complete and available swagger document page.
- Use advanced reflection ([typescript-rtti](https://github.com/typescript-rtti/typescript-rtti)) to get all the type, no extra markup required.

### Install

```
npm install typespeed-swagger typescript-rtti reflect-metadata
```

### How To Use

**First** modify the import path of these decorators from typespeed to typespeed-swagger: `@getMapping`, `@postMapping`, `@requestMapping`, `@reqBody`, `@reqQuery`, `@reqForm`, `@reqParam`.

For example:
```
import { log, component, getMapping, reqQuery } from "typespeed";
```
Would change to:
```
import { log, component } from "typespeed";
import { getMapping, reqQuery } from "typespeed-swagger";
```

**Second**, add swagger middleware to the main.ts entry file, as follows:
```
import { app, log, autoware, ServerFactory } from "typespeed";
import { swaggerMiddleware } from "typespeed-swagger";

@app
class Main {

    @autoware
    public server: ServerFactory;

    public main() {
        swaggerMiddleware(this.server.app, { path: "/docs", "allow-ip": ["127.0.0.1"] }, "./package.json");
        this.server.start(8081);
    }
}
```

After that, start the application, visit http://localhost:8081/docs, and you can see the swagger page.

### Configuration

Typespeed-swagger has three configurations, which are the last two optional parameters of the `swaggerMiddleware` function:

- The `path` property of the second parameter is the address configuration of the swagger page, and the default is `/docs`.

- The `allow-ip` property of the second parameter provides IP restrictions for secure access to the swagger page. Only the client IPs in the `allow-ip` array can access the page normally. Default is `["127.0.0.1", "::1"]`.

- The third parameter is the `package.json` file path of the project. Typespeed-swagger use the package.json file and read its name and version information for swagger page.


### Link

- **TypeSpeed Framework** <https://www.npmjs.com/package/typespeed>

- **Swagger UI** <https://swagger.io>

- **typescript-rtti** <https://www.npmjs.com/package/typescript-rtti>

### License

- [MIT](LICENSE) © speedphp