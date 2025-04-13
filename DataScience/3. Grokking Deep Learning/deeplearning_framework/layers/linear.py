"""
Linear (fully-connected) layer implementation.
"""

import numpy as np
from ..tensor import Tensor
from .base import Layer


class Linear(Layer):
    """
    A 'Linear' layer (also called a fully connected or dense layer).
    y = xW + b
    """

    def __init__(self, n_inputs, n_outputs):
        """
        Parameters
        ----------
        n_inputs : int
            The dimensionality of the input features.
        n_outputs : int
            The number of output features for this linear transform.

        We'll initialize:
          - self.weight: a Tensor of shape (n_inputs, n_outputs)
          - self.bias  : a Tensor of shape (n_outputs,)
        """
        super().__init__()  # Initialize the base Layer

        # Using a random initialization:
        # We scale by sqrt(2/n_inputs) (Kaiming-like init) to help with stable training
        W = np.random.randn(n_inputs, n_outputs) * np.sqrt(2.0 / n_inputs)
        
        # Turn these NumPy arrays into Tensors that track gradients
        self.weight = Tensor(W, autograd=True)
        self.bias = Tensor(np.zeros(n_outputs), autograd=True)
        
        # Register these Tensors as parameters of this layer
        self.parameters.append(self.weight)
        self.parameters.append(self.bias)

    def forward(self, input):
        """
        The forward pass for a linear layer:
        output = input.mm(self.weight) + self.bias

        We expand the bias across dimension 0 to match the batch size
        if input is (batch_size, n_inputs).
        """
        return input.mm(self.weight) + self.bias.expand(0, len(input.data))
