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
        return the sum of squared errors: ((pred - target)^2).sum(0)

        Parameters
        ----------
        pred : Tensor
            Predicted values from the model, shape (batch_size, num_outputs).
        target : Tensor
            Target values (ground truth), shape (batch_size, num_outputs).

        Returns
        -------
        Tensor
            A scalar tensor containing the MSE loss.
        """
        return ((pred - target) * (pred - target)).sum(0)
