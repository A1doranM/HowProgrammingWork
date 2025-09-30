// Section 19
// Challenge 4 - Solution
// Copy Romeo and Juliet with line numbers
#include <iostream>
#include <fstream>
#include <iomanip>
#include <string>

int main() {
    std::ifstream in_file {"../romeoandjuliet.txt"};
    std::ofstream out_file {"../romeoandjuliet_out.txt"};
    if (!in_file.is_open()) {
        std::cerr << "Error opening input file" << std::endl;
        return 1;
    }
     if (!in_file.is_open()) {
        std::cerr << "Error opening input file" << std::endl;
        return 1;
    }
    
    std::string line{};
    int line_number {0};
    while (getline(in_file, line)) {
        if (line == "")
            out_file << std::endl;
        else {
            ++line_number;
            out_file << std::setw(7) << std::left << line_number
                     << line << std::endl;
        }
    }
    std::cout << "\nCopy complete" << std::endl;
    in_file.close();
    out_file.close();
    return 0;
}

