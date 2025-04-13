"""
Cross Entropy Loss with integrated softmax.
"""


class CrossEntropyLoss:
    """
    Computes the cross entropy loss between inputs (logits) and targets (class indices).
    Internally applies softmax to the inputs before computing the loss.
    
    Cross entropy loss is commonly used for classification tasks.
    """
    
    def __init__(self):
        """
        Initialize the cross entropy loss.
        """
        pass
    
    def forward(self, input, target):
        """
        Compute cross entropy loss with softmax.
        
        This performs:
        1. Apply softmax to input (logits)
        2. Convert target indices to one-hot
        3. Compute -log(probability) of the true class
        4. Return the mean loss across the batch
        
        Parameters
        ----------
        input : Tensor
            Unnormalized logits from the model, typically the output 
            of the last linear layer, shape (batch_size, num_classes).
        target : Tensor
            Class indices (not one-hot), shape (batch_size,).
            
        Returns
        -------
        Tensor
            A scalar tensor containing the cross entropy loss.
        """
        return input.cross_entropy(target)
