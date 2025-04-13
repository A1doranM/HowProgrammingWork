"""
Test the core Tensor functionality including operations and autograd.
"""

import numpy as np
import sys
import os

# Add parent directory to path to allow imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from deeplearning_framework import Tensor


def test_tensor_creation():
    """Test basic Tensor creation."""
    # Test scalar
    t1 = Tensor(5)
    assert t1.data.shape == (), f"Expected scalar shape (), got {t1.data.shape}"
    
    # Test vector
    t2 = Tensor([1, 2, 3])
    assert t2.data.shape == (3,), f"Expected shape (3,), got {t2.data.shape}"
    
    # Test matrix
    t3 = Tensor([[1, 2], [3, 4]])
    assert t3.data.shape == (2, 2), f"Expected shape (2, 2), got {t3.data.shape}"
    
    return True


def test_basic_operations():
    """Test basic operations (+, -, *, etc)."""
    a = Tensor([1, 2, 3], autograd=True)
    b = Tensor([4, 5, 6], autograd=True)
    
    # Addition
    c = a + b
    assert np.array_equal(c.data, np.array([5, 7, 9])), f"Addition failed: {c.data}"
    
    # Subtraction
    d = b - a
    assert np.array_equal(d.data, np.array([3, 3, 3])), f"Subtraction failed: {d.data}"
    
    # Multiplication
    e = a * b
    assert np.array_equal(e.data, np.array([4, 10, 18])), f"Multiplication failed: {e.data}"
    
    # Negation
    f = -a
    assert np.array_equal(f.data, np.array([-1, -2, -3])), f"Negation failed: {f.data}"
    
    return True


def test_matrix_operations():
    """Test matrix operations (mm, transpose)."""
    a = Tensor([[1, 2], [3, 4]], autograd=True)
    b = Tensor([[5, 6], [7, 8]], autograd=True)
    
    # Matrix multiplication
    c = a.mm(b)
    expected = np.array([[19, 22], [43, 50]])
    assert np.array_equal(c.data, expected), f"Matrix multiplication failed: {c.data}"
    
    # Transpose
    d = a.transpose()
    expected = np.array([[1, 3], [2, 4]])
    assert np.array_equal(d.data, expected), f"Transpose failed: {d.data}"
    
    return True


def test_activation_functions():
    """Test sigmoid and tanh activations."""
    a = Tensor([-2, -1, 0, 1, 2], autograd=True)
    
    # Sigmoid
    s = a.sigmoid()
    expected_s = 1 / (1 + np.exp(-a.data))
    assert np.allclose(s.data, expected_s), f"Sigmoid failed: {s.data}"
    
    # Tanh
    t = a.tanh()
    expected_t = np.tanh(a.data)
    assert np.allclose(t.data, expected_t), f"Tanh failed: {t.data}"
    
    return True


def test_sum_expand():
    """Test sum and expand operations."""
    a = Tensor([[1, 2, 3], [4, 5, 6]], autograd=True)
    
    # Sum along dimension 0
    s0 = a.sum(0)
    expected_s0 = np.array([5, 7, 9])
    assert np.array_equal(s0.data, expected_s0), f"Sum along dim 0 failed: {s0.data}"
    
    # Sum along dimension 1
    s1 = a.sum(1)
    expected_s1 = np.array([6, 15])
    assert np.array_equal(s1.data, expected_s1), f"Sum along dim 1 failed: {s1.data}"
    
    # Expand (replicate) along dimension 0
    e = Tensor([1, 2, 3], autograd=True)
    e0 = e.expand(0, 2)
    expected_e0 = np.array([[1, 2, 3], [1, 2, 3]])
    assert e0.data.shape == (2, 3), f"Expand shape wrong: {e0.data.shape}"
    assert np.array_equal(e0.data, expected_e0), f"Expand failed: {e0.data}"
    
    return True


def test_index_select():
    """Test index_select functionality."""
    a = Tensor([[1, 2], [3, 4], [5, 6]], autograd=True)
    indices = Tensor([0, 2])
    
    selected = a.index_select(indices)
    expected = np.array([[1, 2], [5, 6]])
    assert np.array_equal(selected.data, expected), f"Index select failed: {selected.data}"
    
    return True


def test_autograd_add():
    """Test autograd on addition."""
    a = Tensor([1, 2, 3], autograd=True)
    b = Tensor([4, 5, 6], autograd=True)
    
    c = a + b
    
    # Backprop with gradient [1, 1, 1]
    c.backward(Tensor(np.ones_like(c.data)))
    
    # For addition, gradient should flow equally to both inputs
    assert np.array_equal(a.grad.data, np.array([1, 1, 1])), f"a.grad incorrect: {a.grad.data}"
    assert np.array_equal(b.grad.data, np.array([1, 1, 1])), f"b.grad incorrect: {b.grad.data}"
    
    return True


def test_autograd_mul():
    """Test autograd on multiplication."""
    a = Tensor([1, 2, 3], autograd=True)
    b = Tensor([4, 5, 6], autograd=True)
    
    c = a * b
    
    # Backprop with gradient [1, 1, 1]
    c.backward(Tensor(np.ones_like(c.data)))
    
    # For multiplication, grad wrt a is b, grad wrt b is a
    assert np.array_equal(a.grad.data, b.data), f"a.grad incorrect: {a.grad.data}"
    assert np.array_equal(b.grad.data, a.data), f"b.grad incorrect: {b.grad.data}"
    
    return True


def test_autograd_mm():
    """Test autograd on matrix multiplication."""
    a = Tensor([[1, 2], [3, 4]], autograd=True)
    b = Tensor([[5, 6], [7, 8]], autograd=True)
    
    c = a.mm(b)
    
    # Backprop with gradient all ones
    grad = np.ones_like(c.data)
    c.backward(Tensor(grad))
    
    # For matrix multiplication:
    # dC/dA = grad.mm(B^T)
    # dC/dB = A^T.mm(grad)
    expected_a_grad = np.dot(grad, b.data.T)
    expected_b_grad = np.dot(a.data.T, grad)
    
    assert np.array_equal(a.grad.data, expected_a_grad), f"a.grad incorrect: {a.grad.data}"
    assert np.array_equal(b.grad.data, expected_b_grad), f"b.grad incorrect: {b.grad.data}"
    
    return True


def test_autograd_chain():
    """Test autograd through a chain of operations."""
    x = Tensor([2, 3], autograd=True)
    w1 = Tensor([[1, 2], [3, 4]], autograd=True)
    
    # Forward pass: y = x.mm(w1)
    y = x.mm(w1)
    
    # Backprop with gradient [1, 1]
    y.backward(Tensor(np.ones_like(y.data)))
    
    # Verify gradients
    expected_x_grad = np.dot(np.ones_like(y.data), w1.data.T)
    expected_w1_grad = np.outer(x.data, np.ones(y.data.shape))
    
    assert np.array_equal(x.grad.data, expected_x_grad), f"x.grad incorrect: {x.grad.data}" 
    assert np.array_equal(w1.grad.data, expected_w1_grad), f"w1.grad incorrect: {w1.grad.data}"
    
    return True


def run_all_tests():
    print("Running tensor tests...")
    tests = [
        test_tensor_creation,
        test_basic_operations,
        test_matrix_operations,
        test_activation_functions,
        test_sum_expand,
        test_index_select,
        test_autograd_add,
        test_autograd_mul,
        test_autograd_mm,
        test_autograd_chain
    ]
    
    all_passed = True
    for i, test in enumerate(tests):
        try:
            result = test()
            status = "PASSED" if result else "FAILED"
        except Exception as e:
            result = False
            status = f"ERROR: {str(e)}"
            
        all_passed = all_passed and result
        print(f"  {i+1}. {test.__name__}: {status}")
    
    return all_passed


if __name__ == "__main__":
    success = run_all_tests()
    print(f"\nTensor tests: {'ALL PASSED' if success else 'SOME FAILED'}")
    sys.exit(0 if success else 1)
