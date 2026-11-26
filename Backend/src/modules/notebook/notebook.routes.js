import { Router } from "express";
import * as notebookController from "./notebook.controller.js";
import rateLimiter from "../../middlewares/rateLimiter.middleware.js";
import * as rates from "../../config/rates.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { verifyJWT } from "../auth/auth.middleware.js";
import * as validators from "./notebook.validator.js";

const router = Router();

router.post(
    "/create", 
    rateLimiter(rates.STRICT_RATE),
    verifyJWT,
    validators.create,
    validate,
    notebookController.create
);

router.post(
    "/leave",
    rateLimiter(rates.STRICT_RATE),
    verifyJWT,
    validators.leave,
    validate,
    notebookController.leave
)

router.get(
    "/my-notebooks",
    rateLimiter(rates.DEFAULT_RATE),
    verifyJWT,
    validators.my_notebooks,
    validate,
    notebookController.my_notebooks
);

export default router;