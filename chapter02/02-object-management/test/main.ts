import { log } from "../src/speed";
import * as walkSync from "walk-sync";

// 循环载入框架的TS文件
const srcDir = process.cwd() + "/src";
const srcPaths = walkSync(srcDir, { globs: ['**/*.ts'] });
for(let p of srcPaths) {
    import(srcDir + "/" + p);
}

// 循环载入用户目录的TS文件
const testDir = process.cwd() + "/test";
const testPaths = walkSync(testDir, { globs: ['**/*.ts'] });
for(let p of testPaths) {
    import(testDir + "/" + p);
}

log("Main file running...");