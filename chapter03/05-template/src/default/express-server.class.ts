import * as express from "express";
import * as consolidate from "consolidate";
import ServerFactory from "../factory/server-factory.class";
import { setRouter } from "../route-mapping.decorator";
import { bean, log } from "../speed";

export default class ExpressServer extends ServerFactory {
    // 提供Web服务对象
    @bean
    public getSever(): ServerFactory {
        const server = new ExpressServer();
        server.app = express();
        return server;
    }

    // 设置中间件
    public setMiddleware(middleware: any) {
        this.middlewareList.push(middleware);
    }

    // 启动服务
    public start(port: number) {
        this.middlewareList.forEach(middleware => {
            this.app.use(middleware);
        });
        this.setDefaultMiddleware();
        this.app.listen(port, () => {
            log("server start at port: " + port);
        });
    }

    // 设置默认中间件
    private setDefaultMiddleware() {
        // 模板配置
        const viewConfig = {
            "engine": "mustache",
            "path": "/test/views",
            "suffix": "html"
        };
        this.app.engine(viewConfig["suffix"], consolidate[viewConfig["engine"]]);
        this.app.set('view engine', viewConfig["suffix"]);
        this.app.set('views', process.cwd() + viewConfig["path"]);

        setRouter(this.app);
    }
}
