import { app, autoware, ServerFactory } from "typespeed";
import { swaggerMiddleware } from "../index";
import * as path from "path";

@app
class Main {

    @autoware
    public server: ServerFactory;

    public main() {
        const packageJson = path.join(__dirname, "./package.json");
        swaggerMiddleware(this.server.app, null, packageJson);
        this.server.start(8081);
    }
}
