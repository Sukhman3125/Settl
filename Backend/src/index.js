import { minimiseExpenses } from "./Utils/expenseMinimiser.js";

const transactions = [
    {
        paidBy: "mirat",
        participants: ["abhishek", "sukhman"],
        amount: 60
    },
    {
        paidBy: "abhishek",
        participants: ["kush"],
        amount: 100
    },
    {
        paidBy: "kush",
        participants: ["sukhman"],
        amount: 60
    },
    {
        paidBy: "sukhman",
        participants: ["avinash"],
        amount: 200
    },
    {
        paidBy: "avinash",
        participants: ["mirat"],
        amount: 167
    },
    {
        paidBy: "avinash",
        participants: ["abhishek", "sukhman", "avinash", "mirat", "kush"],
        amount: 400
    }
];
console.log(minimiseExpenses(transactions));