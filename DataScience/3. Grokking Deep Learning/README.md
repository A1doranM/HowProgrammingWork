# Deep Learning Framework from Scratch

A lightweight deep learning framework implemented from scratch, based on the concepts from "Grokking Deep Learning" Chapter 13.

## Overview

This framework provides a complete implementation of:

- Automatic differentiation (autograd)
- Tensor operations and computation graphs
- Neural network layers (Linear, Embedding, RNN)
- Activation functions (Sigmoid, Tanh)
- Loss functions (MSE, CrossEntropy)
- Optimization algorithms (SGD)

The code follows a clean, modular architecture similar to PyTorch or TensorFlow.

## Directory Structure

```
.
├── deeplearning_framework/         # Main framework code
│   ├── __init__.py                 # Package exports
│   ├── tensor.py                   # Core tensor implementation
│   ├── layers/                     # Neural network layers
│   ├── losses/                     # Loss functions
│   ├── optim/                      # Optimization algorithms
│   ├── example.py                  # Basic example (XOR classification)
│   ├── rnn_example.py              # RNN example (text generation)
│   └── README.md                   # Framework documentation
├── test_framework.py               # Tests for framework functionality
└── import_test.py                  # Simple import test script
```

## Getting Started

1. **Run the import test** to verify all components are correctly accessible:
   ```
   python import_test.py
   ```

2. **Run the test script** to verify the framework is working:
   ```
   python test_framework.py
   ```

3. **Try the examples**:
   ```
   python -m deeplearning_framework.example
   python -m deeplearning_framework.rnn_example
   ```

## Creating Your Own Models

### Simple Classification Example

```python
import numpy as np
from deeplearning_framework import Tensor, Sequential, Linear, Tanh, Sigmoid, MSELoss, SGD

# Create data
X = Tensor(np.array([[0, 0], [0, 1], [1, 0], [1, 1]]), autograd=True)
y = Tensor(np.array([[0], [1], [1], [0]]), autograd=True)

# Create model
model = Sequential([
    Linear(2, 4),      # Input features -> hidden units
    Tanh(),            # Activation function
    Linear(4, 1),      # Hidden -> output
    Sigmoid()          # Output activation
])

# Loss and optimizer
criterion = MSELoss()
optimizer = SGD(model.get_parameters(), alpha=0.1)

# Training loop
for epoch in range(1000):
    # Forward pass
    pred = model.forward(X)
    
    # Compute loss
    loss = criterion.forward(pred, y)
    
    # Backward pass
    loss.backward(Tensor(np.ones_like(loss.data)))
    
    # Update parameters
    optimizer.step()
    
    if epoch % 100 == 0:
        print(f"Epoch {epoch}, Loss: {loss.data}")
```

## Features

- **Computation Graph**: Automatic tracking of operations for backpropagation
- **Autograd**: Automatic differentiation for all mathematical operations
- **Flexible API**: Clean, simple interfaces similar to popular frameworks
- **Extensible Design**: Easy to add new layers, operations or optimizers

## Advanced Features

- **Embedding Layer**: For NLP and categorical feature processing
- **RNN Support**: Recurrent neural networks for sequence data
- **Cross-Entropy Loss**: For classification tasks with proper numerics

## Background

This implementation is based on Chapter 13 of "Grokking Deep Learning" by Andrew Trask, which introduces automatic differentiation and computational graphs. The code has been extended and organized into a complete, usable framework.
