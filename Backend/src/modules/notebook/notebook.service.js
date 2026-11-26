import { ApiError } from "../../utils/ApiError.js";
import { Notebook } from "./notebook.model.js";
import * as constants from "../../config/constants.js";
import { minimiseExpenses } from "../expenseMinimiser/expenseMinimiser.js";
import { User } from "../user/user.model.js";

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

const add_transaction = async ({ notebook, paidBy, participants, amount, description }) => {
    const usernames = [...new Set([paidBy, ...participants])];

    const users = await User.find({
        username: { $in: usernames }
    }).select("_id username");

    const userMap = new Map(
        users.map(user => [user.username, user._id])
    );

    if (users.length !== usernames.length) {
        throw new ApiError(400, "One or more users do not exist");
    }

    const notebookParticipantIds = new Set(
        notebook.participants.map(id => id.toString())
    );

    const allUserIds = usernames.map(
        username => userMap.get(username).toString()
    );

    const allAreParticipants = allUserIds.every(
        id => notebookParticipantIds.has(id)
    );

    if (!allAreParticipants) {
        throw new ApiError(400, "All transaction users must belong to the notebook");
    }

    const paidById = userMap.get(paidBy);
    const participantIds = participants.map(
        username => userMap.get(username)
    );

    notebook.transactions.push({
        paidBy: paidById,
        participants: participantIds,
        amount,
        description: description ?? ""
    });

    notebook.settlements = minimiseExpenses(notebook.transactions);

    await notebook.save();

    const notebookUsers = await User.find({
        _id: { $in: notebook.participants }
    }).select("_id username");

    const usernameMap = new Map(
        notebookUsers.map(user => [
            user._id.toString(),
            user.username
        ])
    );

    const settlements = Object.fromEntries(
        [...notebook.settlements.entries()].map(([debtorId, creditors]) => [
            usernameMap.get(debtorId),
            creditors.map(({ to, amount }) => ({
                to: usernameMap.get(to.toString()),
                amount
            }))
        ])
    );

    return settlements;
};

export {
    create,
    leave,
    my_notebooks,
    add_transaction
};