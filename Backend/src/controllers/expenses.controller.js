import { asyncHandler } from "../Utils/asyncHandler.js";
import { minimiseExpenses } from "../Utils/expenseMinimiser.js";
import { ApiResponse } from "../Utils/ApiResponse.js";

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