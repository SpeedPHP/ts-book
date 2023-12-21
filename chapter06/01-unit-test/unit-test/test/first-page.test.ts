const chaiObj = require('chai');
chaiObj.use(require("chai-http"));

describe("Test First page", () => {
    const testAddr = `http://${process.env.LOCAL_HOST || "localhost"}:8081`;
    // 准备数据进行批量测试
    const firstPageRequests = [
        {
            "url": "/first",
            "expect": "FirstPage index running",
        },
        {
            "url": "/first/sendJson",
            "expect": JSON.stringify({
                "from": "sendJson",
                "to": "Browser"
            }),
        },
        {
            "url": "/first/sendResult",
            "expect": "sendResult",
        },
        {
            "url": "/first/renderTest",
            "expect": "Hello zzz!",
        },
        {
            "url": "/test/error",
            "expect": "This is a error log",
        }
    ]
    // 遍历数据，使用chai-http发起请求，匹配返回结果
    firstPageRequests.forEach((testRequest) => {
        it(testRequest.url, (done) => {
            chaiObj.request(testAddr).get(testRequest.url).end((err, res) => {
                chaiObj.assert.equal(testRequest.expect, res.text);
                return done();
            });
        });
    });

});

export {};