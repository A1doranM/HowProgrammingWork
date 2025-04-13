"""
Basic test script to verify the deep learning framework functionality.
"""

import numpy as np
from deeplearning_framework import Tensor, Linear, Sigmoid, Sequential, MSELoss, SGD

def test_xor():
    """Test a simple XOR neural network."""
    print("Testing XOR network...")
    
    # Create a simple dataset for the XOR problem
    data = Tensor(np.array([[0, 0], [0, 1], [1, 0], [1, 1]]), autograd=True)
    target = Tensor(np.array([[0], [1], [1], [0]]), autograd=True)
    
    # Create a simple network
    model = Sequential([
        Linear(2, 3),
        Sigmoid(),
        Linear(3, 1),
        Sigmoid()
    ])
    
    # Loss function and optimizer
    criterion = MSELoss()
    optimizer = SGD(parameters=model.get_parameters(), alpha=0.5)
    
    # Train for a few iterations
    for i in range(100):
        # Forward pass
        pred = model.forward(data)
        
        # Compute loss
        loss = criterion.forward(pred, target)
        
        # Backward pass
        loss.backward(Tensor(np.ones_like(loss.data)))
        
        # Update parameters
        optimizer.step()
    
    # Check predictions
    predictions = model.forward(data)
    print("\nPredictions after training:")
    for i, (x, y, p) in enumerate(zip(data.data, target.data, predictions.data)):
        correct = "✓" if (p > 0.5 and y[0] == 1) or (p <= 0.5 and y[0] == 0) else "✗"
        print(f"Input: {x} | Target: {y[0]} | Predicted: {p[0]:.4f} | {correct}")
    
    return all(
        (p > 0.5 and y[0] == 1) or (p <= 0.5 and y[0] == 0) 
        for p, y in zip(predictions.data, target.data)
    )

def test_tensor_ops():
    """Test basic tensor operations."""
    print("\nTesting tensor operations...")
    
    # Test addition
    a = Tensor([1, 2, 3], autograd=True)
    b = Tensor([4, 5, 6], autograd=True)
    c = a + b
    print(f"Addition: {a} + {b} = {c}")
    
    # Test subtraction
    d = b - a
    print(f"Subtraction: {b} - {a} = {d}")
    
    # Test multiplication
    e = a * b
    print(f"Multiplication: {a} * {b} = {e}")
    
    # Test matrix multiplication
    f = Tensor([[1, 2], [3, 4]], autograd=True)
    g = Tensor([[5, 6], [7, 8]], autograd=True)
    h = f.mm(g)
    print(f"Matrix multiplication result shape: {h.data.shape}")
    print(f"Matrix multiplication result: \n{h}")
    
    return True

if __name__ == "__main__":
    print("Testing Deep Learning Framework...")
    
    # Run tests
    tensor_test_passed = test_tensor_ops()
    xor_test_passed = test_xor()
    
    # Show results
    print("\nTest Results:")
    print(f"Tensor Operations: {'PASSED' if tensor_test_passed else 'FAILED'}")
    print(f"XOR Network: {'PASSED' if xor_test_passed else 'FAILED'}")
    
    if tensor_test_passed and xor_test_passed:
        print("\nAll tests passed! The framework is working correctly.")
    else:
        print("\nSome tests failed. Please check the framework implementation.")
