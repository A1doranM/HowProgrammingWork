#include "iostream"

template <typename T>
T max(T x, T y) {
  return x < y ? y : x;
}

int main() {
  int m1 = max(1, 2);
  std::cout << m1 << "\n";

  double m2 = max(1.5, 2.5);
  std::cout << m2 << "\n";
}
