export const CORS_ORIGIN = process.env.CORS_ORIGIN;
export const PORT = process.env.PORT;
export const MONGODB_URI = process.env.MONGODB_URI;

export const JWT_TOKENS = {
    ACCESS: {
        EXPIRY: process.env.ACCESS_TOKEN_EXPIRY,
        SECRET: process.env.ACCESS_TOKEN_SECRET
    },
    REFRESH: {
        EXPIRY: process.env.REFRESH_TOKEN_EXPIRY,
        SECRET: process.env.REFRESH_TOKEN_SECRET
    }
};

export const AUTH_OTP_EXPIRY = process.env.AUTH_OTP_EXPIRY;

export const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

export const BUSINESS_EMAIL = {
    ADRESS: process.env.BUSINESS_EMAIL,
    PASSWORD: process.env.BUSINESS_EMAIL_PASSWORD
};