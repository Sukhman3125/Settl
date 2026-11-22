#include "settlement.h"
#include <vector>
using namespace std;

vector<string> helloFromCpp(vector<string> x, vector<double> y, vector<int> z) {
    x.push_back("Hello from C++!");
    y.push_back(3.14159);
    z.push_back(798825);
    vector<string> result;
    for(auto it:x)
        result.push_back(it);
    for(auto it:y)
        result.push_back(to_string(it));
    for(auto it:z)
        result.push_back(to_string(it));
    return result;
}
