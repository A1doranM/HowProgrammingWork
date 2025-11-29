# Strided Convolution and Pooling in Convolutional Neural Networks

## Table of Contents

1. [Plain English Overview](#plain-english-overview)
2. [General Ideas](#general-ideas)
   - [Key Concepts](#key-concepts)
3. [Mathematical Foundations](#mathematical-foundations)
   - [1. Strided Convolution](#1-strided-convolution)
     - [1.1 Stride Mathematics](#11-stride-mathematics)
     - [1.2 Output Dimension Formulas](#12-output-dimension-formulas)
   - [2. Pooling Operations](#2-pooling-operations)
     - [2.1 Max Pooling](#21-max-pooling)
     - [2.2 Average Pooling](#22-average-pooling)
     - [2.3 Pooling Properties](#23-pooling-properties)
4. [Strided Convolution: Detailed Example](#strided-convolution-detailed-example)
   - [Forward Pass with Stride](#forward-pass-with-stride)
   - [Backward Pass with Stride](#backward-pass-with-stride)
5. [Pooling Operations: Detailed Examples](#pooling-operations-detailed-examples)
   - [Max Pooling Forward Pass](#max-pooling-forward-pass)
   - [Max Pooling Backward Pass](#max-pooling-backward-pass)
   - [Average Pooling Forward Pass](#average-pooling-forward-pass)
   - [Average Pooling Backward Pass](#average-pooling-backward-pass)
6. [Complete CNN Layer Example](#complete-cnn-layer-example)
   - [Setup: Convolution → Max Pool](#setup-convolution--max-pool)
   - [Forward Propagation Through Layers](#forward-propagation-through-layers)
   - [Backward Propagation Through Layers](#backward-propagation-through-layers)
7. [Summary of Key Formulas](#summary-of-key-formulas)
8. [Practical Considerations](#practical-considerations)
9. [Connection to Next Topic](#connection-to-next-topic)

---

## Plain English Overview

**Strided convolution** is a technique where the filter skips positions as it slides across the input, effectively downsampling the output. Instead of moving one pixel at a time, the filter jumps by a specified stride (e.g., 2 or 3 pixels), producing a smaller output.

**Pooling** is a downsampling operation that reduces spatial dimensions while retaining important features. Max pooling selects the maximum value from each region, while average pooling computes the mean. Pooling reduces computation, controls overfitting, and provides translation invariance.

## General Ideas

### Building on Previous Concepts

**What We've Learned So Far:**

In the previous guide on Edge Detection and Padding, we established the fundamentals of convolutional neural networks:

1. **Convolution Operation**: Sliding a filter across an input to detect features (edges, patterns)
   - Formula: `Output[i,j] = Σ Σ I[i+m, j+n] · K[m,n]`
   - Stride was implicitly 1 (move one pixel at a time)
   - Every possible position was processed

2. **Padding**: Adding border pixels to control output dimensions
   - Valid padding (p=0): Output shrinks
   - Same padding (p=(f-1)/2): Output maintains size
   - Addressed dimension reduction and edge information loss

3. **Filter Learning**: Filters are learnable parameters that discover features through backpropagation
   - Forward: Detect patterns
   - Backward: Update filters via gradient descent

**Limitations of Standard Convolution:**

While effective for feature detection, standard convolutions with stride=1 have significant limitations:

1. **Computational Expense**:
   - Processing every pixel position is slow
   - For a 224×224 image with 3×3 filter: 222×222 = 49,284 operations per filter
   - Deep networks with many layers become prohibitively expensive

2. **Memory Consumption**:
   - Large feature maps require substantial memory
   - Each layer maintains similar spatial dimensions (with same padding)
   - GPU memory quickly exhausted with high-resolution images

3. **Lack of Hierarchy**:
   - Early layers should capture fine details
   - Deeper layers should capture abstract, high-level features
   - But without downsampling, all layers operate at same scale

4. **No Translation Invariance**:
   - Object should be recognized regardless of exact pixel location
   - Standard convolution is translation-sensitive
   - Small shifts in input produce different feature maps

**How Stride and Pooling Address These Issues:**

**Strided Convolution** extends the basic convolution operation we learned:
- **Before**: Move filter 1 pixel at a time → Dense sampling
- **Now**: Move filter s pixels at a time → Sparse sampling
- **Improvement**:
  - Reduces output size by factor of ~s²
  - Maintains learned feature detection
  - Computational cost reduced proportionally
  - Creates hierarchical feature maps (fine → coarse)

**Pooling** introduces a complementary downsampling technique:
- **Before**: All convolution outputs equally important
- **Now**: Aggregate regions to extract dominant features
- **Improvement**:
  - Provides translation invariance (max within region doesn't change with small shifts)
  - Reduces dimensionality without learnable parameters (no additional complexity)
  - Retains strongest activations (max pooling) or smoothed response (average pooling)
  - Computational cost is minimal compared to convolution

**Synergy with Previous Concepts:**

| Technique | Purpose | Addresses |
|-----------|---------|-----------|
| **Padding** (learned before) | Control spatial dimensions, preserve border info | Output size management, edge information |
| **Stride** (new) | Downsample through convolution, learn optimal sampling | Computational efficiency, hierarchical features |
| **Pooling** (new) | Downsample through aggregation, provide invariance | Translation invariance, dimensionality reduction |

**Combined Power:**

```
Layer 1: Conv (stride=1) + Padding → Detect fine features
         ↓
         Max Pool (stride=2) → Reduce size, add invariance
         ↓
Layer 2: Conv (stride=1) + Padding → Detect mid-level features on coarser map
         ↓
         Max Pool (stride=2) → Further reduction
         ↓
Layer 3: Conv (stride=2) + Padding → Aggressive downsampling, detect high-level features
         ↓
         Global Average Pool → Spatial information → Single vector
```

This architecture progressively:
- Reduces spatial dimensions (computational efficiency)
- Builds hierarchical features (fine → coarse)
- Adds translation invariance (robust recognition)
- Maintains learned representations (filters still trainable)

**Key Insight:**
- **Padding** (previous): Preserve information
- **Stride & Pooling** (now): Intelligently discard information
- **Together**: Balance between detail preservation and computational efficiency

---

### Key Concepts

**Strided Convolution**: Control output size by skipping positions during convolution.
- Stride of 1: Standard convolution (no skipping)
- Stride of 2: Skip every other position (downsample by factor of ~2)
- Stride of s: Output is roughly 1/s the size of input

**Max Pooling**: Takes the maximum value from each pooling window.
- Preserves strongest activations
- Provides translation invariance
- No learnable parameters

**Average Pooling**: Computes the average value from each pooling window.
- Smooths activations
- Less commonly used than max pooling
- No learnable parameters

**Key Difference from Convolution**:
- Convolution: Learns features through trainable filters
- Pooling: Fixed operation (max or average), no learning

---

## Mathematical Foundations

### 1. Strided Convolution

#### 1.1 Stride Mathematics

**Plain English**: Instead of sliding the filter one position at a time, we move it by `s` positions, where `s` is the stride.

**Stride Parameter:**
- `s`: Number of pixels to move the filter in each step
- Common values: s=1 (standard), s=2 (half size), s=3 (third size)

**Convolution with Stride:**

```
Output[i, j] = Σ   Σ   I[i·s + m, j·s + n] · K[m, n]
             m=0 n=0
             f-1 f-1
```

**Symbol Legend:**
- `s`: Stride (step size)
- `i·s`: Row position in input (multiplied by stride)
- `j·s`: Column position in input (multiplied by stride)
- `i, j`: Output position indices
- `m, n`: Filter position indices
- `f`: Filter size

**Key Difference from Standard Convolution:**
- Standard: `I[i+m, j+n]` (consecutive positions)
- Strided: `I[i·s+m, j·s+n]` (skipped positions)

#### 1.2 Output Dimension Formulas

**Without Padding:**
```
n_H_out = ⌊(n_H - f) / s⌋ + 1
n_W_out = ⌊(n_W - f) / s⌋ + 1
```

**With Padding:**
```
n_H_out = ⌊(n_H + 2p - f) / s⌋ + 1
n_W_out = ⌊(n_W + 2p - f) / s⌋ + 1
```

**Symbol Legend:**
- `⌊·⌋`: Floor function (round down to nearest integer)
- `n_H, n_W`: Input height and width
- `f`: Filter size
- `p`: Padding
- `s`: Stride
- `n_H_out, n_W_out`: Output height and width

**Examples:**

Input 6×6, filter 3×3, no padding:
- Stride 1: ⌊(6-3)/1⌋ + 1 = 4
- Stride 2: ⌊(6-3)/2⌋ + 1 = 2
- Stride 3: ⌊(6-3)/3⌋ + 1 = 2

Input 7×7, filter 3×3, padding 1:
- Stride 1: ⌊(7+2-3)/1⌋ + 1 = 7 (same size)
- Stride 2: ⌊(7+2-3)/2⌋ + 1 = 4
- Stride 3: ⌊(7+2-3)/3⌋ + 1 = 3

---

### 2. Pooling Operations

#### 2.1 Max Pooling

**Plain English**: Divide the input into non-overlapping (or overlapping) windows and select the maximum value from each window.

**Mathematical Formula:**

```
Output[i, j] = max{ I[i·s + m, j·s + n] }
               m,n ∈ window
```

**Symbol Legend:**
- `max{·}`: Maximum function
- `i·s, j·s`: Starting position of pooling window
- `m, n`: Offsets within the pooling window
- Window size: typically f×f (e.g., 2×2 or 3×3)

**Common Configuration:**
- Window size: 2×2
- Stride: 2 (non-overlapping)
- Output size: roughly half the input size in each dimension

**Properties:**
1. **No parameters to learn** (unlike convolution)
2. **Translation invariance**: Small shifts don't change output much
3. **Keeps strongest activations**: Preserves important features
4. **Applied independently to each channel**: Depth is preserved

#### 2.2 Average Pooling

**Plain English**: Compute the average value over each pooling window instead of the maximum.

**Mathematical Formula:**

```
Output[i, j] = (1 / (f·f)) · Σ   Σ   I[i·s + m, j·s + n]
                           m=0 n=0
                           f-1 f-1
```

**Symbol Legend:**
- `f·f`: Total number of elements in the pooling window
- `1/(f·f)`: Normalization factor (averaging)
- Other symbols same as max pooling

**Use Cases:**
- Less common than max pooling
- Sometimes used in final layers before fully connected layers
- Provides smoother transitions

#### 2.3 Pooling Properties

**Output Dimensions:**
```
n_H_out = ⌊(n_H - f) / s⌋ + 1
n_W_out = ⌊(n_W - f) / s⌋ + 1
```

**Common Settings:**

| Window Size | Stride | Output Size | Overlapping? |
|-------------|--------|-------------|--------------|
| 2×2 | 2 | ~n/2 × n/2 | No |
| 3×3 | 2 | ~n/2 × n/2 | Yes |
| 2×2 | 1 | ~n × n | Yes |
| 3×3 | 3 | ~n/3 × n/3 | No |

**Advantages:**
1. Reduces spatial dimensions → fewer parameters in next layers
2. Provides fixed-size output regardless of input variations
3. Helps prevent overfitting
4. Computationally efficient
5. Provides some translation/rotation invariance

**Disadvantages:**
1. Loses spatial information
2. Cannot be "unlearned" (fixed operation)

---

## Strided Convolution: Detailed Example

### Forward Pass with Stride

**Given:**
- Input: 6×6 matrix
- Filter: 3×3
- Stride: 2
- No padding

**Input (6×6):**
```
I = [ 1   2   3   4   5   6 ]
    [ 7   8   9  10  11  12 ]
    [13  14  15  16  17  18 ]
    [19  20  21  22  23  24 ]
    [25  26  27  28  29  30 ]
    [31  32  33  34  35  36 ]
```

**Filter (3×3):**
```
K = [ 1   0  -1 ]
    [ 1   0  -1 ]
    [ 1   0  -1 ]
```

**Calculate Output Dimensions:**
```
n_H = 6, n_W = 6, f = 3, s = 2, p = 0

n_H_out = ⌊(6 - 3) / 2⌋ + 1 = ⌊3/2⌋ + 1 = 1 + 1 = 2
n_W_out = ⌊(6 - 3) / 2⌋ + 1 = ⌊3/2⌋ + 1 = 1 + 1 = 2
```

Output will be 2×2.

#### Position (0, 0): Starting at (0·2, 0·2) = (0, 0)

**Extract 3×3 patch from I[0:3, 0:3]:**
```
Patch = [  1   2   3 ]
        [  7   8   9 ]
        [ 13  14  15 ]
```

**Element-wise multiplication with K:**
```
Result = [ 1×1   2×0   3×(-1) ]   [  1   0  -3 ]
         [ 7×1   8×0   9×(-1) ] = [  7   0  -9 ]
         [13×1  14×0  15×(-1) ]   [ 13   0 -15 ]
```

**Sum:**
```
Output[0,0] = 1 + 0 - 3 + 7 + 0 - 9 + 13 + 0 - 15
            = (1 + 7 + 13) + (0 + 0 + 0) + (-3 - 9 - 15)
            = 21 + 0 - 27
            = -6
```

#### Position (0, 1): Starting at (0·2, 1·2) = (0, 2)

**Extract 3×3 patch from I[0:3, 2:5]:**
```
Patch = [  3   4   5 ]
        [  9  10  11 ]
        [ 15  16  17 ]
```

**Element-wise multiplication:**
```
Result = [ 3×1   4×0   5×(-1) ]   [  3   0  -5 ]
         [ 9×1  10×0  11×(-1) ] = [  9   0 -11 ]
         [15×1  16×0  17×(-1) ]   [ 15   0 -17 ]
```

**Sum:**
```
Output[0,1] = 3 + 0 - 5 + 9 + 0 - 11 + 15 + 0 - 17
            = (3 + 9 + 15) + (0 + 0 + 0) + (-5 - 11 - 17)
            = 27 + 0 - 33
            = -6
```

#### Position (1, 0): Starting at (1·2, 0·2) = (2, 0)

**Extract 3×3 patch from I[2:5, 0:3]:**
```
Patch = [ 13  14  15 ]
        [ 19  20  21 ]
        [ 25  26  27 ]
```

**Element-wise multiplication:**
```
Result = [13×1  14×0  15×(-1) ]   [ 13   0 -15 ]
         [19×1  20×0  21×(-1) ] = [ 19   0 -21 ]
         [25×1  26×0  27×(-1) ]   [ 25   0 -27 ]
```

**Sum:**
```
Output[1,0] = 13 + 0 - 15 + 19 + 0 - 21 + 25 + 0 - 27
            = (13 + 19 + 25) + (0 + 0 + 0) + (-15 - 21 - 27)
            = 57 + 0 - 63
            = -6
```

#### Position (1, 1): Starting at (1·2, 1·2) = (2, 2)

**Extract 3×3 patch from I[2:5, 2:5]:**
```
Patch = [ 15  16  17 ]
        [ 21  22  23 ]
        [ 27  28  29 ]
```

**Element-wise multiplication:**
```
Result = [15×1  16×0  17×(-1) ]   [ 15   0 -17 ]
         [21×1  22×0  23×(-1) ] = [ 21   0 -23 ]
         [27×1  28×0  29×(-1) ]   [ 27   0 -29 ]
```

**Sum:**
```
Output[1,1] = 15 + 0 - 17 + 21 + 0 - 23 + 27 + 0 - 29
            = (15 + 21 + 27) + (0 + 0 + 0) + (-17 - 23 - 29)
            = 63 + 0 - 69
            = -6
```

**Complete Strided Output (2×2):**
```
Output = [ -6  -6 ]
         [ -6  -6 ]
```

**Key Observations:**
1. **Output is 2×2 instead of 4×4** (with stride 1 it would be 4×4)
2. **Only 4 filter applications** instead of 16 (stride 1)
3. **Computational savings**: 75% fewer operations
4. **Information loss**: Skip intermediate positions

---

### Backward Pass with Stride

**Given:**
- Gradient from next layer: ∂L/∂Output (2×2)
- We need to compute: ∂L/∂K and ∂L/∂I

**Gradient from Loss:**
```
∂L/∂Output = [ 0.5  0.3 ]
             [ 0.2  0.4 ]
```

#### Computing ∂L/∂K (Filter Gradient with Stride)

**Formula (modified for stride):**
```
∂L/∂K[m,n] = Σ   Σ   I[i·s + m, j·s + n] · (∂L/∂Output)[i,j]
            i=0 j=0
            (output dimensions)
```

**Computing ∂L/∂K[0,0]:**

```
∂L/∂K[0,0] = I[0·2+0, 0·2+0] · (∂L/∂Output)[0,0] +
             I[0·2+0, 1·2+0] · (∂L/∂Output)[0,1] +
             I[1·2+0, 0·2+0] · (∂L/∂Output)[1,0] +
             I[1·2+0, 1·2+0] · (∂L/∂Output)[1,1]

           = I[0,0] · 0.5 + I[0,2] · 0.3 + I[2,0] · 0.2 + I[2,2] · 0.4
           = 1 · 0.5 + 3 · 0.3 + 13 · 0.2 + 15 · 0.4
           = 0.5 + 0.9 + 2.6 + 6.0
           = 10.0
```

**Computing ∂L/∂K[0,1]:**
```
∂L/∂K[0,1] = I[0,1] · 0.5 + I[0,3] · 0.3 + I[2,1] · 0.2 + I[2,3] · 0.4
           = 2 · 0.5 + 4 · 0.3 + 14 · 0.2 + 16 · 0.4
           = 1.0 + 1.2 + 2.8 + 6.4
           = 11.4
```

**Computing ∂L/∂K[0,2]:**
```
∂L/∂K[0,2] = I[0,2] · 0.5 + I[0,4] · 0.3 + I[2,2] · 0.2 + I[2,4] · 0.4
           = 3 · 0.5 + 5 · 0.3 + 15 · 0.2 + 17 · 0.4
           = 1.5 + 1.5 + 3.0 + 6.8
           = 12.8
```

**Complete Filter Gradient (computing all 9 elements):**
```
∂L/∂K = [ 10.0  11.4  12.8 ]
        [ 17.0  19.4  21.8 ]
        [ 24.0  27.4  30.8 ]
```

**Key Difference from Stride=1:**
- **Fewer contributions**: Each filter element is used only 4 times (2×2 output) instead of 16 times (4×4 output)
- **Larger gradient values per contribution**: Each position has more impact
- **Sparser gradient computation**: Skip positions not visited during forward pass

#### Computing ∂L/∂I (Input Gradient with Stride)

**Challenge with Stride:** The input gradient is sparse because many input positions weren't used during forward pass.

**Approach:**
1. Initialize ∂L/∂I to zeros (6×6)
2. For each output position, distribute gradient to the corresponding input patch
3. Input positions used multiple times accumulate gradients

**Formula:**
```
∂L/∂I[i·s + m, j·s + n] += K[m,n] · (∂L/∂Output)[i,j]
```

**Detailed Computation:**

Initialize:
```
∂L/∂I = zeros(6, 6)
```

**From Output[0,0] = -6 with gradient 0.5:**

Starting position: I[0,0]
```
For m=0, n=0: ∂L/∂I[0,0] += K[0,0] · 0.5 = 1 · 0.5 = 0.5
For m=0, n=1: ∂L/∂I[0,1] += K[0,1] · 0.5 = 0 · 0.5 = 0.0
For m=0, n=2: ∂L/∂I[0,2] += K[0,2] · 0.5 = -1 · 0.5 = -0.5
For m=1, n=0: ∂L/∂I[1,0] += K[1,0] · 0.5 = 1 · 0.5 = 0.5
For m=1, n=1: ∂L/∂I[1,1] += K[1,1] · 0.5 = 0 · 0.5 = 0.0
For m=1, n=2: ∂L/∂I[1,2] += K[1,2] · 0.5 = -1 · 0.5 = -0.5
For m=2, n=0: ∂L/∂I[2,0] += K[2,0] · 0.5 = 1 · 0.5 = 0.5
For m=2, n=1: ∂L/∂I[2,1] += K[2,1] · 0.5 = 0 · 0.5 = 0.0
For m=2, n=2: ∂L/∂I[2,2] += K[2,2] · 0.5 = -1 · 0.5 = -0.5
```

**From Output[0,1] = -6 with gradient 0.3:**

Starting position: I[0,2]
```
∂L/∂I[0,2] += 1 · 0.3 = 0.3
∂L/∂I[0,3] += 0 · 0.3 = 0.0
∂L/∂I[0,4] += -1 · 0.3 = -0.3
∂L/∂I[1,2] += 1 · 0.3 = 0.3
∂L/∂I[1,3] += 0 · 0.3 = 0.0
∂L/∂I[1,4] += -1 · 0.3 = -0.3
∂L/∂I[2,2] += 1 · 0.3 = 0.3
∂L/∂I[2,3] += 0 · 0.3 = 0.0
∂L/∂I[2,4] += -1 · 0.3 = -0.3
```

**From Output[1,0] = -6 with gradient 0.2:**

Starting position: I[2,0]
```
∂L/∂I[2,0] += 1 · 0.2 = 0.2
∂L/∂I[2,1] += 0 · 0.2 = 0.0
∂L/∂I[2,2] += -1 · 0.2 = -0.2
∂L/∂I[3,0] += 1 · 0.2 = 0.2
∂L/∂I[3,1] += 0 · 0.2 = 0.0
∂L/∂I[3,2] += -1 · 0.2 = -0.2
∂L/∂I[4,0] += 1 · 0.2 = 0.2
∂L/∂I[4,1] += 0 · 0.2 = 0.0
∂L/∂I[4,2] += -1 · 0.2 = -0.2
```

**From Output[1,1] = -6 with gradient 0.4:**

Starting position: I[2,2]
```
∂L/∂I[2,2] += 1 · 0.4 = 0.4
∂L/∂I[2,3] += 0 · 0.4 = 0.0
∂L/∂I[2,4] += -1 · 0.4 = -0.4
∂L/∂I[3,2] += 1 · 0.4 = 0.4
∂L/∂I[3,3] += 0 · 0.4 = 0.0
∂L/∂I[3,4] += -1 · 0.4 = -0.4
∂L/∂I[4,2] += 1 · 0.4 = 0.4
∂L/∂I[4,3] += 0 · 0.4 = 0.0
∂L/∂I[4,4] += -1 · 0.4 = -0.4
```

**Complete Input Gradient (6×6):**

```
∂L/∂I = [ 0.5  0.0 -0.2  0.0 -0.3  0.0 ]
        [ 0.5  0.0 -0.2  0.0 -0.3  0.0 ]
        [ 0.7  0.0 -0.4  0.0 -0.7  0.0 ]
        [ 0.2  0.0  0.2  0.0 -0.4  0.0 ]
        [ 0.2  0.0  0.2  0.0 -0.4  0.0 ]
        [ 0.0  0.0  0.0  0.0  0.0  0.0 ]
```

**Key Observations:**
1. **Sparse gradient**: Many positions have zero gradient (columns 1, 3, 5 and row 5)
2. **Accumulated values**: Position I[2,2] received gradients from multiple outputs
3. **Zero regions**: Input positions never accessed during forward pass have zero gradients
4. **Checkerboard pattern**: With stride 2, gradients form a pattern based on which positions were sampled

---

## Pooling Operations: Detailed Examples

### Max Pooling Forward Pass

**Given:**
- Input: 4×4 matrix
- Pool size: 2×2
- Stride: 2 (non-overlapping)

**Input (4×4):**
```
I = [  1   3   2   4 ]
    [  5   6   7   8 ]
    [  9  10  11  12 ]
    [ 13  14  15  16 ]
```

**Calculate Output Dimensions:**
```
n_H = 4, n_W = 4, f = 2, s = 2

n_H_out = ⌊(4 - 2) / 2⌋ + 1 = ⌊2/2⌋ + 1 = 1 + 1 = 2
n_W_out = ⌊(4 - 2) / 2⌋ + 1 = ⌊2/2⌋ + 1 = 1 + 1 = 2
```

Output will be 2×2.

#### Position (0, 0): Pool window at I[0:2, 0:2]

**Extract 2×2 window:**
```
Window = [ 1  3 ]
         [ 5  6 ]
```

**Find maximum:**
```
Output[0,0] = max(1, 3, 5, 6) = 6
```

**Store index for backprop:** Position (1,1) within window → Global position I[1,1]

#### Position (0, 1): Pool window at I[0:2, 2:4]

**Extract 2×2 window:**
```
Window = [ 2  4 ]
         [ 7  8 ]
```

**Find maximum:**
```
Output[0,1] = max(2, 4, 7, 8) = 8
```

**Store index:** Position (1,1) within window → Global position I[1,3]

#### Position (1, 0): Pool window at I[2:4, 0:2]

**Extract 2×2 window:**
```
Window = [  9  10 ]
         [ 13  14 ]
```

**Find maximum:**
```
Output[1,0] = max(9, 10, 13, 14) = 14
```

**Store index:** Position (1,1) within window → Global position I[3,1]

#### Position (1, 1): Pool window at I[2:4, 2:4]

**Extract 2×2 window:**
```
Window = [ 11  12 ]
         [ 15  16 ]
```

**Find maximum:**
```
Output[1,1] = max(11, 12, 15, 16) = 16
```

**Store index:** Position (1,1) within window → Global position I[3,3]

**Complete Max Pool Output (2×2):**
```
Output = [  6   8 ]
         [ 14  16 ]
```

**Max Indices (for backprop):**
```
Max_indices = [ (1,1)  (1,3) ]
              [ (3,1)  (3,3) ]
```

**Key Observations:**
1. **Downsampling**: 4×4 → 2×2 (75% size reduction)
2. **No parameters**: No learning involved
3. **Non-linear**: Max is not differentiable at ties, but we choose one
4. **Feature preservation**: Keeps strongest activations

---

### Max Pooling Backward Pass

**Given:**
- Gradient from next layer: ∂L/∂Output (2×2)
- Max indices stored during forward pass
- Need to compute: ∂L/∂I (4×4)

**Gradient from Loss:**
```
∂L/∂Output = [ 0.5  0.3 ]
             [ 0.2  0.4 ]
```

**Backward Pass Principle:**

**Plain English**: During max pooling, only the maximum value affects the output. Therefore, gradient flows back **only to the maximum position**, all other positions get zero gradient.

**Formula:**
```
∂L/∂I[i,j] = { ∂L/∂Output[p,q]  if I[i,j] was the max in pool window (p,q)
             { 0                 otherwise
```

**Detailed Computation:**

Initialize input gradient to zeros:
```
∂L/∂I = zeros(4, 4)
```

**From Output[0,0] = 6 (gradient 0.5):**
- Max was at I[1,1]
- Route gradient: ∂L/∂I[1,1] = 0.5

**From Output[0,1] = 8 (gradient 0.3):**
- Max was at I[1,3]
- Route gradient: ∂L/∂I[1,3] = 0.3

**From Output[1,0] = 14 (gradient 0.2):**
- Max was at I[3,1]
- Route gradient: ∂L/∂I[3,1] = 0.2

**From Output[1,1] = 16 (gradient 0.4):**
- Max was at I[3,3]
- Route gradient: ∂L/∂I[3,3] = 0.4

**Complete Input Gradient (4×4):**
```
∂L/∂I = [ 0.0  0.0  0.0  0.0 ]
        [ 0.0  0.5  0.0  0.3 ]
        [ 0.0  0.0  0.0  0.0 ]
        [ 0.0  0.2  0.0  0.4 ]
```

**Key Observations:**
1. **Sparse gradient**: Only 4 out of 16 positions have non-zero gradients
2. **Binary routing**: Gradient goes to max position, others get zero
3. **No gradient computation**: Just routing based on stored indices
4. **Efficient**: No matrix multiplications, just lookups and assignments

**Why This Works:**

The derivative of max function:
```
∂(max(a,b,c,d))/∂a = { 1  if a is the maximum
                     { 0  otherwise
```

By chain rule:
```
∂L/∂I[i,j] = (∂L/∂Output[p,q]) · (∂Output[p,q]/∂I[i,j])
           = (∂L/∂Output[p,q]) · { 1  if I[i,j] was max
                                  { 0  otherwise
```

---

### Average Pooling Forward Pass

**Given:** Same 4×4 input as max pooling example

**Input (4×4):**
```
I = [  1   3   2   4 ]
    [  5   6   7   8 ]
    [  9  10  11  12 ]
    [ 13  14  15  16 ]
```

#### Position (0, 0): Pool window at I[0:2, 0:2]

**Extract 2×2 window:**
```
Window = [ 1  3 ]
         [ 5  6 ]
```

**Compute average:**
```
Output[0,0] = (1 + 3 + 5 + 6) / 4 = 15 / 4 = 3.75
```

#### Position (0, 1): Pool window at I[0:2, 2:4]

**Extract 2×2 window:**
```
Window = [ 2  4 ]
         [ 7  8 ]
```

**Compute average:**
```
Output[0,1] = (2 + 4 + 7 + 8) / 4 = 21 / 4 = 5.25
```

#### Position (1, 0): Pool window at I[2:4, 0:2]

**Extract 2×2 window:**
```
Window = [  9  10 ]
         [ 13  14 ]
```

**Compute average:**
```
Output[1,0] = (9 + 10 + 13 + 14) / 4 = 46 / 4 = 11.5
```

#### Position (1, 1): Pool window at I[2:4, 2:4]

**Extract 2×2 window:**
```
Window = [ 11  12 ]
         [ 15  16 ]
```

**Compute average:**
```
Output[1,1] = (11 + 12 + 15 + 16) / 4 = 54 / 4 = 13.5
```

**Complete Average Pool Output (2×2):**
```
Output = [  3.75   5.25 ]
         [ 11.50  13.50 ]
```

**Comparison with Max Pooling:**
- Max pooling: [6, 8; 14, 16]
- Average pooling: [3.75, 5.25; 11.5, 13.5]
- Average pooling produces **smoother**, **smaller values**

---

### Average Pooling Backward Pass

**Given:**
- Gradient from next layer: ∂L/∂Output (2×2)
- Need to compute: ∂L/∂I (4×4)

**Gradient from Loss:**
```
∂L/∂Output = [ 0.5  0.3 ]
             [ 0.2  0.4 ]
```

**Backward Pass Principle:**

**Plain English**: During average pooling, **all positions** in the window contributed equally to the output. Therefore, gradient is **distributed evenly** to all positions in the window.

**Formula:**
```
∂L/∂I[i,j] = (1 / (f·f)) · Σ (∂L/∂Output[p,q])
                           all (p,q) where I[i,j] is in pool window
```

For non-overlapping pooling (stride = pool size), each input position belongs to exactly one pool window:
```
∂L/∂I[i,j] = (1 / (f·f)) · (∂L/∂Output[p,q])
```

**Detailed Computation:**

Initialize:
```
∂L/∂I = zeros(4, 4)
```

**From Output[0,0] (gradient 0.5):**

Pool window was I[0:2, 0:2], distribute gradient equally:
```
∂L/∂I[0,0] = 0.5 / 4 = 0.125
∂L/∂I[0,1] = 0.5 / 4 = 0.125
∂L/∂I[1,0] = 0.5 / 4 = 0.125
∂L/∂I[1,1] = 0.5 / 4 = 0.125
```

**From Output[0,1] (gradient 0.3):**

Pool window was I[0:2, 2:4]:
```
∂L/∂I[0,2] = 0.3 / 4 = 0.075
∂L/∂I[0,3] = 0.3 / 4 = 0.075
∂L/∂I[1,2] = 0.3 / 4 = 0.075
∂L/∂I[1,3] = 0.3 / 4 = 0.075
```

**From Output[1,0] (gradient 0.2):**

Pool window was I[2:4, 0:2]:
```
∂L/∂I[2,0] = 0.2 / 4 = 0.05
∂L/∂I[2,1] = 0.2 / 4 = 0.05
∂L/∂I[3,0] = 0.2 / 4 = 0.05
∂L/∂I[3,1] = 0.2 / 4 = 0.05
```

**From Output[1,1] (gradient 0.4):**

Pool window was I[2:4, 2:4]:
```
∂L/∂I[2,2] = 0.4 / 4 = 0.1
∂L/∂I[2,3] = 0.4 / 4 = 0.1
∂L/∂I[3,2] = 0.4 / 4 = 0.1
∂L/∂I[3,3] = 0.4 / 4 = 0.1
```

**Complete Input Gradient (4×4):**
```
∂L/∂I = [ 0.125  0.125  0.075  0.075 ]
        [ 0.125  0.125  0.075  0.075 ]
        [ 0.050  0.050  0.100  0.100 ]
        [ 0.050  0.050  0.100  0.100 ]
```

**Key Observations:**
1. **Dense gradient**: All positions receive gradients (contrast with max pooling)
2. **Equal distribution**: Each position in a window gets the same gradient
3. **Smoothing effect**: Gradients are averaged/diluted
4. **Block structure**: Non-overlapping windows create uniform blocks

**Comparison: Max vs Average Pooling Gradients:**

```
Max Pooling ∂L/∂I:        Average Pooling ∂L/∂I:
[ 0.0  0.0  0.0  0.0 ]    [ 0.125  0.125  0.075  0.075 ]
[ 0.0  0.5  0.0  0.3 ]    [ 0.125  0.125  0.075  0.075 ]
[ 0.0  0.0  0.0  0.0 ]    [ 0.050  0.050  0.100  0.100 ]
[ 0.0  0.2  0.0  0.4 ]    [ 0.050  0.050  0.100  0.100 ]
```

**Difference:**
- Max: Sparse, high gradients at max positions
- Average: Dense, distributed gradients everywhere

---

## Complete CNN Layer Example

### Setup: Convolution → Max Pool

**Architecture:**
1. **Convolutional Layer**: 3×3 filter, stride 1, no padding
2. **Max Pooling Layer**: 2×2 window, stride 2

**Goal:** Show how stride and pooling interact in a real network, focusing only on these specific operations.

**Input (6×6):**
```
I = [ 1   2   3   4   5   6 ]
    [ 7   8   9  10  11  12 ]
    [13  14  15  16  17  18 ]
    [19  20  21  22  23  24 ]
    [25  26  27  28  29  30 ]
    [31  32  33  34  35  36 ]
```

**Filter (3×3):**
```
K = [ 1   0  -1 ]
    [ 2   0  -2 ]
    [ 1   0  -1 ]
```

---

### Forward Propagation Through Layers

#### Layer 1: Convolution (stride=1)

**Output dimensions:**
```
n_out = 6 - 3 + 1 = 4
```

Output is 4×4 (we computed similar convolution in previous guide, skipping detailed computation here)

**Conv Output (4×4) - assuming edge detection:**
```
Conv_out = [  -12   -24   -24   -12 ]
           [  -12   -24   -24   -12 ]
           [  -12   -24   -24   -12 ]
           [  -12   -24   -24   -12 ]
```

This represents detected vertical edges (stronger in middle columns).

#### Layer 2: Max Pooling (2×2, stride=2)

**Input to pooling:** Conv_out (4×4)

**Output dimensions:**
```
n_out = ⌊(4 - 2) / 2⌋ + 1 = 2
```

Output is 2×2.

**Position (0, 0): Pool window Conv_out[0:2, 0:2]**
```
Window = [ -12  -24 ]
         [ -12  -24 ]

Max = -12  (at positions [0,0], [0,1], [1,0], or [1,1] - we choose [0,0])
```

**Position (0, 1): Pool window Conv_out[0:2, 2:4]**
```
Window = [ -24  -12 ]
         [ -24  -12 ]

Max = -12  (at positions [0,1] or [1,1] - we choose [0,1])
```

**Position (1, 0): Pool window Conv_out[2:4, 0:2]**
```
Window = [ -12  -24 ]
         [ -12  -24 ]

Max = -12
```

**Position (1, 1): Pool window Conv_out[2:4, 2:4]**
```
Window = [ -24  -12 ]
         [ -24  -12 ]

Max = -12
```

**Final Output after Max Pooling (2×2):**
```
Pool_out = [ -12  -12 ]
           [ -12  -12 ]
```

**Max Indices (stored for backprop):**
```
Max_idx = [ Conv_out[0,0]  Conv_out[0,3] ]
          [ Conv_out[2,0]  Conv_out[2,3] ]
```

**Summary of Forward Pass:**
- **Input**: 6×6 → **After Conv**: 4×4 → **After Pool**: 2×2
- **Size reduction**: 36 values → 16 values → 4 values (89% reduction)
- **Feature preserved**: Edge information maintained through max values

---

### Backward Propagation Through Layers

**Given:** Loss gradient ∂L/∂Pool_out (2×2)

```
∂L/∂Pool_out = [ 0.1  0.2 ]
               [ 0.3  0.4 ]
```

**Goal:** Compute ∂L/∂K (filter gradient) and ∂L/∂I (input gradient)

#### Layer 2 Backward: Through Max Pooling

**Task:** Compute ∂L/∂Conv_out from ∂L/∂Pool_out

**Using max indices stored during forward pass:**

Initialize:
```
∂L/∂Conv_out = zeros(4, 4)
```

Route gradients to max positions:
```
∂L/∂Conv_out[0,0] = 0.1  (from Pool_out[0,0])
∂L/∂Conv_out[0,3] = 0.2  (from Pool_out[0,1])
∂L/∂Conv_out[2,0] = 0.3  (from Pool_out[1,0])
∂L/∂Conv_out[2,3] = 0.4  (from Pool_out[1,1])
```

**Gradient after max pooling (4×4):**
```
∂L/∂Conv_out = [ 0.1  0.0  0.0  0.2 ]
               [ 0.0  0.0  0.0  0.0 ]
               [ 0.3  0.0  0.0  0.4 ]
               [ 0.0  0.0  0.0  0.0 ]
```

**Key Point:** Gradient is **sparse** - only 4 out of 16 positions have non-zero gradients.

#### Layer 1 Backward: Through Convolution

Now we have ∂L/∂Conv_out (4×4), and need:
1. ∂L/∂K (filter gradient)
2. ∂L/∂I (input gradient)

**Computing ∂L/∂K[0,0] (top-left filter element):**

```
∂L/∂K[0,0] = Σ Σ I[i, j] · (∂L/∂Conv_out)[i,j]
            i,j in valid positions

Only non-zero gradients at [0,0], [0,3], [2,0], [2,3]:

= I[0,0] · 0.1 + I[0,3] · 0.2 + I[2,0] · 0.3 + I[2,3] · 0.4
= 1 · 0.1 + 4 · 0.2 + 13 · 0.3 + 16 · 0.4
= 0.1 + 0.8 + 3.9 + 6.4
= 11.2
```

**Computing remaining filter gradients (similar process):**

```
∂L/∂K = [ 11.2  12.2  13.2 ]
        [ 21.2  23.2  25.2 ]
        [ 31.2  34.2  37.2 ]
```

**(Values approximate - showing pattern)**

**Key Observations on Filter Gradient:**
1. **Sparse contribution**: Only 4 output positions contribute (due to max pooling)
2. **Faster computation**: Fewer terms to sum
3. **Different magnitude**: Compared to without pooling, gradients have different scale

**Computing ∂L/∂I (Input Gradient):**

Using the standard backprop formula with rotated filter:
```
∂L/∂I = ∂L/∂Conv_out (padded) * K_rotated (full convolution)
```

Since ∂L/∂Conv_out is sparse, many computations will be zero.

**Key positions that receive gradients:**

From ∂L/∂Conv_out[0,0] = 0.1:
```
∂L/∂I[0:3, 0:3] += 0.1 · K
```

From ∂L/∂Conv_out[0,3] = 0.2:
```
∂L/∂I[0:3, 3:6] += 0.2 · K
```

From ∂L/∂Conv_out[2,0] = 0.3:
```
∂L/∂I[2:5, 0:3] += 0.3 · K
```

From ∂L/∂Conv_out[2,3] = 0.4:
```
∂L/∂I[2:5, 3:6] += 0.4 · K
```

**Resulting Input Gradient (6×6) - approximate pattern:**
```
∂L/∂I = [ 0.1  0.0 -0.1  0.2  0.0 -0.2 ]
        [ 0.2  0.0 -0.2  0.4  0.0 -0.4 ]
        [ 0.4  0.0 -0.3  0.6  0.0 -0.6 ]
        [ 0.6  0.0 -0.6  0.8  0.0 -0.8 ]
        [ 0.3  0.0 -0.3  0.4  0.0 -0.4 ]
        [ 0.0  0.0  0.0  0.0  0.0  0.0 ]
```

**Key Observations:**
1. **Concentrated gradients**: Four 3×3 regions receive most gradients
2. **Overlap effects**: Some positions (like I[2:3, 3:4]) receive multiple contributions
3. **Sparse propagation**: Due to max pooling's sparse gradients
4. **Edge effects**: Border regions have weaker gradients

---

### Summary of Complete Example

**Forward Pass:**
```
Input (6×6) 
    ↓ Conv (3×3, stride=1)
Conv_out (4×4)
    ↓ Max Pool (2×2, stride=2)
Pool_out (2×2)
```

**Backward Pass:**
```
∂L/∂Pool_out (2×2)
    ↓ Max Pool Backprop (sparse routing)
∂L/∂Conv_out (4×4, sparse: only 4 non-zero)
    ↓ Conv Backprop (rotated filter)
∂L/∂K (3×3, filter update)
∂L/∂I (6×6, input gradient)
```

**Key Insights:**

1. **Max pooling creates sparse gradients** 
   - Only max positions get gradients
   - Speeds up backward pass
   - Most positions receive zero gradient

2. **Stride and pooling both downsample**
   - Stride: During operation, skip positions
   - Pooling: After operation, aggregate regions
   - Combined: Very aggressive downsampling

3. **Gradient flow is selective**
   - Not all input contributed to final output
   - Gradient only flows through "winning" paths
   - This selectivity helps with feature learning

4. **Computational efficiency**
   - Forward: Fewer operations due to downsampling
   - Backward: Sparse gradients reduce computation
   - Memory: Smaller feature maps

---

## Summary of Key Formulas

### Strided Convolution

**Forward:**
```
1. Output[i,j] = Σ Σ I[i·s + m, j·s + n] · K[m,n]
2. n_out = ⌊(n_in + 2p - f) / s⌋ + 1
```

**Backward:**
```
3. ∂L/∂K[m,n] = Σ Σ I[i·s + m, j·s + n] · (∂L/∂Output)[i,j]
4. ∂L/∂I[i·s + m, j·s + n] += K[m,n] · (∂L/∂Output)[i,j]
```

### Max Pooling

**Forward:**
```
5. Output[i,j] = max{ I[i·s + m, j·s + n] }  for m,n in window
6. Store: argmax indices for backprop
```

**Backward:**
```
7. ∂L/∂I[i,j] = { ∂L/∂Output[p,q]  if I[i,j] was max
                { 0                 otherwise
```

### Average Pooling

**Forward:**
```
8. Output[i,j] = (1/(f·f)) · Σ Σ I[i·s + m, j·s + n]
```

**Backward:**
```
9. ∂L/∂I[i,j] = (1/(f·f)) · (∂L/∂Output[p,q])  where I[i,j] in pool window (p,q)
```

---

## Practical Considerations

### 1. Stride Selection

**Trade-offs:**

| Stride | Pros | Cons |
|--------|------|------|
| s=1 | Full spatial info, no skipping | Large output, more computation |
| s=2 | 75% fewer operations, aggressive downsampling | May skip important features |
| s>2 | Extreme downsampling | Information loss, rarely used |

**Guidelines:**
- Use stride 1 for early layers (preserve spatial detail)
- Use stride 2 for downsampling when needed
- Prefer pooling over large strides for controllability

### 2. Pooling Configuration

**Common Settings:**

| Configuration | Use Case |
|--------------|----------|
| 2×2, stride=2 | Standard downsampling (most common) |
| 3×3, stride=2 | Overlapping pools, smoother transitions |
| 2×2, stride=1 | Overlapping, minimal size reduction |

**Max vs Average:**
- **Max pooling**: Preferred in most cases, keeps strong features
- **Average pooling**: Global average pooling before fully connected layers
- **Mixed**: Rarely mix types within same network

### 3. Computational Analysis

**For n×n input, f×f filter, stride s:**

**Strided Convolution:**
- Operations: O(⌊n/s⌋² · f²)
- Memory: O(⌊n/s⌋²)
- Reduction factor: ~1/s² compared to stride 1

**Pooling:**
- Operations: O(n² · f²) forward + O(n²) backward (routing only)
- Memory: O(n²) for storing indices
- Very fast compared to convolution

### 4. Design Patterns

**Modern CNN Architecture:**
```
Input
  ↓
Conv (3×3, stride=1) + ReLU
  ↓
Conv (3×3, stride=1) + ReLU
  ↓
Max Pool (2×2, stride=2)
  ↓
Conv (3×3, stride=1) + ReLU
  ↓
Conv (3×3, stride=1) + ReLU
  ↓
Max Pool (2×2, stride=2)
  ↓
...
  ↓
Global Average Pool
  ↓
Fully Connected
```

**Key principles:**
- Multiple convolutions between pooling
- Gradual downsampling (not too aggressive)
- Pooling for size reduction, not learning
- Global pooling before classification

### 5. Gradient Flow Issues

**Problem with Aggressive Downsampling:**
- Max pooling: 75% of positions get zero gradient
- Large stride: Skip positions entirely
- Combined: Very sparse gradient flow

**Solutions:**
- Use residual connections (skip connections)
- Batch normalization between layers
- Careful initialization
- Not too many pooling layers in sequence

### 6. Alternative Approaches

**Instead of Pooling:**
- **Strided convolution**: Replace pooling with stride 2 convolution
- **Fractional max pooling**: Random pooling regions
- **Stochastic pooling**: Random selection from window

**Modern Trend:**
- Some architectures avoid pooling entirely
- Use strided convolutions for downsampling
- Allows network to learn optimal downsampling

---

## Connection to Next Topic

This foundation in strided convolutions and pooling sets the stage for understanding:

1. **Multi-Channel Convolutions**: Extend to RGB images and deep feature maps with multiple filters per layer

2. **CNN Architectures**: Classic networks (LeNet, AlexNet, VGG, ResNet) and how they combine convolution, pooling, and stride

3. **Receptive Fields**: How stride and pooling affect the receptive field size and network's ability to capture context

4. **Object Detection**: Region proposals and feature pyramid networks use pooling strategically

5. **Semantic Segmentation**: Upsampling and unpooling to restore spatial dimensions

6. **Optimization**: How pooling and stride affect gradient flow and training dynamics

The key insight is that **downsampling is crucial for CNN efficiency**, but must be balanced with **preserving spatial information**. Stride and pooling are two complementary techniques:
- **Stride**: Learned downsampling through convolution
- **Pooling**: Fixed downsampling with translation invariance

Understanding when and how to use each is fundamental to designing effective deep learning architectures.

---

## End of Guide

This guide has covered strided convolution and pooling in comprehensive detail, from basic concepts through complete mathematical derivations to full forward and backward propagation examples focused specifically on stride and pooling effects. The formulas have been explained in plain English, all symbols defined, and calculations shown step-by-step, building upon the foundation from edge detection and padding to create a complete picture of CNN fundamentals.