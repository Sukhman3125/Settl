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
double E = 1e-4;

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
    vector<pair<string, long long>> people; // cents; +ve = is owed, -ve = owes

    for (auto &it : creditors)
    {
        long long c = llround(it.second * 100);
        if (c != 0)
            people.push_back({it.first, c});
    }
    for (auto &it : debtors)
    {
        long long c = llround(it.second * 100);
        if (c != 0)
            people.push_back({it.first, -c});
    }

    long long total = 0;
    for (auto &p : people)
        total += p.second;
    if (total != 0)
        return {}; // inconsistent input

    vector<t> current, best;
    size_t bestCount = SIZE_MAX;

    function<void(int)> dfs = [&](int start)
    {
        while (start < (int)people.size() && people[start].second == 0)
            start++;

        if (start == (int)people.size())
        {
            if (current.size() < bestCount)
            {
                bestCount = current.size();
                best = current;
            }
            return;
        }

        if (current.size() + 1 >= bestCount)
            return; // need at least 1 more

        set<long long> tried;

        for (int i = start + 1; i < (int)people.size(); i++)
        {
            long long a = people[start].second;
            long long b = people[i].second;

            if ((a > 0) == (b > 0) || b == 0)
                continue; // need opposite signs
            if (!tried.insert(b).second)
                continue;

            long long absA = a < 0 ? -a : a;
            long long absB = b < 0 ? -b : b;
            long long amount = min(absA, absB);

            people[start].second += (a < 0 ? amount : -amount);
            people[i].second += (b < 0 ? amount : -amount);

            if (a < 0)
                current.push_back({people[start].first, people[i].first, amount / 100.0});
            else
                current.push_back({people[i].first, people[start].first, amount / 100.0});

            dfs(start); // FIX: stay on start, it may have a remainder

            current.pop_back();
            people[start].second = a;
            people[i].second = b;

            if (a + b == 0)
                break; // perfect cancel: no better option
        }
    };

    dfs(0);
    return best;
}