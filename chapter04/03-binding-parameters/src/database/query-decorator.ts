import { createPool, ResultSetHeader } from 'mysql2';
import { config, log } from '../speed';
const pool = createPool(config("mysql")).promise();
const paramMetadataKey = Symbol('param');

// 插入记录的装饰器
function Insert(sql: string) {
    return (target, propertyKey: string, descriptor: PropertyDescriptor) => {
        descriptor.value = async (...args: any[]) => {
            const result: ResultSetHeader = await queryForExecute(sql, args, target, propertyKey);
            return result.insertId;
        };
    };
}

function Update(sql: string) {
    return (target, propertyKey: string, descriptor: PropertyDescriptor) => {
        descriptor.value = async (...args: any[]) => {
            const result: ResultSetHeader = await queryForExecute(sql, args, target, propertyKey);
            return result.affectedRows;
        };
    };
}

function Select(sql: string) {
    return (target, propertyKey: string, descriptor: PropertyDescriptor) => {
        descriptor.value = async (...args: any[]) => {
            let newSql = sql;
            let sqlValues = [];
            if (args.length > 0) {
                // 调用convertSQLParams()进行参数的处理
                [newSql, sqlValues] = convertSQLParams(args, target, propertyKey, newSql);
            }
            const [rows] = await pool.query(newSql, sqlValues);
            return rows;
        };
    }
}

// SQL参数装饰器
function Param(name: string) {
    return function (target: any, propertyKey: string | symbol, parameterIndex: number) {
        const existingParameters: [string, number][] = Reflect.getOwnMetadata(paramMetadataKey, target, propertyKey) || [];
        existingParameters.push([name, parameterIndex]);
        // 将参数索引存入metadata
        Reflect.defineMetadata(paramMetadataKey, existingParameters, target, propertyKey,);
    };
}

// 执行SQL的核心方法
async function queryForExecute(sql: string, args: any[], target, propertyKey: string,): Promise<ResultSetHeader> {
    let sqlValues = [];
    let newSql = sql;
    if (args.length > 0) {
        // 需要进行参数配置，则调用convertSQLParams()进行处理
        [newSql, sqlValues] = convertSQLParams(args, target, propertyKey, newSql);
    }
    // 执行SQL语句
    const [result] = await pool.query(newSql, sqlValues);
    return <ResultSetHeader>result;
}

function convertSQLParams(args: any[], target: any, propertyKey: string, decoratorSQL: string,): [string, any[]] {
    const queryValues = [];
    let argsVal;
    if (typeof args[0] === 'object') {
        argsVal = new Map(
            Object.getOwnPropertyNames(args[0]).map((valName) => [valName, args[0][valName]]),
        );
    } else {
        // 从metadata取出参数索引
        const existingParameters: [string, number][] = Reflect.getOwnMetadata(paramMetadataKey, target, propertyKey);
        argsVal = new Map(
            existingParameters.map(([argName, argIdx]) => [argName, args[argIdx]]),
        );
    }
    const regExp = /#{(\w+)}/;
    // 循环匹配SQL语句里的占位符
    let match;
    while (match = regExp.exec(decoratorSQL)) {
        const [replaceTag, matchName] = match;
        decoratorSQL = decoratorSQL.replace(new RegExp(replaceTag, 'g'), '?');
        queryValues.push(argsVal.get(matchName));
    }
    return [decoratorSQL, queryValues];
}

export { Insert, Update, Update as Delete, Select, Param };