import { getRabbitMQConnection } from "./connection.js";
import {
    EMAIL_QUEUE,
    REVIEW_QUEUE
} from '../config/rabbitmq.js';

let channel;

export default async function createChannel() {
    if (channel) {
        return channel;
    }
    const connection = await getRabbitMQConnection();
    channel = await connection.createChannel();
    await channel.assertQueue(EMAIL_QUEUE, { durable: true });
    await channel.assertQueue(REVIEW_QUEUE, { durable: true });
    return channel;
}

