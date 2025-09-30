// Section 13
// Declare Classes and Objects
#include <iostream>
#include <string>
#include <vector>

using namespace std;

class Player {
    // attributes
    string name {"Player"};
    int health {100};
    int xp {3};

    // methods
    void talk(string);
    bool is_dead();
};

class Account {
    // attributes
    string name {"Account"};
    double balance {0.0};

    // methods
    bool deposit(double);
    bool withdraw(double);

};


int main() {
    Account frank_account;
    Account jim_account;


    Player frank;
    Player hero;

    Player players[] {frank, hero};

    vector<Player> player_vec {frank};
    player_vec.push_back(hero);


    Player *enemy {nullptr};
    enemy = new Player;
    delete enemy;

    // Difference between object creation methods.
    /*
        EventList temp;

        AND

        EventList* temp = new EventList()

        First:

        Object on the stack EventList temp;

        - access is little bit faster, there is no derefferencing
        - object are automatically deleted at the end of method which creates them so we don't have to care about their deletion
        - stack size is limited ( much more than heap )
        - these objects cannot be returned from the method without copying

        Second:

        Object on the heap EventList* temp = new EventList();

        - heap is "unlimited" ( comparing to stack )
        - these objects are easilly shared accross whole application because they aren't automatically deteled
        - we have to delete them manually, if we loose the pointer then there are lost bytes in memory ( leaks )
    */




    return 0;
}
