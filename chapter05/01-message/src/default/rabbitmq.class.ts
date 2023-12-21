import { bean, config } from "../core.decorator";
import { connect } from "amqplib";
let rabbitConnection = null;

class RabbitMQ {
    
    // 提供RabbitMQ对象
    @bean
    public getRabbitMQ(): RabbitMQ {
        if (!config("rabbitmq")) {
            return null;
        }
        return new RabbitMQ();
    }

    // 发布信息到交换机
    public async publishMessageToExchange(exchange: string, routingKey: string, message: string): Promise<void> {
        const channel = await getChannel();
        await channel.checkExchange(exchange);
        channel.publish(exchange, routingKey, Buffer.from(message));
        await channel.close();
    }

    // 发送消息到队列
    public async sendMessageToQueue(queue: string, message: string): Promise<void> {
        const channel = await getChannel();
        await channel.checkQueue(queue);
        channel.sendToQueue(queue, Buffer.from(message));
        await channel.close();
    }

    // publishMessageToExchange()方法别名
    public async publish(exchange: string, routingKey: string, message: string): Promise<void> {
        await this.publishMessageToExchange(exchange, routingKey, message);
    }

    // sendMessageToQueue()方法别名
    public async send(queue: string, message: string):  Promise<void> {
        await this.sendMessageToQueue(queue, message);
    }
}
// 获取通道函数，确保通道唯一，并且程序关闭时退出
async function getChannel() {
    if (rabbitConnection === null) {
        rabbitConnection = await connect(config("rabbitmq"));
        process.once('SIGINT', async () => { 
            await rabbitConnection.close();
        });
    }
    const channel = await rabbitConnection.createChannel();
    return channel;
}
// RabbitMQ监听队列装饰器
function rabbitListener(queue: string) {
    return (target: any, propertyKey: string) => {
        (async function () {
            // 创建通道
            const channel = await getChannel();
            // 检查队列是否存在
            await channel.checkQueue(queue);
            // 监听队列queue，收到消息则调用当前被装饰的方法
            await channel.consume(queue, target[propertyKey], { noAck: true });
        }());
    }
}

export { RabbitMQ, rabbitListener };