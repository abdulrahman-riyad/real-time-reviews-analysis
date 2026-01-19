import dotenv from 'dotenv';
dotenv.config();

export const EMAIL_QUEUE= "email.queue";
export const REVIEW_QUEUE= "review.queue";
export const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";