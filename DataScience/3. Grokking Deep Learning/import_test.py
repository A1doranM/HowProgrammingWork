"""
Test script to verify that all components can be imported correctly.
This confirms the package structure is working properly.
"""

print("Testing imports from deeplearning_framework...")

# Test core Tensor import
print("Importing Tensor...", end=" ")
from deeplearning_framework import Tensor
print("✓")

# Test layer imports
print("Importing Layer types...", end=" ")
from deeplearning_framework import (
    Layer, Linear, Sigmoid, Tanh, 
    Sequential, Embedding, RNNCell
)
print("✓")

# Test loss imports
print("Importing Loss functions...", end=" ")
from deeplearning_framework import MSELoss, CrossEntropyLoss
print("✓")

# Test optimizer imports
print("Importing Optimizers...", end=" ")
from deeplearning_framework import SGD
print("✓")

print("\nAll components imported successfully!")
print("The framework is correctly set up and ready to use.")
