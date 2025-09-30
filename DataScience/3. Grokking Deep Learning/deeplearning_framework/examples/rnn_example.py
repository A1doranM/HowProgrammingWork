"""
Example of using RNN and Embedding layers for a simple text prediction task.

This script demonstrates how to use RNNCell and Embedding layers to build a
simple character-level language model.
"""

import numpy as np
from deeplearning_framework.tensor import Tensor
from deeplearning_framework.layers import RNNCell, Embedding, Linear
from deeplearning_framework.losses import CrossEntropyLoss
from deeplearning_framework.optim import SGD


def process_text(text, seq_length=5):
    """
    Convert text into sequences of character indices for training.
    
    Parameters
    ----------
    text : str
        The input text to process.
    seq_length : int
        Length of sequences to create.
        
    Returns
    -------
    tuple
        (char_to_idx, idx_to_char, sequences, targets)
    """
    # Create character to index mappings
    chars = sorted(list(set(text)))
    char_to_idx = {ch: i for i, ch in enumerate(chars)}
    idx_to_char = {i: ch for i, ch in enumerate(chars)}
    
    # Create sequences and targets
    sequences = []
    targets = []
    
    for i in range(0, len(text) - seq_length):
        # Get a sequence of characters
        seq = text[i:i+seq_length]
        # Target is the next character
        target = text[i+seq_length]
        
        # Convert to indices
        seq_indices = [char_to_idx[ch] for ch in seq]
        target_idx = char_to_idx[target]
        
        sequences.append(seq_indices)
        targets.append(target_idx)
    
    return char_to_idx, idx_to_char, sequences, targets


def main():
    # Sample text for demonstration
    text = "hello world, this is a simple demonstration of RNN capability."
    
    # Process the text
    char_to_idx, idx_to_char, sequences, targets = process_text(text)
    vocab_size = len(char_to_idx)
    embedding_dim = 8
    hidden_dim = 16
    
    # Convert to tensors
    data = Tensor(np.array(sequences), autograd=True)
    target = Tensor(np.array(targets), autograd=True)
    
    # Create model components
    embed = Embedding(vocab_size, embedding_dim)
    rnn = RNNCell(embedding_dim, hidden_dim, vocab_size)
    
    # Create loss and optimizer
    criterion = CrossEntropyLoss()
    
    # Get all parameters to optimize
    parameters = embed.get_parameters() + rnn.get_parameters()
    optimizer = SGD(parameters=parameters, alpha=0.01)
    
    # Training loop
    print("Training the model...")
    for epoch in range(100):
        total_loss = 0
        
        # Mini-batch size (we'll use all data as one batch for simplicity)
        batch_size = len(sequences)
        
        # Initialize hidden state
        hidden = rnn.init_hidden(batch_size)
        
        # Process each character in the sequence one at a time
        for t in range(len(sequences[0])):
            # Get character indices for this time step
            char_indices = Tensor(data.data[:, t], autograd=True)
            
            # Embed the characters
            embedded = embed.forward(char_indices)
            
            # Pass through RNN
            output, hidden = rnn.forward(embedded, hidden)
        
        # After processing the whole sequence, predict the next character
        # and compute loss against the target
        loss = criterion.forward(output, target)
        
        # Backprop
        loss.backward(Tensor(np.ones_like(loss.data)))
        
        # Update parameters
        optimizer.step()
        
        total_loss += loss.data
        
        # Print progress
        if epoch % 10 == 0:
            print(f"Epoch {epoch}, Loss: {total_loss}")
    
    # Generate some text
    print("\nGenerating sample text:")
    
    # Start with a seed sequence
    seed_text = text[:5]
    generated_text = seed_text
    
    # Initialize hidden state for a single sequence
    hidden = rnn.init_hidden(1)
    
    # Build up the hidden state by processing the seed sequence
    for ch in seed_text:
        char_idx = Tensor(np.array([char_to_idx[ch]]), autograd=True)
        embedded = embed.forward(char_idx)
        output, hidden = rnn.forward(embedded, hidden)
    
    # Generate 50 new characters
    for _ in range(50):
        # Get prediction probabilities
        probs = np.exp(output.data) / np.sum(np.exp(output.data))
        
        # Sample a character index based on the probabilities
        next_idx = np.random.choice(len(probs[0]), p=probs[0])
        
        # Convert to character and add to the generated text
        next_char = idx_to_char[next_idx]
        generated_text += next_char
        
        # Prepare for next prediction
        char_idx = Tensor(np.array([next_idx]), autograd=True)
        embedded = embed.forward(char_idx)
        output, hidden = rnn.forward(embedded, hidden)
    
    print(f"Generated text:\n{generated_text}")


if __name__ == "__main__":
    main()
