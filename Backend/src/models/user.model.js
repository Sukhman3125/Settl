import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_TOKENS } from "../config/config.js";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: function () {
                return this.provider === "local";
            },
        },

        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },

        provider: {
            type: String,
            enum: ["local", "google"],
            default: "local",
        },

        refreshToken: {
            type: String,
            default: null,
        },
        friends: [
            {
                type: Schema.Types.ObjectId,
                ref: "User"
            }
        ]
    },
    {
        timestamps: true,
    }
);

userSchema.methods.isPasswordCorrect = async function (password) {
    if (!this.password) return false;

    return bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
        },
        JWT_TOKENS.ACCESS.SECRET,
        {
            expiresIn: JWT_TOKENS.ACCESS.EXPIRY,
        }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        JWT_TOKENS.REFRESH.SECRET,
        {
            expiresIn: JWT_TOKENS.REFRESH.EXPIRY,
        }
    );
};

export const User = mongoose.model("User", userSchema);