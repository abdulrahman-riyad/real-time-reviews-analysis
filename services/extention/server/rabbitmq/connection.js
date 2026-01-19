import amqp from 'amqplib';
import { RABBITMQ_URL } from '../config/rabbitmq.js';

let connection;

export const getRabbitMQConnection = async () => {
    if (connection) {
        return connection;
    }
    connection = await amqp.connect(RABBITMQ_URL);
    return connection;
};

export const closeRabbitMQConnection = async () => {
    if (connection) {
        await connection.close();
        connection = null;
    }
};