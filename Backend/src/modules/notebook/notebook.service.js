import { ApiError } from "../../utils/ApiError.js";
import { Notebook } from "./notebook.model.js";
import * as constants from "../../config/constants.js";

const create = async (user_id, notebookName) => {
    const notebook = await Notebook.create({
        name: notebookName,
        participants: [user_id],
        transactions: []
    });

    if (!notebook)
        throw new ApiError(
            500,
            "Failed to create notebook"
        );

    return notebook;
};

const leave = async (user_id, notebook) => {
    if (notebook.participants.length === 1) {
        await Notebook.findByIdAndDelete(notebook._id);
        return;
    }

    await Notebook.findByIdAndUpdate(
        notebook._id,
        {
            $pull: {
                participants: user_id
            }
        }
    );
};

const my_notebooks = async (user_id, page) => {
    const limit = constants.NOTEBOOKS_IN_A_PAGE;
    const skip = (page - 1) * limit;

    const notebooks = await Notebook.find({
        participants: user_id
    })
        .select("name participants createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    return notebooks;
};

export {
    create,
    leave,
    my_notebooks
};