"""
Container modules that hold other layers.
"""

from .base import Layer


class Sequential(Layer):
    """
    A container that holds multiple layers in sequence.
    When you call 'forward', it feeds data through each layer in turn.
    """

    def __init__(self, layers=None):
        """
        Initialize a Sequential container.
        
        Parameters
        ----------
        layers : list or None
            An optional list of Layer objects to add immediately.
        """
        super().__init__()
        self.layers = [] if layers is None else layers

    def add(self, layer):
        """
        Append another layer to the end of the sequence.
        
        Parameters
        ----------
        layer : Layer
            The layer to add to the sequence.
        """
        self.layers.append(layer)
        
    def forward(self, input):
        """
        Pass the 'input' through each layer in self.layers sequentially.
        The output of each layer becomes the input to the next.
        
        Parameters
        ----------
        input : Tensor
            The input tensor to process.
            
        Returns
        -------
        Tensor
            The result after passing through all layers.
        """
        for layer in self.layers:
            input = layer.forward(input)
        return input
    
    def get_parameters(self):
        """
        Gather parameters from each layer and return them in a single list.
        This allows an optimizer to easily update all layer parameters together.
        
        Returns
        -------
        list
            A list containing all parameters from all layers.
        """
        params = []
        for layer in self.layers:
            params.extend(layer.get_parameters())
        return params
