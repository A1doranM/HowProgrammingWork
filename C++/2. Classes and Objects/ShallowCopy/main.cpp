// Section 13
// Copy Constructor - Shallow Copy
// Shallow Copy is the default copy behaviour it has troubles when we use pointers
// inside object. The pointers is copied NOT what it points to (shallow copy).
// When we release the storage in the destructor, the other object still refers
// to the released storage.
// Note: this program will crash
#include <iostream>

using namespace std;

class Shallow {
private:
    int *data;
public:
    void set_data_value(int d) { *data = d; }
    int get_data_value() { return *data; }
    // Constructor
    Shallow(int d);
    // Copy Constructor
    Shallow(const Shallow &source);
    // Destructor
    ~Shallow();
};

Shallow::Shallow(int d) { // allocate storage
    data = new int;
    *data = d;
}

Shallow::Shallow(const Shallow &source) // default copy constructor
    : data(source.data) { // source and new object points to the same data.
        cout << "Copy constructor  - shallow copy" << endl;
}

Shallow::~Shallow() { // free storage
    delete data;
    cout << "Destructor freeing data" << endl;
}

void display_shallow(Shallow s) {
    cout << s.get_data_value() << endl;
}

int main() {

    Shallow obj1 {100};
    display_shallow(obj1);

    Shallow obj2 {obj1};
    obj2.set_data_value(1000);

    return 0;
}

