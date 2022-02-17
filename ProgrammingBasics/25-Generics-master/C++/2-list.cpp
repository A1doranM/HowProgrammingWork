#include "iostream"

template <class T>
struct ListItem {
  ListItem<T>* next;
  ListItem<T>* prev;
  T data;
};

template <class T>
class List {
  private:
    ListItem<T>* head;
    ListItem<T>* tail;
  public:
    List<T>() {
      head = NULL;
      tail = NULL;
    };

    void push(T value) {
      ListItem<T>* item = new ListItem<T>;
      item->data = value;
      if (head == NULL) {
        head = item;
      } else {
        item->prev = tail;
        tail->next = item;
      }
      tail = item;
    }

    void display() {
      ListItem<T>* current = head;
      while (current != NULL) {
        std::cout << current->data << "\n";
        current = current->next;
      }
    }
};

int main() {
  List<std::string> list;
  list.push("Ave");
  list.push("Emperor");
  list.push("Marcus Aurelius!");
  list.display();
};
