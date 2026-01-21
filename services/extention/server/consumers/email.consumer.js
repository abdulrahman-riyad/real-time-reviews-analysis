import ejs from 'ejs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

import { EMAIL_CONFIG } from '../config/email.config.js';
import { EMAIL_QUEUE } from '../config/rabbitmq.js';
import createChannel from '../rabbitmq/channel.js';

const transporter = nodemailer.createTransport({
    host: EMAIL_CONFIG.host,
    port: EMAIL_CONFIG.port,
    secure: false,
    auth: {
        user: EMAIL_CONFIG.user,
        pass: EMAIL_CONFIG.pass
    }
});

async function sendEmail(to, subject, templateName, templateData) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.ejs`);
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    const htmlContent = ejs.render(templateContent, templateData);
    const mailOptions = {
        from: EMAIL_CONFIG.user,
        to: to,
        subject: subject,
        html: htmlContent
    };
    await transporter.sendMail(mailOptions);
}

async function emailConsumer() {
    const channel = await createChannel();

    console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', EMAIL_QUEUE);

    channel.consume(EMAIL_QUEUE, async (msg) => {
        if (msg !== null) {
            console.log(" [x] Received email request");
            const emailPayload = JSON.parse(msg.content.toString());
            const { to, subject, templateName, templateData } = emailPayload;
            try {
                await sendEmail(to, subject, templateName, templateData);
                console.log(` [🗸] Processed email for ${to}`);
                channel.ack(msg);
            } catch (error) {
                console.error('Error sending email:', error);
            }
        }
    }, {
        noAck: false
    });
}

emailConsumer();