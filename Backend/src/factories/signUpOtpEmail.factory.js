import { APP_NAME } from "../config/constants.js";

export default function signUpOtpEmail(otp, username) {
    return {
        subject: `Welcome to ${APP_NAME} — Verify your email`,
        body: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Verify your ${APP_NAME} account</title>
        </head>

        <body style="
            margin: 0;
            padding: 0;
            background-color: #f4f4f5;
            font-family: Arial, Helvetica, sans-serif;
            color: #18181b;
        ">
            <div style="
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                border: 1px solid #e4e4e7;
            ">

                <!-- Header -->
                <div style="
                    padding: 32px;
                    background-color: #18181b;
                    text-align: center;
                ">
                    <h1 style="
                        margin: 0;
                        color: #ffffff;
                        font-size: 30px;
                        letter-spacing: -1px;
                    ">
                        ${APP_NAME}
                    </h1>
                    <p style="
                        margin: 8px 0 0;
                        color: #a1a1aa;
                        font-size: 14px;
                    ">
                        Split fairly. Settle easily.
                    </p>
                </div>

                <!-- Content -->
                <div style="padding: 40px 32px;">

                    <h2 style="
                        margin: 0 0 16px;
                        font-size: 24px;
                    ">
                        Welcome aboard, ${username}! 👋
                    </h2>

                    <p style="
                        margin: 0 0 20px;
                        font-size: 16px;
                        line-height: 1.6;
                        color: #52525b;
                    ">
                        We're glad to have you on ${APP_NAME}!
                        Managing shared expenses and keeping track of
                        who owes whom shouldn't be complicated.
                    </p>

                    <p style="
                        margin: 0 0 12px;
                        font-size: 16px;
                        line-height: 1.6;
                        color: #52525b;
                    ">
                        You're just one step away from making expense
                        sharing simpler. Use the verification code below
                        to activate your account:
                    </p>

                    <!-- OTP -->
                    <div style="
                        margin: 28px 0;
                        padding: 24px;
                        background-color: #f4f4f5;
                        border-radius: 8px;
                        text-align: center;
                    ">
                        <span style="
                            font-size: 32px;
                            font-weight: bold;
                            letter-spacing: 8px;
                            color: #18181b;
                        ">
                            ${otp}
                        </span>
                    </div>

                    <p style="
                        margin: 0 0 12px;
                        font-size: 14px;
                        line-height: 1.6;
                        color: #71717a;
                        text-align: center;
                    ">
                        This verification code will expire soon.
                        For your security, never share it with anyone.
                    </p>

                    <hr style="
                        border: none;
                        border-top: 1px solid #e4e4e7;
                        margin: 32px 0;
                    ">

                    <p style="
                        margin: 0;
                        font-size: 14px;
                        line-height: 1.6;
                        color: #71717a;
                    ">
                        Didn't create a ${APP_NAME} account?
                        No worries, simply ignore this email.
                    </p>

                </div>

                <!-- Footer -->
                <div style="
                    padding: 24px 32px;
                    background-color: #fafafa;
                    text-align: center;
                ">
                    <p style="
                        margin: 0 0 8px;
                        font-size: 13px;
                        color: #71717a;
                    ">
                        Making shared expenses easier, one settlement at a time.
                    </p>
                    <p style="
                        margin: 0;
                        font-size: 12px;
                        color: #a1a1aa;
                    ">
                        © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
                    </p>
                </div>

            </div>
        </body>
        </html>
        `
    };
}
