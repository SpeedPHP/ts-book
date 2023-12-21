const chaiObj = require('chai');
chaiObj.use(require("chai-http"));
const expect = chaiObj.expect;

describe("Test Redis", () => {
    const testAddr = `http://${process.env.LOCAL_HOST || "localhost"}:8081`;
    // 准备排行榜数据
    const ranking = {
        "zhangsan": 93, "lisi": 99, "wangwu": 96, "zhaoliu": 97, "qianqi": 98, "sunba": 92, "zhoujiu": 94, "wushi": 95
    };
    // 测试Redis读取
    it("/redis", (done) => {
        chaiObj.request(testAddr).get("/redis").end((err, res) => {
            expect(res.text).to.be.equal("get from redis: " + "Hello World");
            done();
        });
    });
    // 测试Redis的发布订阅功能
    it("/redis/publish", (done) => {
        chaiObj.request(testAddr).get("/redis/publish").end((err, res) => {
            expect(res.text).to.be.equal("Published!");
            done();
        });
    });
    // 遍历排行榜数据，发送请求以加入到排行榜
    Object.keys(ranking).forEach((item) => {
        it("/redis/add " + item, (done) => {
            chaiObj.request(testAddr).get(`/redis/add?name=${item}&score=${ranking[item]}`).end((err, res) => {
                expect(res.text).to.be.equal("add zset success");
                done();
            });
        });
    });
    // 列出排行榜数据，检查按小到大的排序是否跟本地一致
    it("/redis/list", (done) => {
        chaiObj.request(testAddr).get("/redis/list").end((err, res) => {
            const dataList = JSON.parse(res.text);
            const rankingAsc = Object.fromEntries(Object.entries(ranking).sort((a, b) => a[1] - b[1]));
            expect(JSON.stringify(dataList)).to.be.equal(JSON.stringify(rankingAsc));
            done();
        });
    });
    // 列出排行榜数据，检查按大到小的排序是否跟本地一致
    it("/redis/ranking", (done) => {
        chaiObj.request(testAddr).get("/redis/ranking").end((err, res) => {
            const dataList = JSON.parse(res.text);
            const rankingDesc = Object.fromEntries(Object.entries(ranking).sort((a, b) => b[1] - a[1]));
            expect(JSON.stringify(dataList)).to.be.equal(JSON.stringify(rankingDesc));
            done();
        });
    });
});

export { };