import createChannel from "../rabbitmq/channel.js";
import { EMAIL_QUEUE } from "../config/rabbitmq.js";
import { EMAIL_TEMPLATE_NAME } from "../config/email.config.js";

export default async function emailProducer(job) {
    try {
        const {
            to,
            subject,
            templateData
        } = job;
        const channel = await createChannel();
        const emailPayload = {
            to,
            subject,
            templateName: EMAIL_TEMPLATE_NAME,
            templateData
        };
        await channel.sendToQueue(
            EMAIL_QUEUE,
            Buffer.from(JSON.stringify(emailPayload)),
            { persistent: true }
        );
    } catch (err) {
        console.error(`Error happened in email producer: ${err}`);
    }
}
