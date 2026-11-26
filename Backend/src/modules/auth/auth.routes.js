import { Router } from "express";
import * as authController from "./auth.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import * as validators from "./auth.validator.js";
import { verifyJWT } from "./auth.middleware.js";
import rateLimiter from "../../middlewares/rateLimiter.middleware.js";
import * as rates from "../../config/rates.js";

const router = Router();

router.post(
    "/signup",
    rateLimiter(rates.STRICT_RATE),
    validators.signup,
    validate,
    authController.signup
);

router.post(
    "/verifyOtp",
    rateLimiter(rates.STRICT_RATE),
    validators.verifyOtp,
    validate,
    authController.verifyOtp
);

router.post(
    "/login",
    rateLimiter(rates.LENIENT_RATE),
    validators.login,
    validate,
    authController.login
);

router.post(
    "/logout",
    verifyJWT,
    rateLimiter(rates.LENIENT_RATE),
    authController.logout
);

router.post(
    "/refresh-token",
    rateLimiter(rates.STRICT_RATE),
    authController.refreshAccessToken
);

router.get(
    "/me",
    verifyJWT,
    rateLimiter(rates.STRICT_RATE),
    authController.getCurrentUser
);

router.post(
    "/google",
    rateLimiter(rates.STRICT_RATE),
    validators.googleLogin,
    validate,
    authController.googleLogin
);

export default router;