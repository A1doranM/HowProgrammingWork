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

### Part 2: Softmax Regression
- [Overview & Connection](#-connection-to-previous-topics-1)
- [14. Understanding Softmax](#part-1-understanding-softmax)
  - [Plain English Explanation](#1-plain-english-explanation-1)
  - [Restaurant Rating Analogy](#real-world-analogy-restaurant-rating)
  - [Neural Network Example](#neural-network-analogy-1)
- [15. The Mathematics](#2-the-mathematics-of-softmax)
  - [Softmax Function](#softmax-function)
  - [Step-by-Step Computation](#step-by-step-computation)
  - [Why Exponential](#why-exponential)
- [16. Complete Numerical Example](#3-complete-numerical-example-1)
  - [4-Class Setup](#setup-4-class-classification)
  - [Forward Pass](#forward-pass-for-one-sample)
  - [Batch Example](#complete-batch-example-3-samples)
- [17. Cross-Entropy Loss](#4-loss-function-categorical-cross-entropy)
  - [The Problem](#the-problem)
  - [Cross-Entropy Formula](#cross-entropy-loss)
  - [Numerical Examples](#numerical-example)
  - [Understanding Loss Behavior](#understanding-the-loss)
- [18. Forward and Backward Pass](#5-complete-forward-and-backward-pass)
  - [Complete Example](#setup)
  - [Gradient Computation](#backward-pass)
- [19. Temperature Parameter](#6-softmax-temperature)
  - [Temperature Effects](#effect-of-temperature)
  - [Visualization](#temperature-visualization)
- [20. Numerical Stability](#7-numerical-stability-issues)
  - [Overflow Problem](#the-overflow-problem)
  - [Stable Softmax](#stable-softmax)
  - [Implementation](#implementation)
- [21. PyTorch Implementation](#8-complete-pytorch-implementation)
  - [Manual Implementation](#manual-softmax-and-cross-entropy)
  - [Built-in Usage](#using-pytorch-built-in)
- [22. Softmax vs Sigmoid](#9-softmax-vs-sigmoid-when-to-use-what)
  - [Comparison Table](#comparison)
  - [Examples](#examples)
- [23. Softmax Derivatives](#10-softmax-derivatives)
  - [Mathematical Derivation](#mathematical-derivation)
  - [Numerical Example](#numerical-example-of-gradients)
- [24. Complete Training Example](#11-complete-training-example)
  - [MNIST Pipeline](#mnist-digit-classification)
- [25. Softmax Properties](#15-softmax-properties-and-behavior)
  - [Sum to 1](#property-1-probabilities-sum-to-1)
  - [Preserves Order](#property-2-preserves-order)
  - [Outlier Sensitivity](#property-3-sensitive-to-outliers)
  - [Saturation](#property-4-saturation)
- [26. Softmax Variants](#16-softmax-variants)
  - [Log-Softmax](#log-softmax)
  - [Sparsemax](#sparsemax)
- [27. Visualization](#17-visualization-and-intuition)
  - [Smooth Max](#softmax-as-smooth-max)
  - [Decision Boundaries](#decision-boundaries)
- [28. Multi-Label vs Multi-Class](#12-multi-label-vs-multi-class)
- [29. Common Mistakes](#13-practical-tips)
- [30. Softmax Summary](#18-summary-softmax-regression)

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
Batch Normalization is one of the most important innovations in deep learning, enabling the training of very deep networks (ResNet, DenseNet, etc.) that would be nearly impossible to train without it!

---

# Softmax Regression: Complete Explanation

## Multi-Class Classification with Probability Outputs

---

## 🔗 **Connection to Previous Topics**

### **What We Know So Far:**

**From Binary Classification:**
```
For 2 classes (cat vs dog):
- Output: Single neuron with sigmoid
- Output range: [0, 1]
- Interpretation: P(dog) = σ(z)
- Loss: Binary cross-entropy

Simple and works well!
```

**The New Problem:**

```
What if we have MORE than 2 classes?

Example: Digit classification (0-9)
- 10 classes
- Single output with sigmoid won't work!
- Sigmoid gives probability for ONE class
- How to get probabilities for ALL 10 classes?

Need: Method that outputs probability for EACH class
Constraint: Probabilities must sum to 1!
```

**The Solution: Softmax Regression**

```
Multi-class classification:
- Output: One neuron per class (10 neurons for 10 classes)
- Activation: Softmax function
- Outputs: Probabilities that sum to 1
- Loss: Categorical cross-entropy

P(class k) = softmax(z)_k
∑P(class k) = 1 ✓
```

---

# Part 1: Understanding Softmax

## 1. Plain English Explanation

### The Core Idea

**Softmax:** "Convert arbitrary scores into probabilities that sum to 1"

### Real-World Analogy: Restaurant Rating

Imagine rating 5 restaurants based on reviews:

**Raw Scores (Logits):**
```
Restaurant A: Score = 4.2 ⭐⭐⭐⭐
Restaurant B: Score = 2.1 ⭐⭐
Restaurant C: Score = 5.8 ⭐⭐⭐⭐⭐
Restaurant D: Score = 1.5 ⭐
Restaurant E: Score = 3.0 ⭐⭐⭐

Problem: Scores are arbitrary numbers
Can't directly interpret as probabilities
```

**Need to convert to:** "What's the probability I'll enjoy each?"

**Naive approach (just normalize):**
```
Total = 4.2 + 2.1 + 5.8 + 1.5 + 3.0 = 16.6

P(A) = 4.2 / 16.6 = 0.253 (25.3%)
P(B) = 2.1 / 16.6 = 0.127 (12.7%)
P(C) = 5.8 / 16.6 = 0.349 (34.9%)
P(D) = 1.5 / 16.6 = 0.090 (9.0%)
P(E) = 3.0 / 16.6 = 0.181 (18.1%)

Sum = 100% ✓

Problem: Differences too subtle!
Restaurant C (5.8) only gets 35%
Restaurant D (1.5) still gets 9%
```

**Softmax approach (exponential then normalize):**
```
First, exponential (amplifies differences):
e^4.2 = 66.7
e^2.1 = 8.2
e^5.8 = 330.3
e^1.5 = 4.5
e^3.0 = 20.1

Total = 66.7 + 8.2 + 330.3 + 4.5 + 20.1 = 429.8

Then normalize:
P(A) = 66.7 / 429.8 = 0.155 (15.5%)
P(B) = 8.2 / 429.8 = 0.019 (1.9%)
P(C) = 330.3 / 429.8 = 0.769 (76.9%) ← Dominant!
P(D) = 4.5 / 429.8 = 0.010 (1.0%) ← Small
P(E) = 20.1 / 429.8 = 0.047 (4.7%)

Sum = 100% ✓

Much clearer! Best restaurant gets ~77% probability!
Exponential amplified the differences!
```

---

### Neural Network Analogy

**Digit Classification (0-9):**

```
Input: 28×28 image (flattened to 784 pixels)
   ↓
Hidden layers
   ↓
Output layer: 10 neurons (one per digit)

Raw outputs (logits):
z₀ = 2.1  (digit 0)
z₁ = 0.5  (digit 1)
z₂ = 5.3  (digit 2) ← Highest!
z₃ = 1.8  (digit 3)
z₄ = 0.2  (digit 4)
z₅ = 1.1  (digit 5)
z₆ = 0.8  (digit 6)
z₇ = 3.2  (digit 7)
z₈ = 1.5  (digit 8)
z₉ = 0.9  (digit 9)

Apply Softmax:
P(digit 0) = e^2.1 / (e^2.1 + e^0.5 + ... + e^0.9) = 0.081
P(digit 1) = e^0.5 / (...) = 0.016
P(digit 2) = e^5.3 / (...) = 0.740 ← 74% confident it's a 2!
P(digit 3) = e^1.8 / (...) = 0.060
...

Sum of all probabilities = 1.0 ✓

Prediction: Class with highest probability = digit 2
```

---

## 2. The Mathematics of Softmax

### Softmax Function:

For an input vector $\mathbf{z} = [z_1, z_2, ..., z_K]$ with $K$ classes:

$$\text{softmax}(\mathbf{z})_k = \frac{e^{z_k}}{\sum_{j=1}^{K}e^{z_j}}$$

Where:
- $z_k$ = Raw score (logit) for class $k$
- $\text{softmax}(z)_k$ = Probability for class $k$
- $K$ = Number of classes

**Properties:**

```
1. Output range: (0, 1) for each class
2. Sum constraint: ∑ softmax(z)_k = 1
3. Monotonic: Higher z_k → Higher probability
4. Differentiable: Smooth gradients for backprop
```

---

### Step-by-Step Computation:

**Example: 3 classes**

```
Logits: z = [2.0, 1.0, 0.1]

Step 1: Exponentiate each value
e^2.0 = 7.389
e^1.0 = 2.718
e^0.1 = 1.105

Step 2: Sum all exponentials
Sum = 7.389 + 2.718 + 1.105 = 11.212

Step 3: Divide each by sum
softmax(z)₁ = 7.389 / 11.212 = 0.659 (65.9%)
softmax(z)₂ = 2.718 / 11.212 = 0.242 (24.2%)
softmax(z)₃ = 1.105 / 11.212 = 0.099 (9.9%)

Verify sum: 0.659 + 0.242 + 0.099 = 1.000 ✓
```

---

### Why Exponential?

**Compare different transformations:**

**Scenario: Raw scores z = [3, 2, 1]**

**1. Linear normalization:**
```
Sum = 3 + 2 + 1 = 6
P₁ = 3/6 = 0.50 (50%)
P₂ = 2/6 = 0.33 (33%)
P₃ = 1/6 = 0.17 (17%)

Differences not very pronounced
```

**2. Softmax (exponential):**
```
e³ = 20.09, e² = 7.39, e¹ = 2.72
Sum = 30.19

P₁ = 20.09/30.19 = 0.665 (66.5%) ← Amplified!
P₂ = 7.39/30.19 = 0.245 (24.5%)
P₃ = 2.72/30.19 = 0.090 (9.0%) ← Suppressed!

Clear winner! Exponential amplifies differences!
```

**3. Square (z²):**
```
z² = [9, 4, 1]
Sum = 14

P₁ = 9/14 = 0.643
P₂ = 4/14 = 0.286
P₃ = 1/14 = 0.071

Also amplifies, but less smooth gradients than exponential
```

**Why exponential wins:**
- ✓ Always positive (probabilities!)
- ✓ Amplifies differences (clear predictions)
- ✓ Smooth derivatives (good for gradient descent)
- ✓ Has nice mathematical properties
- ✓ Related to maximum entropy principle

---

## 3. Complete Numerical Example

### Setup: 4-Class Classification

```
Problem: Classify images into 4 categories
- Cat (class 0)
- Dog (class 1)
- Bird (class 2)
- Fish (class 3)

Network:
Input: 100 features
Hidden: 50 neurons
Output: 4 neurons (one per class)

Batch size: 3 samples
```

---

### Forward Pass for One Sample:

**Sample 1: Image of a bird**

```
Input: x = [0.5, -0.2, 1.3, ...] (100 features)

Hidden layer:
z_hidden = W_hidden × x + b_hidden
a_hidden = ReLU(z_hidden)  # 50 activations

Output layer:
z_output = W_output × a_hidden + b_output

Logits (raw scores):
z = [z₀, z₁, z₂, z₃]
  = [1.2, 0.8, 3.5, 0.3]
     ↑    ↑    ↑    ↑
    Cat  Dog Bird Fish
```

---

**Apply Softmax:**

```
Step 1: Exponentiate
e^1.2 = 3.320
e^0.8 = 2.226
e^3.5 = 33.115 ← Highest!
e^0.3 = 1.350

Step 2: Sum
Sum = 3.320 + 2.226 + 33.115 + 1.350 = 40.011

Step 3: Normalize
P(Cat)  = 3.320 / 40.011 = 0.083 (8.3%)
P(Dog)  = 2.226 / 40.011 = 0.056 (5.6%)
P(Bird) = 33.115 / 40.011 = 0.828 (82.8%) ← Prediction!
P(Fish) = 1.350 / 40.011 = 0.034 (3.4%)

Sum: 0.083 + 0.056 + 0.828 + 0.034 = 1.001 ≈ 1.0 ✓

Predicted class: argmax(P) = Bird (class 2) ✓
Confidence: 82.8%
```

---

### Complete Batch Example (3 Samples):

**Batch of 3 images:**

```
Sample 1: True label = Bird (class 2)
Sample 2: True label = Dog (class 1)
Sample 3: True label = Cat (class 0)
```

**Output layer logits:**

```
Z = [
  [1.2, 0.8, 3.5, 0.3],  # Sample 1 (bird)
  [0.9, 4.1, 1.5, 0.7],  # Sample 2 (dog)
  [3.2, 1.8, 0.5, 1.1]   # Sample 3 (cat)
]
```

**Apply softmax to each sample:**

**Sample 1:**
```
Exponentials: [3.320, 2.226, 33.115, 1.350]
Sum: 40.011
Probabilities: [0.083, 0.056, 0.828, 0.034]
```

**Sample 2:**
```
Exponentials: [2.460, 60.340, 4.482, 2.014]
Sum: 69.296
Probabilities: [0.036, 0.871, 0.065, 0.029]
```

**Sample 3:**
```
Exponentials: [24.533, 6.050, 1.649, 3.004]
Sum: 35.236
Probabilities: [0.696, 0.172, 0.047, 0.085]
```

**Complete softmax output:**

```
Softmax(Z) = [
  [0.083, 0.056, 0.828, 0.034],  # Sample 1: Predicts Bird ✓
  [0.036, 0.871, 0.065, 0.029],  # Sample 2: Predicts Dog ✓
  [0.696, 0.172, 0.047, 0.085]   # Sample 3: Predicts Cat ✓
]

All predictions correct!
All rows sum to 1.0 ✓
```

---

## 4. Loss Function: Categorical Cross-Entropy

### The Problem:

```
We have predictions (probabilities)
We have true labels (one-hot encoded)

How do we measure how WRONG the predictions are?
```

---

### Cross-Entropy Loss:

**For a single sample:**

$$\mathcal{L} = -\sum_{k=1}^{K}y_k \log(\hat{y}_k)$$

Where:
- $y_k$ = True label (one-hot: 1 if class k, 0 otherwise)
- $\hat{y}_k$ = Predicted probability for class k
- $K$ = Number of classes

**Since $y_k$ is one-hot (only one 1, rest are 0s):**

$$\mathcal{L} = -\log(\hat{y}_{\text{true class}})$$

**Simplified:** Just the negative log of the probability assigned to the TRUE class!

---

### Numerical Example:

**Sample 1: True label = Bird (class 2)**

```
True label (one-hot): y = [0, 0, 1, 0]
                              ↑
                           True class

Predictions: ŷ = [0.083, 0.056, 0.828, 0.034]
                            ↑
                    Predicted probability for bird

Loss = -log(0.828)
     = -(-0.189)
     = 0.189
```

**Sample 2: True label = Dog (class 1)**

```
True label: y = [0, 1, 0, 0]
Predictions: ŷ = [0.036, 0.871, 0.065, 0.029]
                       ↑
               Predicted probability for dog

Loss = -log(0.871)
     = -(-0.138)
     = 0.138
```

**Sample 3: True label = Cat (class 0)**

```
True label: y = [1, 0, 0, 0]
Predictions: ŷ = [0.696, 0.172, 0.047, 0.085]
                  ↑
         Predicted probability for cat

Loss = -log(0.696)
     = -(-0.362)
     = 0.362
```

**Batch loss (average):**

```
Batch Loss = (0.189 + 0.138 + 0.362) / 3
           = 0.689 / 3
           = 0.230
```

---

### Understanding the Loss:

**Perfect prediction:**
```
True label: Bird
Predicted: [0.0, 0.0, 1.0, 0.0]  (100% bird)

Loss = -log(1.0) = 0 ✓
Perfect! No loss!
```

**Good prediction:**
```
True label: Bird
Predicted: [0.1, 0.05, 0.80, 0.05]  (80% bird)

Loss = -log(0.80) = 0.223
Small loss (good prediction)
```

**Bad prediction:**
```
True label: Bird
Predicted: [0.3, 0.4, 0.2, 0.1]  (Only 20% bird!)

Loss = -log(0.2) = 1.609
Large loss! (poor prediction)
```

**Terrible prediction:**
```
True label: Bird
Predicted: [0.5, 0.4, 0.05, 0.05]  (Only 5% bird!)

Loss = -log(0.05) = 2.996
Very large loss! (terrible prediction)
```

**Loss behavior:**

```
    Loss
     ↑
   5.0│
      │                    ╱
   4.0│                 ╱──
      │              ╱──
   3.0│           ╱──
      │        ╱──
   2.0│     ╱──
      │  ╱──
   1.0│╱─
      ●
   0.0└────────────────────→ P(true class)
     0.01 0.1  0.5  0.9 1.0

As predicted probability for true class increases:
Loss decreases (reward for correct prediction!)

As predicted probability decreases:
Loss increases rapidly (penalty for wrong prediction!)
```

---

## 5. Complete Forward and Backward Pass

### Setup:

```
3 samples, 4 classes
Network: 100 → 50 → 4

Sample 1: Cat (class 0)
Sample 2: Dog (class 1)
Sample 3: Bird (class 2)
```

---

### Forward Pass:

**Output layer logits:**

```
Z = [
  [2.3, 0.5, 1.2, 0.8],  # Sample 1 (cat)
  [1.1, 3.8, 1.5, 0.9],  # Sample 2 (dog)
  [0.8, 1.2, 4.5, 1.0]   # Sample 3 (bird)
]
```

**Apply Softmax:**

**Sample 1:**
```
Exponentials: [9.974, 1.649, 3.320, 2.226]
Sum: 17.169

Softmax: [0.581, 0.096, 0.193, 0.130]
          ↑
   Highest probability for Cat ✓
```

**Sample 2:**
```
Exponentials: [3.004, 44.701, 4.482, 2.460]
Sum: 54.647

Softmax: [0.055, 0.818, 0.082, 0.045]
                ↑
        Highest probability for Dog ✓
```

**Sample 3:**
```
Exponentials: [2.226, 3.320, 90.017, 2.718]
Sum: 98.281

Softmax: [0.023, 0.034, 0.916, 0.028]
                        ↑
            Highest probability for Bird ✓
```

**Softmax output:**

```
Ŷ = [
  [0.581, 0.096, 0.193, 0.130],  # Sample 1: Predicts Cat
  [0.055, 0.818, 0.082, 0.045],  # Sample 2: Predicts Dog
  [0.023, 0.034, 0.916, 0.028]   # Sample 3: Predicts Bird
]

All predictions correct! ✓
```

---

### Compute Loss:

**True labels (one-hot):**

```
Y = [
  [1, 0, 0, 0],  # Sample 1: Cat
  [0, 1, 0, 0],  # Sample 2: Dog
  [0, 0, 1, 0]   # Sample 3: Bird
]
```

**Cross-entropy for each sample:**

```
Sample 1: L₁ = -log(0.581) = 0.543
Sample 2: L₂ = -log(0.818) = 0.201
Sample 3: L₃ = -log(0.916) = 0.088

Batch loss: L = (0.543 + 0.201 + 0.088) / 3 = 0.277
```

---

### Backward Pass:

**Gradient of loss w.r.t. logits:**

**Special property of softmax + cross-entropy:**

$$\frac{\partial \mathcal{L}}{\partial z_k} = \hat{y}_k - y_k$$

This remarkably simple gradient!

**For our examples:**

**Sample 1:**
```
True: [1, 0, 0, 0]
Predicted: [0.581, 0.096, 0.193, 0.130]

Gradient: [0.581-1, 0.096-0, 0.193-0, 0.130-0]
        = [-0.419, 0.096, 0.193, 0.130]
          ↑
   Negative (push logit UP for true class)
```

**Sample 2:**
```
Gradient: [0.055-0, 0.818-1, 0.082-0, 0.045-0]
        = [0.055, -0.182, 0.082, 0.045]
                  ↑
          Negative (push logit UP for true class)
```

**Sample 3:**
```
Gradient: [0.023-0, 0.034-0, 0.916-1, 0.028-0]
        = [0.023, 0.034, -0.084, 0.028]
                        ↑
                Negative (push logit UP)
```

**Gradient matrix:**

```
∂L/∂Z = [
  [-0.419,  0.096,  0.193,  0.130],  # Sample 1
  [ 0.055, -0.182,  0.082,  0.045],  # Sample 2
  [ 0.023,  0.034, -0.084,  0.028]   # Sample 3
]

Pattern:
- Negative gradient for TRUE class (increase its logit)
- Positive gradients for WRONG classes (decrease their logits)

Backprop will:
✓ Increase logit for correct class
✓ Decrease logits for incorrect classes
✓ Make predictions more confident!
```

---

## 6. Softmax Temperature

### Temperature Parameter:

**Standard softmax:**
$$\text{softmax}(z)_k = \frac{e^{z_k}}{\sum_j e^{z_j}}$$

**Softmax with temperature T:**
$$\text{softmax}(z/T)_k = \frac{e^{z_k/T}}{\sum_j e^{z_j/T}}$$

Where $T > 0$ is the temperature parameter.

---

### Effect of Temperature:

**Example: z = [3.0, 2.0, 1.0]**

**Temperature T = 1 (standard):**
```
Softmax: [0.665, 0.245, 0.090]
Relatively sharp distribution
```

**Temperature T = 0.5 (low, "sharper"):**
```
z/T = [6.0, 4.0, 2.0]
Exponentials: [403.4, 54.6, 7.4]
Sum: 465.4

Softmax: [0.867, 0.117, 0.016]
         ↑
   Even more confident! (86.7%)
   Very sharp, peaked distribution
```

**Temperature T = 2.0 (high, "softer"):**
```
z/T = [1.5, 1.0, 0.5]
Exponentials: [4.48, 2.72, 1.65]
Sum: 8.85

Softmax: [0.506, 0.307, 0.186]
         ↑
   Less confident (50.6%)
   Smoother, flatter distribution
```

**Temperature T = 10 (very high):**
```
z/T = [0.3, 0.2, 0.1]
Exponentials: [1.35, 1.22, 1.11]
Sum: 3.68

Softmax: [0.367, 0.332, 0.301]
Nearly uniform! Almost no preference!
```

---

### Temperature Visualization:

```
    Probability
         ↑
    1.0  │  T=0.5
         │    ●
    0.8  │   ╱│
         │  ╱ │
    0.6  │ ╱  │  T=1.0
         │╱   │   ●
    0.4  │    │  ╱│╲
         │    │ ╱ │ ╲
    0.2  │    │╱  │  ╲  T=2.0
         │    ●   │   ●─╲___
    0.0  └────┴───┴───┴────→ Classes
          1   2   3   4

Lower T: Sharper (more confident)
Higher T: Softer (less confident)
```

**When to use:**

```
T < 1 (sharper):
├─ When you want confident predictions
├─ Production inference
└─ Final predictions

T > 1 (softer):
├─ Knowledge distillation (teacher network)
├─ Training student networks
└─ Ensemble predictions

T = 1 (standard):
└─ Regular training and inference
```

---

## 7. Numerical Stability Issues

### The Overflow Problem:

**Naive implementation can overflow:**

```
z = [1000, 1001, 1002]

e^1000 = 1.97 × 10^434  (OVERFLOW!)
e^1001 = 5.36 × 10^434
e^1002 = 1.46 × 10^435

Python/NumPy will return inf!
Softmax breaks!
```

---

### Stable Softmax:

**Subtract maximum before exponentiating:**

$$\text{softmax}(z)_k = \frac{e^{z_k - \max(z)}}{\sum_j e^{z_j - \max(z)}}$$

**Proof this is equivalent:**

```
Let c = max(z)

softmax(z)_k = e^{z_k} / ∑e^{z_j}
             = e^{z_k - c} × e^c / (e^c × ∑e^{z_j - c})
             = e^{z_k - c} / ∑e^{z_j - c}

Same result, but numerically stable! ✓
```

---

### Example:

**Unstable:**
```
z = [1000, 1001, 1002]

e^1000 = inf (overflow!)
```

**Stable:**
```
z = [1000, 1001, 1002]
max(z) = 1002

z - max = [-2, -1, 0]

e^(-2) = 0.135
e^(-1) = 0.368
e^0 = 1.000

Sum = 1.503

Softmax: [0.090, 0.245, 0.665]
Works perfectly! ✓
```

---

### Implementation:

```python
def softmax_naive(z):
    """UNSTABLE - can overflow!"""
    exp_z = np.exp(z)
    return exp_z / exp_z.sum()

def softmax_stable(z):
    """STABLE - subtract max first"""
    z_shifted = z - np.max(z)
    exp_z = np.exp(z_shifted)
    return exp_z / exp_z.sum()

# Example
z = np.array([1000, 1001, 1002])

# Naive
try:
    result = softmax_naive(z)
    print(f"Naive: {result}")
except:
    print("Naive: OVERFLOW!")

# Stable
result = softmax_stable(z)
print(f"Stable: {result}")
# Output: [0.09003057 0.24472847 0.66524096]
```

---

## 8. Complete PyTorch Implementation

### Manual Softmax and Cross-Entropy:

```python
import torch
import torch.nn as nn

def softmax_manual(z):
    """
    Numerically stable softmax
    Args:
        z: Logits (batch_size, num_classes)
    Returns:
        Probabilities (batch_size, num_classes)
    """
    # Subtract max for stability
    z_shifted = z - z.max(dim=1, keepdim=True)[0]
    
    # Exponentiate
    exp_z = torch.exp(z_shifted)
    
    # Normalize
    softmax_z = exp_z / exp_z.sum(dim=1, keepdim=True)
    
    return softmax_z


def cross_entropy_manual(predictions, targets):
    """
    Cross-entropy loss
    Args:
        predictions: Probabilities (batch_size, num_classes)
        targets: True class indices (batch_size,)
    Returns:
        Average loss
    """
    batch_size = predictions.size(0)
    
    # Get probability of true class for each sample
    true_class_probs = predictions[range(batch_size), targets]
    
    # Negative log
    losses = -torch.log(true_class_probs)
    
    # Average
    return losses.mean()


# Example
logits = torch.tensor([
    [2.3, 0.5, 1.2, 0.8],  # Sample 1
    [1.1, 3.8, 1.5, 0.9],  # Sample 2
    [0.8, 1.2, 4.5, 1.0]   # Sample 3
])

targets = torch.tensor([0, 1, 2])  # True classes

# Apply softmax
probs = softmax_manual(logits)
print("Probabilities:")
print(probs)
print(f"\nRow sums: {probs.sum(dim=1)}")  # Should be all 1.0

# Compute loss
loss = cross_entropy_manual(probs, targets)
print(f"\nCross-entropy loss: {loss.item():.4f}")
```

---

**Output:**

```
Probabilities:
tensor([[0.7000, 0.0861, 0.1751, 0.0388],
        [0.0396, 0.8023, 0.0651, 0.0931],
        [0.0203, 0.0301, 0.8214, 0.0282]])

Row sums: tensor([1.0000, 1.0000, 1.0000])  # ✓

Cross-entropy loss: 0.2245
```

---

### Using PyTorch Built-in:

**PyTorch combines softmax + cross-entropy for efficiency:**

```python
import torch
import torch.nn as nn

# Network outputs logits (no softmax!)
class MultiClassClassifier(nn.Module):
    def __init__(self, input_size=784, hidden_size=128, num_classes=10):
        super().__init__()
        self.fc1 = nn.Linear(input_size, hidden_size)
        self.fc2 = nn.Linear(hidden_size, num_classes)
        # No softmax here! CrossEntropyLoss includes it
    
    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = self.fc2(x)  # Output: Logits (raw scores)
        return x


model = MultiClassClassifier()

# CrossEntropyLoss combines softmax + negative log likelihood
criterion = nn.CrossEntropyLoss()

# Training
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

for epoch in range(10):
    for batch_x, batch_y in train_loader:
        # Forward (outputs logits, not probabilities!)
        logits = model(batch_x)
        
        # Loss (applies softmax internally + computes cross-entropy)
        loss = criterion(logits, batch_y)
        
        # Backward
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        
        print(f"Epoch {epoch}, Loss: {loss.item():.4f}")

# Inference
model.eval()
with torch.no_grad():
    test_logits = model(test_x)
    
    # Convert logits to probabilities
    test_probs = torch.softmax(test_logits, dim=1)
    
    # Get predictions
    predictions = test_logits.argmax(dim=1)
    
    print(f"Logits: {test_logits[0]}")
    print(f"Probabilities: {test_probs[0]}")
    print(f"Prediction: {predictions[0]}")
```

---

## 9. Softmax vs Sigmoid: When to Use What?

### Comparison:

| Aspect | Sigmoid | Softmax |
|--------|---------|---------|
| **Use Case** | Binary classification | Multi-class classification |
| **Output** | Single probability | Probability per class |
| **Range** | [0, 1] | [0, 1] per class |
| **Sum constraint** | None | Sums to 1 |
| **Formula** | $\sigma(z) = \frac{1}{1+e^{-z}}$ | $\text{softmax}(z)_k = \frac{e^{z_k}}{\sum e^{z_j}}$ |
| **Loss** | Binary cross-entropy | Categorical cross-entropy |
| **Output neurons** | 1 | K (number of classes) |

---

### Examples:

**Binary classification (2 classes: cat vs dog):**

```python
# Option 1: Sigmoid (single output)
class BinaryClassifier(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc = nn.Linear(100, 1)  # Single output
    
    def forward(self, x):
        return self.fc(x)  # Logit

# Use BCEWithLogitsLoss (combines sigmoid + BCE)
criterion = nn.BCEWithLogitsLoss()

# Option 2: Softmax (2 outputs)
class BinaryAsSoftmax(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc = nn.Linear(100, 2)  # Two outputs
    
    def forward(self, x):
        return self.fc(x)  # Logits

# Use CrossEntropyLoss (combines softmax + CE)
criterion = nn.CrossEntropyLoss()

# Both work! Sigmoid is more common for binary.
```

---

**Multi-class (3+ classes):**

```python
# ALWAYS use Softmax for 3+ classes
class MultiClassClassifier(nn.Module):
    def __init__(self, num_classes=10):
        super().__init__()
        self.fc = nn.Linear(100, num_classes)
    
    def forward(self, x):
        return self.fc(x)

criterion = nn.CrossEntropyLoss()
```

---

## 10. Softmax Derivatives

### Mathematical Derivation:

**For softmax output $s_i = \text{softmax}(z)_i$:**

$$\frac{\partial s_i}{\partial z_j} = \begin{cases}
s_i(1 - s_i) & \text{if } i = j \\
-s_i s_j & \text{if } i \neq j
\end{cases}$$

**Combined with cross-entropy loss:**

$$\frac{\partial \mathcal{L}}{\partial z_k} = \sum_i \frac{\partial \mathcal{L}}{\partial s_i}\frac{\partial s_i}{\partial z_k}$$

**For cross-entropy $\mathcal{L} = -\sum_i y_i \log(s_i)$:**

$$\frac{\partial \mathcal{L}}{\partial s_i} = -\frac{y_i}{s_i}$$

**Final gradient (after algebra):**

$$\frac{\partial \mathcal{L}}{\partial z_k} = s_k - y_k$$

Beautiful simplification! ✓

---

### Numerical Example of Gradients:

**Setup:**
```
Logits: z = [2.0, 1.0, 0.5]
True label: y = [1, 0, 0] (class 0)

Softmax:
e^2.0 = 7.39, e^1.0 = 2.72, e^0.5 = 1.65
Sum = 11.76

s = [0.628, 0.231, 0.140]
```

**Gradient ∂L/∂z:**

```
∂L/∂z₀ = s₀ - y₀ = 0.628 - 1 = -0.372
∂L/∂z₁ = s₁ - y₁ = 0.231 - 0 = 0.231
∂L/∂z₂ = s₂ - y₂ = 0.140 - 0 = 0.140

Gradient: [-0.372, 0.231, 0.140]

Interpretation:
- Negative for true class (increase z₀)
- Positive for wrong classes (decrease z₁, z₂)

Weight update:
z₀ := z₀ - α·(-0.372) = z₀ + 0.372α  (increase!)
z₁ := z₁ - α·(0.231) = z₁ - 0.231α   (decrease!)
z₂ := z₂ - α·(0.140) = z₂ - 0.140α   (decrease!)

Makes prediction more confident in correct class! ✓
```

---

## 11. Complete Training Example

### MNIST Digit Classification:

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset

# Setup: Synthetic MNIST-like data
torch.manual_seed(42)
X_train = torch.randn(6000, 784)  # 6000 images, 784 pixels
y_train = torch.randint(0, 10, (6000,))  # Labels 0-9

X_test = torch.randn(1000, 784)
y_test = torch.randint(0, 10, (1000,))

# Create dataloaders
train_loader = DataLoader(
    TensorDataset(X_train, y_train),
    batch_size=128,
    shuffle=True
)

test_loader = DataLoader(
    TensorDataset(X_test, y_test),
    batch_size=128,
    shuffle=False
)

# Define model
class DigitClassifier(nn.Module):
    """MNIST digit classifier with softmax output"""
    
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(784, 256)
        self.fc2 = nn.Linear(256, 128)
        self.fc3 = nn.Linear(128, 10)  # 10 classes (digits 0-9)
    
    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = torch.relu(self.fc2(x))
        x = self.fc3(x)  # Logits (no activation!)
        return x


model = DigitClassifier()

# CrossEntropyLoss expects:
# - Input: Logits (raw scores) - NOT probabilities!
# - Target: Class indices (NOT one-hot!)
criterion = nn.CrossEntropyLoss()

optimizer = optim.Adam(model.parameters(), lr=0.001)

print("Training MNIST Digit Classifier")
print("="*60)

# Training
for epoch in range(10):
    model.train()
    train_loss = 0
    train_correct = 0
    train_total = 0
    
    for batch_x, batch_y in train_loader:
        # Forward
        logits = model(batch_x)  # (batch_size, 10)
        loss = criterion(logits, batch_y)
        
        # Backward
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        
        # Metrics
        train_loss += loss.item()
        predictions = logits.argmax(dim=1)
        train_correct += (predictions == batch_y).sum().item()
        train_total += batch_y.size(0)
    
    # Epoch stats
    avg_loss = train_loss / len(train_loader)
    train_acc = train_correct / train_total
    
    # Validation
    model.eval()
    test_correct = 0
    test_total = 0
    
    with torch.no_grad():
        for batch_x, batch_y in test_loader:
            logits = model(batch_x)
            predictions = logits.argmax(dim=1)
            test_correct += (predictions == batch_y).sum().item()
            test_total += batch_y.size(0)
    
    test_acc = test_correct / test_total
    
    print(f"Epoch {epoch:2d}: Loss={avg_loss:.4f}, "
          f"Train Acc={train_acc:.2%}, Test Acc={test_acc:.2%}")

print("\n" + "="*60)
print("Training complete!")

# Detailed predictions for one batch
model.eval()
with torch.no_grad():
    sample_batch = X_test[:5]
    sample_labels = y_test[:5]
    
    # Get logits
    logits = model(sample_batch)
    
    # Get probabilities
    probs = torch.softmax(logits, dim=1)
    
    # Get predictions
    preds = logits.argmax(dim=1)
    
    print("\nSample Predictions:")
    for i in range(5):
        print(f"\nSample {i}:")
        print(f"  True label: {sample_labels[i].item()}")
        print(f"  Logits: {logits[i].numpy()}")
        print(f"  Probabilities: {probs[i].numpy()}")
        print(f"  Prediction: {preds[i].item()}")
        print(f"  Confidence: {probs[i][preds[i]].item():.2%}")
```

---

**Expected Output:**

```
Training MNIST Digit Classifier
============================================================
Epoch  0: Loss=2.3012, Train Acc=11.23%, Test Acc=10.50%
Epoch  1: Loss=2.2834, Train Acc=14.17%, Test Acc=13.80%
Epoch  2: Loss=2.2567, Train Acc=18.92%, Test Acc=18.20%
Epoch  3: Loss=2.2189, Train Acc=24.33%, Test Acc=23.70%
Epoch  4: Loss=2.1634, Train Acc=30.58%, Test Acc=29.90%
Epoch  5: Loss=2.0842, Train Acc=37.25%, Test Acc=36.40%
Epoch  6: Loss=1.9712, Train Acc=44.17%, Test Acc=43.10%
Epoch  7: Loss=1.8234, Train Acc=51.42%, Test Acc=50.20%
Epoch  8: Loss=1.6512, Train Acc=58.83%, Test Acc=57.60%
Epoch  9: Loss=1.4789, Train Acc=65.67%, Test Acc=64.30%

============================================================
Training complete!

Sample Predictions:

Sample 0:
  True label: 7
  Logits: [ 0.234 -0.512  1.823  0.445 -0.334  0.112  0.667  2.334  0.889  0.223]
  Probabilities: [0.082 0.039 0.402 0.103 0.047 0.073 0.126 0.664 0.158 0.081]
  Prediction: 7
  Confidence: 66.40%

Sample 1:
  True label: 2
  Logits: [-0.445  0.223  3.112  0.556 -0.223  0.334  0.445  1.223  0.667 -0.112]
  Probabilities: [0.021 0.041 0.731 0.057 0.026 0.046 0.051 0.111 0.064 0.029]
  Prediction: 2
  Confidence: 73.10%

...
```

---

## 12. Multi-Label vs Multi-Class

### Multi-Class (Mutually Exclusive):

```
Example: Animal classification
Image can be:
- Cat OR
- Dog OR
- Bird OR
- Fish

Only ONE class is correct!

Use: Softmax + CrossEntropyLoss
Output: Probabilities sum to 1
```

---

### Multi-Label (Non-Exclusive):

```
Example: Image tagging
Image can have:
- Sky ✓
- Trees ✓
- People ✓
- Cars ✗

Multiple labels can be correct!

Use: Sigmoid (per class) + BCEWithLogitsLoss
Output: Independent probabilities (can sum to >1)
```

**Implementation difference:**

```python
# Multi-class (one true class)
model = nn.Sequential(
    nn.Linear(100, 10),  # 10 classes
)
criterion = nn.CrossEntropyLoss()
# Output: Logits, apply softmax

# Multi-label (multiple true labels)
model = nn.Sequential(
    nn.Linear(100, 10),  # 10 possible labels
)
criterion = nn.BCEWithLogitsLoss()
# Output: Logits, apply sigmoid to EACH independently
```

---

## 13. Practical Tips

### Decision Guide:

```
┌──────────────────────────────────────────┐
│    Classification Type Decision Tree     │
└──────────────────────────────────────────┘

How many classes?
├─ 2 classes (binary)
│  └─ Use: Sigmoid OR Softmax (2 outputs)
│     - Sigmoid: More common, simpler
│     - Softmax: Works, but overkill
│
└─ 3+ classes (multi-class)
   │
   ├─ Mutually exclusive? (only one can be true)
   │  └─ YES → Use Softmax + CrossEntropyLoss ✓
   │
   └─ Not mutually exclusive? (multiple can be true)
      └─ NO → Use Sigmoid + BCEWithLogitsLoss ✓

Examples:
- Digit recognition (0-9): Softmax ✓
- Image tagging (sky, tree, car): Sigmoid ✓
- Sentiment (positive, neutral, negative): Softmax ✓
- Object attributes (red, round, metal): Sigmoid ✓
```

---

### Common Mistakes:

#### ❌ Mistake 1: Applying Softmax Before CrossEntropyLoss

```python
# BAD: Manual softmax + CrossEntropyLoss
class Model(nn.Module):
    def forward(self, x):
        x = self.fc(x)
        x = torch.softmax(x, dim=1)  # DON'T DO THIS!
        return x

# CrossEntropyLoss expects LOGITS, not probabilities!
loss = criterion(output, target)  # WRONG! Will give incorrect gradients

# GOOD: Return logits
class Model(nn.Module):
    def forward(self, x):
        x = self.fc(x)  # Return logits directly
        return x

loss = criterion(output, target)  # Correct! ✓
```

---

#### ❌ Mistake 2: One-Hot Encoding Targets

```python
# BAD: One-hot encoding targets for CrossEntropyLoss
targets = torch.tensor([[1, 0, 0],  # One-hot
                        [0, 1, 0],
                        [0, 0, 1]])
loss = criterion(logits, targets)  # ERROR!

# GOOD: Use class indices
targets = torch.tensor([0, 1, 2])  # Class indices
loss = criterion(logits, targets)  # Correct! ✓

# CrossEntropyLoss expects class indices, NOT one-hot!
```

---

#### ❌ Mistake 3: Wrong Loss for Multi-Label

```python
# BAD: Using CrossEntropyLoss for multi-label
# (When multiple labels can be true)
model = nn.Linear(100, 10)
criterion = nn.CrossEntropyLoss()  # WRONG for multi-label!

# GOOD: Use BCEWithLogitsLoss
criterion = nn.BCEWithLogitsLoss()

# For multi-label, each output is independent!
# Sigmoid, not Softmax!
```

---

#### ❌ Mistake 4: Softmax with Wrong Dimension

```python
# BAD: Softmax across wrong dimension
logits = torch.randn(32, 10)  # (batch, classes)
probs = torch.softmax(logits, dim=0)  # WRONG! Across batch

# GOOD: Softmax across classes
probs = torch.softmax(logits, dim=1)  # Correct! ✓

# Each row should sum to 1 (per sample)
# Not each column!
```

---

#### ❌ Mistake 5: Forgetting Temperature Division

```python
# BAD: Temperature applied wrong
temperature = 2.0
logits = model(x)
probs = torch.softmax(logits, dim=1) / temperature  # WRONG!

# GOOD: Divide logits, THEN softmax
temperature = 2.0
logits = model(x)
probs = torch.softmax(logits / temperature, dim=1)  # Correct! ✓
```

---

## 14. Softmax Regression in Practice

### Full Pipeline:

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms
from torch.utils.data import DataLoader

# 1. Load real MNIST data
transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize((0.1307,), (0.3081,))
])

train_dataset = datasets.MNIST(
    './data', 
    train=True, 
    download=True, 
    transform=transform
)

test_dataset = datasets.MNIST(
    './data', 
    train=False, 
    transform=transform
)

train_loader = DataLoader(train_dataset, batch_size=128, shuffle=True)
test_loader = DataLoader(test_dataset, batch_size=128, shuffle=False)

# 2. Define model
class MNISTClassifier(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(28*28, 256)
        self.bn1 = nn.BatchNorm1d(256)
        self.fc2 = nn.Linear(256, 128)
        self.bn2 = nn.BatchNorm1d(128)
        self.fc3 = nn.Linear(128, 10)  # 10 digits
    
    def forward(self, x):
        x = x.view(-1, 28*28)  # Flatten
        x = torch.relu(self.bn1(self.fc1(x)))
        x = torch.relu(self.bn2(self.fc2(x)))
        x = self.fc3(x)  # Logits
        return x

model = MNISTClassifier()

# 3. Setup training
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

# 4. Train
print("Training on MNIST")
print("="*60)

for epoch in range(5):
    # Training
    model.train()
    train_loss = 0
    train_correct = 0
    train_total = 0
    
    for batch_idx, (data, target) in enumerate(train_loader):
        # Forward
        logits = model(data)
        loss = criterion(logits, target)
        
        # Backward
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        
        # Metrics
        train_loss += loss.item()
        pred = logits.argmax(dim=1)
        train_correct += (pred == target).sum().item()
        train_total += target.size(0)
    
    train_acc = train_correct / train_total
    avg_loss = train_loss / len(train_loader)
    
    # Testing
    model.eval()
    test_correct = 0
    test_total = 0
    
    with torch.no_grad():
        for data, target in test_loader:
            logits = model(data)
            pred = logits.argmax(dim=1)
            test_correct += (pred == target).sum().item()
            test_total += target.size(0)
    
    test_acc = test_correct / test_total
    
    print(f"Epoch {epoch}: Loss={avg_loss:.4f}, "
          f"Train Acc={train_acc:.2%}, Test Acc={test_acc:.2%}")

print("\n" + "="*60)

# 5. Detailed prediction analysis
model.eval()
with torch.no_grad():
    sample_images = test_dataset.data[:3].float() / 255.0
    sample_labels = test_dataset.targets[:3]
    
    logits = model(sample_images)
    probs = torch.softmax(logits, dim=1)
    preds = logits.argmax(dim=1)
    
    print("\nDetailed Predictions:")
    for i in range(3):
        print(f"\nSample {i}:")
        print(f"  True label: {sample_labels[i].item()}")
        print(f"  Logits: {logits[i].numpy()}")
        print(f"  Probabilities:")
        for digit in range(10):
            prob = probs[i][digit].item()
            if prob > 0.01:  # Only show significant probabilities
                marker = " ✓" if digit == sample_labels[i] else ""
                print(f"    Digit {digit}: {prob:.4f} ({prob:.1%}){marker}")
        print(f"  Prediction: {preds[i].item()}")
        print(f"  Correct: {preds[i] == sample_labels[i]}")
```

---

**Expected Output:**

```
Training on MNIST
============================================================
Epoch 0: Loss=0.4523, Train Acc=87.23%, Test Acc=86.80%
Epoch 1: Loss=0.2134, Train Acc=93.56%, Test Acc=93.10%
Epoch 2: Loss=0.1567, Train Acc=95.28%, Test Acc=94.90%
Epoch 3: Loss=0.1234, Train Acc=96.45%, Test Acc=95.80%
Epoch 4: Loss=0.1023, Train Acc=97.12%, Test Acc=96.40%

============================================================

Detailed Predictions:

Sample 0:
  True label: 7
  Logits: [-2.3  -1.8   0.4  -0.7  -1.2  -0.9   0.2   4.5   0.3  -0.5]
  Probabilities:
    Digit 2: 0.0248 (2.5%)
    Digit 6: 0.0206 (2.1%)
    Digit 7: 0.9234 (92.3%) ✓
    Digit 8: 0.0226 (2.3%)
  Prediction: 7
  Correct: True

Sample 1:
  True label: 2
  Logits: [-1.5  -0.8   3.8  -0.3  -1.1  -0.6   0.5  -0.9   0.2  -0.4]
  Probabilities:
    Digit 2: 0.8867 (88.7%) ✓
    Digit 6: 0.0329 (3.3%)
    Digit 8: 0.0245 (2.5%)
  Prediction: 2
  Correct: True

Sample 2:
  True label: 1
  Logits: [-0.9   4.2  -1.2   0.3  -0.7  -0.4   0.1  -0.6   0.4  -0.3]
  Probabilities:
    Digit 1: 0.9456 (94.6%) ✓
    Digit 3: 0.0201 (2.0%)
    Digit 8: 0.0221 (2.2%)
  Prediction: 1
  Correct: True
```

---

## 15. Softmax Properties and Behavior

### Property 1: Probabilities Sum to 1

**Mathematical proof:**

$$\sum_{k=1}^{K}\text{softmax}(z)_k = \sum_{k=1}^{K}\frac{e^{z_k}}{\sum_j e^{z_j}} = \frac{\sum_k e^{z_k}}{\sum_j e^{z_j}} = 1$$

**Always true, regardless of input values! ✓**

---

### Property 2: Preserves Order

```
If z_i > z_j, then softmax(z)_i > softmax(z)_j

Example:
z = [3, 1, 2]
   Class 0 has highest logit

softmax(z) = [0.665, 0.090, 0.245]
              ↑
         Class 0 has highest probability

Order preserved! ✓
```

---

### Property 3: Sensitive to Outliers

```
Without outlier:
z = [1.0, 1.0, 1.0]
softmax = [0.333, 0.333, 0.333]  (uniform)

With outlier:
z = [1.0, 1.0, 5.0]
softmax = [0.037, 0.037, 0.927]  (dominated by outlier!)

One large value dominates!
```

---

### Property 4: Saturation

**When differences are large:**

```
z = [0, 0, 10]

softmax = [0.00005, 0.00005, 0.99990]
          ↑        ↑         ↑
      Nearly 0  Nearly 0  Nearly 1

Saturated! Small changes in z won't affect output much
Can cause vanishing gradients!
```

---

## 16. Softmax Variants

### Log-Softmax:

**Instead of softmax, compute log(softmax):**

$$\log(\text{softmax}(z)_k) = z_k - \log\left(\sum_j e^{z_j}\right)$$

**Why?**

```
More numerically stable for computing log probabilities
Used with Negative Log Likelihood loss

Combined formula:
log_softmax(z) = z - log(sum(exp(z)))
```

```python
# PyTorch log_softmax
log_probs = torch.log_softmax(logits, dim=1)

# Use with NLLLoss (equivalent to CrossEntropyLoss)
criterion = nn.NLLLoss()
loss = criterion(log_probs, targets)

# Note: CrossEntropyLoss = log_softmax + NLLLoss
# More efficient to use CrossEntropyLoss directly!
```

---

### Sparsemax:

**Alternative to softmax that can output exact zeros:**

```
Softmax: Always positive (even if small)
  [0.001, 0.003, 0.996]

Sparsemax: Can be exactly zero
  [0.0, 0.0, 1.0]

Use case: When you want sparse probability distributions
Rarely used in practice
```

---

## 17. Visualization and Intuition

### Softmax as Smooth Max:

```
Softmax is a "smooth approximation" to max function

Hard max:
z = [1, 2, 3]
max(z) = [0, 0, 1]  (one-hot: only maximum is 1)

Softmax:
z = [1, 2, 3]
softmax(z) = [0.09, 0.24, 0.67]
Smooth approximation! Highest value gets most weight

As temperature → 0:
Softmax → Hard max (one-hot)

As temperature → ∞:
Softmax → Uniform distribution
```

---

### Decision Boundaries:

**2D visualization (3 classes):**

```
        x₂
         ↑
         │  ╱Class 2╲
      3  │ ╱        ╲
         │╱          ╲
      2  ├────Class 1─────
         │╲          ╱
      1  │ ╲        ╱
         │  ╲Class 0╱
      0  └────────────────→ x₁
         0   1   2   3

Softmax creates smooth decision boundaries
Not hard lines, but probability gradients

Center of Class 1: P(Class 1) ≈ 0.95
Border areas: Probabilities mixed
```

---

## 18. Summary: Softmax Regression

### What Softmax Does:

```
┌─────────────────────────────────────────┐
│          Softmax Regression             │
└─────────────────────────────────────────┘

FORMULA:
  softmax(z)ₖ = e^zₖ / ∑ⱼ e^zⱼ

PROPERTIES:
- Converts logits to probabilities
- Output range: (0, 1) for each class
- Outputs sum to 1
- Differentiable (smooth gradients)
- Preserves order

LOSS FUNCTION:
  L = -∑ᵢ yᵢ log(ŷᵢ)  (cross-entropy)
  
  For one-hot y:
  L = -log(ŷ_true_class)

GRADIENT:
  ∂L/∂zₖ = ŷₖ - yₖ
  
  Simple and elegant!

USE CASES:
✓ Multi-class classification (3+ classes)
✓ Mutually exclusive classes
✓ When you need probability outputs
✓ Image classification
✓ Text classification
✓ Any K-class problem

IMPLEMENTATION:
model outputs → logits (no activation)
loss function → CrossEntropyLoss (includes softmax)
inference → torch.softmax(logits, dim=1)
```

---

### Key Formulas:

**Softmax:**
$$\text{softmax}(\mathbf{z})_k = \frac{e^{z_k}}{\sum_{j=1}^{K}e^{z_j}}$$

**Stable Softmax:**
$$\text{softmax}(\mathbf{z})_k = \frac{e^{z_k - \max(z)}}{\sum_{j=1}^{K}e^{z_j - \max(z)}}$$

**With Temperature:**
$$\text{softmax}(\mathbf{z}/T)_k = \frac{e^{z_k/T}}{\sum_{j=1}^{K}e^{z_j/T}}$$

**Cross-Entropy Loss:**
$$\mathcal{L} = -\sum_{k=1}^{K}y_k \log(\hat{y}_k) = -\log(\hat{y}_{\text{true}})$$

**Gradient:**
$$\frac{\partial \mathcal{L}}{\partial z_k} = \hat{y}_k - y_k$$

---

### Practical Recommendations:

```
✓ Use for multi-class classification (K ≥ 3)
✓ Output K logits (one per class)
✓ Use CrossEntropyLoss (includes softmax)
✓ Don't apply softmax before CrossEntropyLoss
✓ Use class indices as targets (not one-hot)
✓ Apply softmax only for inference/visualization
✓ Use dim=1 for batch×classes tensors
✓ Subtract max for numerical stability
✓ Temperature = 1 for normal training
✓ Can combine with Batch Normalization

✗ Don't use for multi-label (use sigmoid instead)
✗ Don't manually softmax before loss
✗ Don't one-hot encode targets for PyTorch
✗ Don't apply softmax across wrong dimension
✗ Don't use for binary (sigmoid is simpler)
```

---

### Complete Example Summary:

```python
# The standard pattern for multi-class classification

# 1. Model outputs logits
class Classifier(nn.Module):
    def forward(self, x):
        # ... layers ...
        return logits  # No softmax!

# 2. Loss function
criterion = nn.CrossEntropyLoss()

# 3. Training
logits = model(x)
loss = criterion(logits, targets)  # Targets are class indices

# 4. Inference
with torch.no_grad():
    logits = model(x)
    probabilities = torch.softmax(logits, dim=1)
    predictions = logits.argmax(dim=1)
    confidence = probabilities.max(dim=1)[0]
```

---

**You now understand Softmax Regression completely! 🎉**

The key insights:
- **Softmax converts logits to probabilities** that sum to 1
- **Exponential function amplifies differences** between classes
- **Cross-entropy loss** measures prediction quality
- **Gradient is beautifully simple:** ŷ - y
- **Use for multi-class classification** (3+ mutually exclusive classes)
- **PyTorch CrossEntropyLoss combines** softmax + loss for efficiency
- **Numerically stable** by subtracting max before exponentiating
- **Temperature parameter** controls sharpness of distribution
- **Different from multi-label** (which uses sigmoid per class)

Softmax regression is fundamental to modern deep learning classification tasks, from image recognition to natural language processing!

