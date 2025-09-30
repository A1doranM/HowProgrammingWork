// Section 18
// Miles per Gallon - Function - Rethrow
#include <iostream>
#include <vector>

int main() {    
    int miles {};
    int gallons {};
    double miles_per_gallon {};
    
    std::cout << "Enter the miles driven: ";
    std::cin >> miles;
    std::cout << "Enter the gallons used: ";
    std::cin >> gallons;
    
    try {
        if (gallons == 0)
            throw gallons;
        else if (miles < 0 || gallons < 0) 
            throw "You can have negative miles or gallons";
        else if (gallons > 1000)
            throw std::string {"Huh"};
    
       // miles_per_gallon = miles / gallons;
        miles_per_gallon = static_cast<double>(miles) / gallons;
        std::cout << "Result: " << miles_per_gallon << std::endl;
    }
    catch (int ex) {
        std::cout << "Sorry, you can't divide by zero" << std::endl;
    }
    catch (const char *ex) {    // what happens if you don't have this but throw string
        std::cout << ex << std::endl;
    }
    catch (...) {
        std::cerr << "Unknown error" << std::endl;
        throw;
    }
    std::cout << "Bye" << std::endl;
    return 0;
}

