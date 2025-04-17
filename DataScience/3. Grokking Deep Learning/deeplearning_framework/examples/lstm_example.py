"""
Example of using the LSTM cell for a sequence prediction task.
"""

import numpy as np
from deeplearning_framework.tensor import Tensor
from deeplearning_framework.layers.lstm import LSTMCell
from deeplearning_framework.optim.sgd import SGD
from deeplearning_framework.losses.mse import MSELoss

# Define a simple sequence prediction problem
# We'll generate sequences where the next value is the sum of the previous two values
def generate_sequence(seq_length, n_sequences):
    """Generate sequences where y[t] = x[t-1] + x[t-2]"""
    sequences = []
    targets = []
    
    for _ in range(n_sequences):
        # Start with random values
        a, b = np.random.rand(), np.random.rand()
        seq = [a, b]
        
        # Generate the sequence
        for i in range(seq_length - 2):
            next_val = seq[i] + seq[i+1]
            seq.append(next_val)
        
        # Input sequence is all values except the last one
        sequences.append(seq[:-1])
        # Target sequence is all values except the first one
        targets.append(seq[1:])
    
    return np.array(sequences), np.array(targets)

# Parameters
input_size = 1  # Dimension of input feature
hidden_size = 10  # Dimension of hidden state
output_size = 1  # Dimension of output
seq_length = 10  # Length of sequence
batch_size = 16  # Number of sequences in batch
learning_rate = 0.01
epochs = 100

# Generate data
inputs, targets = generate_sequence(seq_length, batch_size)

# Create LSTM model
lstm = LSTMCell(input_size, hidden_size, output_size)

# Create optimizer
optimizer = SGD(parameters=lstm.get_parameters(), alpha=learning_rate)

# Create loss function
criterion = MSELoss()

# Convert data to Tensors
inputs = Tensor(inputs.reshape(batch_size, seq_length-1, 1), autograd=True)
targets = Tensor(targets.reshape(batch_size, seq_length-1, 1), autograd=True)

# Training loop
for epoch in range(epochs):
    total_loss = 0
    
    # Initialize hidden state
    hidden = lstm.init_hidden(batch_size)
    
    # For each time step
    for t in range(seq_length-1):
        # Get current input
        x_t = Tensor(inputs.data[:, t, :], autograd=True)
        # Get target for this time step
        y_t = Tensor(targets.data[:, t, :], autograd=True)
        
        # Forward pass
        output, hidden = lstm.forward(x_t, hidden)
        
        # Calculate loss
        loss = criterion.forward(output, y_t)
        total_loss += loss.data
        
        # Backward pass
        loss.backward(Tensor(np.ones_like(loss.data)))
        
        # Update weights
        optimizer.step()
    
    # Print progress
    if epoch % 10 == 0:
        print(f"Epoch {epoch}, Loss: {total_loss/(seq_length-1)}")

# Testing
print("\nTesting the LSTM with a new sequence:")

# Generate a test sequence
test_a, test_b = 0.3, 0.7
test_seq = [test_a, test_b]
print(f"Starting values: {test_a}, {test_b}")

# Generate the expected sequence
for i in range(seq_length - 2):
    next_val = test_seq[i] + test_seq[i+1]
    test_seq.append(next_val)

# Initialize hidden state
hidden = lstm.init_hidden(1)  # Batch size of 1

# Perform prediction one step at a time
predictions = [test_a, test_b]
current_a, current_b = test_a, test_b

for i in range(seq_length - 2):
    # Create input tensor with shape (batch_size=1, input_size=1)
    x = Tensor(np.array([[current_b]]), autograd=True)
    
    # Get prediction
    output, hidden = lstm.forward(x, hidden)
    
    # Extract prediction value
    pred = output.data[0, 0]
    predictions.append(pred)
    
    # Update for next iteration
    current_a, current_b = current_b, pred

# Print results comparison
print("Expected sequence vs LSTM predictions:")
for i, (expected, predicted) in enumerate(zip(test_seq, predictions)):
    print(f"Step {i}: Expected = {expected:.6f}, Predicted = {predicted:.6f}, Diff = {abs(expected-predicted):.6f}")

"""
LSTM vs Simple RNN Comparison:

The key advantages of LSTM over simple RNNs demonstrated in this example:

1. Long-term Dependencies: 
   - LSTMs can maintain information over many time steps through the cell state
   - Standard RNNs struggle with dependencies beyond a few steps

2. Controlled Information Flow:
   - The forget gate allows discarding irrelevant information
   - The input gate carefully controls what new information to add
   - The output gate selectively reveals parts of the internal state

3. Gradient Flow:
   - The cell state provides an uninterrupted gradient highway
   - This prevents vanishing/exploding gradients in long sequences
   - Makes LSTMs much more effective for training on long sequences

4. Memory Capacity:
   - LSTM's explicit memory mechanism gives it higher capacity
   - It can handle more complex patterns and longer-term dependencies

When to use LSTMs:
- Long sequences where distant information matters
- Tasks requiring selective memory (ignoring noise)
- Complex sequential patterns
- When simple RNNs fail to converge or perform poorly
"""
