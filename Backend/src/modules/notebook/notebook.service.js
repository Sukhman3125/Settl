import { ApiError } from "../../utils/ApiError.js";
import { Notebook } from "./notebook.model.js";

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

const leave = async (user_id, notebook_id) => {
    const notebook = await Notebook.findById(notebook_id)
        .select("participants");
    if (!notebook)
        throw new ApiError(404, "Notebook not found");
    
    const isParticipant = notebook.participants.some(
        participant => participant.equals(user_id)
    );
    if(!isParticipant)
        throw new ApiError(403, "You don't have access to this notebook");
    
    if(notebook.participants.length === 1){
        await Notebook.findByIdAndDelete(notebook_id);
        return;
    }

    await Notebook.findByIdAndUpdate(
        notebook_id,
        {
            $pull:{
                participants: user_id
            }
        }
    );
};

export {
    create,
    leave
};