import { body } from "express-validator";

const email = () =>
    body("email")
        .isString().withMessage("Email must be a string").bail()
        .trim()
        .notEmpty().withMessage("Email is required").bail()
        .isEmail().withMessage("Please provide a valid email")
        .normalizeEmail();

export const signup = [
    body("username")
        .isString().withMessage("Username must be a string").bail()
        .trim()
        .notEmpty().withMessage("Username is required").bail()
        .isLength({ min: 3, max: 20 }).withMessage("Username must be between 3 and 20 characters")
        .matches(/^[a-zA-Z0-9_-]+$/).withMessage("Username can only contain letters, numbers, underscores and hyphens"),

    email(),

    body("password")
        .isString().withMessage("Password must be a string").bail()
        .notEmpty().withMessage("Password is required").bail()
        .isLength({ min: 8, max: 72 }).withMessage("Password must be between 8 and 72 characters")
        .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
        .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
        .matches(/[0-9]/).withMessage("Password must contain at least one number")
        .matches(/[!@#$%^&*(),.?":{}|<>_\-+=/\\[\];'`~]/).withMessage("Password must contain at least one special character"),
];

export const verifyOtp = [
    email(),

    body("otp")
        .isString().withMessage("OTP must be a string").bail()
        .trim()
        .matches(/^\d{6}$/).withMessage("OTP must be exactly 6 digits"),
];

export const login = [
    body("emailOrUsername")
        .isString().withMessage("Email or Username must be a string").bail()
        .trim()
        .notEmpty().withMessage("Email or Username is required"),

    body("password")
        .isString().withMessage("Password must be a string").bail()
        .notEmpty().withMessage("Password is required"),
];

export const googleLogin = [
    body("idToken")
        .isString().withMessage("Google ID token must be a string").bail()
        .notEmpty().withMessage("Google ID token is required"),
];