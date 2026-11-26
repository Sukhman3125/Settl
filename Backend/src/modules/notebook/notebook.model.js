import mongoose, { Schema } from "mongoose";
import * as constants from "../../config/constants.js";

const transactionSchema = new Schema(
    {
        paidBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        participants: [{
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        }],

        amount: {
            type: Number,
            required: true,
            min: 0.01,
        },

        description: {
            type: String,
            trim: true,
            maxlength: constants.DESC_MAX_LEN,
            default: ""
        }
    },
    {
        timestamps: true,
    }
);

const settlementSchema = new Schema(
    {
        to: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        amount: {
            type: Number,
            required: true
        }
    },
    { _id: false }
);


const notebookSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            validate: {
                validator: function (value) {
                    return /^[a-zA-Z0-9 ]+$/.test(value);
                },
                message: "Notebook can only contain letters, numbers, and spaces",
            },
        },
        participants: [{
            type: Schema.Types.ObjectId,
            ref: "User"
        }],
        transactions: [transactionSchema],
        settlements: {
            type: Map,
            of: [settlementSchema],
            default: () => new Map()
        }
    },
    {
        timestamps: true
    }
);

notebookSchema.index({ participants: 1 });

export const Notebook = mongoose.model("Notebook", notebookSchema);