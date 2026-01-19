import dotenv from 'dotenv';
dotenv.config({
    path: "../.env"
});

export const EMAIL_CONFIG = {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
}

export const EMAIL_TEMPLATE_NAME = 'email_template';