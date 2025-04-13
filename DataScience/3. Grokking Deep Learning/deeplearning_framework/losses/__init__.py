"""
Loss function implementations for neural networks.
"""

from .mse import MSELoss
from .cross_entropy import CrossEntropyLoss

__all__ = [
    'MSELoss',
    'CrossEntropyLoss'
]
