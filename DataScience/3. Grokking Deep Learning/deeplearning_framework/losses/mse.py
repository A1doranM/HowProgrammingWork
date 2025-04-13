"""
Mean Squared Error (MSE) loss implementation.
"""

from ..layers.base import Layer


class MSELoss(Layer):
    """
    A layer that computes the Mean Squared Error (MSE) loss
    between predictions (pred) and targets (target).
    
    MSE = mean((pred - target)^2)
    """

    def __init__(self):
        """
        Initialize the MSE loss layer.
        """
        super().__init__()  # We don't have any parameters in this layer.

    def forward(self, pred, target):
        """
        Given predicted values 'pred' and true values 'target',
        compute the mean squared error loss.

        Parameters
        ----------
        pred : Tensor
            Predicted values from the model, shape (batch_size, num_outputs).
        target : Tensor
            Target values (ground truth), shape (batch_size, num_outputs).

        Returns
        -------
        Tensor
            A scalar tensor containing the MSE loss, calculated as:
            sum((pred - target)^2) across all elements.
        """
        # Calculate squared differences
        squared_diff = (pred - target) * (pred - target)
        
        # Sum across all dimensions to get a scalar
        # First sum over features (dim=1 if it exists), then sum over batch (dim=0)
        if len(squared_diff.data.shape) > 1:
            # Sum over feature dimension first (dim=1)
            feature_sum = squared_diff.sum(1)
            # Then sum over batch dimension (dim=0)
            return feature_sum.sum(0)
        else:
            # If only one dimension, just sum over it (dim=0)
            return squared_diff.sum(0)
