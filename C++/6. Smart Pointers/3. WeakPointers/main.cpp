// Section 17
// Weak Pointers
#include <iostream>
#include <memory>

/*
    Provides a non-owning "weak" reference

    weak_ptr<T>
        - Points to an object of type T on the heap
        - Does not participate in owning relationship
        - Always created from a shared_ptr
        - Does NOT increment or decrement reference use count
        - Used to prevent strong reference cycles which could prevent obj from deletion

*/

using namespace std;

class B;    // forward declaration

class A {
    std::shared_ptr<B> b_ptr;
public:
    void set_B(std::shared_ptr<B> &b) {
        b_ptr = b;
    }
    A() { cout << "A Constructor" << endl; }
    ~A() { cout << "A Destructor" << endl; }
};

class B {
    std::weak_ptr<A> a_ptr;     // make weak to break the strong circular reference
public:
    void set_A(std::shared_ptr<A> &a) {
        a_ptr = a;
    }
    B() { cout << "B Constructor" << endl; }
    ~B() { cout << "B Destructor" << endl; }
};

int main() {
    shared_ptr<A> a  = make_shared<A>();
    shared_ptr<B> b = make_shared<B>();
    a->set_B(b);
    b->set_A(a);

    return 0;
}

