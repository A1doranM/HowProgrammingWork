"""
Base Layer class that all neural network layers inherit from.
"""

class Layer:
    """
    A base Layer class that any specific layer (e.g., Linear) can inherit from.
    Typically, it keeps track of a list of parameters,
    and has a method to fetch them for optimization.
    """
    
    def __init__(self):
        # We'll store layer parameters (weights, biases, etc.) in a list
        self.parameters = list()
        
    def get_parameters(self):
        """
        Return the list of parameters for this layer.
        This can be used by an optimizer to update them.
        """
        return self.parameters
    
    def forward(self, input):
        """
        The forward pass of the layer.
        
        Parameters
        ----------
        input : Tensor
            The input tensor to process.
            
        Returns
        -------
        Tensor
            The result of applying this layer to the input.
        """
        raise NotImplementedError("Subclasses must implement forward()")
