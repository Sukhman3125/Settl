import { body } from "express-validator";

export const createNotebook = [
    body("notebookName")
        .isString().withMessage("Notebook name must be a string").bail()
        .trim().notEmpty()
        .withMessage("Notebook name is required").bail()
        .isLength({ min: 3, max: 20 })
        .withMessage("Notebook name must be between 3 and 20 characters").bail()
        .matches(/^[a-zA-Z0-9]+$/).withMessage("Notebook name can only contain letters and numbers")
];