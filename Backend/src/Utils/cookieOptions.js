import ms from "ms";
import * as config from "../config/config.js";

export const accessTokenOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: ms(config.JWT_TOKENS.ACCESS.EXPIRY), 
};

export const refreshTokenOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: ms(config.JWT_TOKENS.REFRESH.EXPIRY), 
};