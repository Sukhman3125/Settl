import { native } from "../../cpp.js";
import * as constants from "../../config/constants.js";

export function minimiseExpenses(transactions) {
    const paidBy = [], liableTo = [], amount = [];
    for (const transaction of transactions) {
        const payer = String(transaction.paidBy);
        const share = transaction.amount / transaction.participants.length;

        for (const participant of transaction.participants) {
            const participantId = String(participant);

            if (participantId !== payer) {
                paidBy.push(payer);
                liableTo.push(participantId);
                amount.push(share);
            }
        }
    }

    const rawCppTransactions = native.calculateMinimisedExpenses(
        paidBy, liableTo, amount,
        constants.PIVOT_FOR_LARGER_INPUTS
    );

    const result = Object.create(null);

    for (let i = 0; i < rawCppTransactions.length; i += 3) {
        const debtor = rawCppTransactions[i];
        const creditor = rawCppTransactions[i + 1];
        const expense = Number(rawCppTransactions[i + 2]);

        if (!result[debtor]) {
            result[debtor] = [];
        }

        result[debtor].push({
            user: creditor,
            amount: expense
        });
    }

    return result;
}