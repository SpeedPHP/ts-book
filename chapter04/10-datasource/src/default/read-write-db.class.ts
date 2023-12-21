import { createConnection, createPool } from "mysql2";
import DataSourceFactory from "../factory/data-source-factory.class";
import { bean, config } from "../speed";

export default class ReadWriteDb extends DataSourceFactory {
    private readonly readSession;
    private readonly writeSession;

    // 提供数据源对象
    @bean
    public getDataSource(): DataSourceFactory {
        if (!config("mysql")) {
            return null;
        }
        return new ReadWriteDb();
    }

    constructor() {
        super();
        const dbConfig = config("mysql");
        // 处理多库配置
        if (dbConfig["master"] && dbConfig["slave"]) {
            this.writeSession = this.getConnectionByConfig(dbConfig["master"]);
            if (Array.isArray(dbConfig["slave"])) {
                // 一主多从配置
                this.readSession = dbConfig["slave"].map(config => this.getConnectionByConfig(config));
            } else {
                // 一主一从配置
                this.readSession = [this.getConnectionByConfig(dbConfig["slave"])];
            }
        } else {
            // 单数据源配置
            this.writeSession = this.getConnectionByConfig(dbConfig);
            this.readSession = [this.writeSession];
        }
    }

    private getConnectionByConfig(config: object) {
        if (config["PoolOptions"] !== undefined) {
            // 配置连接池
            if (Object.keys(config["PoolOptions"]).length !== 0) {
                config = Object.assign(config, config["PoolOptions"]);
            }
            return createPool(config).promise();
        } else {
            // 仅使用连接
            return createConnection(config).promise();
        }
    }

    // 获取读连接
    public readConnection() {
        return this.readSession[Math.floor(Math.random() * this.readSession.length)];
    }

    // 获取写连接
    public writeConnection() {
        return this.writeSession;
    }
}