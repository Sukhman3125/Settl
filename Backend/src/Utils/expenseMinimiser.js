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
minimiseExpenses(transactions);
function minimiseExpenses(transactions) {
    const { lenders, borrowers } = calculateDebts(transactions);

    console.log("Lenders:", lenders);
    console.log("Borrowers:", borrowers);
}

function calculateDebts(transactions) {
    let netBalance = {};
    transactions.forEach((obj) => {
        netBalance[obj.paidBy] = (netBalance[obj.paidBy] || 0) + obj.amount;
        for (let participant of obj.participants) {
            netBalance[participant] = (netBalance[participant] || 0) - obj.amount / obj.participants.length;
        }
    });
    let lenders = [], borrowers = [];
    Object.entries(netBalance).forEach(([key, value]) => {
        if (value > 0) {
            lenders.push({name: key, amount: value});
        } else if (value < 0) {
            borrowers.push({name: key, amount: -value});
        }
    });
    lenders.sort((a, b) => b.amount - a.amount);
    borrowers.sort((a, b) => b.amount - a.amount);

    return { lenders, borrowers };
}