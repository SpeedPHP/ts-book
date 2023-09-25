import * as os from "os";
const chaiObj = require('chai');
chaiObj.use(require("chai-http"));
const expect = chaiObj.expect;

describe("Test Swagger plugin for TypeSpeed", () => {
    let appClose;
    const hostname = process.env.LOCAL_HOST || os.hostname();
    const testAddr = `http://${hostname}:8082`;
    before(function () {
        this.timeout(20000);
        appClose = require("../app/main");
    });
    it("Swagger UI", (done) =>  {
        chaiObj.request(testAddr).get("/docs/").end((err, res) => {
            expect(res.status).to.be.equal(200);
            done();
        });
    });
    it("JSDoc for Project", (done) => {
        const jsonFile = require("../app/example.json");
        chaiObj.request(testAddr).get("/docs/swagger.json").end((err, res) => {
            expect(JSON.stringify(res.body)).to.be.equal(JSON.stringify(jsonFile));
            done();
        });
    });
    it("Test Database", (done) =>  {
        chaiObj.request(testAddr).get("/test/res").end((err, res) => {
            expect(res.status).to.be.equal(200);
            done();
        });
    });
    it("Test Redis", (done) =>  {
        chaiObj.request(testAddr).get("/redis").end((err, res) => {
            expect(res.text).to.be.equal("get from redis: Hello World");
            done();
        });
    });
    it("Test RabbitMQ", (done) =>  {
        chaiObj.request(testAddr).get("/rabbitmq").end((err, res) => {
            expect(res.text).to.be.equal("Sent by MQClass");
            done();
        });
    });
    after((done) => {
        if(appClose != null){
            appClose.default();
        }
        done();
    });
});


export {};