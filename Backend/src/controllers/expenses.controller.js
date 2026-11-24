import { asyncHandler } from "../utils/asyncHandler.js";
import { minimiseExpenses } from "../utils/expenseMinimiser.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const minimise = asyncHandler(async (req, res) => {
    const { transactions } = req.body;
    const result = minimiseExpenses(transactions);
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                result,
                "Successfully fetched the minimised transactions"
            )
        );
});