// Section 19
// Read File 1
// Test for file open and simple read of 3 data items
#include <iostream>
#include <fstream>

int main() {
    std::ifstream in_file;
    std::string line;
    int num;
    double total;
    
    in_file.open("../test.txt");
    if (!in_file) {
        std::cerr << "Problem opening file" << std::endl;
        return 1;
    }
    in_file >> line >> num >> total;
    std::cout << line << std::endl;
    std::cout << num << std::endl;
    std::cout << total << std::endl;
    in_file.close();
    return 0;
}

