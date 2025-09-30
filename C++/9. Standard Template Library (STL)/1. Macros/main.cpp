// Section 20
// Macros
#include <iostream>

//int min(int a, int b) {
//    return (a < b) ? a : b;
//}
//
//char min(char a, char b) {
//    return (a < b) ? a :  b;
//}
//
//double min(double a, double b) {
//    return (a < b) ? a : b;
//}

/*

    - C++ preprocessor directives
    - No type information
    - Simple substitution

*/

#define min(a, b)  (((a)<(b)) ? (a) : (b)) // Macros function

#define max(a,b) ((a>b) ? a : b) // Another macros
int main() {

    std::cout << min(2,3) << std::endl;
    std::cout << min('A', 'B') << std::endl;
    std::cout << min(12.5, 9.2) << std::endl;
    std::cout << min(5+2*2, 7+40) << std::endl;

    std::cout << max(10,20) << std::endl;
    return 0;
}

