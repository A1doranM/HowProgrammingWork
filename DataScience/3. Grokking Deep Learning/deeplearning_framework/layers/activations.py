"""
Activation functions for neural networks.
"""

from .base import Layer


class Sigmoid(Layer):
    """
    A layer that applies the sigmoid activation function to its input.
    
    Sigmoid: f(x) = 1 / (1 + e^(-x))
    Range: (0, 1)
    """
    
    def __init__(self):
        super().__init__()
    
    def forward(self, input):
        """
        Apply sigmoid activation to the input tensor.
        
        Parameters
        ----------
        input : Tensor
            Input tensor of any shape.
            
        Returns
        -------
        Tensor
            The sigmoid of each element in the input.
        """
        return input.sigmoid()


class Tanh(Layer):
    """
    A layer that applies the hyperbolic tangent activation function to its input.
    
    Tanh: f(x) = (e^x - e^(-x)) / (e^x + e^(-x))
    Range: (-1, 1)
    """
    
    def __init__(self):
        super().__init__()
    
    def forward(self, input):
        """
        Apply tanh activation to the input tensor.
        
        Parameters
        ----------
        input : Tensor
            Input tensor of any shape.
            
        Returns
        -------
        Tensor
            The tanh of each element in the input.
        """
        return input.tanh()
