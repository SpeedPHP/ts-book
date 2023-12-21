import { createPool, ResultSetHeader } from 'mysql2';
import { config, log } from '../speed';
import BeanFactory from "../bean-factory.class";
import CacheFactory from '../factory/cache-factory.class';
const pool = createPool(config("mysql")).promise();
const paramMetadataKey = Symbol('param');
const resultTypeMap = new Map<string, object>();
const cacheDefindMap = new Map<string, number>();
const tableVersionMap =  new Map<string, number>();
let cacheBean: CacheFactory;

function Insert(sql: string) {
    return (target, propertyKey: string, descriptor: PropertyDescriptor) => {
        descriptor.value = async (...args: any[]) => {
            const result: ResultSetHeader = await queryForExecute(sql, args, target, propertyKey);
            if(cacheBean && result.affectedRows > 0){
                const [tableName, tableVersion] = getTableAndVersion("insert", sql);
                tableVersionMap.set(tableName, tableVersion + 1);
            }
            return result.insertId;
        };
    };
}

function Update(sql: string) {
    return (target, propertyKey: string, descriptor: PropertyDescriptor) => {
        descriptor.value = async (...args: any[]) => {
            const result: ResultSetHeader = await queryForExecute(sql, args, target, propertyKey);
            if(cacheBean && result.affectedRows > 0){
                const [tableName, tableVersion] = getTableAndVersion("update", sql);
                tableVersionMap.set(tableName, tableVersion + 1);
            }
            return result.affectedRows;
        };
    };
}

function Delete(sql: string) {
    return (target, propertyKey: string, descriptor: PropertyDescriptor) => {
        descriptor.value = async (...args: any[]) => {
            const result: ResultSetHeader = await queryForExecute(sql, args, target, propertyKey);
            if(cacheBean && result.affectedRows > 0){
                const [tableName, tableVersion] = getTableAndVersion("delete", sql);
                tableVersionMap.set(tableName, tableVersion + 1);
            }
            return result.affectedRows;
        };
    };
}
// 查询装饰器
function Select(sql: string) {
    return (target, propertyKey: string, descriptor: PropertyDescriptor) => {
        descriptor.value = async (...args: any[]) => {
            let newSql = sql;
            let sqlValues = [];
            if (args.length > 0) {
                // 处理参数绑定
                [newSql, sqlValues] = convertSQLParams(args, target, propertyKey, newSql);
            }
            let rows;
            // 检查当前查询是否需要缓存
            if (cacheBean && cacheDefindMap.has([target.constructor.name, propertyKey].toString())) {
                // 获取表名和表版本号
                const [tableName, tableVersion] = getTableAndVersion("select", newSql);
                // 构建缓存键
                const cacheKey = JSON.stringify([tableName, tableVersion, newSql, sqlValues]);
                if (cacheBean.get(cacheKey)) {
                    // 如果有结果则返回
                    rows = cacheBean.get(cacheKey);
                } else {
                    // 查询结果
                    [rows] = await pool.query(newSql, sqlValues);
                    log("cache miss, and select result for " + rows);
                    const ttl = cacheDefindMap.get([target.constructor.name, propertyKey].toString());
                    // 存入缓存
                    cacheBean.set(cacheKey, rows, ttl);
                }
            } else {
                [rows] = await pool.query(newSql, sqlValues);
            }

            if (rows === null || Object.keys(rows).length === 0) {
                return;
            }
            const records = [];
            // 取得@ResultType装饰器记录的数据类型
            const resultType = resultTypeMap.get([target.constructor.name, propertyKey].toString());
            if(!resultType){
                return rows;
            }
            // 遍历查询结果记录，每行记录都创建一个数据类来装载
            for (const rowIndex in rows) {
                const entity = Object.create(resultType);
                Object.getOwnPropertyNames(resultType).forEach(function (propertyRow) {
                    // 匹配数据类的属性和字段名，对应赋值
                    if (rows[rowIndex].hasOwnProperty(propertyRow)) {
                        Object.defineProperty(
                            entity,
                            propertyRow,
                            Object.getOwnPropertyDescriptor(rows[rowIndex], propertyRow),
                        );
                    }
                });
                // 组成数据类数组
                records.push(entity);
            }
            return records;
        };
    }
}

function ResultType(dataClass) {
    return function (target, propertyKey: string) {
        resultTypeMap.set([target.constructor.name, propertyKey].toString(), new dataClass());
        //never return
    };
}

function Param(name: string) {
    return function (target: any, propertyKey: string | symbol, parameterIndex: number) {
        const existingParameters: [string, number][] = Reflect.getOwnMetadata(paramMetadataKey, target, propertyKey) || [];
        existingParameters.push([name, parameterIndex]);
        Reflect.defineMetadata(paramMetadataKey, existingParameters, target, propertyKey);
    };
}

async function queryForExecute(sql: string, args: any[], target, propertyKey: string,): Promise<ResultSetHeader> {
    let sqlValues = [];
    let newSql = sql;
    if (args.length > 0) {
        [newSql, sqlValues] = convertSQLParams(args, target, propertyKey, newSql);
    }
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
        const existingParameters: [string, number][] = Reflect.getOwnMetadata(paramMetadataKey, target, propertyKey);
        argsVal = new Map(
            existingParameters.map(([argName, argIdx]) => [argName, args[argIdx]]),
        );
    }
    const regExp = /#{(\w+)}/;
    let match;
    while (match = regExp.exec(decoratorSQL)) {
        const [replaceTag, matchName] = match;
        decoratorSQL = decoratorSQL.replace(new RegExp(replaceTag, 'g'), '?');
        queryValues.push(argsVal.get(matchName));
    }
    return [decoratorSQL, queryValues];
}

function cache(ttl: number) {
    return function (target: any, propertyKey: string) {
        // 收集需要缓存的查询方法和缓存过期时间
        cacheDefindMap.set([target.constructor.name, propertyKey].toString(), ttl);
        if (cacheBean == null) {
            const cacheFactory = BeanFactory.getBean(CacheFactory);
            if (cacheFactory || cacheFactory["factory"]) {
                cacheBean = cacheFactory["factory"];
            }
        }
        log(cacheDefindMap);
    }
}

function getTableAndVersion(name: string, sql: string): [string, number] {
    const regExpMap = {
        insert: /insert\sinto\s+([\w`\'\"]+)/i,
        update: /update\s+([\w`\'\"]+)/i,
        delete: /delete\sfrom\s+([\w`\'\"]+)/i,
        select: /\s+from\s+([\w`\'\"]+)/i
    }
    const macths = sql.match(regExpMap[name]);
    if (macths && macths.length > 1) {
        const tableName = macths[1].replace(/[`\'\"]/g, "");
        const tableVersion = tableVersionMap.get(tableName) || 1;
        tableVersionMap.set(tableName, tableVersion);
        log(tableVersionMap);
        return [tableName, tableVersion];
    }else{
        throw new Error("can not find table name");
    }
}

export { Insert, Update, Delete, Select, Param, ResultType, cache };