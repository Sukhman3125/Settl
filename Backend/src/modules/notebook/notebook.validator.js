import { body } from "express-validator";
import * as constants from "../../config/constants.js"

const notebook_id = () => body("notebook_id")
    .isMongoId()
    .withMessage("Invalid notebook id");

const user = (prop_name) =>
    body(prop_name)
        .isString().withMessage(`${prop_name} must be a string`).bail()
        .trim()
        .notEmpty().withMessage(`${prop_name} is required`).bail()
        .isLength({ min: 3, max: 20 }).withMessage(`${prop_name} must be between 3 and 20 characters`)
        .matches(/^[a-zA-Z0-9_-]+$/).withMessage(`${prop_name} can only contain letters, numbers, underscores and hyphens`);

export const create = [
    body("notebookName")
        .isString().withMessage("Notebook name must be a string").bail()
        .trim().notEmpty()
        .withMessage("Notebook name is required").bail()
        .isLength({ min: 3, max: 20 })
        .withMessage("Notebook name must be between 3 and 20 characters").bail()
        .matches(/^[a-zA-Z0-9]+$/).withMessage("Notebook name can only contain letters and numbers")
];

export const leave = [
    notebook_id()
];

export const my_notebooks = [
    body("page")
        .optional()
        .isInt({ min: 1 }).withMessage("Page must be a positive integer")
        .toInt()
];

export const add_transaction = [
    notebook_id(),
    user("paidBy"),

    body("participants")
        .isArray({ min: 1 })
        .withMessage("Participants must be a non-empty array")
        .bail()
        .custom((participants, { req }) => {
            const normalized = participants.map(p =>
                typeof p === "string" ? p.trim() : p
            );

            req.body.participants = normalized;

            if (new Set(normalized).size !== normalized.length)
                throw new Error("Participants cannot contain duplicates");

            return true;
        }),

    user("participants.*"),

    body("amount")
        .isFloat({ gt: 0 })
        .withMessage("Amount must be a positive number")
        .toFloat(),

    body("description")
        .optional()
        .isString()
        .withMessage("Description must be a string")
        .bail()
        .trim()
        .isLength({ max: constants.DESC_MAX_LEN })
        .withMessage(`Description cannot exceed ${constants.DESC_MAX_LEN} characters`)
];