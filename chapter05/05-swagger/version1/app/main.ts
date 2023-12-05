import { app, log, autoware, ServerFactory } from "typespeed";
import { swaggerMiddleware } from "../index";

@app
class Main {

    @autoware
    public server : ServerFactory;

    public main(){
        swaggerMiddleware(this.server.app);
        this.server.start(8081);
    }
}
