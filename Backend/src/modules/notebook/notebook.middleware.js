import { ApiError } from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { Notebook } from "./notebook.model.js";

export const verifyParticipation = (select = "_id") =>
    asyncHandler(async (req, res, next) => {
        const user_id = req.user?._id;
        if (!user_id)
            throw new ApiError(401, "Unauthorized request");
        const notebook_id = req.body?.notebook_id;
        if (!notebook_id)
            throw new ApiError(400, "Please provide the notebook_id");

        const notebook = await Notebook.findOne({
            _id: notebook_id,
            participants: user_id
        }).select(select);

        if (!notebook)
            throw new ApiError(403, "You don't have access to this notebook");

        req.notebook = notebook;

        next();
    });