"""
Test the loss function implementations.
"""

import numpy as np
import sys
import os

# Add necessary path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from deeplearning_framework import Tensor
from deeplearning_framework.losses import MSELoss, CrossEntropyLoss


def test_mse_loss():
    """Test Mean Squared Error loss."""
    # Create an MSE loss
    criterion = MSELoss()
    
    # Test with simple values
    pred = Tensor([[1.0, 2.0], [3.0, 4.0]], autograd=True)
    target = Tensor([[0.0, 0.0], [0.0, 0.0]], autograd=True)
    
    # Calculate loss
    loss = criterion.forward(pred, target)
    
    # Expected: ((1-0)^2 + (2-0)^2 + (3-0)^2 + (4-0)^2) = 1 + 4 + 9 + 16 = 30
    expected = np.array([30.0])
    
    assert np.allclose(loss.data, expected), f"MSE loss wrong: {loss.data}, expected: {expected}"
    
    # Test backpropagation
    loss.backward(Tensor(np.ones_like(loss.data)))
    
    # Gradient of MSE w.r.t. prediction is 2*(pred - target)
    # For our case: 2 * [[1, 2], [3, 4]] = [[2, 4], [6, 8]]
    expected_grad = 2 * pred.data
    
    assert pred.grad is not None, "Prediction gradient not computed"
    assert np.allclose(pred.grad.data, expected_grad), f"MSE gradient wrong: {pred.grad.data}"
    
    return True


def test_cross_entropy_loss():
    """Test Cross Entropy loss with softmax."""
    # Create a Cross Entropy loss
    criterion = CrossEntropyLoss()
    
    # Test with 2 samples, 3 classes
    # First sample has high logit on class 0, second on class 2
    logits = Tensor([[5.0, 1.0, 0.1], [0.1, 1.0, 5.0]], autograd=True)
    
    # Targets: first sample class 0, second sample class 2
    targets = Tensor([0, 2], autograd=True)
    
    # Calculate loss
    loss = criterion.forward(logits, targets)
    
    # Manually calculate softmax
    exp_logits = np.exp(logits.data)
    softmax = exp_logits / np.sum(exp_logits, axis=1, keepdims=True)
    
    # Calculate cross entropy manually: -log(p_correct_class)
    # For first sample: -log(softmax[0, 0])
    # For second sample: -log(softmax[1, 2])
    manual_loss = -(np.log(softmax[0, 0]) + np.log(softmax[1, 2])) / 2  # Average over 2 samples
    
    assert np.allclose(loss.data, manual_loss), f"Cross entropy loss wrong: {loss.data}, expected: {manual_loss}"
    
    # Test backpropagation
    loss.backward(Tensor(np.ones_like(loss.data)))
    
    # Gradient of cross entropy is (softmax - one_hot_target)
    one_hot = np.zeros_like(softmax)
    one_hot[0, 0] = 1.0  # First sample, class 0
    one_hot[1, 2] = 1.0  # Second sample, class 2
    
    expected_grad = (softmax - one_hot)
    
    assert logits.grad is not None, "Logits gradient not computed"
    assert np.allclose(logits.grad.data, expected_grad), f"CrossEntropy gradient wrong: {logits.grad.data}"
    
    return True


def test_loss_backprop_chain():
    """Test backpropagation through a loss and tensor operations."""
    # Create a simple chain: x -> intermediate -> loss
    x = Tensor([[1.0, 2.0], [3.0, 4.0]], autograd=True)
    
    # Intermediate transformation: double each value
    intermediate = x * Tensor([[2.0, 2.0], [2.0, 2.0]], autograd=True)
    
    # Target: all zeros
    target = Tensor([[0.0, 0.0], [0.0, 0.0]], autograd=True)
    
    # MSE Loss
    criterion = MSELoss()
    loss = criterion.forward(intermediate, target)
    
    # Expected: ((2-0)^2 + (4-0)^2 + (6-0)^2 + (8-0)^2) = 4 + 16 + 36 + 64 = 120
    expected_loss = np.array([120.0])
    assert np.allclose(loss.data, expected_loss), f"Loss calculation wrong: {loss.data}, expected: {expected_loss}"
    
    # Backprop
    loss.backward(Tensor(np.ones_like(loss.data)))
    
    # Check that gradient flowed back to x
    assert x.grad is not None, "Gradient didn't flow back to x"
    
    # Gradient of loss w.r.t. x is:
    # d(loss)/d(intermediate) * d(intermediate)/d(x) = 2*(intermediate - target) * 2
    # For our case: 2 * [[2, 4], [6, 8]] * 2 = [[8, 16], [24, 32]]
    expected_x_grad = np.array([[8, 16], [24, 32]])
    assert np.allclose(x.grad.data, expected_x_grad), f"Gradient wrong: {x.grad.data}, expected: {expected_x_grad}"
    
    return True


def run_all_tests():
    print("Running loss function tests...")
    tests = [
        test_mse_loss,
        test_cross_entropy_loss,
        test_loss_backprop_chain
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
    print(f"\nLoss function tests: {'ALL PASSED' if success else 'SOME FAILED'}")
    sys.exit(0 if success else 1)
