"""
Recurrent Neural Network (RNN) implementations.
"""

import numpy as np
from ..tensor import Tensor
from .base import Layer
from .linear import Linear
from .activations import Sigmoid, Tanh


class RNNCell(Layer):
    """
    A single RNN cell that processes one time step of the data.
    It takes the current input and the previous hidden state,
    and outputs the new hidden state along with an output vector.
    
    Formally:
      hidden_t = activation(input_t * W_ih + hidden_(t-1) * W_hh)
      output_t = hidden_t * W_ho
    """

    def __init__(self, n_inputs, n_hidden, n_output, activation='sigmoid'):
        """
        Parameters
        ----------
        n_inputs : int
            Dimensionality of each input vector.
        n_hidden : int
            Size of the hidden state (number of hidden units).
        n_output : int
            Size of the output vector for each time step.
        activation : str
            Which nonlinear function to apply in the hidden update ('sigmoid' or 'tanh').
        """
        super().__init__()

        self.n_inputs = n_inputs
        self.n_hidden = n_hidden
        self.n_output = n_output
        
        # Choose either Sigmoid or Tanh for the hidden state activation
        if activation == 'sigmoid':
            self.activation = Sigmoid()
        elif activation == 'tanh':
            self.activation = Tanh()
        else:
            raise ValueError("Non-linearity not found. Use 'sigmoid' or 'tanh'.")

        # Linear transformations:
        # w_ih: transforms input vector to hidden dimension
        self.w_ih = Linear(n_inputs, n_hidden)
        # w_hh: transforms previous hidden to next hidden
        self.w_hh = Linear(n_hidden, n_hidden)
        # w_ho: transforms hidden state to output dimension
        self.w_ho = Linear(n_hidden, n_output)
        
        # Add all parameters (weights and biases) to self.parameters for easy access
        self.parameters.extend(self.w_ih.get_parameters())
        self.parameters.extend(self.w_hh.get_parameters())
        self.parameters.extend(self.w_ho.get_parameters())
    
    def forward(self, input, hidden):
        """
        Forward pass for one time step.

        Parameters
        ----------
        input : Tensor
            The input vector for this time step (batch_size, n_inputs).
        hidden : Tensor
            The previous hidden state (batch_size, n_hidden).
        
        Returns
        -------
        output : Tensor
            The output vector for this time step (batch_size, n_output).
        new_hidden : Tensor
            The new hidden state (batch_size, n_hidden).
        """
        # Transform the previous hidden state: hidden_(t-1) => next hidden
        from_prev_hidden = self.w_hh.forward(hidden)
        
        # Transform the input: input_t => hidden dimension
        from_input = self.w_ih.forward(input)
        
        # Combine them by addition, then apply the activation
        combined = from_input + from_prev_hidden
        new_hidden = self.activation.forward(combined)

        # Finally, transform hidden => output dimension
        output = self.w_ho.forward(new_hidden)
        
        return output, new_hidden
    
    def init_hidden(self, batch_size=1):
        """
        Initialize a zero hidden state for a given batch size.

        Parameters
        ----------
        batch_size : int
            The number of sequences in the batch.

        Returns
        -------
        hidden : Tensor
            A (batch_size, n_hidden)-shaped Tensor of zeros.
        """
        return Tensor(np.zeros((batch_size, self.n_hidden)), autograd=True)
