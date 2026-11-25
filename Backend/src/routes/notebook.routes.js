import { Router } from "express";
import * as notebookController from "../controllers/notebook.controller.js";
import rateLimiter from "../middlewares/rateLimiter.middleware.js";
import * as rates from "../config/rates.js";
import { validate } from "../middlewares/validate.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import * as validators from "../validators/notebook.validator.js";

const router = Router();

router.post(
    "/create", 
    rateLimiter(rates.STRICT_RATE),
    verifyJWT,
    validators.createNotebook,
    validate,
    notebookController.createNotebook
);

export default router;