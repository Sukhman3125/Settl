import mongoose, { Schema } from "mongoose";

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
    },
    {
        timestamps: true,
    }
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
        transactions: [transactionSchema]
    },
    {
        timestamps: true
    }
);

notebookSchema.index({ participants: 1 });

export const Notebook = mongoose.model("Notebook", notebookSchema);