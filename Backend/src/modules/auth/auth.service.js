import { User } from "../user/user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { OAuth2Client } from "google-auth-library";
import { generateUniqueUsername } from "../../utils/generateUsername.js";
import jwt from "jsonwebtoken";
import { PendingUser } from "../user/pendingUser.model.js";
import generateOtp from "../../factories/otp.factory.js";
import sendMail from "../../utils/mailer.js";
import signUpOtpEmail from "../../factories/signUpOtpEmail.factory.js";
import * as config from "../../config/config.js";
import { MAX_OTP_ATTEMPTS } from "../../config/constants.js";

const googleClient = new OAuth2Client(config.GOOGLE_CLIENT_ID);

const googleLogin = async (idToken) => {
    if (!idToken) {
        throw new ApiError(400, "Google ID token is required");
    }

    const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: config.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
        throw new ApiError(401, "Invalid Google token");
    }

    const {
        sub,
        email,
        name,
        email_verified,
    } = payload;

    if (!email_verified) {
        throw new ApiError(401, "Google account email is not verified");
    }

    let user = await User.findOne({
        $or: [
            { googleId: sub },
            { email },
        ],
    });

    if (!user) {
        const username = await generateUniqueUsername(name, email);

        user = await User.create({
            username,
            email,
            provider: "google",
            googleId: sub,
        });
    } else if (!user.googleId) {
        user.googleId = sub;

        await user.save({
            validateBeforeSave: false,
        });
    }

    const { accessToken, refreshToken } =
        await generateAccessAndRefreshTokens(user);

    const loggedInUser = await User.findById(user._id)
        .select("-password -refreshToken");

    return {
        user: loggedInUser,
        accessToken,
        refreshToken,
    };
};

const generateAccessAndRefreshTokens = async (user) => {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({
        validateBeforeSave: false,
    });

    return {
        accessToken,
        refreshToken,
    };
};

const signup = async ({ username, email, password }) => {
    const existingUser = await User.findOne({
        $or: [
            { username },
            { email },
        ],
    });

    if (existingUser) {
        throw new ApiError(
            409,
            existingUser.email === email
                ? "Email already registered"
                : "Username already taken"
        );
    }

    // Replace any existing pending registration for this email
    // Allows multiple pending users to request the same username; first to verify claims it
    await PendingUser.deleteOne({ email });

    const otp = generateOtp();

    const pendingUser = await PendingUser.create({
        username,
        email,
        password,
        otp,
        attempts: 0,
        expiresAt: new Date(Date.now() + 1000 * config.AUTH_OTP_EXPIRY)
    });

    if (!pendingUser) {
        throw new ApiError(500, "Failed to sign up");
    }

    const { body, subject } = signUpOtpEmail(otp, username);

    try {
        await sendMail(email, subject, body);
    } catch (mailError) {
        await PendingUser.deleteOne({ _id: pendingUser._id });
        console.error("Failed to send signup OTP email:", mailError);
        throw new ApiError(500, "Failed to send verification email. Please try again later.");
    }

    return;
};

const verifyOtp = async ({ email, otp }) => {
    const pendingUser = await PendingUser.findOne({ email });

    if (!pendingUser) {
        throw new ApiError(404, "OTP expired or not found. Please sign up again.");
    }

    if (pendingUser.expiresAt < new Date()) {
        await PendingUser.deleteOne({ _id: pendingUser._id });
        throw new ApiError(400, "OTP has expired. Please sign up again.");
    }

    if (pendingUser.attempts >= MAX_OTP_ATTEMPTS) {
        await PendingUser.deleteOne({ _id: pendingUser._id });
        throw new ApiError(400, "Maximum OTP attempts exceeded. Please sign up again.");
    }

    const isOtpCorrect = await pendingUser.isOtpCorrect(otp);

    if (!isOtpCorrect) {
        const updated = await PendingUser.findByIdAndUpdate(
            pendingUser._id,
            { $inc: { attempts: 1 } },
            { new: true }
        );

        if (updated && updated.attempts >= MAX_OTP_ATTEMPTS) {
            await PendingUser.deleteOne({ _id: pendingUser._id });
            throw new ApiError(400, "Maximum OTP attempts exceeded. Please sign up again.");
        }

        const remaining = MAX_OTP_ATTEMPTS - (updated?.attempts ?? (pendingUser.attempts + 1));
        throw new ApiError(400, `Incorrect OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`);
    }

    const existingUser = await User.findOne({
        $or: [
            { username: pendingUser.username },
            { email: pendingUser.email },
        ],
    });

    if (existingUser) {
        await PendingUser.deleteOne({ _id: pendingUser._id });
        throw new ApiError(
            409,
            existingUser.email === pendingUser.email
                ? "Email already registered"
                : "Username already taken by another user"
        );
    }

    const user = new User({
        username: pendingUser.username,
        email: pendingUser.email,
        password: pendingUser.password,
    });

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;

    await user.save();

    await PendingUser.deleteMany({
        $or: [
            { _id: pendingUser._id },
            { username: pendingUser.username }
        ]
    });

    const createdUser = user.toObject();
    delete createdUser.password;
    delete createdUser.refreshToken;

    return {
        user: createdUser,
        accessToken,
        refreshToken,
    };
};

const login = async ({ emailOrUsername, password }) => {
    const user = await User.findOne({
        $or: [
            { email: emailOrUsername.toLowerCase() },
            { username: emailOrUsername.toLowerCase() }
        ]
    });

    if (!user) {
        throw new ApiError(401, "Invalid credentials");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } =
        await generateAccessAndRefreshTokens(user);

    const loggedInUser = await User.findById(user._id)
        .select("-password -refreshToken");

    return {
        user: loggedInUser,
        accessToken,
        refreshToken,
    };
};

const logout = async (userId) => {
    await User.findByIdAndUpdate(
        userId,
        {
            $unset: {
                refreshToken: 1,
            },
        },
        {
            new: true,
        }
    );
};

const refreshAccessToken = async (incomingRefreshToken) => {

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {

        const decodedToken = jwt.verify(
            incomingRefreshToken,
            config.JWT_TOKENS.REFRESH.SECRET
        );

        const user = await User.findById(decodedToken._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Refresh token expired or used");
        }

        const { accessToken, refreshToken } =
            await generateAccessAndRefreshTokens(user);

        return {
            accessToken,
            refreshToken,
        };

    } catch (error) {
        throw new ApiError(401, "Invalid refresh token");
    }
};

const getCurrentUser = async (user) => {
    return user;
};

export {
    signup,
    verifyOtp,
    login,
    logout,
    refreshAccessToken,
    getCurrentUser,
    googleLogin
};