import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import * as notebookService from "./notebook.service.js";

const createNotebook = asyncHandler(async (req, res) => {
    const user_id = req.user._id;
    const { notebookName } = req.body;
    const notebook = await notebookService.createNotebook(user_id, notebookName);
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

export {
    createNotebook
}