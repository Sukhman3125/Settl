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
    const notebook = req.notebook;
    await notebookService.leave(user_id, notebook);
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

const my_notebooks = asyncHandler(async (req, res) => {
    const user_id = req.user._id;
    const page = req.body?.page ?? 1;
    const notebooks = await notebookService.my_notebooks(user_id, page);
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                notebooks,
                "Successfully fetched the notebooks"
            )
        );
});

const add_transaction = asyncHandler(async (req, res) => {
    const addedBy = req.user._id;
    const notebook = req.notebook;
    const { paidBy, participants, amount, description } = req.body;

    const settlements = await notebookService.add_transaction(
        { addedBy, notebook, paidBy, participants, amount, description }
    );

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                settlements,
                "Successfully added the transaction"
            )
        );
});

export {
    create,
    leave,
    my_notebooks,
    add_transaction
}