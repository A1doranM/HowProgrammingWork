// Section 13
// Delegating Constructors
#include <iostream>
#include <string>

using namespace std;

class Player
{
private:
   std::string name;
   int health;
   int xp;
public:
// Overloaded Constructors
    Player();
    Player(std::string name_val);
    Player(std::string name_val, int health_val, int xp_val);
};

// Delegating constructor is about situation when we have a lot of similar code
// in constructors so we can use another constructor inside constructor.

// Here we use most specific constructor to create object without args
Player::Player()
    : Player {"None",0,0} {
        cout << "No-args constructor" << endl;
}

// Here we pass just one argument.
Player::Player(std::string name_val)
   : Player {name_val,0, 0}  {
           cout << "One-arg constructor" << endl;
}

// Our most specific constructor which set values for all fields.
Player::Player(std::string name_val, int health_val, int xp_val)
    : name{name_val}, health{health_val}, xp{xp_val} {
            cout << "Three-args constructor" << endl;
}

int main() {

    Player empty;
    Player frank {"Frank"};
    Player villain {"Villain", 100, 55};

    return 0;
}

