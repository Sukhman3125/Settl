import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { CORS_ORIGIN } from "./config/config.js";
import expensesRoutes from "./routes/expenses.routes.js";
import authRoutes from "./routes/auth.routes.js";
import notebookRoutes from "./routes/notebook.routes.js";

const app = express();
app.use(cors({
    origin: CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/expenses", expensesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/notebook", notebookRoutes);

export { app };