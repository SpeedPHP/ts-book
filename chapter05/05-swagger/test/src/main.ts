import { app, log, autoware, ServerFactory } from "typespeed";
import { swaggerMiddleware } from "typespeed-swagger";

@app
class Main {

    @autoware
    public server: ServerFactory;

    public main() {
        swaggerMiddleware(this.server.app, {
            path: "/documents",
            'allow-ip': ["192.,168.1.1", "127.0.0.1", "::1"]
        }, "./package.json");
        this.server.start(8081);
        log('start application');
    }
}