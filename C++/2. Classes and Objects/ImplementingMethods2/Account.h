// Check to prevent multiple initializations of one class
// without it if we write "#include "Account.h" multiple times in different
// files we will receive error;
// This is the common syntax for all header files in C++.

#ifndef _ACCOUNT_H_ // if not define
#define _ACCOUNT_H_ // define
#include <string>

class Account {
private:
    // attributes
    std::string name;
    double balance;

public:
    // methods
    // declared inline
    void set_balance(double bal) { balance = bal; }
    double get_balance() { return balance; }

    // methods will be declared outside the class declaration
    void set_name(std::string n);
    std::string get_name();

    bool deposit(double amount);
    bool withdraw(double amount);
};

#endif // _ACCOUNT_H_
