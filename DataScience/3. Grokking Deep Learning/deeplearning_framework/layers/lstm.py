"""
Long Short-Term Memory (LSTM) implementation.

LSTMs are an advanced form of recurrent neural networks that address the 
vanishing/exploding gradient problem of standard RNNs, allowing them to
learn long-term dependencies in sequential data.
"""

import numpy as np
from ..tensor import Tensor
from .base import Layer
from .linear import Linear

class LSTMCell(Layer):
    """
    Long Short-Term Memory (LSTM) cell implementation.
    
    LSTM architecture works by maintaining two state vectors:
    1. Cell state (c_t): The "memory" that can flow unchanged through time
    2. Hidden state (h_t): The "working memory" output at each time step
    
    Three gates control information flow through the cell:
    - Forget gate: Controls what information to discard from the cell state
    - Input gate: Controls what new information to store in the cell state
    - Output gate: Controls what parts of the cell state to output
    
    This combination of cell state and gates allows LSTM to:
    - Remember information for long sequences (solves vanishing gradient)
    - Selectively update its memory (through gates)
    - Control information flow between time steps
    
    LSTM update equations:
    f_t = σ(W_xf·x_t + W_hf·h_{t-1} + b_f)  # Forget gate
    i_t = σ(W_xi·x_t + W_hi·h_{t-1} + b_i)  # Input gate
    o_t = σ(W_xo·x_t + W_ho·h_{t-1} + b_o)  # Output gate
    g_t = tanh(W_xc·x_t + W_hc·h_{t-1} + b_c)  # Candidate values
    c_t = f_t * c_{t-1} + i_t * g_t  # Cell state update
    h_t = o_t * tanh(c_t)  # Hidden state update
    """
    
    def __init__(self, n_inputs, n_hidden, n_output):
        """
        Initialize an LSTM cell.
        
        Parameters
        ----------
        n_inputs : int
            Dimensionality of the input vector.
        n_hidden : int
            Size of hidden state and cell state vectors.
        n_output : int
            Dimensionality of the output vector.
        """
        super().__init__()

        self.n_inputs = n_inputs
        self.n_hidden = n_hidden
        self.n_output = n_output

        # Forget gate components
        # The forget gate decides what information to discard from the cell state
        self.xf = Linear(n_inputs, n_hidden)  # Input -> Forget gate
        self.hf = Linear(n_hidden, n_hidden, bias=False)  # Hidden -> Forget gate
        
        # Input gate components
        # The input gate decides what new information to store in the cell state
        self.xi = Linear(n_inputs, n_hidden)  # Input -> Input gate
        self.hi = Linear(n_hidden, n_hidden, bias=False)  # Hidden -> Input gate
        
        # Output gate components
        # The output gate decides what to output based on the cell state
        self.xo = Linear(n_inputs, n_hidden)  # Input -> Output gate      
        self.ho = Linear(n_hidden, n_hidden, bias=False)  # Hidden -> Output gate
        
        # Cell/candidate gate components
        # The cell gate creates candidate values to potentially add to cell state
        self.xc = Linear(n_inputs, n_hidden)  # Input -> Cell candidate      
        self.hc = Linear(n_hidden, n_hidden, bias=False)  # Hidden -> Cell candidate
        
        # Output projection to final dimension
        self.w_ho = Linear(n_hidden, n_output, bias=False)
        
        # Collect all parameters
        self.parameters.extend(self.xf.get_parameters())
        self.parameters.extend(self.hf.get_parameters())
        
        self.parameters.extend(self.xi.get_parameters())
        self.parameters.extend(self.hi.get_parameters())     
        
        self.parameters.extend(self.xo.get_parameters())  
        self.parameters.extend(self.ho.get_parameters())    
        
        self.parameters.extend(self.xc.get_parameters())  
        self.parameters.extend(self.hc.get_parameters())          
        
        self.parameters.extend(self.w_ho.get_parameters())        
    
    def forward(self, input, hidden):
        """
        Forward pass for one time step of the LSTM.
        
        Parameters
        ----------
        input : Tensor
            Input tensor of shape (batch_size, n_inputs)
        hidden : tuple of (Tensor, Tensor)
            Tuple containing:
            - Previous hidden state (batch_size, n_hidden)
            - Previous cell state (batch_size, n_hidden)
            
        Returns
        -------
        output : Tensor
            Output tensor of shape (batch_size, n_output)
        next_hidden : tuple of (Tensor, Tensor)
            Tuple containing the new hidden state and cell state
        """
        # Unpack previous states
        prev_hidden = hidden[0]  # Previous hidden state h_{t-1}     
        prev_cell = hidden[1]    # Previous cell state c_{t-1}
        
        # Forget gate calculation
        # f_t = σ(W_xf·x_t + W_hf·h_{t-1} + b_f)
        # Determines what information to discard from the cell state
        # Values close to 1 keep the information, values close to 0 forget it
        f = (self.xf.forward(input) + self.hf.forward(prev_hidden)).sigmoid()
        
        # Input gate calculation
        # i_t = σ(W_xi·x_t + W_hi·h_{t-1} + b_i)
        # Determines what new information to add to the cell state
        # Values close to 1 let information in, values close to 0 block it
        i = (self.xi.forward(input) + self.hi.forward(prev_hidden)).sigmoid()
        
        # Output gate calculation
        # o_t = σ(W_xo·x_t + W_ho·h_{t-1} + b_o)
        # Determines what parts of the cell state to output
        # Values close to 1 let information out, values close to 0 block it
        o = (self.xo.forward(input) + self.ho.forward(prev_hidden)).sigmoid()
        
        # Cell candidate calculation
        # g_t = tanh(W_xc·x_t + W_hc·h_{t-1} + b_c)
        # Creates new candidate values that could be added to the cell state
        # Values are squashed between -1 and 1 with tanh
        g = (self.xc.forward(input) + self.hc.forward(prev_hidden)).tanh()
        
        # Cell state update
        # c_t = f_t * c_{t-1} + i_t * g_t
        # Forgets old information (f_t * c_{t-1}) and adds new information (i_t * g_t)
        # This is the key to LSTM's ability to maintain information over time
        c = (f * prev_cell) + (i * g)

        # Hidden state update
        # h_t = o_t * tanh(c_t)
        # Outputs filtered information based on the cell state
        # The output gate controls what parts of the cell state to expose
        h = o * c.tanh()
        
        # Final output projection
        output = self.w_ho.forward(h)
        
        return output, (h, c)
    
    def init_hidden(self, batch_size=1):
        """
        Initialize hidden state and cell state for a given batch size.
        
        Parameters
        ----------
        batch_size : int
            Number of sequences in a batch
            
        Returns
        -------
        hidden : tuple of (Tensor, Tensor)
            Tuple containing:
            - Initial hidden state (batch_size, n_hidden)
            - Initial cell state (batch_size, n_hidden)
        """
        # Initialize hidden state
        init_hidden = Tensor(np.zeros((batch_size, self.n_hidden)), autograd=True)
        # Initialize cell state
        init_cell = Tensor(np.zeros((batch_size, self.n_hidden)), autograd=True)
        
        # Initialize first elements to 1 for better gradient flow
        init_hidden.data[:, 0] += 1
        init_cell.data[:, 0] += 1
        
        return (init_hidden, init_cell)
