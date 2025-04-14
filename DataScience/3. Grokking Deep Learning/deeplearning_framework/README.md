# Deep Learning Framework

A lightweight deep learning framework with automatic differentiation built from scratch.

## Overview

This framework provides the core building blocks for creating and training neural networks:

- **Tensor** class with automatic differentiation
- Various **layer types** (Linear, Activations, Embedding, RNN)
- **Loss functions** (MSE, CrossEntropy)
- **Optimization algorithms** (SGD)

The framework is designed to be educational and illustrates the core principles behind deep learning libraries like PyTorch, while maintaining a clean and understandable implementation.

For a comprehensive explanation of how the framework works internally, see [Deep Dive Explanation](deep_dive_explanation.md).

## Features

- **Automatic Differentiation**: Compute gradients automatically through backpropagation
- **Neural Network Building Blocks**: Common layers and components  
- **Extensible Architecture**: Easily add new layers, loss functions, or optimizers

## Structure

```
deeplearning_framework/
├── tensor.py               # Core tensor implementation with autograd
├── layers/                 # Neural network layers
│   ├── base.py             # Base Layer class
│   ├── linear.py           # Linear (fully connected) layer
│   ├── activations.py      # Sigmoid, Tanh layers
│   ├── container.py        # Sequential container
│   ├── embedding.py        # Embedding layer for NLP
│   └── rnn.py              # RNN cell implementation
├── losses/                 # Loss functions
│   ├── mse.py              # Mean Squared Error loss
│   └── cross_entropy.py    # Cross Entropy loss with softmax
└── optim/                  # Optimization algorithms
    └── sgd.py              # Stochastic Gradient Descent
```

## Examples

### Simple XOR Network

```python
import numpy as np
from deeplearning_framework.tensor import Tensor
from deeplearning_framework.layers import Linear, Tanh, Sigmoid, Sequential
from deeplearning_framework.losses import MSELoss
from deeplearning_framework.optim import SGD

# Create data
data = Tensor(np.array([[0, 0], [0, 1], [1, 0], [1, 1]]), autograd=True)
target = Tensor(np.array([[0], [1], [1], [0]]), autograd=True)

# Create model
model = Sequential([
    Linear(2, 3),  # 2 inputs -> 3 hidden units
    Tanh(),        # Tanh activation
    Linear(3, 1),  # 3 hidden units -> 1 output
    Sigmoid()      # Sigmoid activation
])

# Define loss and optimizer
criterion = MSELoss()
optimizer = SGD(parameters=model.get_parameters(), alpha=0.1)

# Training loop
for epoch in range(1000):
    # Forward pass
    predictions = model.forward(data)
    
    # Compute loss
    loss = criterion.forward(predictions, target)
    
    # Backward pass
    loss.backward(Tensor(np.ones_like(loss.data)))
    
    # Update parameters
    optimizer.step()
```

See `example.py` and `rnn_example.py` for more complete examples.

## Extending the Framework

You can extend the framework by:

1. Creating new layer types that inherit from `Layer`
2. Implementing new loss functions
3. Adding new optimization algorithms

Each extension requires implementing the appropriate methods to integrate with the automatic differentiation system.

## Background

This framework is based on the implementation from "Grokking Deep Learning" by Andrew Trask, Chapter 13 - "Introduction to Automatic Differentiation".
