import { bean } from "../core.decorator";
import { Redis as IoRedis, RedisKey} from "ioredis";
import { config } from "../typespeed";

// 收集Redis订阅事件
const redisSubscribers = {};

class Redis extends IoRedis {
    // 分别创建发布对象和订阅对象
    private static pubObj: Redis = null;
    private static subObj: Redis = null;

    // 提供Redis对象，这里是发布对象
    @bean
    public getRedis(): Redis {
        return Redis.getInstanceOfRedis("pub");
    }

    // 获取排行榜数据，按分数从高到低
    public async zrevranking(key: RedisKey, start: number | string, stop: number | string): Promise<Map<string, number>> {
        // 用zrevrange()获得数据
        const list = await this.zrevrange(key, start, stop, "WITHSCORES");
        // 转换数据格式，方便开发者直接使用
        const map = new Map<string, number>();
        for (let i = 0; i < list.length; i = i + 2) {
            map.set(list[i], Number(list[i + 1]));
        }
        return map;
    }

    // 获取排行榜数据，按分数从低到高
    public async zranking(key: RedisKey, start: number | string, stop: number | string): Promise<Map<string, number>> {
        // zrange()获得数据
        const list = await this.zrange(key, start, stop, "WITHSCORES");
        // 转换数据格式，方便开发者直接使用
        const map = new Map<string, number>();
        for (let i = 0; i < list.length; i = i + 2) {
            map.set(list[i], Number(list[i + 1]));
        }
        return map;
    }

    // 获取实例化Redis对象，此处为单例模式
    static getInstanceOfRedis(mode: "sub" | "pub") {
        // 检查Redis配置，避免没有配置Redis时报错
        if (!config("redis")) {
            return null;
        }
        // 跟进参数分别创建发布对象和订阅对象
        if (mode === "sub") {
            this.pubObj = this.pubObj || new Redis(config("redis"));
            return this.pubObj;
        } else {
            this.subObj = this.subObj || new Redis(config("redis"));
            return this.subObj;
        }
    }
}

// 订阅装饰器
function redisSubscriber(channel: string) {
    // 检查Redis配置，避免没有配置Redis时报错
    if (!config("redis")) return function(){
        throw new Error("redis not configured");
    };
    // 开启订阅
    Redis.getInstanceOfRedis("sub").subscribe(channel, function (err, count) {
        if (err) {
            console.error(err);
        }
    });
    // 收集订阅事件
    return function (target: any, propertyKey: string) {
        redisSubscribers[channel] = target[propertyKey];
    };
}

// 检查Redis配置，避免没有配置Redis时报错
if (config("redis")) {
    Redis.getInstanceOfRedis("sub").on("message", function (channel, message) {
        redisSubscribers[channel](message);
    });
}

// 进程退出时关闭Redis连接
process.once('SIGINT', () => { 
    Redis.getInstanceOfRedis("sub") || Redis.getInstanceOfRedis("sub").disconnect();
    Redis.getInstanceOfRedis("pub") || Redis.getInstanceOfRedis("pub").disconnect();
});

export { Redis, redisSubscriber };