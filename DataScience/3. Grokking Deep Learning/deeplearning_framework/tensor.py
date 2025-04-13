"""
Tensor implementation with autograd support.
"""

import numpy as np


class Tensor:
    """
    A Tensor class supporting auto-differentiation for various operations:
    +, -, *, matrix multiply (mm), sum/expand, transpose, neg, sigmoid, tanh,
    index_select, and cross_entropy for classification tasks.
    """

    def __init__(self, data,
                 autograd=False,
                 creators=None,
                 creation_op=None,
                 id=None):
        """
        Parameters
        ----------
        data : array-like
            NumPy array storing numerical values for this Tensor.
        autograd : bool
            If True, we track gradients (auto-diff).
        creators : list or None
            Parent Tensors involved in creating this one.
        creation_op : str or None
            The operation name that led to this Tensor's creation (e.g., "add", "cross_entropy").
        id : int or None
            Unique ID for the Tensor. If None, a random ID is assigned.
        """
        self.data = np.array(data)
        self.autograd = autograd
        self.grad = None

        # Assign or generate an ID
        if id is None:
            self.id = np.random.randint(0, 100000)
        else:
            self.id = id
        
        self.creators = creators
        self.creation_op = creation_op
        # children[id] = how many grads we expect from that child
        self.children = {}
        
        # If we have parent Tensors, register this as a child to them
        if creators is not None:
            for c in creators:
                if self.id not in c.children:
                    c.children[self.id] = 1
                else:
                    c.children[self.id] += 1

    def all_children_grads_accounted_for(self):
        """
        Check if we've received gradients from all child Tensors.
        Returns True if none are pending.
        """
        for id, cnt in self.children.items():
            if cnt != 0:
                return False
        return True 
        
    def backward(self, grad=None, grad_origin=None):
        """
        The main backprop method. Takes an incoming gradient (grad) from a child,
        accumulates it in self.grad, and then, if all child grads are in,
        applies chain rule logic to pass gradients back to parent Tensors.
        """
        if self.autograd:

            # Default to a Tensor of ones if no grad is provided
            if grad is None:
                grad = Tensor(np.ones_like(self.data))

            # Decrement child's expected gradient count
            if grad_origin is not None:
                if self.children[grad_origin.id] == 0:
                    raise Exception("cannot backprop more than once from the same child")
                else:
                    self.children[grad_origin.id] -= 1

            # Accumulate gradient in self.grad
            if self.grad is None:
                self.grad = grad
            else:
                self.grad += grad
            
            # The incoming gradient should not require grad
            assert grad.autograd == False
            
            # If all child gradients are accounted for or there's a direct call:
            if (self.creators is not None
                and (self.all_children_grads_accounted_for() or grad_origin is None)):

                # Apply chain rule depending on creation_op
                if self.creation_op == "add":
                    # grad splits to both parents unchanged
                    self.creators[0].backward(self.grad, self)
                    self.creators[1].backward(self.grad, self)
                    
                elif self.creation_op == "sub":
                    # x - y => partial wrt x is +grad, wrt y is -grad
                    self.creators[0].backward(Tensor(self.grad.data), self)
                    self.creators[1].backward(Tensor((-self.grad).data), self)

                elif self.creation_op == "mul":
                    # x * y => partial wrt x is grad * y, wrt y is grad * x
                    new = self.grad * self.creators[1]
                    self.creators[0].backward(new, self)
                    new = self.grad * self.creators[0]
                    self.creators[1].backward(new, self)                    
                    
                elif self.creation_op == "mm":
                    # z = x.mm(y)
                    # partial wrt x => grad.mm(y^T), wrt y => x^T.mm(grad)
                    c0 = self.creators[0]
                    c1 = self.creators[1]

                    new = self.grad.mm(c1.transpose())
                    c0.backward(new)
                    new = self.grad.transpose().mm(c0).transpose()
                    c1.backward(new)
                    
                elif self.creation_op == "transpose":
                    # partial wrt x => grad.transpose()
                    self.creators[0].backward(self.grad.transpose())

                elif ("sum" in self.creation_op):
                    # sum_<dim>
                    dim = int(self.creation_op.split("_")[1])
                    expanded = self.grad.expand(dim, self.creators[0].data.shape[dim])
                    self.creators[0].backward(expanded)

                elif ("expand" in self.creation_op):
                    # partial wrt x => grad.sum(dim)
                    dim = int(self.creation_op.split("_")[1])
                    self.creators[0].backward(self.grad.sum(dim))
                    
                elif self.creation_op == "neg":
                    # partial wrt x => -grad
                    self.creators[0].backward(self.grad.__neg__())
                    
                elif self.creation_op == "sigmoid":
                    # z = sigmoid(x), partial wrt x => grad * z*(1-z)
                    ones = Tensor(np.ones_like(self.grad.data))
                    self.creators[0].backward(self.grad * (self * (ones - self)))
                
                elif self.creation_op == "tanh":
                    # z = tanh(x), partial wrt x => grad * (1 - z^2)
                    ones = Tensor(np.ones_like(self.grad.data))
                    self.creators[0].backward(self.grad * (ones - (self * self)))
                
                elif self.creation_op == "index_select":
                    # route grad back to correct indices
                    new_grad = np.zeros_like(self.creators[0].data)
                    indices_ = self.index_select_indices.data.flatten()
                    grad_ = self.grad.data.reshape(len(indices_), -1)
                    for i in range(len(indices_)):
                        new_grad[indices_[i]] += grad_[i]
                    self.creators[0].backward(Tensor(new_grad))
                    
                elif self.creation_op == "cross_entropy":
                    # Cross entropy with softmax:
                    # partial wrt input => (softmax_output - target_dist)
                    dx = self.softmax_output - self.target_dist
                    self.creators[0].backward(Tensor(dx))

    # ----------------------
    # Overloaded Operators
    # ----------------------

    def __add__(self, other):
        if self.autograd and other.autograd:
            return Tensor(self.data + other.data,
                          autograd=True,
                          creators=[self, other],
                          creation_op="add")
        return Tensor(self.data + other.data)

    def __neg__(self):
        if self.autograd:
            return Tensor(-self.data,
                          autograd=True,
                          creators=[self],
                          creation_op="neg")
        return Tensor(-self.data)
    
    def __sub__(self, other):
        if self.autograd and other.autograd:
            return Tensor(self.data - other.data,
                          autograd=True,
                          creators=[self, other],
                          creation_op="sub")
        return Tensor(self.data - other.data)
    
    def __mul__(self, other):
        if self.autograd and other.autograd:
            return Tensor(self.data * other.data,
                          autograd=True,
                          creators=[self, other],
                          creation_op="mul")
        return Tensor(self.data * other.data)

    # ----------------------
    # Summation / Expand
    # ----------------------
    def sum(self, dim):
        """
        Summation along dimension 'dim'. We'll store 'sum_<dim>' in creation_op
        to handle backprop shape expansions.
        """
        if self.autograd:
            return Tensor(self.data.sum(dim),
                          autograd=True,
                          creators=[self],
                          creation_op="sum_" + str(dim))
        return Tensor(self.data.sum(dim))
    
    def expand(self, dim, copies):
        """
        Expand (repeat) data along dimension 'dim' 'copies' times,
        helpful for broadcasting-like operations.
        """
        trans_cmd = list(range(len(self.data.shape)))
        trans_cmd.insert(dim, len(self.data.shape))
        new_data = self.data.repeat(copies).reshape(list(self.data.shape) + [copies])
        new_data = new_data.transpose(trans_cmd)
        
        if self.autograd:
            return Tensor(new_data,
                          autograd=True,
                          creators=[self],
                          creation_op="expand_" + str(dim))
        return Tensor(new_data)

    # ----------------------
    # Transpose / MatMul
    # ----------------------
    def transpose(self):
        """
        Return a transposed view of this Tensor's data.
        """
        if self.autograd:
            return Tensor(self.data.transpose(),
                          autograd=True,
                          creators=[self],
                          creation_op="transpose")
        return Tensor(self.data.transpose())
    
    def mm(self, x):
        """
        Matrix multiply: self.data.dot(x.data).
        """
        if self.autograd:
            return Tensor(self.data.dot(x.data),
                          autograd=True,
                          creators=[self, x],
                          creation_op="mm")
        return Tensor(self.data.dot(x.data))

    # ----------------------
    # Nonlinearities
    # ----------------------
    def sigmoid(self):
        if self.autograd:
            return Tensor(1 / (1 + np.exp(-self.data)),
                          autograd=True,
                          creators=[self],
                          creation_op="sigmoid")
        return Tensor(1 / (1 + np.exp(-self.data)))

    def tanh(self):
        if self.autograd:
            return Tensor(np.tanh(self.data),
                          autograd=True,
                          creators=[self],
                          creation_op="tanh")
        return Tensor(np.tanh(self.data))
    
    # ----------------------
    # Indexing
    # ----------------------
    def index_select(self, indices):
        """
        Return a new Tensor by indexing self at positions given by 'indices'.
        """
        if self.autograd:
            new = Tensor(self.data[indices.data],
                         autograd=True,
                         creators=[self],
                         creation_op="index_select")
            new.index_select_indices = indices
            return new
        return Tensor(self.data[indices.data])

    # ----------------------
    # Cross Entropy
    # ----------------------
    def cross_entropy(self, target_indices):
        """
        Cross entropy loss with softmax:
        1) Compute softmax of self.data
        2) Gather targets from 'target_indices'
        3) Compute loss = - log(prob_of_true_class), averaged over batch
        4) In backprop, we do (softmax_output - one_hot_targets)
        """
        temp = np.exp(self.data)
        softmax_output = temp / np.sum(temp,
                                       axis=len(self.data.shape) - 1,
                                       keepdims=True)
        
        # Flattening target indices for simple indexing
        t = target_indices.data.flatten()
        # Reshape the softmax output to match: (batch_size, num_classes)
        p = softmax_output.reshape(len(t), -1)
        # Build one-hot target distribution
        target_dist = np.eye(p.shape[1])[t]
        
        # Cross entropy: -sum( log(prob_of_true_class) ), average over batch
        loss = -(np.log(p) * target_dist).sum(1).mean()
    
        if self.autograd:
            out = Tensor(loss,
                         autograd=True,
                         creators=[self],
                         creation_op="cross_entropy")
            # Store the softmax distribution and the target distribution
            # so we can do backprop: grad = (softmax_output - target_dist)
            out.softmax_output = softmax_output
            out.target_dist = target_dist
            return out

        # If not autograd, return a plain Tensor with no backprop references
        return Tensor(loss)
        
    # ----------------------
    # String / Debug
    # ----------------------
    def __repr__(self):
        return str(self.data.__repr__())
    
    def __str__(self):
        return str(self.data.__str__())
