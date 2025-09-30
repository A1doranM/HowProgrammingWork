"""
Deep learning framework with autograd support.
Based on the implementation from Grokking Deep Learning, Chapter 13.
"""

from .tensor import Tensor

# Import main components for easier access
from .layers import Layer, Linear, Sigmoid, Tanh, Sequential, Embedding, RNNCell
from .losses import MSELoss, CrossEntropyLoss
from .optim import SGD

# Expose key classes at the package level
__all__ = [
    'Tensor',
    # Layers
    'Layer',
    'Linear',
    'Sigmoid',
    'Tanh',
    'Sequential',
    'Embedding',
    'RNNCell',
    # Losses
    'MSELoss',
    'CrossEntropyLoss',
    # Optimizers
    'SGD'
]
