# Project Brief: Deep Learning Framework

## Overview

A lightweight deep learning framework built from scratch that implements automatic differentiation (autograd) and provides core building blocks for creating and training neural networks. The framework is designed to be educational and illustrates the core principles behind professional deep learning libraries like PyTorch.

## Core Purpose

The primary purpose of this framework is to:

1. Demonstrate how automatic differentiation works in deep learning frameworks
2. Provide a clear, understandable implementation of neural network components
3. Serve as an educational tool for understanding the internals of deep learning systems
4. Allow experimentation with neural network architectures without the complexity of full-scale frameworks

## Key Features

- **Tensor**: Core data structure with automatic differentiation capabilities
- **Layers**: Building blocks for neural networks (Linear, Activations, Embeddings, RNN)
- **Loss Functions**: Methods to calculate model error (MSE, Cross Entropy)
- **Optimizers**: Algorithms to update model parameters (SGD)
- **Testing Infrastructure**: Comprehensive test suite to verify correct implementation

## Framework Requirements

1. **Automatic Differentiation**: Must correctly compute gradients for all operations
2. **Clean API**: Intuitive interface similar to mainstream frameworks
3. **Educational Value**: Code should be readable and well-documented
4. **Extensibility**: Easy to add new layers, loss functions, or optimizers
5. **Test Coverage**: All components should have unit tests

## Constraints

- Uses NumPy for numerical operations rather than implementing from scratch
- Prioritizes clarity and educational value over performance
- Does not include GPU acceleration
- Limited to core functionality common in deep learning systems

## Success Metrics

- Ability to implement and train basic neural networks (MLP, RNN)
- Correct implementation of backpropagation verified by tests
- Solution of classic problems (XOR, sequence prediction)
- Code clarity and documentation quality

## Origin

This framework is based on the concepts presented in "Grokking Deep Learning" by Andrew Trask, specifically Chapter 13 on automatic differentiation, but has been extended with additional features and improved architecture.
