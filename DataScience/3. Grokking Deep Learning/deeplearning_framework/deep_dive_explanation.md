# Deep Dive into the Neural Network Framework

This document provides a comprehensive explanation of how the custom deep learning framework works, focusing on forward propagation, backpropagation, weight updates, and the automatic differentiation system.

## 1. Introduction to the Framework

Our deep learning framework is a lightweight implementation that provides the core functionality needed to build, train, and deploy neural networks. The framework is structured similarly to PyTorch but simplified for educational purposes. It includes:

- A `Tensor` class with automatic differentiation capabilities
- Various neural network layers (Linear, Sigmoid, Tanh, etc.)
- Loss functions (MSE, Cross-Entropy)
- Optimization algorithms (SGD)

The framework is designed to illustrate the key concepts behind deep learning libraries while maintaining clarity and simplicity in the implementation.

## 2. The Tensor Class: Core Building Block

At the heart of the framework is the `Tensor` class, which serves as the foundational building block for all operations.

### 2.1 Data Representation

A `Tensor` encapsulates:
- `data`: The actual numerical values (stored as a NumPy array)
- `autograd`: A flag indicating whether this tensor requires gradient computation
- `grad`: Storage for the computed gradients
- `creators`: References to parent tensors that created this tensor
- `creation_op`: The operation that created this tensor
- `children`: A dictionary tracking which tensors depend on this tensor
- `id`: A unique identifier for the tensor

```python
def __init__(self, data,
             autograd=False,
             creators=None,
             creation_op=None,
             id=None):
    self.data = np.array(data)
    self.autograd = autograd
    self.grad = None
    self.creators = creators
    self.creation_op = creation_op
    self.children = {}
    
    # Assign or generate an ID
    if id is None:
        self.id = np.random.randint(0, 100000)
    else:
        self.id = id
```

### 2.2 Automatic Differentiation Implementation

The framework implements reverse-mode automatic differentiation (autograd), which is more efficient for neural networks where we typically have many parameters but a single scalar loss output.

Key concepts:
1. **Computational Graph**: During forward computations, the framework constructs a directed acyclic graph (DAG) of operations.
2. **Parent-Child Relationships**: Each tensor tracks its creators (parents) and dependents (children).
3. **Gradient Accumulation**: Gradients from multiple paths are accumulated.

When an operation creates a new tensor, it:
1. Sets the `creators` to reference the input tensors
2. Sets the `creation_op` to identify the operation type
3. Registers itself as a child of its creator tensors

```python
# When creating a new tensor from an operation (e.g., addition)
if self.autograd and other.autograd:
    return Tensor(self.data + other.data,
                  autograd=True,
                  creators=[self, other],
                  creation_op="add")
```

### 2.3 The Backward Method

The `backward` method is where the magic of automatic differentiation happens:

```python
def backward(self, grad=None, grad_origin=None):
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
        
        # If all child gradients are accounted for:
        if (self.creators is not None and
            (self.all_children_grads_accounted_for() or grad_origin is None)):
            
            # Apply chain rule based on creation_op
            # (Different logic for add, mul, mm, etc.)
            # ...
```

The backward method applies the chain rule based on the operation type:

1. It receives a gradient from a child tensor
2. It accumulates the gradient if multiple children provide gradients
3. It checks if all expected gradients from children have been received
4. It computes the gradients with respect to its creators (parents)
5. It calls backward on its parent tensors, passing the appropriate gradients

Different operations have different gradient computation rules:
- For addition (`add`): The gradient passes unchanged to both parents
- For multiplication (`mul`): Each parent receives the gradient multiplied by the other parent
- For matrix multiplication (`mm`): More complex calculation involving transposes
- For activations: The gradient is modified based on the derivative of the activation function

## 3. Neural Network Architecture

### 3.1 Layer Abstraction

The framework uses a `Layer` base class that all specific layers inherit from:

```python
class Layer:
    def __init__(self):
        self.parameters = list()
        
    def get_parameters(self):
        return self.parameters
    
    def forward(self, input):
        raise NotImplementedError("Subclasses must implement forward()")
```

Each layer:
- Maintains a list of its parameters (weights, biases)
- Implements a `forward` method to process input data
- Provides a `get_parameters` method to access its parameters for optimization

### 3.2 Layer Implementations

#### Linear Layer

The `Linear` layer (also called a fully connected or dense layer) implements a linear transformation:

```python
class Linear(Layer):
    def __init__(self, n_inputs, n_outputs):
        super().__init__()
        
        # Initialize weights with Kaiming-like initialization
        W = np.random.randn(n_inputs, n_outputs) * np.sqrt(2.0 / n_inputs)
        
        # Create Parameter tensors with autograd enabled
        self.weight = Tensor(W, autograd=True)
        self.bias = Tensor(np.zeros(n_outputs), autograd=True)
        
        # Register parameters
        self.parameters.append(self.weight)
        self.parameters.append(self.bias)

    def forward(self, input):
        # output = input.mm(self.weight) + self.bias
        return input.mm(self.weight) + self.bias.expand(0, len(input.data))
```

The `Linear` layer:
1. Initializes weights according to a scaled normal distribution to help with training stability
2. Creates a bias vector initialized to zeros
3. Registers both as parameters
4. In the forward pass, performs the computation: output = input × weight + bias

#### Activation Layers

Activation layers apply non-linear transformations:

```python
class Sigmoid(Layer):
    def __init__(self):
        super().__init__()
    
    def forward(self, input):
        return input.sigmoid()

class Tanh(Layer):
    def __init__(self):
        super().__init__()
    
    def forward(self, input):
        return input.tanh()
```

These layers don't have parameters but apply their respective non-linear functions to the input.

### 3.3 Sequential Container

The `Sequential` container combines multiple layers into a single model:

```python
class Sequential(Layer):
    def __init__(self, layers=None):
        super().__init__()
        self.layers = [] if layers is None else layers

    def forward(self, input):
        for layer in self.layers:
            input = layer.forward(input)
        return input
    
    def get_parameters(self):
        params = []
        for layer in self.layers:
            params.extend(layer.get_parameters())
        return params
```

The `Sequential` container:
1. Takes a list of layers as input
2. In the forward pass, passes the input through each layer in sequence
3. Collects parameters from all contained layers for optimization

### 3.4 Recurrent Neural Networks (RNNs)

RNNs are specialized neural networks designed to process sequential data by maintaining a "memory" of previous inputs through a hidden state.

#### 3.4.1 Basic RNN Cell

The RNN cell processes one element of a sequence at a time, updating its hidden state:

```python
class RNNCell(Layer):
    def __init__(self, n_inputs, n_hidden, n_output, activation='sigmoid'):
        super().__init__()
        
        self.n_inputs = n_inputs
        self.n_hidden = n_hidden
        self.n_output = n_output
        
        # Choose activation function
        self.activation = Sigmoid() if activation == 'sigmoid' else Tanh()

        # Linear transformations
        self.w_ih = Linear(n_inputs, n_hidden)  # input -> hidden
        self.w_hh = Linear(n_hidden, n_hidden)  # hidden -> hidden
        self.w_ho = Linear(n_hidden, n_output)  # hidden -> output
        
        # Register parameters
        self.parameters.extend(self.w_ih.get_parameters())
        self.parameters.extend(self.w_hh.get_parameters())
        self.parameters.extend(self.w_ho.get_parameters())
    
    def forward(self, input, hidden):
        # Transform previous hidden state
        from_prev_hidden = self.w_hh.forward(hidden)
        # Transform current input
        from_input = self.w_ih.forward(input)
        # Combine and apply activation
        new_hidden = self.activation.forward(from_input + from_prev_hidden)
        # Generate output
        output = self.w_ho.forward(new_hidden)
        
        return output, new_hidden
```

The RNN update equation is:
- h_t = activation(W_ih · x_t + W_hh · h_{t-1})
- y_t = W_ho · h_t

where:
- x_t is the input at time t
- h_t is the hidden state at time t
- y_t is the output at time t

#### 3.4.2 The Vanishing/Exploding Gradient Problem

Standard RNNs suffer from the vanishing/exploding gradient problem during backpropagation through time:

1. **Vanishing Gradients**: When repeatedly multiplying small values (<1) during backpropagation, gradients approach zero exponentially, making it impossible to learn long-term dependencies.

2. **Exploding Gradients**: When repeatedly multiplying large values (>1), gradients grow exponentially, causing instability in training.

This limitation makes standard RNNs ineffective for learning dependencies across many time steps.

#### 3.4.3 Long Short-Term Memory (LSTM)

LSTM networks address the vanishing gradient problem through a more complex architecture with gates and a cell state.

```python
class LSTMCell(Layer):
    def __init__(self, n_inputs, n_hidden, n_output):
        super().__init__()
        
        # Input transformations (x -> gates)
        self.xf = Linear(n_inputs, n_hidden)  # Forget gate
        self.xi = Linear(n_inputs, n_hidden)  # Input gate
        self.xo = Linear(n_inputs, n_hidden)  # Output gate      
        self.xc = Linear(n_inputs, n_hidden)  # Cell candidate
        
        # Hidden state transformations (h -> gates)
        self.hf = Linear(n_hidden, n_hidden, bias=False)  # Forget gate
        self.hi = Linear(n_hidden, n_hidden, bias=False)  # Input gate
        self.ho = Linear(n_hidden, n_hidden, bias=False)  # Output gate
        self.hc = Linear(n_hidden, n_hidden, bias=False)  # Cell candidate
        
        # Output projection
        self.w_ho = Linear(n_hidden, n_output, bias=False)
        
        # Register parameters
        # ... (collecting parameters from all Linear layers)
    
    def forward(self, input, hidden):
        # Unpack hidden state and cell state
        prev_hidden, prev_cell = hidden
        
        # Gate computations (each with sigmoid activation)
        f = (self.xf.forward(input) + self.hf.forward(prev_hidden)).sigmoid()  # Forget gate
        i = (self.xi.forward(input) + self.hi.forward(prev_hidden)).sigmoid()  # Input gate
        o = (self.xo.forward(input) + self.ho.forward(prev_hidden)).sigmoid()  # Output gate
        
        # Cell candidate computation (with tanh activation)
        g = (self.xc.forward(input) + self.hc.forward(prev_hidden)).tanh()
        
        # Update cell state: forget old information + add new information
        c = (f * prev_cell) + (i * g)
        
        # Update hidden state based on cell state filtered by output gate
        h = o * c.tanh()
        
        # Project to output dimension
        output = self.w_ho.forward(h)
        
        return output, (h, c)
```

**LSTM Architecture Components:**

1. **Cell State (c_t)**: The key innovation of LSTM - a separate memory pipeline that can maintain information over many time steps.

2. **Gates**: Three sigmoid-activated gates control information flow:
   - **Forget Gate (f_t)**: Controls what to discard from the cell state
   - **Input Gate (i_t)**: Controls what new information to add to the cell state
   - **Output Gate (o_t)**: Controls what parts of the cell state to expose as output

3. **Cell Candidate (g_t)**: A tanh-activated layer creating new candidate values for the cell state

**LSTM Update Equations:**
- f_t = σ(W_xf · x_t + W_hf · h_{t-1} + b_f)
- i_t = σ(W_xi · x_t + W_hi · h_{t-1} + b_i)
- o_t = σ(W_xo · x_t + W_ho · h_{t-1} + b_o)
- g_t = tanh(W_xc · x_t + W_hc · h_{t-1} + b_c)
- c_t = f_t ⊙ c_{t-1} + i_t ⊙ g_t
- h_t = o_t ⊙ tanh(c_t)

where ⊙ represents element-wise multiplication.

**Advantages of LSTM over Standard RNNs:**

1. **Long-Term Dependencies**: The cell state provides a highway for information to flow unchanged, allowing LSTMs to learn dependencies across hundreds of time steps.

2. **Selective Memory**: Gates allow the network to selectively remember or forget information, making it more adaptable to different sequence lengths and patterns.

3. **Gradient Flow**: The cell state pathway helps gradients flow back through time without vanishing, enabling effective learning from long sequences.

4. **Performance**: LSTMs consistently outperform standard RNNs on tasks requiring memory of events separated by many time steps.

Despite having more parameters than standard RNNs, the improved capability to model long-term dependencies makes LSTMs the preferred choice for many sequence modeling tasks, including language modeling, speech recognition, time series prediction, and more.

## 4. Forward Propagation

Forward propagation is the process of computing the output of the network for a given input. Let's examine this process using the XOR example:

```python
# Create a neural network with one hidden layer
model = Sequential([
    Linear(2, 3),  # 2 inputs -> 3 hidden units
    Tanh(),        # Tanh activation
    Linear(3, 1),  # 3 hidden units -> 1 output
    Sigmoid()      # Sigmoid activation for binary classification
])
```

For an input sample [0, 1]:

1. **Linear Layer 1**:
   - Input: [0, 1]
   - Operation: output = input.mm(weight) + bias
   - If weights = [[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]] and bias = [0.1, 0.2, 0.3]
   - Output: [0, 1].mm([[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]]) + [0.1, 0.2, 0.3]
   - Output: [0.5, 0.7, 0.9]

2. **Tanh Activation**:
   - Input: [0.5, 0.7, 0.9]
   - Operation: tanh(input)
   - Output: [0.462, 0.604, 0.716]

3. **Linear Layer 2**:
   - Input: [0.462, 0.604, 0.716]
   - Operation: output = input.mm(weight) + bias
   - If weights = [[0.7], [0.8], [0.9]] and bias = [0.1]
   - Output: [0.462, 0.604, 0.716].mm([[0.7], [0.8], [0.9]]) + [0.1]
   - Output: [1.723]

4. **Sigmoid Activation**:
   - Input: [1.723]
   - Operation: sigmoid(input)
   - Output: [0.848]

So the final prediction for input [0, 1] would be approximately 0.848, which is close to the target value of 1 for the XOR problem.

During forward propagation, each tensor operation:
1. Performs the required mathematical calculation
2. Creates a new tensor with the result
3. Sets up the computational graph by:
   - Setting the creator reference
   - Setting the creation operation
   - Registering as a child of the input tensors

This computational graph will later be used for backpropagation.

## 5. Backpropagation (Backward Pass)

Backpropagation is the process of computing gradients of the loss with respect to all parameters in the network. This is achieved by applying the chain rule repeatedly from the loss to each parameter.

### 5.1 Initializing Backpropagation

In the training loop, backpropagation is started from the loss:

```python
# Compute loss
loss = criterion.forward(predictions, target)

# Start backpropagation
loss.backward(Tensor(np.ones_like(loss.data)))
```

This starts the backward pass through the computational graph with an initial gradient of 1.0 for the scalar loss.

### 5.2 Gradient Flow Through the Network

Following from our XOR example, the gradient flows backward through the network:

1. **Loss Function (MSE)**:
   - Computes gradient: 2 * (prediction - target) / batch_size
   - For predicted [0.848] and target [1.0], the gradient would be [2 * (0.848 - 1.0)] = [-0.304]

2. **Sigmoid Layer**:
   - Input gradient: [-0.304]
   - Derivative of sigmoid(x): sigmoid(x) * (1 - sigmoid(x))
   - For input [1.723], the derivative is [0.848 * (1 - 0.848)] = [0.129]
   - Output gradient: [-0.304 * 0.129] = [-0.039]

3. **Linear Layer 2**:
   - Input gradient: [-0.039]
   - Gradient for weights: input_transpose.mm(grad)
   - For input [0.462, 0.604, 0.716], the weight gradients are:
     - [0.462 * -0.039, 0.604 * -0.039, 0.716 * -0.039] = [-0.018, -0.024, -0.028]
   - Gradient for bias: sum of gradient across batch = [-0.039]
   - Gradient for previous layer: grad.mm(weights_transpose)
   - For weights [[0.7], [0.8], [0.9]], the output gradient is:
     - [-0.039].mm([[0.7, 0.8, 0.9]]) = [-0.027, -0.031, -0.035]

4. **Tanh Layer**:
   - Input gradient: [-0.027, -0.031, -0.035]
   - Derivative of tanh(x): 1 - tanh(x)^2
   - For input [0.5, 0.7, 0.9], the derivatives are:
     - [1 - 0.462^2, 1 - 0.604^2, 1 - 0.716^2] = [0.787, 0.635, 0.487]
   - Output gradient: [-0.027 * 0.787, -0.031 * 0.635, -0.035 * 0.487]
                     = [-0.021, -0.020, -0.017]

5. **Linear Layer 1**:
   - Input gradient: [-0.021, -0.020, -0.017]
   - Gradient for weights and bias calculated similarly to Linear Layer 2
   - Gradient flows to the input layer

### 5.3 The Chain Rule in Operation

The chain rule is the foundation of backpropagation. For a composition of functions f(g(x)), the derivative is:

f'(g(x)) * g'(x)

In our framework, this is implemented in the `backward` method of the `Tensor` class, where different gradient calculations are performed based on the `creation_op`:

```python
if self.creation_op == "add":
    # grad splits to both parents unchanged
    self.creators[0].backward(self.grad, self)
    self.creators[1].backward(self.grad, self)
    
elif self.creation_op == "mul":
    # x * y => partial wrt x is grad * y, wrt y is grad * x
    new = self.grad * self.creators[1]
    self.creators[0].backward(new, self)
    new = self.grad * self.creators[0]
    self.creators[1].backward(new, self)
    
elif self.creation_op == "sigmoid":
    # z = sigmoid(x), partial wrt x => grad * z*(1-z)
    ones = Tensor(np.ones_like(self.grad.data))
    self.creators[0].backward(self.grad * (self * (ones - self)), self)
```

### 5.4 Gradient Accumulation

A key aspect of backpropagation is gradient accumulation. When a tensor is used in multiple operations, its gradient is the sum of the gradients coming from all those operations.

This is handled in the `backward` method:

```python
# Accumulate gradient in self.grad
if self.grad is None:
    self.grad = grad
else:
    self.grad += grad
```

The `children` dictionary and `all_children_grads_accounted_for` method ensure that a tensor only backpropagates to its creators once all expected gradients from its children have been accumulated.

## 6. Optimization with SGD

After gradients are computed through backpropagation, the optimizer updates the model parameters to minimize the loss.

### 6.1 The SGD Optimizer

The `SGD` (Stochastic Gradient Descent) optimizer implements a simple update rule:

```python
class SGD:
    def __init__(self, parameters, alpha=0.1):
        self.parameters = parameters
        self.alpha = alpha
    
    def step(self, zero=False):
        for p in self.parameters:
            if p.grad is not None:
                # Update: param -= learning_rate * gradient
                p.data = p.data - self.alpha * p.grad.data
                
                if zero:
                    p.grad.data *= 0
```

### 6.2 Parameter Updates

The `step` method:
1. Iterates through all parameters
2. Subtracts the gradient multiplied by the learning rate from each parameter
3. Optionally resets gradients to zero after the update

### 6.3 Learning Rate Impact

The learning rate (`alpha`) controls the size of the update steps:
- Too large: Can cause instability and divergence
- Too small: Can result in slow convergence
- Just right: Allows for efficient convergence to a good solution

In the XOR example, a learning rate of 0.1 is used:

```python
optimizer = SGD(parameters=model.get_parameters(), alpha=0.1)
```

### 6.4 Training Loop Mechanics

The training loop orchestrates the entire learning process:

```python
# Training loop
for epoch in range(1000):
    # Forward pass: get model predictions
    predictions = model.forward(data)
    
    # Compute loss
    loss = criterion.forward(predictions, target)
    
    # Backward pass: compute gradients
    loss.backward(Tensor(np.ones_like(loss.data)))
    
    # Update parameters
    optimizer.step()
```

This loop:
1. Performs forward propagation to get predictions
2. Computes the loss between predictions and targets
3. Performs backpropagation to compute gradients
4. Updates parameters using the optimizer

## 7. Putting It All Together: XOR Example

The XOR problem is a classic example that requires a neural network to learn a non-linear decision boundary. The XOR truth table is:

| Input 1 | Input 2 | Output |
|---------|---------|--------|
| 0       | 0       | 0      |
| 0       | 1       | 1      |
| 1       | 0       | 1      |
| 1       | 1       | 0      |

In our framework, this is solved using a neural network with one hidden layer, as shown in the example:

```python
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
```

### 7.1 Training Process Visualization

Let's visualize the whole training process for a single epoch:

1. **Forward Propagation**:
   - Data flows through the network from input to output
   - Each layer performs its operation and passes the result to the next layer
   - Final layer produces predictions

2. **Loss Calculation**:
   - The MSE loss computes the squared difference between predictions and targets
   - This produces a scalar loss value measuring model performance

3. **Backward Propagation**:
   - Gradients flow backward from the loss
   - Chain rule is applied at each step
   - Gradients with respect to all parameters are computed

4. **Parameter Updates**:
   - SGD optimizer updates all parameters based on their gradients
   - The updated parameters will produce better predictions in the next epoch

After sufficient training (1000 epochs in the example), the network successfully learns to approximate the XOR function, as shown in the final predictions:

```
Final predictions:
Input: [0 0] -> Predicted: 0.0291, Actual: 0
Input: [0 1] -> Predicted: 0.9775, Actual: 1
Input: [1 0] -> Predicted: 0.9653, Actual: 1
Input: [1 1] -> Predicted: 0.0388, Actual: 0
```

### 7.2 Weight Updates and Learning Dynamics

During training, the weights and biases evolve to capture the XOR pattern:

1. **Initial Random Weights**:
   - The network starts with random weights, making random predictions
   - The loss is high due to the large difference between predictions and targets

2. **Early Training Phases**:
   - Weights rapidly adjust to reduce the most significant errors
   - The decision boundary begins to take shape
   - The loss decreases quickly

3. **Mid Training Phases**:
   - Weight adjustments become more refined
   - The network learns to correctly separate the four XOR cases
   - The loss continues to decrease but at a slower rate

4. **Late Training Phases**:
   - Fine-tuning of weights for optimal performance
   - The decision boundary becomes sharp
   - The loss stabilizes at a low value

The combination of a non-linear activation function (Tanh) in the hidden layer and the right number of hidden units (3) allows the network to learn the non-linear XOR function successfully.

## Conclusion

This deep learning framework demonstrates the core components and principles behind modern deep learning libraries. By implementing automatic differentiation, neural network layers, and optimization algorithms from scratch, we gain a deeper understanding of how these systems work.

The key takeaways are:

1. **Tensors with Autograd**: The foundation of modern deep learning is automatic differentiation, which allows efficient computation of gradients through complex neural networks.

2. **Computational Graph**: Forward operations build a graph that is traversed backward during backpropagation.

3. **Modular Design**: The layer abstraction provides a clean way to build complex networks from simple building blocks.

4. **Optimization Process**: The interplay between forward propagation, loss calculation, backpropagation, and parameter updates drives the learning process.

By understanding these concepts, you have gained insight into how frameworks like PyTorch and TensorFlow work under the hood, empowering you to use them more effectively and even extend them when needed.
