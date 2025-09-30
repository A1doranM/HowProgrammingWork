"""
Stochastic Gradient Descent (SGD) optimizer.
"""


class SGD:
    """
    Implements stochastic gradient descent (SGD) optimization algorithm.
    
    Conceptually, SGD performs the update:
        param = param - learning_rate * gradient
    """
    
    def __init__(self, parameters, alpha=0.1):
        """
        Initialize the SGD optimizer.
        
        Parameters
        ----------
        parameters : list
            List of Tensor objects to optimize. Typically model.get_parameters().
        alpha : float
            Learning rate (step size) for parameter updates.
        """
        self.parameters = parameters
        self.alpha = alpha
    
    def zero(self):
        """
        Reset gradients of all parameters to zero.
        
        This is typically called before computing a new batch of gradients.
        """
        for p in self.parameters:
            if p.grad is not None:
                p.grad.data *= 0
        
    def step(self, zero=False):  # Changed default to False
        """
        Perform one optimization step.
        
        This updates each parameter based on its gradient:
            param.data -= learning_rate * param.grad.data
        
        Parameters
        ----------
        zero : bool
            If True, gradients are set to zero after the update.
            Default is False to preserve gradients for inspection.
        """
        for p in self.parameters:
            if p.grad is not None:
                # The correct update: param -= learning_rate * gradient
                p.data = p.data - self.alpha * p.grad.data
                
                if zero:
                    p.grad.data *= 0
