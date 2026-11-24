import nodemailer from "nodemailer";
import * as config from "../config/config.js";
import { APP_NAME } from "../config/constants.js";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: config.BUSINESS_EMAIL.ADRESS,
        pass: config.BUSINESS_EMAIL.PASSWORD,
    },
});

export default async function sendMail(to, subject, body) {
    return transporter.sendMail({
        from: `"${APP_NAME}" <${config.BUSINESS_EMAIL.ADRESS}>`,
        to,
        subject,
        html: body,
    });
}