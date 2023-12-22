#!/usr/bin/env node
// 声明执行此文件的命令，位置必须在第一行
import { Command } from 'commander';
const program = new Command();
import * as fs from "fs";

// 设置命令
program.command('new [appName]') // 命令名称
    .description('Create a new app.') // 命令的Help描述
    .action((appName) => { // 命令的执行函数
        const currentDir = process.cwd();

        // 创建新项目的初始文件
        fs.mkdirSync(currentDir + "/" + appName);
        mkFile("nodemon.json", currentDir + "/" + appName, appName);
        mkFile("package.json", currentDir + "/" + appName, appName);
        mkFile("tsconfig.json", currentDir + "/" + appName, appName);

        fs.mkdirSync(currentDir + "/" + appName + "/src");
        mkFile("main.ts", currentDir + "/" + appName + "/src", appName);
        mkFile("front-page.class.ts", currentDir + "/" + appName + "/src", appName);

        // 输出提示
        console.log('');
        console.log('  Create app success!');
        console.log('');
        console.log('  Please run `npm install` in the app directory.');
        console.log('');
    });

// 设置当开发者输入帮助命令时，需要显示的信息
program.on('--help', () => {
    console.log('');
    console.log('  Examples:');
    console.log('');
    console.log('    $ speed new blog');
});

// 解析命令行参数
program.parse(process.argv);

// 创建文件和替换内容的函数
function mkFile(fileName, targetPath, appName) {
    const tplPath = __dirname + "/templates";
    const fileContents = fs.readFileSync(tplPath + "/" + fileName + ".tpl", "utf-8");
    fs.writeFileSync(targetPath + "/" + fileName, fileContents.replace("###appName###", appName));
}