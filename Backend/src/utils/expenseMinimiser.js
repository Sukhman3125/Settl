import { native } from "../cpp.js";
import * as constants from "../config/constants.js";

export function minimiseExpenses(transactions) {
    let paidBy = [], liableTo = [], amount = [];
    for (let i = 0; i < transactions.length; i++) {
        transactions[i].participants.forEach((participant) => {
            if (participant !== transactions[i].paidBy) {
                paidBy.push(transactions[i].paidBy);
                liableTo.push(participant);
                amount.push(transactions[i].amount / transactions[i].participants.length);
            }
        });
    }
    const rawCppTransactions = native.calculateMinimisedExpenses(paidBy, liableTo, amount, constants.PIVOT_FOR_LARGER_INPUTS);
    let result = {};
    for(let i = 0; i < rawCppTransactions.length; i+=3) {
        if (!result[rawCppTransactions[i]]) {
            result[rawCppTransactions[i]] = [];
        }
        result[rawCppTransactions[i]].push([rawCppTransactions[i+1], parseFloat(rawCppTransactions[i+2])]);
    }
    return result;
}