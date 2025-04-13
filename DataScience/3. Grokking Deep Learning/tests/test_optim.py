"""
Test the optimizer implementations.
"""

import numpy as np
import sys
import os

# Add parent directory to path to allow imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from deeplearning_framework import Tensor
from deeplearning_framework.optim import SGD


def test_sgd_parameter_update():
    """Test that SGD correctly updates parameters."""
    # Create some parameters to optimize
    params = [
        Tensor([1.0, 2.0, 3.0], autograd=True),
        Tensor([[4.0, 5.0], [6.0, 7.0]], autograd=True)
    ]
    
    # Add gradients to them
    params[0].grad = Tensor([0.1, 0.2, 0.3])
    params[1].grad = Tensor([[0.4, 0.5], [0.6, 0.7]])
    
    # Save original parameter values and gradient values
    original_params = [p.data.copy() for p in params]
    original_grads = [p.grad.data.copy() for p in params]
    
    # Create an SGD optimizer
    lr = 0.1
    optimizer = SGD(parameters=params, alpha=lr)
    
    # Step the optimizer
    optimizer.step(zero=False)  # Explicitly set zero=False
    
    # Debug output
    for i, (param, orig, grad) in enumerate(zip(params, original_params, original_grads)):
        expected = orig - lr * grad
        print(f"Parameter {i}:")
        print(f"  Original: {orig}")
        print(f"  Gradient: {grad}")
        print(f"  Expected: {expected}")
        print(f"  Actual  : {param.data}")
        print(f"  Match   : {np.allclose(param.data, expected)}")
    
    # Check parameters were updated correctly
    for i, (param, orig, grad) in enumerate(zip(params, original_params, original_grads)):
        expected = orig - lr * grad
        assert np.allclose(param.data, expected), f"Parameter {i} not updated correctly"
    
    return True


def test_sgd_zero_grad():
    """Test that SGD's zero method zeroes out gradients."""
    # Create a parameter with a gradient
    param = Tensor([1.0, 2.0, 3.0], autograd=True)
    param.grad = Tensor([0.1, 0.2, 0.3])
    
    # Create SGD optimizer
    optimizer = SGD(parameters=[param], alpha=0.1)
    
    # Call zero method
    optimizer.zero()
    
    # Check that gradient is zeroed out
    assert np.all(param.grad.data == 0), "Gradient not zeroed out"
    
    return True


def test_sgd_integration():
    """Test SGD in an end-to-end simple gradient descent scenario."""
    # We'll use a simple function: f(x) = x^2
    # The minimum is at x=0, and the gradient is df/dx = 2x
    
    # Start at x = 5.0
    x = Tensor([5.0], autograd=True)
    
    # Create optimizer
    optimizer = SGD(parameters=[x], alpha=0.1)
    
    # Run 10 steps of SGD
    iterations = 10
    for _ in range(iterations):
        # Compute f(x) = x^2
        f_x = x * x
        
        # Compute gradient df/dx = 2x
        f_x.backward(Tensor([1.0]))
        
        # Perform update and zero gradients
        optimizer.step(zero=True)  # Explicitly zero out gradients
    
    # After optimization, x should be closer to 0 (the minimum)
    # With 10 iterations and lr=0.1, x should be approximately:
    # x = 5.0 * (1 - 0.1*2)^10 ≈ 5.0 * (0.8)^10 ≈ 0.5
    assert x.data[0] < 1.0, f"SGD optimization didn't reduce x enough: {x.data[0]}"
    
    return True


def run_all_tests():
    print("Running optimizer tests...")
    tests = [
        test_sgd_parameter_update,
        test_sgd_zero_grad,
        test_sgd_integration
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
    print(f"\nOptimizer tests: {'ALL PASSED' if success else 'SOME FAILED'}")
    sys.exit(0 if success else 1)
