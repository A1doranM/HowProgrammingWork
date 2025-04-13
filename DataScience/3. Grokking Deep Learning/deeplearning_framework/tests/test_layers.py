"""
Test the layers implementation.
"""

import numpy as np
import sys
import os

# Add necessary path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from deeplearning_framework import Tensor
from deeplearning_framework.layers import Layer, Linear, Sigmoid, Tanh, Sequential, Embedding


def test_linear_layer():
    """Test the Linear layer functionality."""
    # Create a Linear layer with 2 inputs and 3 outputs
    layer = Linear(2, 3)
    
    # Check that parameters are created correctly
    assert len(layer.parameters) == 2, f"Expected 2 parameters, got {len(layer.parameters)}"
    assert layer.weight.data.shape == (2, 3), f"Weight shape wrong: {layer.weight.data.shape}"
    assert layer.bias.data.shape == (3,), f"Bias shape wrong: {layer.bias.data.shape}"
    
    # Test forward pass with a batch of 2 inputs
    x = Tensor([[1.0, 2.0], [3.0, 4.0]], autograd=True)
    y = layer.forward(x)
    
    # Expected output: y = x.mm(W) + b
    # Shape should be (2, 3) - 2 samples, 3 outputs
    assert y.data.shape == (2, 3), f"Output shape wrong: {y.data.shape}"
    
    # Check bias broadcasting
    # Manual computation for one sample
    sample1 = np.dot(x.data[0], layer.weight.data) + layer.bias.data
    # Check the first sample matches
    assert np.allclose(y.data[0], sample1), f"Forward pass calculation wrong"
    
    return True


def test_activation_layers():
    """Test the activation layer functionality."""
    # Test sigmoid
    sigmoid = Sigmoid()
    x = Tensor([[-2.0, -1.0, 0.0, 1.0, 2.0]], autograd=True)
    y = sigmoid.forward(x)
    
    # Expected: sigmoid(x) = 1 / (1 + e^(-x))
    expected = 1 / (1 + np.exp(-x.data))
    assert np.allclose(y.data, expected), f"Sigmoid output wrong: {y.data}"
    
    # Test tanh
    tanh = Tanh()
    z = tanh.forward(x)
    
    # Expected: tanh(x) = (e^x - e^(-x)) / (e^x + e^(-x))
    expected = np.tanh(x.data)
    assert np.allclose(z.data, expected), f"Tanh output wrong: {z.data}"
    
    return True


def test_sequential():
    """Test the Sequential container."""
    # Create a simple sequential model
    model = Sequential([
        Linear(2, 3),
        Tanh(),
        Linear(3, 1),
        Sigmoid()
    ])
    
    # Check if parameters are collected correctly
    params = model.get_parameters()
    assert len(params) == 4, f"Expected 4 parameters, got {len(params)}"
    
    # Check forward pass
    x = Tensor([[1.0, 2.0], [3.0, 4.0]], autograd=True)
    y = model.forward(x)
    
    # Check output shape: should be (2, 1)
    assert y.data.shape == (2, 1), f"Output shape wrong: {y.data.shape}"
    
    # Check values are in sigmoid range (0, 1)
    assert np.all(y.data > 0) and np.all(y.data < 1), f"Output not in sigmoid range: {y.data}"
    
    return True


def test_embedding():
    """Test the Embedding layer functionality."""
    # Create an embedding layer: 10 possible indices, embedding dim 5
    embed = Embedding(10, 5)
    
    # Check parameters
    assert embed.weight.data.shape == (10, 5), f"Weight shape wrong: {embed.weight.data.shape}"
    
    # Test with a batch of indices
    indices = Tensor([0, 2, 5])
    output = embed.forward(indices)
    
    # Output shape should be (3, 5): 3 indices, each mapping to a 5-dim vector
    assert output.data.shape == (3, 5), f"Output shape wrong: {output.data.shape}"
    
    # Check the embeddings match the weight rows
    for i, idx in enumerate(indices.data):
        assert np.array_equal(output.data[i], embed.weight.data[idx]), \
            f"Embedding at index {idx} doesn't match"
    
    return True


def test_layer_backprop():
    """Test backpropagation through a layer."""
    # Create a Linear layer
    linear = Linear(2, 3)
    
    # Record the original weights
    original_weight = linear.weight.data.copy()
    original_bias = linear.bias.data.copy()
    
    # Forward pass
    x = Tensor([[1.0, 2.0]], autograd=True)
    y = linear.forward(x)
    
    # Create a target and loss (MSE)
    target = Tensor([[0.1, 0.2, 0.3]], autograd=True)  # Make target autograd=True
    diff = y - target
    loss = (diff * diff).sum(0)  # Element-wise multiply
    
    # Backward pass
    loss.backward(Tensor(np.ones_like(loss.data)))
    
    # Check that gradients exist
    assert linear.weight.grad is not None, "Weight grad is None"
    assert linear.bias.grad is not None, "Bias grad is None"
    
    # Check grad shapes
    assert linear.weight.grad.data.shape == linear.weight.data.shape, "Weight grad shape wrong"
    assert linear.bias.grad.data.shape == linear.bias.data.shape, "Bias grad shape wrong"
    
    # Manually update the weights using SGD
    lr = 0.1
    linear.weight.data -= lr * linear.weight.grad.data
    linear.bias.data -= lr * linear.bias.grad.data
    
    # Check that weights were updated
    assert not np.array_equal(linear.weight.data, original_weight), "Weights not updated"
    assert not np.array_equal(linear.bias.data, original_bias), "Bias not updated"
    
    return True


def test_sequential_backprop():
    """Test backpropagation through a Sequential container."""
    # Create a simple model
    model = Sequential([
        Linear(2, 3),
        Tanh(),
        Linear(3, 1)
    ])
    
    # Get parameters before training
    params_before = [p.data.copy() for p in model.get_parameters()]
    
    # Forward pass
    x = Tensor([[1.0, 2.0]], autograd=True)
    y = model.forward(x)
    
    # Create a target and loss (MSE)
    target = Tensor([[0.5]], autograd=True)  # Make target autograd=True
    diff = y - target
    loss = (diff * diff).sum(0)  # Element-wise multiply
    
    # Backward pass
    loss.backward(Tensor(np.ones_like(loss.data)))
    
    # Check that all parameters have gradients
    for p in model.get_parameters():
        assert p.grad is not None, f"Parameter has no gradient: {p}"
    
    # Manually update the weights using SGD
    lr = 0.1
    for p in model.get_parameters():
        p.data -= lr * p.grad.data
    
    # Check that parameters were updated
    params_after = [p.data for p in model.get_parameters()]
    for i, (before, after) in enumerate(zip(params_before, params_after)):
        assert not np.array_equal(before, after), f"Parameter {i} not updated"
    
    return True


def run_all_tests():
    print("Running layer tests...")
    tests = [
        test_linear_layer,
        test_activation_layers,
        test_sequential,
        test_embedding,
        test_layer_backprop,
        test_sequential_backprop
    ]
    
    all_passed = True
    for i, test in enumerate(tests):
        try:
            result = test()
            status = "PASSED" if result else "FAILED"
        except Exception as e:
            result = False
            status = f"ERROR: {str(e)}"
            import traceback
            print(traceback.format_exc())
            
        all_passed = all_passed and result
        print(f"  {i+1}. {test.__name__}: {status}")
    
    return all_passed


if __name__ == "__main__":
    success = run_all_tests()
    print(f"\nLayer tests: {'ALL PASSED' if success else 'SOME FAILED'}")
    sys.exit(0 if success else 1)
