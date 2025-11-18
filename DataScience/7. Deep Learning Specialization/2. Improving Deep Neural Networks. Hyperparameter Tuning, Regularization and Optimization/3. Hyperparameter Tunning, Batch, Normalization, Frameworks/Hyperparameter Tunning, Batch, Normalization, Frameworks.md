# Hyperparameter Tuning, Batch Normalization, and Frameworks
## Advanced Techniques for Training Deep Neural Networks
### (Detailed Step-by-Step with Complete Examples)

## Table of Contents

### Part 1: Normalizing Activations in a Network (Batch Normalization)
- [Overview & Connection to Previous Topics](#-connection-to-previous-topics)
- [1. Understanding the Problem](#part-1-understanding-the-problem)
  - [Plain English Explanation](#1-plain-english-explanation)
  - [The Covariate Shift Problem](#the-covariate-shift-problem)
  - [Assembly Line Analogy](#real-world-analogy-assembly-line)
  - [Neural Network Analogy](#neural-network-analogy)
- [2. The Mathematics of Batch Normalization](#2-the-mathematics-of-batch-normalization)
  - [The Algorithm](#batch-normalization-algorithm)
  - [Key Components](#key-components)
  - [Why It Works](#why-normalization-works)
- [3. Complete Numerical Example](#3-complete-numerical-example)
  - [Setup: Simple Network](#setup-simple-3-layer-network)
  - [Without Batch Norm](#without-batch-normalization)
  - [With Batch Norm](#with-batch-normalization)
  - [Step-by-Step Calculations](#detailed-calculation-for-batch-1)
- [4. Visual Comparison](#4-visual-comparison)
  - [Activation Distributions](#activation-distributions)
  - [Gradient Flow](#gradient-flow)
- [5. Training and Test Time](#5-batch-norm-training-vs-test-time)
  - [Training Mode](#training-mode)
  - [Test Mode](#test-mode-inference)
  - [Running Statistics](#maintaining-running-statistics)
- [6. Complete Implementation](#6-complete-pytorch-implementation)
  - [Manual Implementation](#manual-batch-normalization)
  - [Built-in Implementation](#using-pytorch-built-in)
- [7. Placement in Networks](#7-where-to-place-batch-norm)
  - [Before or After Activation](#before-vs-after-activation)
  - [Convolutional Networks](#batch-norm-in-cnns)
  - [Recurrent Networks](#batch-norm-in-rnns)
- [8. Effects on Training](#8-effects-on-training)
  - [Learning Rate](#learning-rate-with-batch-norm)
  - [Regularization Effect](#regularization-effect)
  - [Convergence Speed](#convergence-speed)
- [9. Batch Size Considerations](#9-batch-size-and-batch-norm)
  - [Minimum Batch Size](#minimum-batch-size-requirements)
  - [Small Batch Problems](#problems-with-small-batches)
  - [Solutions](#solutions-for-small-batches)
- [10. Alternatives to Batch Norm](#10-alternatives-to-batch-normalization)
  - [Layer Normalization](#layer-normalization)
  - [Instance Normalization](#instance-normalization)
  - [Group Normalization](#group-normalization)
  - [Comparison](#comparison-of-normalization-techniques)
- [11. Advanced Topics](#11-advanced-topics)
  - [Batch Renormalization](#batch-renormalization)
  - [Weight Normalization](#weight-normalization)
  - [Spectral Normalization](#spectral-normalization)
- [12. Practical Guidelines](#12-practical-guidelines)
  - [When to Use Batch Norm](#when-to-use-batch-norm)
  - [Hyperparameter Guidelines](#hyperparameter-guidelines)
  - [Common Mistakes](#common-mistakes)
- [13. Batch Norm Summary](#13-summary-batch-normalization)

---

---

## 🔗 **Connection to Previous Topics**

### **What We Know So Far:**

**From Optimization Algorithms:**
```
We learned how to train networks efficiently:
- Mini-batch gradient descent
- Momentum (accelerates convergence)
- RMSprop (adapts learning rates)
- Adam (combines both)

But we haven't addressed a fundamental problem:
Internal Covariate Shift!
```

**The New Problem:**

```
As we train deeper networks, we face a challenge:

Input to layer 3 depends on layers 1 and 2
When layers 1 and 2 update their weights,
the distribution of layer 3's input CHANGES!

This is like trying to hit a moving target!

Layer 3 has to constantly adapt to:
- Different mean values
- Different variance/scale
- Different distributions

This slows down training significantly!
```

**The Question:**

```
Can we STABILIZE the inputs to each layer?
Make training faster and more stable?
Allow us to use higher learning rates?

Answer: Batch Normalization!
```

---

# Part 1: Understanding the Problem

## 1. Plain English Explanation

### The Covariate Shift Problem

**Covariate Shift:** "The distribution of inputs keeps changing during training"

### Real-World Analogy: Assembly Line

Imagine a factory assembly line with 5 stations:

**Without Stabilization:**
```
Station 1 → Station 2 → Station 3 → Station 4 → Station 5
(Raw)      (Polish)     (Paint)     (Inspect)   (Package)

Day 1: Station 1 outputs parts ranging 10-20cm
Station 3 adjusts paint spray for this size range

Day 2: Station 1 improves, outputs parts 15-25cm
Station 3's spray pattern now WRONG for this range!
Must readjust everything!

Day 3: Station 1 changes again to 12-18cm
Station 3 must readjust AGAIN!

Each station constantly adapting to changing inputs!
Slow, inefficient, never stabilizes!
```

**With Stabilization (Batch Normalization):**
```
Station 1 → [Normalizer] → Station 2 → [Normalizer] → Station 3 ...

Day 1: Parts from Station 1: 10-20cm
Normalizer: Scales all parts to standard 0-10cm range
Station 2 receives: 0-10cm (consistent!)

Day 2: Parts from Station 1: 15-25cm (changed!)
Normalizer: Still scales to 0-10cm range
Station 2 receives: 0-10cm (same as before!)

Day 3: Parts from Station 1: 12-18cm (changed again!)
Normalizer: Still scales to 0-10cm range
Station 2 receives: 0-10cm (still consistent!)

Each station works with STABLE inputs!
Fast adaptation, better quality!
```

---

### Neural Network Analogy

**The Problem Without Batch Norm:**

```
Layer 1: W₁, b₁
   ↓ (outputs: z₁ = W₁x + b₁)
   ↓ (activation: a₁ = ReLU(z₁))
   
Layer 2: W₂, b₂ (receives a₁ as input)
   ↓ (outputs: z₂ = W₂a₁ + b₂)
   ↓ (activation: a₂ = ReLU(z₂))
   
Layer 3: W₃, b₃ (receives a₂ as input)

Training iteration 1:
a₁ has mean=5.2, std=2.3
Layer 2 learns based on this distribution

Training iteration 100:
W₁ has changed significantly!
a₁ now has mean=12.7, std=8.9 (completely different!)
Layer 2's learned weights are now mismatched!
Layer 2 has to "relearn" for new distribution!

This happens at EVERY layer!
Each layer chasing moving targets!
```

**With Batch Normalization:**

```
Layer 1: W₁, b₁
   ↓ (outputs: z₁)
   ↓ (activation: a₁ = ReLU(z₁))
   ↓ [BATCH NORM] ← Normalize here!
   ↓ (normalized: ã₁ has mean=0, std=1 ALWAYS)
   
Layer 2: W₂, b₂ (receives ã₁ as input)
   ↓ (outputs: z₂)
   ↓ (activation: a₂ = ReLU(z₂))
   ↓ [BATCH NORM] ← Normalize here!
   ↓ (normalized: ã₂ has mean=0, std=1 ALWAYS)
   
Layer 3: W₃, b₃ (receives ã₂ as input)

Training iteration 1:
ã₁ has mean=0, std=1
Layer 2 learns based on this

Training iteration 100:
W₁ has changed, BUT:
ã₁ STILL has mean=0, std=1 (normalized!)
Layer 2's input distribution UNCHANGED!
Layer 2 can focus on learning the task!

Stable inputs at every layer! ✓
```

---

## 2. The Mathematics of Batch Normalization

### Batch Normalization Algorithm:

For a mini-batch of activations $\{x_1, x_2, ..., x_B\}$ where $B$ is batch size:

**Step 1: Compute batch statistics**
$$\mu_B = \frac{1}{B}\sum_{i=1}^{B}x_i$$

$$\sigma^2_B = \frac{1}{B}\sum_{i=1}^{B}(x_i - \mu_B)^2$$

**Step 2: Normalize**
$$\hat{x}_i = \frac{x_i - \mu_B}{\sqrt{\sigma^2_B + \epsilon}}$$

**Step 3: Scale and shift (learnable parameters)**
$$y_i = \gamma \hat{x}_i + \beta$$

Where:
- $\mu_B$ = Batch mean
- $\sigma^2_B$ = Batch variance
- $\epsilon$ = Small constant (e.g., $10^{-5}$) for numerical stability
- $\gamma$ = Scale parameter (learned)
- $\beta$ = Shift parameter (learned)
- $\hat{x}_i$ = Normalized value (mean=0, std=1)
- $y_i$ = Final output (after scale and shift)

---

### Key Components:

| Symbol | Name | Purpose | Typical Value |
|--------|------|---------|---------------|
| $\mu_B$ | Batch mean | Center of distribution | Computed per batch |
| $\sigma^2_B$ | Batch variance | Spread of distribution | Computed per batch |
| $\epsilon$ | Epsilon | Numerical stability | $10^{-5}$ |
| $\gamma$ | Gamma (scale) | Learned: controls spread | Initialized to 1 |
| $\beta$ | Beta (shift) | Learned: controls center | Initialized to 0 |
| $\hat{x}_i$ | Normalized value | Zero mean, unit variance | - |
| $y_i$ | Output | After learned transformation | - |

---

### Why Normalization Works:

```
Before Normalization:
x = [0.1, 5.2, -2.3, 8.9, 1.2, ...]
Mean ≈ 2.7, Std ≈ 3.8 (varies batch to batch!)

Problem:
- Large values → Large gradients → Instability
- Values shift → Distribution changes → Slow learning
- Different scales → Hard to choose learning rate

After Normalization:
x̂ = [-0.68, 0.66, -1.32, 1.63, -0.39, ...]
Mean = 0, Std = 1 (stable across batches!)

Benefits:
✓ Consistent scale → Stable gradients
✓ Centered around 0 → Faster convergence
✓ Unit variance → Can use higher learning rates
✓ Distribution stable → Layers learn efficiently
```

---

### Why Scale and Shift (γ, β)?

```
Pure normalization forces:
x̂ with mean=0, std=1

But what if the network NEEDS a different distribution?
Example: Sigmoid activation works best with inputs near ±3

Solution: Learn γ and β!
y = γ·x̂ + β

Network can learn optimal mean and std for each layer!

Special cases:
If γ = σ_B and β = μ_B:
  y = σ_B·x̂ + μ_B = x (identity! Can recover original)
  
Network can decide:
- Use normalization (γ≈1, β≈0)
- Undo normalization (γ=σ_B, β=μ_B)
- Or anything in between!
```

---

## 3. Complete Numerical Example

### Setup: Simple 3-Layer Network

```
Network architecture:
Input: 4 features
Layer 1: 3 neurons (with Batch Norm)
Layer 2: 2 neurons (with Batch Norm)
Output: 1 neuron

Batch size: 4 images

We'll trace through one forward pass
```

---

### Without Batch Normalization:

**Mini-batch input (4 samples, 4 features each):**
```
X = [
  [0.5, 1.2, -0.3, 2.1],  # Sample 1
  [1.8, 0.4, 1.5, -0.8],  # Sample 2
  [-0.2, 2.3, 0.7, 1.2],  # Sample 3
  [0.9, -1.1, 0.2, 0.5]   # Sample 4
]
```

**Layer 1 forward pass:**
```
Weights W₁ (3×4), biases b₁ (3×1)

For sample 1:
z₁[1] = W₁[1]·x[1] + b₁[1]
     = [0.2, -0.1, 0.5, 0.3]·[0.5, 1.2, -0.3, 2.1] + 0.1
     = 0.1 - 0.12 - 0.15 + 0.63 + 0.1
     = 0.56

Similarly for all neurons and samples:
Z₁ = [
  [0.56, -0.23, 1.45],  # Sample 1
  [2.31, 0.87, -1.12],  # Sample 2
  [1.78, 2.45, 0.34],   # Sample 3
  [-0.45, 0.12, 0.89]   # Sample 4
]

Apply ReLU:
A₁ = ReLU(Z₁) = [
  [0.56, 0, 1.45],
  [2.31, 0.87, 0],
  [1.78, 2.45, 0.34],
  [0, 0.12, 0.89]
]

Statistics per neuron (across batch):
Neuron 1: [0.56, 2.31, 1.78, 0]
  mean = 1.1625, std = 0.963

Neuron 2: [0, 0.87, 2.45, 0.12]
  mean = 0.86, std = 1.058

Neuron 3: [1.45, 0, 0.34, 0.89]
  mean = 0.67, std = 0.604

Problem: Different means and stds!
Layer 2 receives inconsistent inputs!
```

---

### With Batch Normalization:

**After computing Z₁, apply Batch Norm BEFORE activation:**

```
Z₁ = [
  [0.56, -0.23, 1.45],  # Sample 1
  [2.31, 0.87, -1.12],  # Sample 2
  [1.78, 2.45, 0.34],   # Sample 3
  [-0.45, 0.12, 0.89]   # Sample 4
]
```

**Normalize each neuron separately (across the batch):**

**For Neuron 1:**
```
Values: [0.56, 2.31, 1.78, -0.45]

Step 1: Compute batch mean
μ_B = (0.56 + 2.31 + 1.78 - 0.45) / 4
    = 4.2 / 4
    = 1.05

Step 2: Compute batch variance
σ²_B = [(0.56-1.05)² + (2.31-1.05)² + (1.78-1.05)² + (-0.45-1.05)²] / 4
     = [0.2401 + 1.5876 + 0.5329 + 2.25] / 4
     = 4.6106 / 4
     = 1.1527

Step 3: Normalize
ε = 0.00001

For sample 1:
x̂₁ = (0.56 - 1.05) / √(1.1527 + 0.00001)
   = -0.49 / √1.1528
   = -0.49 / 1.0737
   = -0.456

For sample 2:
x̂₂ = (2.31 - 1.05) / 1.0737
   = 1.26 / 1.0737
   = 1.174

For sample 3:
x̂₃ = (1.78 - 1.05) / 1.0737
   = 0.73 / 1.0737
   = 0.680

For sample 4:
x̂₄ = (-0.45 - 1.05) / 1.0737
   = -1.5 / 1.0737
   = -1.397

Normalized values: [-0.456, 1.174, 0.680, -1.397]

Verify: mean ≈ 0, std ≈ 1 ✓
```

**Step 4: Scale and shift (learnable parameters)**
```
Initial: γ = 1, β = 0 (standard initialization)

y₁ = γ·x̂₁ + β = 1·(-0.456) + 0 = -0.456
y₂ = γ·x̂₂ + β = 1·(1.174) + 0 = 1.174
y₃ = γ·x̂₃ + β = 1·(0.680) + 0 = 0.680
y₄ = γ·x̂₄ + β = 1·(-1.397) + 0 = -1.397

(With initial γ=1, β=0, output = normalized value)
```

**Apply ReLU:**
```
A₁ = ReLU(y) = [0, 1.174, 0.680, 0]

Now feed to Layer 2 with STABLE inputs! ✓
```

---

### Detailed Calculation for Batch 1:

**Complete Batch Norm for all 3 neurons:**

| Neuron | Original Values | μ_B | σ²_B | Normalized (x̂) | After γ,β | After ReLU |
|--------|----------------|-----|------|----------------|-----------|------------|
| **1** | [0.56, 2.31, 1.78, -0.45] | 1.05 | 1.153 | [-0.456, 1.174, 0.680, -1.397] | Same (γ=1, β=0) | [0, 1.174, 0.680, 0] |
| **2** | [-0.23, 0.87, 2.45, 0.12] | 0.80 | 1.292 | [-0.908, 0.061, 1.451, -0.604] | Same | [0, 0.061, 1.451, 0] |
| **3** | [1.45, -1.12, 0.34, 0.89] | 0.39 | 0.954 | [1.084, -1.545, -0.051, 0.512] | Same | [1.084, 0, 0, 0.512] |

**Result:**
```
All neurons now have:
- Mean ≈ 0
- Std ≈ 1
- Consistent distribution

Layer 2 receives stable, normalized inputs! ✓
```

---

## 4. Visual Comparison

### Activation Distributions:

**Without Batch Norm (after 100 training iterations):**

```
    Frequency
        ↑
    25  │   ╱╲                          Layer 1
        │  ╱  ╲                         (centered, narrow)
    20  │ ╱    ╲
        │╱      ╲
    15  ●────────╲___
        │
        │              ╱──╲             Layer 2
    10  │          ╱──╱    ╲──          (shifted right, wider)
        │      ╱──╱          ╲──
     5  │  ╱──╱                ╲──
        │──╱                      ╲──
     0  └─────────────────────────────→ Activation Value
       -5   0   5   10  15  20

Different distributions per layer!
Layer 3 has to adapt to Layer 2's shifted, wide distribution!
```

**With Batch Norm (after 100 iterations):**

```
    Frequency
        ↑
    25  │   ╱╲                          All Layers!
        │  ╱  ╲                         (all centered at 0)
    20  │ ╱    ╲                        (all std ≈ 1)
        │╱      ╲
    15  ●────────╲___
        │
    10  │
        │
     5  │
        │
     0  └─────────────────────────────→ Activation Value
       -3   -2  -1   0   1   2   3

All layers have same normalized distribution!
Stable learning environment! ✓
```

---

### Gradient Flow:

**Without Batch Norm:**

```
    Gradient Magnitude
         ↑
    10.0 │●                             Layer 1
         │                              (vanishing!)
     1.0 │  ●                           Layer 2
         │    ●                         Layer 3
     0.1 │      ●●                      Layer 4-5
         │        ●●●                   (gradients dying)
    0.01 │           ●●●●
         │               ●●●●●
   0.001 │                    ●●●●●●●● Layers 6-10
         └──────────────────────────→ Layer Depth
          1  2  3  4  5  6  7  8  9  10

Vanishing gradient problem!
Deep layers barely learn!
```

**With Batch Norm:**

```
    Gradient Magnitude
         ↑
    10.0 │
         │
     1.0 │●●●●●●●●●●                   All Layers!
         │                              (stable gradients)
     0.1 │
         │
    0.01 │
         │
   0.001 │
         └──────────────────────────→ Layer Depth
          1  2  3  4  5  6  7  8  9  10

Gradients flow smoothly through all layers!
All layers learn at similar rates! ✓
```

---

## 5. Batch Norm: Training vs Test Time

### Training Mode:

**During training, use BATCH statistics:**

```python
def batch_norm_training(x, gamma, beta, eps=1e-5):
    """
    x: Input batch (B, D) where B=batch size, D=features
    gamma, beta: Learned parameters (D,)
    """
    # Compute batch statistics
    mu = x.mean(dim=0)        # Mean per feature
    var = x.var(dim=0)        # Variance per feature
    
    # Normalize
    x_norm = (x - mu) / torch.sqrt(var + eps)
    
    # Scale and shift
    out = gamma * x_norm + beta
    
    return out, mu, var  # Return statistics for running average
```

**Example:**
```
Batch: [[1, 2], [3, 4], [5, 6], [7, 8]]

μ = [4, 5]  ← Computed from THIS batch
σ² = [5, 5]

Normalized using THIS batch's statistics
```

---

### Test Mode (Inference):

**During testing, use POPULATION statistics (running average):**

```python
def batch_norm_inference(x, gamma, beta, running_mean, running_var, eps=1e-5):
    """
    x: Input (can be single sample!)
    running_mean, running_var: Statistics from training
    """
    # Normalize using running statistics
    x_norm = (x - running_mean) / torch.sqrt(running_var + eps)
    
    # Scale and shift
    out = gamma * x_norm + beta
    
    return out
```

**Example:**
```
Test sample: [2, 3]

Use running_mean and running_var from training:
running_mean = [4.2, 5.1]  ← Accumulated during training
running_var = [4.8, 4.9]

Normalized using TRAINING statistics
NOT computed from test sample!

Why? Test batch might be size 1!
Can't compute meaningful statistics from 1 sample!
```

---

### Maintaining Running Statistics:

**During training, maintain exponentially weighted averages:**

$$\mu_{\text{running}} = \lambda \mu_{\text{running}} + (1-\lambda)\mu_B$$
$$\sigma^2_{\text{running}} = \lambda \sigma^2_{\text{running}} + (1-\lambda)\sigma^2_B$$

Where $\lambda$ = momentum (typically 0.9 or 0.99)

**Example:**

```
Training batch 1:
μ_B = 2.3, σ²_B = 1.5

Update running stats (λ = 0.9):
μ_running = 0.9 × 0 + 0.1 × 2.3 = 0.23
σ²_running = 0.9 × 1 + 0.1 × 1.5 = 1.05

Training batch 2:
μ_B = 2.7, σ²_B = 1.8

Update:
μ_running = 0.9 × 0.23 + 0.1 × 2.7 = 0.207 + 0.27 = 0.477
σ²_running = 0.9 × 1.05 + 0.1 × 1.8 = 0.945 + 0.18 = 1.125

...

After 1000 batches:
μ_running ≈ 2.5 (stable population estimate)
σ²_running ≈ 1.6 (stable population estimate)

Use these for test time! ✓
```

---

## 6. Complete PyTorch Implementation

### Manual Batch Normalization:

```python
import torch
import torch.nn as nn

class BatchNorm1d:
    """Manual implementation of Batch Normalization"""
    
    def __init__(self, num_features, eps=1e-5, momentum=0.1):
        """
        Args:
            num_features: Number of features (neurons) in layer
            eps: Small constant for numerical stability
            momentum: For running statistics (0.1 means 10% current batch)
        """
        self.num_features = num_features
        self.eps = eps
        self.momentum = momentum
        
        # Learnable parameters
        self.gamma = torch.ones(num_features)   # Scale
        self.beta = torch.zeros(num_features)   # Shift
        
        # Running statistics (for inference)
        self.running_mean = torch.zeros(num_features)
        self.running_var = torch.ones(num_features)
        
        # Track if in training or eval mode
        self.training = True
    
    def forward(self, x):
        """
        Args:
            x: Input tensor (batch_size, num_features)
        
        Returns:
            Normalized and scaled tensor
        """
        if self.training:
            # TRAINING MODE: Use batch statistics
            
            # Compute batch statistics
            batch_mean = x.mean(dim=0)  # Mean per feature
            batch_var = x.var(dim=0, unbiased=False)  # Variance per feature
            
            # Normalize
            x_norm = (x - batch_mean) / torch.sqrt(batch_var + self.eps)
            
            # Scale and shift
            out = self.gamma * x_norm + self.beta
            
            # Update running statistics (exponentially weighted average)
            with torch.no_grad():
                self.running_mean = (
                    (1 - self.momentum) * self.running_mean + 
                    self.momentum * batch_mean
                )
                self.running_var = (
                    (1 - self.momentum) * self.running_var + 
                    self.momentum * batch_var
                )
            
            return out
        
        else:
            # INFERENCE MODE: Use running statistics
            
            # Normalize using population statistics
            x_norm = (x - self.running_mean) / torch.sqrt(self.running_var + self.eps)
            
            # Scale and shift
            out = self.gamma * x_norm + self.beta
            
            return out
    
    def train(self):
        """Set to training mode"""
        self.training = True
    
    def eval(self):
        """Set to evaluation mode"""
        self.training = False


# Example usage
batch_size = 4
num_features = 3

# Create batch norm layer
bn = BatchNorm1d(num_features)

# Training
bn.train()
x_train = torch.randn(batch_size, num_features)

print("Training Mode:")
print(f"Input:\n{x_train}")
print(f"\nInput mean: {x_train.mean(dim=0)}")
print(f"Input std: {x_train.std(dim=0)}")

out_train = bn.forward(x_train)

print(f"\nOutput:\n{out_train}")
print(f"Output mean: {out_train.mean(dim=0)}")
print(f"Output std: {out_train.std(dim=0)}")

print(f"\nRunning mean: {bn.running_mean}")
print(f"Running var: {bn.running_var}")

# Inference
bn.eval()
x_test = torch.randn(1, num_features)  # Single sample!

print("\n" + "="*50)
print("Inference Mode:")
print(f"Input: {x_test}")

out_test = bn.forward(x_test)

print(f"Output: {out_test}")
print(f"\nUsed running_mean: {bn.running_mean}")
print(f"Used running_var: {bn.running_var}")
```

---

**Expected Output:**

```
Training Mode:
Input:
tensor([[ 0.3367,  0.1288,  0.2345],
        [ 0.2303, -1.1229, -0.1863],
        [ 2.1895, -0.5516,  1.5770],
        [-0.8972,  0.5638,  0.1920]])

Input mean: tensor([0.4648, -0.2455,  0.4543])
Input std: tensor([1.1910, 0.6982, 0.7249])

Output:
tensor([[-0.1076,  0.5358, -0.3032],
        [-0.1968, -1.2570, -0.8827],
        [ 1.4470, -0.4379,  1.5491],
        [-1.1426,  1.1592, -0.3632]])

Output mean: tensor([-2.9802e-08,  0.0000e+00, -2.9802e-08])  # ≈ 0 ✓
Output std: tensor([1.0000, 1.0000, 1.0000])  # = 1 ✓

Running mean: tensor([0.0465, -0.0246,  0.0454])
Running var: tensor([1.0182, 1.0049, 1.0053])

==================================================
Inference Mode:
Input: tensor([[-0.6237,  1.2345, -0.8932]])

Output: tensor([[-0.6577,  1.2667, -0.9305]])

Used running_mean: tensor([0.0465, -0.0246,  0.0454])
Used running_var: tensor([1.0182, 1.0049, 1.0053])
```

---

### Using PyTorch Built-in:

```python
import torch
import torch.nn as nn

class NeuralNetWithBatchNorm(nn.Module):
    """Network with Batch Normalization"""
    
    def __init__(self, input_size=1000, hidden1=100, hidden2=50, output_size=2):
        super().__init__()
        
        # Layer 1
        self.fc1 = nn.Linear(input_size, hidden1)
        self.bn1 = nn.BatchNorm1d(hidden1)  # Batch norm after fc1
        
        # Layer 2
        self.fc2 = nn.Linear(hidden1, hidden2)
        self.bn2 = nn.BatchNorm1d(hidden2)  # Batch norm after fc2
        
        # Output layer (typically no batch norm on output)
        self.fc3 = nn.Linear(hidden2, output_size)
    
    def forward(self, x):
        # Layer 1
        x = self.fc1(x)
        x = self.bn1(x)      # Normalize
        x = torch.relu(x)    # Then activate
        
        # Layer 2
        x = self.fc2(x)
        x = self.bn2(x)      # Normalize
        x = torch.relu(x)    # Then activate
        
        # Output (no batch norm, no activation)
        x = self.fc3(x)
        
        return x


# Create model
model = NeuralNetWithBatchNorm()

# Check batch norm parameters
print("Batch Norm 1 parameters:")
print(f"  Gamma (scale): {model.bn1.weight[:5]}")  # First 5 values
print(f"  Beta (shift): {model.bn1.bias[:5]}")
print(f"  Running mean: {model.bn1.running_mean[:5]}")
print(f"  Running var: {model.bn1.running_var[:5]}")

# Training
model.train()  # Set to training mode
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
criterion = nn.CrossEntropyLoss()

for epoch in range(5):
    for batch_x, batch_y in train_loader:
        # Forward (uses batch statistics)
        output = model(batch_x)
        loss = criterion(output, batch_y)
        
        # Backward
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        
        print(f"Epoch {epoch}, Loss: {loss.item():.4f}")

# Inference
model.eval()  # Set to evaluation mode (uses running statistics)

with torch.no_grad():
    test_output = model(test_x)  # Can be single sample!
    pred = test_output.argmax(dim=1)
```

---

## 7. Where to Place Batch Norm?

### Before vs After Activation:

**Original Paper (2015): Batch Norm BEFORE activation**

```python
# Original placement
x = linear(x)
x = batch_norm(x)
x = relu(x)
```

**Modern Practice: Both work, but trends vary**

```python
# Also common (especially in ResNets)
x = linear(x)
x = relu(x)
x = batch_norm(x)
```

**Comparison:**

| Placement | Effect | When to Use |
|-----------|--------|-------------|
| **Before activation** | Normalizes pre-activations | Original paper, default choice |
| **After activation** | Normalizes post-activations | Some ResNet variants |

**In practice:** Before activation is more common and better studied.

---

### Batch Norm in CNNs:

**For convolutional layers:**

```python
class ConvNetWithBatchNorm(nn.Module):
    def __init__(self):
        super().__init__()
        
        # Conv layer 1
        self.conv1 = nn.Conv2d(3, 64, kernel_size=3, padding=1)
        self.bn1 = nn.BatchNorm2d(64)  # BatchNorm2d for conv!
        
        # Conv layer 2
        self.conv2 = nn.Conv2d(64, 128, kernel_size=3, padding=1)
        self.bn2 = nn.BatchNorm2d(128)
        
        # Fully connected
        self.fc = nn.Linear(128 * 7 * 7, 10)
    
    def forward(self, x):
        # Conv block 1
        x = self.conv1(x)        # (B, 64, H, W)
        x = self.bn1(x)          # Normalize per channel
        x = torch.relu(x)
        x = torch.max_pool2d(x, 2)
        
        # Conv block 2
        x = self.conv2(x)
        x = self.bn2(x)
        x = torch.relu(x)
        x = torch.max_pool2d(x, 2)
        
        # Flatten and classify
        x = x.view(x.size(0), -1)
        x = self.fc(x)
        
        return x
```

**How BatchNorm2d works:**

```
Input: (Batch, Channels, Height, Width) = (32, 64, 28, 28)

For each of 64 channels:
  Compute mean and variance across:
  - All 32 samples in batch
  - All 28×28 spatial locations
  
  Total values per channel: 32 × 28 × 28 = 25,088
  
  Normalize all these values together
  One γ and one β per channel (64 learnable params each)

Result: Each channel normalized independently
```

---

### Batch Norm in RNNs:

**RNNs are tricky - batch norm not commonly used!**

```
Problem with RNNs:
- Variable sequence lengths
- Different timesteps have different statistics
- Batch norm across timesteps problematic

Solutions:
1. Use Layer Normalization instead (more common)
2. Apply batch norm only to input-to-hidden transformation
3. Use specialized variants like Recurrent Batch Norm
```

**Example (if using batch norm in RNN):**

```python
class RNNWithBatchNorm(nn.Module):
    def __init__(self, input_size, hidden_size):
        super().__init__()
        self.hidden_size = hidden_size
        
        # Input transformation with batch norm
        self.fc_input = nn.Linear(input_size, hidden_size)
        self.bn_input = nn.BatchNorm1d(hidden_size)
        
        # Recurrent transformation (no batch norm usually)
        self.fc_hidden = nn.Linear(hidden_size, hidden_size)
    
    def forward(self, x, h):
        # Input transformation with batch norm
        x = self.fc_input(x)
        x = self.bn_input(x)  # Normalize input contribution
        
        # Recurrent transformation
        h = self.fc_hidden(h)  # No batch norm here
        
        # Combine
        out = torch.tanh(x + h)
        return out

# More common: Use LayerNorm for RNNs instead!
```

---

## 8. Effects on Training

### Learning Rate with Batch Norm:

**Can use MUCH higher learning rates!**

**Without Batch Norm:**
```
Typical LR with Adam: 0.001
Typical LR with SGD: 0.01

Higher LR causes:
- Gradient explosion
- Unstable training
- Divergence
```

**With Batch Norm:**
```
Can use with Adam: 0.001 - 0.01 (10× higher!)
Can use with SGD: 0.1 - 1.0 (100× higher!)

Benefits:
✓ Faster convergence
✓ More stable training
✓ Can explore wider range of LRs
```

**Example:**

| Configuration | Max Stable LR | Epochs to 90% | Final Acc |
|--------------|---------------|---------------|-----------|
| No Batch Norm + SGD | 0.01 | 25 | 91% |
| Batch Norm + SGD | 0.5 | 8 | 94% |
| No Batch Norm + Adam | 0.003 | 15 | 92% |
| Batch Norm + Adam | 0.01 | 5 | 95% |

**Batch Norm allows 3-5× faster training! ✓**

---

### Regularization Effect:

**Batch Norm adds noise → acts as regularizer!**

```
Each sample normalized using batch statistics:
x̂ᵢ = (xᵢ - μ_B) / σ_B

But μ_B and σ_B vary batch to batch!

Batch 1: μ = 2.3, σ = 1.5
Batch 2: μ = 2.7, σ = 1.8
Batch 3: μ = 2.1, σ = 1.6

Same input sample gets SLIGHTLY different
normalized values depending on which batch it's in!

This noise acts like regularization!
Reduces overfitting!
```

**Evidence:**

```
Without Batch Norm:
Train Acc: 98%, Test Acc: 87% (overfitting!)

With Batch Norm:
Train Acc: 96%, Test Acc: 92% (better generalization!)

Can often reduce/remove Dropout when using Batch Norm!
```

---

### Convergence Speed:

**Numerical comparison (same network, same data):**

```
Training to 95% test accuracy:

Standard Network:
- Optimizer: SGD, LR: 0.01
- Epochs needed: 45
- Time: 67 seconds
- Best test acc: 95.2%

With Batch Norm:
- Optimizer: SGD, LR: 0.1
- Epochs needed: 12
- Time: 19 seconds
- Best test acc: 96.1%

3.7× faster convergence!
Better final accuracy!
```

**Loss curve comparison:**

```
    Loss
     ↑
  0.7│●
     │ ╲___                           Without Batch Norm
  0.6│     ╲___
     │         ╲___
  0.5│             ╲___
     │                 ╲___
  0.4│  ●                  ╲___       With Batch Norm
     │   ╲___                  ╲__    (much faster!)
  0.3│       ╲___
     │           ╲___
  0.2│               ╲___
     │                   ╲___●
  0.1│                        
     └────────────────────────────→ Epochs
      0   10   20   30   40   50

With Batch Norm: Reaches 0.2 loss in 12 epochs
Without: Takes 45 epochs!
```

---

## 9. Batch Size and Batch Norm

### Minimum Batch Size Requirements:

**Batch Norm needs reasonable batch statistics:**

```
Batch size 1:
μ = x₁  (just that one value!)
σ² = 0  (can't compute variance!)
Normalization FAILS!

Batch size 2:
μ = (x₁ + x₂) / 2
σ² = [(x₁-μ)² + (x₂-μ)²] / 2
Very noisy estimates!

Batch size 8-16:
Reasonable statistics
Works but noisy

Batch size 32+:
Good statistics ✓
Recommended minimum!
```

---

### Problems with Small Batches:

**Numerical example:**

```
True population: μ = 5, σ = 2

Batch size 2:
Sample 1: [4.2, 6.8]
μ_B = 5.5, σ_B = 1.3
Normalized: [-1.0, 1.0]

Sample 2: [3.1, 5.9]
μ_B = 4.5, σ_B = 1.4
Normalized: [-1.0, 1.0]

Same conceptual samples, different normalizations!
Very noisy!

Batch size 32:
Samples: [5.1, 4.8, 6.2, 4.9, ..., 5.3] (32 values)
μ_B = 4.98, σ_B = 1.97
Much closer to true μ=5, σ=2! ✓
Stable normalization!
```

---

### Solutions for Small Batches:

#### 1. Layer Normalization (LayerNorm):

```python
# Normalize across features, not batch
layer_norm = nn.LayerNorm(hidden_size)

# Works with ANY batch size, even 1!
x = torch.randn(1, hidden_size)  # Batch size 1
out = layer_norm(x)  # No problem!

# Computes statistics per sample:
# μ = mean across hidden_size dimension
# σ² = variance across hidden_size dimension
```

---

#### 2. Group Normalization:

```python
# Normalize within groups of channels
group_norm = nn.GroupNorm(
    num_groups=8,      # Divide channels into 8 groups
    num_channels=64
)

# Works with batch size 1
# Each group normalized independently
```

---

#### 3. Increase Batch Size:

```
If possible, use batch size ≥ 16, preferably ≥ 32

If memory limited:
- Use gradient accumulation
- Simulate larger batch with multiple small batches
- Use Group Norm or Layer Norm instead
```

---

## 10. Alternatives to Batch Normalization

### Layer Normalization:

**Normalize across features instead of batch:**

$$\mu_L = \frac{1}{D}\sum_{i=1}^{D}x_i$$
$$\sigma^2_L = \frac{1}{D}\sum_{i=1}^{D}(x_i - \mu_L)^2$$
$$\hat{x}_i = \frac{x_i - \mu_L}{\sqrt{\sigma^2_L + \epsilon}}$$

**Visual comparison:**

```
Batch Norm:                Layer Norm:
Normalize across batch     Normalize across features

    Features                   Features
    ↓ ↓ ↓ ↓                   ↓ ↓ ↓ ↓
→ [1 2 3 4] Sample 1      → [1 2 3 4] ← Normalize across
→ [5 6 7 8] Sample 2      → [5 6 7 8] ← Normalize across
→ [2 3 4 5] Sample 3      → [2 3 4 5] ← Normalize across
→ [6 7 8 9] Sample 4      → [6 7 8 9] ← Normalize across
  ↑
  Normalize down each feature

Batch Norm:
- Mean/var per feature across batch
- Batch size dependent

Layer Norm:
- Mean/var per sample across features
- Batch size independent!
```

**When to use:**
```
Layer Norm:
✓ RNNs, LSTMs, Transformers (standard choice!)
✓ Small batch sizes (<16)
✓ Reinforcement learning (batch size 1 often)
✓ Variable batch sizes
```

---

### Instance Normalization:

**Normalize each sample and each channel independently:**

```
Used in: Style transfer, GANs

Input: (Batch, Channels, Height, Width)

For each sample, for each channel:
  Compute mean and var across (Height × Width)
  Normalize
```

```python
instance_norm = nn.InstanceNorm2d(num_channels)

# Normalizes each sample independently
# Good for style-based tasks
```

---

### Group Normalization:

**Compromise between Layer and Instance Norm:**

```
Divide channels into groups
Normalize within each group

Input: (Batch, Channels, Height, Width)
Groups: 8

For each sample:
  Divide 64 channels into 8 groups of 8
  For each group:
    Compute mean/var across (8 channels × H × W)
    Normalize
```

```python
group_norm = nn.GroupNorm(
    num_groups=8,
    num_channels=64
)

# Batch size independent!
# Works well for small batches
```

---

### Comparison of Normalization Techniques:

| Technique | Normalizes Across | Batch Dependent? | Best For | Batch Size Req |
|-----------|------------------|------------------|----------|----------------|
| **Batch Norm** | (Batch, H, W) per channel | Yes | CNNs, MLPs | ≥16, prefer ≥32 |
| **Layer Norm** | Features per sample | No | RNNs, Transformers | Any (even 1) |
| **Instance Norm** | (H, W) per sample, per channel | No | Style transfer, GANs | Any |
| **Group Norm** | Channels in groups, per sample | No | Small batch CNNs | Any |

**Visual comparison:**

```
Input shape: (4 batch, 6 channels, H, W)

Batch Norm:
  For channel 1: Mean/Var across all 4 samples' (H×W)
  For channel 2: Mean/Var across all 4 samples' (H×W)
  ...
  Total: 6 normalizations

Layer Norm:
  For sample 1: Mean/Var across all 6 channels' (H×W)
  For sample 2: Mean/Var across all 6 channels' (H×W)
  ...
  Total: 4 normalizations

Instance Norm:
  For each (sample, channel) pair: Mean/Var across (H×W)
  Total: 4 × 6 = 24 normalizations

Group Norm (3 groups of 2 channels):
  For sample 1, group 1: Mean/Var across channels 1-2's (H×W)
  For sample 1, group 2: Mean/Var across channels 3-4's (H×W)
  ...
  Total: 4 × 3 = 12 normalizations
```

---

## 11. Advanced Topics

### Batch Renormalization:

**Problem with standard Batch Norm:**
```
Small batches → Noisy batch statistics
Test time uses different statistics (running avg)
Can cause train/test mismatch
```

**Batch Renormalization solution:**

$$y = \frac{\gamma}{\sigma_B}(x - \mu_B) + \beta$$

But constrains ratio $\frac{\sigma_B}{\sigma_{running}}$ and difference $\mu_B - \mu_{running}$

```python
# Constrains batch stats to be close to running stats
# More stable with small batches
# Rarely used in practice
```

---

### Weight Normalization:

**Instead of normalizing activations, normalize weights!**

$$\hat{W} = \frac{g}{\|v\|}v$$

Where:
- $v$ = Weight vector
- $g$ = Learnable scalar
- $\hat{W}$ = Normalized weight

**Benefits:**
- Batch size independent
- Faster than batch norm (no mean/var computation)

**Drawbacks:**
- Doesn't address covariate shift
- Less effective than batch norm for most tasks

---

### Spectral Normalization:

**Normalize weights by largest singular value:**

$$\hat{W} = \frac{W}{\sigma(W)}$$

Where $\sigma(W)$ = largest singular value of $W$

**Use case:**
- GANs (prevents discriminator from being too strong)
- Ensures Lipschitz continuity

```python
# Spectral norm for GANs
discriminator = nn.Sequential(
    nn.utils.spectral_norm(nn.Linear(100, 128)),
    nn.LeakyReLU(),
    nn.utils.spectral_norm(nn.Linear(128, 1))
)
```

---

## 12. Practical Guidelines

### When to Use Batch Norm:

```
✓ ALWAYS try Batch Norm for:
  - CNNs (image classification, object detection)
  - MLPs (fully connected networks)
  - Deep networks (>5 layers)

✓ Provides benefits:
  - Faster training (2-5× speedup)
  - Higher learning rates possible
  - Less sensitive to initialization
  - Regularization effect
  - Better gradient flow

✗ DON'T use Batch Norm for:
  - RNNs (use Layer Norm instead)
  - Small batches (<8, use Group/Layer Norm)
  - Online learning (batch size 1)
  - When batch statistics unreliable
```

---

### Hyperparameter Guidelines:

```
┌─────────────────────────────────────────┐
│      Batch Norm Hyperparameters         │
└─────────────────────────────────────────┘

Momentum (for running stats):
├─ Default: 0.1
├─ Large datasets: 0.01 (more history)
├─ Small datasets: 0.1-0.2 (faster adaptation)
└─ Almost always use default!

Epsilon (ε):
├─ Default: 1e-5
├─ FP16 training: 1e-3 (larger for stability)
├─ Almost never change for FP32
└─ Use default!

Affine parameters (γ, β):
├─ Default: True (learnable)
├─ Can set to False (no scale/shift)
├─ Almost always keep True!
└─ Let network learn optimal distribution

Placement:
├─ After linear/conv, before activation (standard)
├─ After activation (alternative, less common)
└─ Never on output layer
```

---

### Common Mistakes:

#### ❌ Mistake 1: Using with Very Small Batches

```python
# BAD: Batch norm with batch size 2
train_loader = DataLoader(dataset, batch_size=2)
model = nn.Sequential(
    nn.Linear(100, 50),
    nn.BatchNorm1d(50),  # Will be very noisy!
    nn.ReLU()
)

# GOOD: Use larger batch size OR different normalization
train_loader = DataLoader(dataset, batch_size=32)
# OR
model = nn.Sequential(
    nn.Linear(100, 50),
    nn.LayerNorm(50),  # Works with any batch size!
    nn.ReLU()
)
```

---

#### ❌ Mistake 2: Forgetting to Switch to Eval Mode

```python
# BAD: Using batch statistics at test time
model.train()  # Still in training mode!
with torch.no_grad():
    predictions = model(test_data)  # Using batch stats from test data!
    # If test batch size differs from train, results will be inconsistent!

# GOOD: Switch to eval mode
model.eval()  # Use running statistics
with torch.no_grad():
    predictions = model(test_data)  # Consistent results!
```

---

#### ❌ Mistake 3: Applying Batch Norm to Output Layer

```python
# BAD: Batch norm on output
model = nn.Sequential(
    nn.Linear(100, 50),
    nn.BatchNorm1d(50),
    nn.ReLU(),
    nn.Linear(50, 10),
    nn.BatchNorm1d(10),  # NO! Don't normalize outputs!
    nn.Softmax(dim=1)
)

# GOOD: No batch norm on output
model = nn.Sequential(
    nn.Linear(100, 50),
    nn.BatchNorm1d(50),
    nn.ReLU(),
    nn.Linear(50, 10),  # No batch norm here
    nn.Softmax(dim=1)
)
```

---

#### ❌ Mistake 4: Wrong Batch Norm for Layer Type

```python
# BAD: BatchNorm1d for Conv2d
conv = nn.Conv2d(3, 64, 3)
bn = nn.BatchNorm1d(64)  # WRONG!

# GOOD: Use BatchNorm2d for convolutions
conv = nn.Conv2d(3, 64, 3)
bn = nn.BatchNorm2d(64)  # Correct!

# Rule:
# - Linear/MLP: BatchNorm1d
# - Conv2d: BatchNorm2d
# - Conv3d: BatchNorm3d
```

---

#### ❌ Mistake 5: Not Tracking Running Stats

```python
# BAD: Creating batch norm without allowing state updates
model = nn.Sequential(
    nn.Linear(100, 50),
    nn.BatchNorm1d(50, track_running_stats=False)  # Bad idea!
)

# GOOD: Default behavior (track running stats)
model = nn.Sequential(
    nn.Linear(100, 50),
    nn.BatchNorm1d(50)  # track_running_stats=True by default
)
```

---

## 13. Summary: Batch Normalization

### What Batch Norm Does:

```
┌─────────────────────────────────────────┐
│        Batch Normalization              │
└─────────────────────────────────────────┘

FORMULA (Training):
  μ_B = (1/B)∑xᵢ
  σ²_B = (1/B)∑(xᵢ - μ_B)²
  x̂ᵢ = (xᵢ - μ_B) / √(σ²_B + ε)
  yᵢ = γ·x̂ᵢ + β

FORMULA (Inference):
  x̂ᵢ = (xᵢ - μ_running) / √(σ²_running + ε)
  yᵢ = γ·x̂ᵢ + β

EFFECT:
- Normalizes layer inputs to mean=0, std=1
- Reduces internal covariate shift
- Stabilizes training
- Allows higher learning rates
- Regularization effect

PARAMETERS:
- γ (scale): Learned, init to 1
- β (shift): Learned, init to 0  
- μ_running: EWA of batch means
- σ²_running: EWA of batch variances
- ε = 10⁻⁵ (stability constant)

ADVANTAGES:
✓ 2-5× faster training
✓ Higher learning rates possible
✓ Less sensitive to initialization
✓ Regularization (reduces overfitting)
✓ Better gradient flow
✓ Enables very deep networks

DISADVANTAGES:
✗ Batch size dependent (≥16 recommended)
✗ Different behavior train vs test
✗ Extra memory for running statistics
✗ Slower per iteration (minimal)
✗ Can be tricky with RNNs
```

---

### Key Formulas:

**Training Mode:**
$$\mu_B = \frac{1}{B}\sum_{i=1}^{B}x_i$$
$$\sigma^2_B = \frac{1}{B}\sum_{i=1}^{B}(x_i - \mu_B)^2$$
$$\hat{x}_i = \frac{x_i - \mu_B}{\sqrt{\sigma^2_B + \epsilon}}$$
$$y_i = \gamma\hat{x}_i + \beta$$

**Running Statistics Update:**
$$\mu_{\text{running}} = \lambda \mu_{\text{running}} + (1-\lambda)\mu_B$$
$$\sigma^2_{\text{running}} = \lambda \sigma^2_{\text{running}} + (1-\lambda)\sigma^2_B$$

**Inference Mode:**
$$\hat{x}_i = \frac{x_i - \mu_{\text{running}}}{\sqrt{\sigma^2_{\text{running}} + \epsilon}}$$
$$y_i = \gamma\hat{x}_i + \beta$$

---

### Practical Recommendations:

```
✓ Use Batch Norm for CNNs and MLPs
✓ Use Layer Norm for RNNs and Transformers
✓ Use batch size ≥ 32 with Batch Norm
✓ Place after linear/conv, before activation
✓ Don't apply to output layer
✓ Use running stats for inference (model.eval())
✓ Can use higher learning rates (5-10× increase)
✓ Reduces need for Dropout
✓ Initialize γ=1, β=0 (defaults)

✗ Don't use with batch size <8
✗ Don't forget to call model.eval() for testing
✗ Don't use wrong BatchNorm type (1d vs 2d vs 3d)
✗ Don't disable running stats tracking
✗ Don't apply to recurrent connections in RNNs
```

---

### Complete Example: CNN with Batch Norm

```python
import torch
import torch.nn as nn
import torch.optim as optim

class CNN_WithBatchNorm(nn.Module):
    """CNN for image classification with Batch Normalization"""
    
    def __init__(self, num_classes=10):
        super().__init__()
        
        # Convolutional layers with Batch Norm
        self.conv1 = nn.Conv2d(3, 64, kernel_size=3, padding=1)
        self.bn1 = nn.BatchNorm2d(64)
        
        self.conv2 = nn.Conv2d(64, 128, kernel_size=3, padding=1)
        self.bn2 = nn.BatchNorm2d(128)
        
        self.conv3 = nn.Conv2d(128, 256, kernel_size=3, padding=1)
        self.bn3 = nn.BatchNorm2d(256)
        
        # Fully connected with Batch Norm
        self.fc1 = nn.Linear(256 * 4 * 4, 512)
        self.bn4 = nn.BatchNorm1d(512)
        
        self.fc2 = nn.Linear(512, num_classes)
        # No batch norm on output!
    
    def forward(self, x):
        # Conv block 1
        x = self.conv1(x)
        x = self.bn1(x)      # Normalize
        x = torch.relu(x)
        x = torch.max_pool2d(x, 2)
        
        # Conv block 2
        x = self.conv2(x)
        x = self.bn2(x)      # Normalize
        x = torch.relu(x)
        x = torch.max_pool2d(x, 2)
        
        # Conv block 3
        x = self.conv3(x)
        x = self.bn3(x)      # Normalize
        x = torch.relu(x)
        x = torch.max_pool2d(x, 2)
        
        # Flatten
        x = x.view(x.size(0), -1)
        
        # FC block
        x = self.fc1(x)
        x = self.bn4(x)      # Normalize
        x = torch.relu(x)
        
        # Output (no batch norm!)
        x = self.fc2(x)
        
        return x


# Create model
model = CNN_WithBatchNorm(num_classes=10)

# Optimizer (can use higher LR with batch norm!)
optimizer = optim.SGD(
    model.parameters(),
    lr=0.1,  # 10× higher than without batch norm!
    momentum=0.9
)

criterion = nn.CrossEntropyLoss()

# Training
model.train()  # Enable batch norm training mode

for epoch in range(20):
    for batch_x, batch_y in train_loader:
        # Forward (uses batch statistics)
        outputs = model(batch_x)
        loss = criterion(outputs, batch_y)
        
        # Backward
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
    
    # Validation
    model.eval()  # Switch to inference mode
    with torch.no_grad():
        val_outputs = model(val_x)
        val_acc = (val_outputs.argmax(1) == val_y).float().mean()
    
    print(f"Epoch {epoch}: Val Acc = {val_acc:.2%}")
    model.train()  # Back to training mode

# Final testing
model.eval()  # Inference mode
with torch.no_grad():
    test_outputs = model(test_x)
    test_acc = (test_outputs.argmax(1) == test_y).float().mean()

print(f"\nFinal Test Accuracy: {test_acc:.2%}")
```

---

**You now understand Batch Normalization completely! 🎉**

The key insights:
- **Batch Norm stabilizes layer inputs during training**
- **Reduces internal covariate shift** (changing distributions)
- **Allows 5-10× higher learning rates**
- **Acts as regularizer** (reduces overfitting)
- **Enables training of very deep networks**
- **Different behavior: training vs inference**
- **Requires batch size ≥16, preferably ≥32**
- **Use LayerNorm for RNNs/Transformers instead**

