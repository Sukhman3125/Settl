import { Router } from "express";
import * as notebookController from "./notebook.controller.js";
import rateLimiter from "../../middlewares/rateLimiter.middleware.js";
import * as rates from "../../config/rates.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { verifyJWT } from "../auth/auth.middleware.js";
import * as validators from "./notebook.validator.js";
import { verifyParticipation } from "./notebook.middleware.js";

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
    verifyParticipation("_id participants"),
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

router.post(
    "/add-transaction",
    rateLimiter(rates.LENIENT_RATE),
    verifyJWT,
    validators.add_transaction,
    validate,
    verifyParticipation("_id participants transactions"),
    notebookController.add_transaction
);

router.post(
    "/remove-transaction",
    rateLimiter(rates.LENIENT_RATE),
    verifyJWT,
    validators.remove_transaction,
    validate,
    verifyParticipation("_id participants transactions"),
    notebookController.remove_transaction
);

export default router;