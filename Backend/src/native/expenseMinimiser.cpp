#include "expenseMinimiser.h"
#include <string>
#include <vector>
#include <tuple>
#include <unordered_map>
#include <set>
#include <algorithm>
#include <functional>
#include <climits>
#include <cmath>
using namespace std;

using t = tuple<string, string, double>;
double E = 1e-3;

#pragma region declarations

unordered_map<string, double> calculateNetBalance(
    const vector<string> &paidBy,
    const vector<string> &liableTo,
    const vector<double> &amount);

vector<t> settleDebts(
    vector<pair<string, double>> &creditors,
    vector<pair<string, double>> &debtors,
    int pivotForLargerInputs);

vector<t> greedySettleDebts(
    vector<pair<string, double>> &creditors,
    vector<pair<string, double>> &debtors);

vector<t> backtrackSettleDebts(
    vector<pair<string, double>> &creditors,
    vector<pair<string, double>> &debtors);
#pragma endregion

vector<string> calculateMinimisedExpenses(
    vector<string> paidBy,
    vector<string> liableTo,
    vector<double> amount,
    int pivotForLargerInputs)
{
    unordered_map<string, double> netBalance = calculateNetBalance(paidBy, liableTo, amount);

    vector<pair<string, double>> creditors;
    vector<pair<string, double>> debtors;
    for (auto it : netBalance)
    {
        const string &name = it.first;
        double balance = it.second;
        if (balance > 0)
        {
            creditors.push_back({name, balance});
        }
        else if (balance < 0)
        {
            debtors.push_back({name, -balance});
        }
    }

    auto transactions = settleDebts(creditors, debtors, pivotForLargerInputs);
    vector<string> result;
    for (auto it : transactions)
    {
        result.push_back(get<0>(it));
        result.push_back(get<1>(it));
        result.push_back(to_string(get<2>(it)));
    }
    return result;
}

unordered_map<string, double> calculateNetBalance(
    const vector<string> &paidBy,
    const vector<string> &liableTo,
    const vector<double> &amount)
{
    int n = paidBy.size();
    unordered_map<string, double> netBalance;
    for (int i = 0; i < n; i++)
    {
        netBalance[paidBy[i]] += amount[i];
        netBalance[liableTo[i]] -= amount[i];
    }
    return netBalance;
}

vector<t> settleDebts(
    vector<pair<string, double>> &creditors,
    vector<pair<string, double>> &debtors,
    int pivotForLargerInputs)
{
    sort(creditors.begin(), creditors.end(), [](const pair<string, double> &a, const pair<string, double> &b)
         { return a.second > b.second; });
    sort(debtors.begin(), debtors.end(), [](const pair<string, double> &a, const pair<string, double> &b)
         { return a.second > b.second; });
    if (creditors.size() + debtors.size() <= pivotForLargerInputs)
    {
        return backtrackSettleDebts(creditors, debtors);
    }
    else
    {
        return greedySettleDebts(creditors, debtors);
    }
}

vector<t> greedySettleDebts(
    vector<pair<string, double>> &creditors,
    vector<pair<string, double>> &debtors)
{
    int i = 0, j = 0;
    vector<t> transactions;
    while (i < creditors.size() && j < debtors.size())
    {
        double amount = min(creditors[i].second, debtors[j].second);
        creditors[i].second -= amount;
        debtors[j].second -= amount;

        transactions.push_back({debtors[j].first, creditors[i].first, amount});

        if (creditors[i].second < E)
        {
            i++;
        }
        if (debtors[j].second < E)
        {
            j++;
        }
    }
    return transactions;
}

vector<t> backtrackSettleDebts(
    vector<pair<string, double>> &creditors,
    vector<pair<string, double>> &debtors)
{
    vector<pair<string, double>> people; // +ve = is owed, -ve = owes

    for (auto &it : creditors)
        if (fabs(it.second) > E)
            people.push_back({it.first, it.second});
    for (auto &it : debtors)
        if (fabs(it.second) > E)
            people.push_back({it.first, -it.second});

    vector<t> result;
    int n = (int)people.size();

    // Step 1: cancel exact opposite pairs (always optimal)
    vector<bool> used(n, false);
    for (int i = 0; i < n; i++)
    {
        if (used[i])
            continue;
        for (int j = i + 1; j < n; j++)
        {
            if (used[j])
                continue;
            if (fabs(people[i].second + people[j].second) < E)
            {
                double amt = fabs(people[i].second);
                if (people[i].second < 0)
                    result.push_back({people[i].first, people[j].first, amt});
                else
                    result.push_back({people[j].first, people[i].first, amt});
                used[i] = used[j] = true;
                break;
            }
        }
    }

    vector<pair<string, double>> rem;
    for (int i = 0; i < n; i++)
        if (!used[i])
            rem.push_back(people[i]);

    int m = (int)rem.size();
    if (m == 0)
        return result;

    // Step 2: split into the maximum number of zero-sum groups (exact DP)
    unsigned full = (1u << m) - 1;
    vector<double> sum(full + 1, 0.0);
    vector<uint8_t> dp(full + 1, 0);

    auto isZero = [&](unsigned mask)
    {
        return fabs(sum[mask]) < E * __builtin_popcount(mask);
    };

    for (unsigned mask = 1; mask <= full; mask++)
    {
        int low = __builtin_ctz(mask);
        sum[mask] = sum[mask & (mask - 1)] + rem[low].second;

        uint8_t best = 0;
        unsigned mm = mask;
        while (mm)
        {
            unsigned b = mm & (~mm + 1);
            uint8_t v = dp[mask ^ b];
            if (v > best)
                best = v;
            mm ^= b;
        }
        dp[mask] = best + (isZero(mask) ? 1 : 0);
    }

    // Reconstruct an ordering that achieves dp[full]
    vector<int> order;
    unsigned mask = full;
    while (mask)
    {
        int target = dp[mask] - (isZero(mask) ? 1 : 0);
        unsigned mm = mask;
        while (mm)
        {
            unsigned b = mm & (~mm + 1);
            if (dp[mask ^ b] == target)
            {
                order.push_back(__builtin_ctz(b));
                mask ^= b;
                break;
            }
            mm ^= b;
        }
    }
    reverse(order.begin(), order.end());

    // Cut the ordering at every zero-sum prefix (using the same mask sums as the DP)
    vector<vector<int>> groups;
    vector<int> cur;
    unsigned prefixMask = 0;
    for (int id : order)
    {
        cur.push_back(id);
        prefixMask |= (1u << id);
        if (isZero(prefixMask))
        {
            groups.push_back(cur);
            cur.clear();
        }
    }
    if (!cur.empty())
        groups.push_back(cur);

    // Step 3: settle each group (k people -> k-1 transactions, optimal since it can't be split)
    for (auto &g : groups)
    {
        vector<pair<int, double>> cr, db; // (index, remaining amount)
        for (int id : g)
        {
            if (rem[id].second > E)
                cr.push_back({id, rem[id].second});
            else if (rem[id].second < -E)
                db.push_back({id, -rem[id].second});
        }
        size_t i = 0, j = 0;
        while (i < cr.size() && j < db.size())
        {
            double amount = min(cr[i].second, db[j].second);
            result.push_back({rem[db[j].first].first, rem[cr[i].first].first, amount});
            cr[i].second -= amount;
            db[j].second -= amount;
            if (cr[i].second < E)
                i++;
            if (db[j].second < E)
                j++;
        }
    }

    return result;
}