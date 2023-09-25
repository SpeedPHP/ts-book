import { app, log, autoware, ServerFactory } from "../../";
//import * as basicAuth from "express-basic-auth"

@app
class Main {

    @autoware
    public server : ServerFactory;

    public main(){
        // this.server.setMiddleware(basicAuth({
        //     users: { 'admin': 'supersecret' }
        // }));
        this.server.start(8080);
        log('start application');
    }
}