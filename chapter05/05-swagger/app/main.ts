import { app, log, autoware, ServerFactory } from "typespeed";
import { swaggerMiddleware } from "../index";
import * as path from "path";

let appServer = null;

@app
class Main {

    @autoware
    public server: ServerFactory;

    public main() {
        const packageJson = path.join(__dirname, "./package.json");
        swaggerMiddleware(this.server.app, null, packageJson);
        appServer = this.server.start(8082);
    }
}
export default () => {
    if (appServer != null) {
        appServer.close();
    }
};