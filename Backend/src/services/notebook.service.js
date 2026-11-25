import { ApiError } from "../utils/ApiError.js";
import { Notebook } from "../models/notebook.model.js";

const createNotebook = async (user_id, notebookName) => {
    const notebook = await Notebook.create({
        name: notebookName,
        participants: [user_id],
        transactions: []
    });

    if(!notebook)
        throw new ApiError(
            500,
            "Failed to create notebook"
        );

    return notebook;
};

export {
    createNotebook
};