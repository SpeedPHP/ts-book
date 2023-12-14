const config = require("./config.json");
const testConfig = require("./config-test.json");

let realConfig = Object.assign(config, testConfig);
console.log(realConfig);
