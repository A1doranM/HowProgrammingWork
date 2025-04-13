"""
Embedding layer for mapping discrete indices to dense vectors.
"""

import numpy as np
from ..tensor import Tensor
from .base import Layer


class Embedding(Layer):
    """
    An embedding layer that maps indices to dense vectors.
    Often used for word embeddings in NLP tasks.
    """
    
    def __init__(self, vocab_size, dim):
        """
        Initialize an embedding layer.
        
        Parameters
        ----------
        vocab_size : int
            Size of the vocabulary (number of possible indices).
        dim : int
            Dimensionality of the embedding vectors.
        """
        super().__init__()
        
        self.vocab_size = vocab_size
        self.dim = dim
        
        # Initialize embedding weights with a conventional approach from word2vec
        # Scale is (-0.5/dim, 0.5/dim) to keep initial values small
        weight_data = (np.random.rand(vocab_size, dim) - 0.5) / dim
        self.weight = Tensor(weight_data, autograd=True)
        
        # Add the embedding weight to parameters for optimization
        self.parameters.append(self.weight)
    
    def forward(self, input):
        """
        Maps input indices to their corresponding embedding vectors.
        
        Parameters
        ----------
        input : Tensor
            A tensor of indices, shape (batch_size,) or (batch_size, seq_len).
            
        Returns
        -------
        Tensor
            The embedded vectors, shape (batch_size, dim) or (batch_size, seq_len, dim).
        """
        return self.weight.index_select(input)
