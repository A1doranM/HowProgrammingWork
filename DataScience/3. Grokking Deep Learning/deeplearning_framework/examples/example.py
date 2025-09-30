"""
Example usage of the deep learning framework.

This script demonstrates how to create a simple neural network for binary classification,
train it on XOR data, and use it for prediction.
"""

import numpy as np
from deeplearning_framework.tensor import Tensor
from deeplearning_framework.layers import Linear, Tanh, Sigmoid, Sequential
from deeplearning_framework.losses import MSELoss
from deeplearning_framework.optim import SGD


def main():
    # Create a simple dataset for the XOR problem
    data = Tensor(np.array([[0, 0], [0, 1], [1, 0], [1, 1]]), autograd=True)
    target = Tensor(np.array([[0], [1], [1], [0]]), autograd=True)
    
    # Create a neural network with one hidden layer
    model = Sequential([
        Linear(2, 3),  # 2 inputs -> 3 hidden units
        Tanh(),        # Tanh activation
        Linear(3, 1),  # 3 hidden units -> 1 output
        Sigmoid()      # Sigmoid activation for binary classification
    ])
    
    # Define a loss function
    criterion = MSELoss()
    
    # Create an optimizer with a learning rate of 0.1
    optimizer = SGD(parameters=model.get_parameters(), alpha=0.1)
    
    # Training loop
    print("Training the model...")
    for epoch in range(1000):  # Train for 1000 epochs
        # Forward pass: get model predictions
        predictions = model.forward(data)
        
        # Compute loss
        loss = criterion.forward(predictions, target)
        
        # Backward pass: compute gradients
        loss.backward(Tensor(np.ones_like(loss.data)))
        
        # Update parameters
        optimizer.step()
        
        # Print progress every 100 epochs
        if epoch % 100 == 0:
            print(f"Epoch {epoch}, Loss: {loss.data}")
    
    # Print final predictions
    final_predictions = model.forward(data)
    print("\nFinal predictions:")
    for i, (input_data, pred, actual) in enumerate(zip(data.data, final_predictions.data, target.data)):
        print(f"Input: {input_data} -> Predicted: {pred[0]:.4f}, Actual: {actual[0]}")


if __name__ == "__main__":
    main()
