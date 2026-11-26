import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import * as notebookService from "./notebook.service.js";

const create = asyncHandler(async (req, res) => {
    const user_id = req.user._id;
    const { notebookName } = req.body;
    const notebook = await notebookService.create(user_id, notebookName);
    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                notebook,
                "Notebook created successfully"
            )
        );
});

const leave = asyncHandler(async (req, res) => {
    const user_id = req.user._id;
    const { notebook_id } = req.body;
    await notebookService.leave(user_id, notebook_id);
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                "Successfully left the notebook"
            )
        );
});

export {
    create,
    leave
}