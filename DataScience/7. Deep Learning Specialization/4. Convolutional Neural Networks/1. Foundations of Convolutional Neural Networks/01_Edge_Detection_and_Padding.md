# Edge Detection and Padding in Convolutional Neural Networks
## Table of Contents

1. [Plain English Overview](#plain-english-overview)
2. [General Ideas](#general-ideas)
   - [Key Concepts](#key-concepts)
3. [Mathematical Foundations](#mathematical-foundations)
   - [1. Convolution Operation](#1-convolution-operation)
   - [2. Edge Detection Filters](#2-edge-detection-filters)
     - [2.1 Vertical Edge Detection](#21-vertical-edge-detection)
     - [2.2 Horizontal Edge Detection](#22-horizontal-edge-detection)
   - [3. Padding Theory](#3-padding-theory)
     - [3.1 Why Padding?](#31-why-padding)
     - [3.2 Padding Mathematics](#32-padding-mathematics)
     - [3.3 Types of Padding](#33-types-of-padding)
4. [Complete Detailed Example: Edge Detection with Padding](#complete-detailed-example-edge-detection-with-padding)
   - [Problem Setup](#problem-setup)
   - [Input Image (6×6)](#input-image-66)
   - [Vertical Edge Detection Filter (3×3)](#vertical-edge-detection-filter-33)
5. [Forward Propagation: Without Padding (Valid Convolution)](#forward-propagation-without-padding-valid-convolution)
   - [Step 1: Calculate Output Dimensions](#step-1-calculate-output-dimensions)
   - [Step 2: Perform Convolution](#step-2-perform-convolution)
6. [Forward Propagation: With Same Padding (p=1)](#forward-propagation-with-same-padding-p1)
   - [Step 1: Apply Padding](#step-1-apply-padding)
   - [Step 2: Calculate Output Dimensions](#step-2-calculate-output-dimensions-1)
   - [Step 3: Perform Convolution](#step-3-perform-convolution)
7. [Backward Propagation: Gradient Flow](#backward-propagation-gradient-flow)
   - [Overview](#overview)
   - [Mathematical Formulation](#mathematical-formulation)
   - [1. Gradient with Respect to Filter (∂L/∂K)](#1-gradient-with-respect-to-filter-lk)
   - [2. Gradient with Respect to Input (∂L/∂I)](#2-gradient-with-respect-to-input-li)
8. [Detailed Backward Propagation Example](#detailed-backward-propagation-example)
   - [Setup](#setup)
   - [Computing ∂L/∂K (Filter Gradient)](#computing-lk-filter-gradient)
   - [Computing ∂L/∂I (Input Gradient)](#computing-li-input-gradient)
9. [Parameter Update (Gradient Descent)](#parameter-update-gradient-descent)
10. [Summary of Key Formulas](#summary-of-key-formulas)
11. [Practical Considerations](#practical-considerations)
    - [1. Computational Complexity](#1-computational-complexity)
    - [2. Memory Requirements](#2-memory-requirements)
    - [3. Choice of Padding](#3-choice-of-padding)
    - [4. Filter Size Selection](#4-filter-size-selection)
12. [Connection to Next Topic](#connection-to-next-topic)
13. [Appendix: Numerical Stability and Implementation Tips](#appendix-numerical-stability-and-implementation-tips)
    - [1. Filter Initialization](#1-filter-initialization)
    - [2. Gradient Clipping](#2-gradient-clipping)
    - [3. Vectorized Implementation](#3-vectorized-implementation)
    - [4. Bias Terms](#4-bias-terms)

---


## Plain English Overview

Edge detection is a fundamental operation in computer vision where we identify boundaries between different regions in an image. In CNNs, this is achieved through **convolution operations** using small matrices called **filters** or **kernels** that slide across the image to detect patterns like vertical edges, horizontal edges, and more complex features. Padding is a technique to control the spatial dimensions of the output after convolution by adding extra pixels around the image borders.

## General Ideas

### Key Concepts

**Convolution Operation**: A mathematical operation where a small filter (kernel) slides across an input image, performing element-wise multiplication and summation at each position to produce a feature map.

**Edge Detection**: Edges represent rapid changes in pixel intensity. By using specially designed filters, we can detect:
- Vertical edges (left-to-right intensity changes)
- Horizontal edges (top-to-bottom intensity changes)
- Diagonal and complex edges (using learned filters)

**Padding**: Adding extra pixels around the image border to:
- Preserve spatial dimensions
- Prevent information loss at borders
- Control output size

---

## Mathematical Foundations

### 1. Convolution Operation

#### Plain English Description
Convolution involves sliding a filter over an input image. At each position, we multiply corresponding elements and sum them to get one output value. This process continues across the entire image.

#### Mathematical Formula

For a 2D convolution operation:

```
(I * K)[i, j] = ΣΣ I[i+m, j+n] · K[m, n]
                m n
```

**Symbol Legend:**
- `I`: Input image (2D matrix)
- `K`: Kernel/Filter (2D matrix)
- `*`: Convolution operator (not multiplication)
- `[i, j]`: Position in the output feature map
- `[m, n]`: Position within the kernel
- `Σ`: Summation over all kernel positions
- `·`: Element-wise multiplication

#### Detailed Computation Steps

Given an input `I` of size `(n_H × n_W)` and a kernel `K` of size `(f × f)`:

**Step 1: Calculate Output Dimensions**

Without padding:
```
n_H_out = n_H - f + 1
n_W_out = n_W - f + 1
```

**Symbol Legend:**
- `n_H`: Height of input image
- `n_W`: Width of input image
- `f`: Size of the filter (assuming square filter f × f)
- `n_H_out`: Height of output feature map
- `n_W_out`: Width of output feature map

**Step 2: Perform Convolution at Each Position**

For each output position `(i, j)` where `i ∈ [0, n_H_out-1]` and `j ∈ [0, n_W_out-1]`:

```
Output[i, j] = Σ   Σ   I[i+m, j+n] · K[m, n]
             m=0 n=0
             f-1 f-1
```

This means we:
1. Take a `f × f` patch from the input starting at position `(i, j)`
2. Perform element-wise multiplication with the kernel
3. Sum all resulting values to get one output value

---

### 2. Edge Detection Filters

#### 2.1 Vertical Edge Detection

**Plain English**: A vertical edge detector responds strongly when there's a change from dark to light (or vice versa) in the horizontal direction.

**Classic Vertical Edge Filter (3×3 Sobel Operator):**

```
K_vertical = [ 1   0  -1 ]
             [ 2   0  -2 ]
             [ 1   0  -1 ]
```

**How it works:**
- Left column (positive values): Detects bright regions on the left
- Middle column (zeros): Ignores the center
- Right column (negative values): Detects bright regions on the right
- When convolved, produces large positive/negative values at vertical edges

#### 2.2 Horizontal Edge Detection

**Horizontal Edge Filter (3×3 Sobel Operator):**

```
K_horizontal = [ 1   2   1 ]
               [ 0   0   0 ]
               [-1  -2  -1 ]
```

**How it works:**
- Top row (positive): Detects bright regions above
- Middle row (zeros): Ignores the center
- Bottom row (negative): Detects bright regions below
- Produces large values at horizontal edges

---

### 3. Padding Theory

#### 3.1 Why Padding?

**Problem 1: Shrinking Output**

After each convolution layer, the spatial dimensions decrease:
```
Output size = Input size - Filter size + 1
```

After many layers, the image becomes too small to process.

**Problem 2: Edge Information Loss**

Corner and edge pixels are used less frequently in convolution than center pixels:
- Corner pixel: Used only once
- Edge pixel: Used `f` times
- Center pixel: Used `f²` times

This means valuable edge information is underutilized.

#### 3.2 Padding Mathematics

**Padding Operation**: Add `p` pixels around the border of the input image.

**Padded Input Dimensions:**
```
n_H_padded = n_H + 2p
n_W_padded = n_W + 2p
```

**Symbol Legend:**
- `p`: Padding size (number of pixel rows/columns added on each side)
- `n_H_padded`: Height after padding
- `n_W_padded`: Width after padding

**Output Dimensions with Padding:**
```
n_H_out = n_H + 2p - f + 1
n_W_out = n_W + 2p - f + 1
```

#### 3.3 Types of Padding

**a) Valid Padding (No Padding): p = 0**

```
n_H_out = n_H - f + 1
n_W_out = n_W - f + 1
```

- No padding added
- Output is smaller than input
- Information at borders is used less

**b) Same Padding: Output size = Input size**

To maintain dimensions, we need:
```
n_H = n_H + 2p - f + 1

Solving for p:
2p = f - 1
p = (f - 1) / 2
```

**Symbol Legend:**
- For `f = 3`: `p = (3-1)/2 = 1`
- For `f = 5`: `p = (5-1)/2 = 2`
- For `f = 7`: `p = (7-1)/2 = 3`

**Note**: This requires `f` to be odd. In practice, filters are typically odd-sized (3×3, 5×5, 7×7).

**c) Full Padding: p = f - 1**

```
n_H_out = n_H + 2(f-1) - f + 1 = n_H + f - 1
n_W_out = n_W + 2(f-1) - f + 1 = n_W + f - 1
```

- Maximum padding
- Output is larger than input
- Every input pixel contributes equally

---

## Complete Detailed Example: Edge Detection with Padding

### Problem Setup

**Given:**
- Input image `I` of size `6 × 6`
- Vertical edge detection filter `K` of size `3 × 3`
- We'll demonstrate both without and with padding

### Input Image (6×6):

```
I = [ 10  10  10   0   0   0 ]
    [ 10  10  10   0   0   0 ]
    [ 10  10  10   0   0   0 ]
    [ 10  10  10   0   0   0 ]
    [ 10  10  10   0   0   0 ]
    [ 10  10  10   0   0   0 ]
```

This represents a simplified image with:
- Left half: bright (value 10)
- Right half: dark (value 0)
- Clear vertical edge in the middle

### Vertical Edge Detection Filter (3×3):

```
K = [ 1   0  -1 ]
    [ 1   0  -1 ]
    [ 1   0  -1 ]
```

---

## Forward Propagation: Without Padding (Valid Convolution)

### Step 1: Calculate Output Dimensions

```
n_H = 6, n_W = 6, f = 3, p = 0

n_H_out = n_H - f + 1 = 6 - 3 + 1 = 4
n_W_out = n_W - f + 1 = 6 - 3 + 1 = 4
```

Output will be `4 × 4`.

### Step 2: Perform Convolution

#### Position (0, 0) - Top-left corner:

**Extract 3×3 patch from I starting at (0,0):**
```
Patch = [ 10  10  10 ]
        [ 10  10  10 ]
        [ 10  10  10 ]
```

**Element-wise multiplication with filter K:**
```
Result = [ 10×1  10×0  10×(-1) ]   [ 10   0  -10 ]
         [ 10×1  10×0  10×(-1) ] = [ 10   0  -10 ]
         [ 10×1  10×0  10×(-1) ]   [ 10   0  -10 ]
```

**Sum all elements:**
```
Output[0,0] = 10 + 0 + (-10) + 10 + 0 + (-10) + 10 + 0 + (-10)
            = (10 + 10 + 10) + (0 + 0 + 0) + (-10 + -10 + -10)
            = 30 + 0 - 30
            = 0
```

**Interpretation**: No edge detected (uniform region).

#### Position (0, 1):

**Extract 3×3 patch starting at (0,1):**
```
Patch = [ 10  10   0 ]
        [ 10  10   0 ]
        [ 10  10   0 ]
```

**Element-wise multiplication:**
```
Result = [ 10×1  10×0   0×(-1) ]   [ 10   0   0 ]
         [ 10×1  10×0   0×(-1) ] = [ 10   0   0 ]
         [ 10×1  10×0   0×(-1) ]   [ 10   0   0 ]
```

**Sum:**
```
Output[0,1] = 10 + 0 + 0 + 10 + 0 + 0 + 10 + 0 + 0
            = 30
```

**Interpretation**: Strong positive response! Vertical edge detected (bright-to-dark transition from left to right).

#### Position (0, 2):

**Extract 3×3 patch starting at (0,2):**
```
Patch = [ 10   0   0 ]
        [ 10   0   0 ]
        [ 10   0   0 ]
```

**Element-wise multiplication:**
```
Result = [ 10×1   0×0   0×(-1) ]   [ 10  0  0 ]
         [ 10×1   0×0   0×(-1) ] = [ 10  0  0 ]
         [ 10×1   0×0   0×(-1) ]   [ 10  0  0 ]
```

**Sum:**
```
Output[0,2] = 10 + 0 + 0 + 10 + 0 + 0 + 10 + 0 + 0
            = 30
```

#### Position (0, 3):

**Extract 3×3 patch starting at (0,3):**
```
Patch = [ 0   0   0 ]
        [ 0   0   0 ]
        [ 0   0   0 ]
```

**Sum:**
```
Output[0,3] = 0
```

**Interpretation**: No edge (uniform dark region).

### Complete Output Matrix (4×4):

By repeating for all positions:

```
Output = [  0  30  30   0 ]
         [  0  30  30   0 ]
         [  0  30  30   0 ]
         [  0  30  30   0 ]
```

**Analysis:**
- Columns 1 and 2 show strong activation (30): Vertical edge detected
- Columns 0 and 3 show no activation (0): Uniform regions
- The vertical edge in the middle of the input is clearly detected

---

## Forward Propagation: With Same Padding (p=1)

### Step 1: Apply Padding

Add 1 pixel border of zeros around the input:

```
I_padded (8×8) = 
[ 0   0   0   0   0   0   0   0 ]
[ 0  10  10  10   0   0   0   0 ]
[ 0  10  10  10   0   0   0   0 ]
[ 0  10  10  10   0   0   0   0 ]
[ 0  10  10  10   0   0   0   0 ]
[ 0  10  10  10   0   0   0   0 ]
[ 0  10  10  10   0   0   0   0 ]
[ 0   0   0   0   0   0   0   0 ]
```

### Step 2: Calculate Output Dimensions

```
n_H_padded = 6 + 2(1) = 8
n_W_padded = 6 + 2(1) = 8

n_H_out = 8 - 3 + 1 = 6
n_W_out = 8 - 3 + 1 = 6
```

Output will be `6 × 6` (same as original input size).

### Step 3: Perform Convolution

#### Position (0, 0):

**Extract 3×3 patch:**
```
Patch = [ 0   0   0 ]
        [ 0  10  10 ]
        [ 0  10  10 ]
```

**Convolution:**
```
Result = 0 + 0 + 0 + 0 + 0 + 0 + 0 + 0 + 0 = 0
```

But more precisely:
```
= (0×1 + 0×0 + 0×(-1)) + 
  (0×1 + 10×0 + 10×(-1)) + 
  (0×1 + 10×0 + 10×(-1))
= 0 + (0 + 0 - 10) + (0 + 0 - 10)
= -20
```

Let me recalculate correctly:

```
Patch = [ 0   0   0 ]    Filter = [ 1   0  -1 ]
        [ 0  10  10 ]             [ 1   0  -1 ]
        [ 0  10  10 ]             [ 1   0  -1 ]

= (0×1) + (0×0) + (0×(-1)) +
  (0×1) + (10×0) + (10×(-1)) +
  (0×1) + (10×0) + (10×(-1))
= 0 + 0 + 0 + 0 + 0 - 10 + 0 + 0 - 10
= -20
```

### Complete Padded Output (6×6):

```
Output_padded = [ -20  -10  20  10   0   0 ]
                [   0    0  30  30   0   0 ]
                [   0    0  30  30   0   0 ]
                [   0    0  30  30   0   0 ]
                [   0    0  30  30   0   0 ]
                [ -20  -10  20  10   0   0 ]
```

**Analysis:**
- Output maintains original 6×6 size
- Edge detection still works (columns 2-3 show strong activation)
- Border effects are captured (corners and edges have different values)
- More information preserved about the entire image

---

## Backward Propagation: Gradient Flow

### Overview

In backward propagation, we compute gradients with respect to:
1. **∂L/∂K**: Gradient with respect to the filter (for learning)
2. **∂L/∂I**: Gradient with respect to the input (for passing to previous layers)

Where `L` is the loss function.

### Mathematical Formulation

Given:
- Forward pass: `Output = I * K` (convolution)
- Loss gradient from next layer: `∂L/∂Output`

### 1. Gradient with Respect to Filter (∂L/∂K)

**Plain English**: To find how the loss changes with respect to filter weights, we correlate the input with the gradient from the output.

**Formula:**
```
∂L/∂K[m,n] = Σ   Σ   I[i+m, j+n] · (∂L/∂Output)[i,j]
            i=0 j=0
```

**Symbol Legend:**
- `∂L/∂K[m,n]`: Gradient for filter element at position (m,n)
- `I[i+m, j+n]`: Input value at corresponding position
- `∂L/∂Output[i,j]`: Gradient from the next layer
- `Σ`: Sum over all valid output positions

**Step-by-Step Process:**

For each filter element `K[m,n]`:
1. Find all positions where this filter element was used
2. Multiply the input value by the gradient from output at that position
3. Sum all contributions

### 2. Gradient with Respect to Input (∂L/∂I)

**Plain English**: Each input pixel contributes to multiple output pixels. We accumulate gradients from all outputs it influenced.

**Formula:**
```
∂L/∂I[i,j] = Σ   Σ   K[m,n] · (∂L/∂Output)[i-m, j-n]
            m=0 n=0
```

This is equivalent to convolving the gradient with a **180° rotated filter**.

#### Why Rotate the Filter?

**Mathematical Intuition:**

During forward propagation, when computing output position `(i,j)`, we multiply:
```
Output[i,j] = Σ Σ I[i+m, j+n] · K[m,n]
```

This means input pixel `I[i+m, j+n]` was multiplied by filter element `K[m,n]`.

During backward propagation, the chain rule tells us:
```
∂L/∂I[i,j] = Σ (∂L/∂Output[p,q]) · (∂Output[p,q]/∂I[i,j])
```

**Key Question**: Which output positions `(p,q)` did input `I[i,j]` contribute to?

**Answer**: Input `I[i,j]` contributed to output `Output[p,q]` when:
- The filter was positioned such that `I[i,j]` fell within the filter's receptive field
- This happens when: `i = p + m` and `j = q + n` for some filter position `(m,n)`
- Rearranging: `p = i - m` and `q = j - n`

**Therefore:**
```
∂L/∂I[i,j] = Σ Σ (∂L/∂Output)[i-m, j-n] · K[m,n]
```

**The Rotation**: When we change the indexing from `[i-m, j-n]` to standard convolution form `[i+m', j+n']`, we need to substitute:
- `m' = -m` (ranges from `-(f-1)` to `0` instead of `0` to `f-1`)
- `n' = -n`

This substitution is mathematically equivalent to rotating the filter by 180° and performing standard convolution.

**Practical Example:**

Original filter:
```
K = [ 1   0  -1 ]     Position (0,0) is top-left
    [ 1   0  -1 ]     Position (2,2) is bottom-right
    [ 1   0  -1 ]
```

After 180° rotation:
```
K_rotated = [ -1   0   1 ]     What was (2,2) is now (0,0)
            [ -1   0   1 ]     What was (0,0) is now (2,2)
            [ -1   0   1 ]
```

**Why This Matters**: The rotation ensures that when we convolve the output gradient with the filter, each weight reaches the correct input positions that it originally influenced during the forward pass, properly distributing gradients according to the chain rule.

---

## Detailed Backward Propagation Example

### Setup

Using our previous forward pass example:

**Input (6×6):**
```
I = [ 10  10  10   0   0   0 ]
    [ 10  10  10   0   0   0 ]
    [ 10  10  10   0   0   0 ]
    [ 10  10  10   0   0   0 ]
    [ 10  10  10   0   0   0 ]
    [ 10  10  10   0   0   0 ]
```

**Filter (3×3):**
```
K = [ 1   0  -1 ]
    [ 1   0  -1 ]
    [ 1   0  -1 ]
```

**Forward Output (4×4):**
```
Output = [  0  30  30   0 ]
         [  0  30  30   0 ]
         [  0  30  30   0 ]
         [  0  30  30   0 ]
```

**Gradient from Loss (assumed 4×4):**

Let's assume the next layer sends back this gradient:
```
∂L/∂Output = [ 0.0  0.5  0.5  0.0 ]
             [ 0.0  0.5  0.5  0.0 ]
             [ 0.0  0.5  0.5  0.0 ]
             [ 0.0  0.5  0.5  0.0 ]
```

This gradient indicates high importance for positions detecting the edge.

---

### Computing ∂L/∂K (Filter Gradient)

We need to compute the gradient for each of the 9 filter elements.

#### Computing ∂L/∂K[0,0] (Top-left filter element):

**Formula:**
```
∂L/∂K[0,0] = Σ Σ I[i+0, j+0] · (∂L/∂Output)[i,j]
```

**Detailed Calculation:**

For all valid output positions (i,j) ∈ [0,3] × [0,3]:

```
Position (0,0): I[0,0] · ∂L/∂Output[0,0] = 10 × 0.0 = 0.0
Position (0,1): I[0,1] · ∂L/∂Output[0,1] = 10 × 0.5 = 5.0
Position (0,2): I[0,2] · ∂L/∂Output[0,2] = 10 × 0.5 = 5.0
Position (0,3): I[0,3] · ∂L/∂Output[0,3] = 0 × 0.0 = 0.0

Position (1,0): I[1,0] · ∂L/∂Output[1,0] = 10 × 0.0 = 0.0
Position (1,1): I[1,1] · ∂L/∂Output[1,1] = 10 × 0.5 = 5.0
Position (1,2): I[1,2] · ∂L/∂Output[1,2] = 10 × 0.5 = 5.0
Position (1,3): I[1,3] · ∂L/∂Output[1,3] = 0 × 0.0 = 0.0

... (continuing for all 16 positions)

∂L/∂K[0,0] = 0.0 + 5.0 + 5.0 + 0.0 + ... = 40.0
```

**Full calculation for all filter elements:**

#### ∂L/∂K[0,1] (Top-middle):

```
∂L/∂K[0,1] = Σ Σ I[i, j+1] · (∂L/∂Output)[i,j]

Position (0,0): I[0,1] · 0.0 = 10 × 0.0 = 0.0
Position (0,1): I[0,2] · 0.5 = 10 × 0.5 = 5.0
Position (0,2): I[0,3] · 0.5 = 0 × 0.5 = 0.0
Position (0,3): I[0,4] · 0.0 = 0 × 0.0 = 0.0
...

∂L/∂K[0,1] = 20.0
```

#### ∂L/∂K[0,2] (Top-right):

```
∂L/∂K[0,2] = Σ Σ I[i, j+2] · (∂L/∂Output)[i,j]

Position (0,0): I[0,2] · 0.0 = 10 × 0.0 = 0.0
Position (0,1): I[0,3] · 0.5 = 0 × 0.5 = 0.0
Position (0,2): I[0,4] · 0.5 = 0 × 0.5 = 0.0
Position (0,3): I[0,5] · 0.0 = 0 × 0.0 = 0.0
...

∂L/∂K[0,2] = 0.0
```

**Complete Filter Gradient (3×3):**

```
∂L/∂K = [ 40.0  20.0   0.0 ]
        [ 40.0  20.0   0.0 ]
        [ 40.0  20.0   0.0 ]
```

**Interpretation:**
- Left column (40.0): These filter weights see bright pixels where gradient is high
- Middle column (20.0): Moderate contribution
- Right column (0.0): These weights see dark pixels, no gradient contribution

---

### Computing ∂L/∂I (Input Gradient)

**Formula (Full Convolution with Rotated Filter):**

```
∂L/∂I = ∂L/∂Output * K_rotated (full convolution)
```

Where `K_rotated` is K rotated by 180°:
```
K_rotated = [ -1   0   1 ]
            [ -1   0   1 ]
            [ -1   0   1 ]
```

For valid convolution backward pass, we need to:
1. Pad `∂L/∂Output` to restore input dimensions
2. Convolve with rotated kernel

**Padding the gradient for backward convolution:**

To compute the input gradient (6×6) from the output gradient (4×4), we need to:
1. Add `f-1 = 3-1 = 2` pixels of padding around all sides of the 4×4 gradient
2. This expands it from 4×4 to (4 + 2×2) = 8×8
3. Then convolve with the 3×3 rotated filter to get 6×6 output

**Padded gradient (8×8):**
```
∂L/∂Output_padded =
[ 0.0  0.0  0.0  0.0  0.0  0.0  0.0  0.0 ]
[ 0.0  0.0  0.0  0.0  0.0  0.0  0.0  0.0 ]
[ 0.0  0.0  0.0  0.5  0.5  0.0  0.0  0.0 ]
[ 0.0  0.0  0.0  0.5  0.5  0.0  0.0  0.0 ]
[ 0.0  0.0  0.0  0.5  0.5  0.0  0.0  0.0 ]
[ 0.0  0.0  0.0  0.5  0.5  0.0  0.0  0.0 ]
[ 0.0  0.0  0.0  0.0  0.0  0.0  0.0  0.0 ]
[ 0.0  0.0  0.0  0.0  0.0  0.0  0.0  0.0 ]
```

Now we convolve this 8×8 padded gradient with the 3×3 rotated filter to obtain a 6×6 input gradient.

#### Computing ∂L/∂I[0,0]:

**Extract 3×3 patch from padded gradient:**
```
Patch = [ 0.0  0.0  0.0 ]
        [ 0.0  0.0  0.0 ]
        [ 0.0  0.0  0.0 ]
```

**Convolve with K_rotated:**
```
∂L/∂I[0,0] = 0.0
```

#### Computing ∂L/∂I[0,1]:

**Extract 3×3 patch:**
```
Patch = [ 0.0  0.0  0.0 ]
        [ 0.0  0.0  0.0 ]
        [ 0.0  0.0  0.5 ]
```

**Convolve:**
```
= (0.0×(-1) + 0.0×0 + 0.0×1) +
  (0.0×(-1) + 0.0×0 + 0.0×1) +
  (0.0×(-1) + 0.0×0 + 0.5×1)
= 0.5
```

#### Computing ∂L/∂I[1,1]:

**Extract 3×3 patch:**
```
Patch = [ 0.0  0.0  0.0 ]
        [ 0.0  0.0  0.5 ]
        [ 0.0  0.0  0.5 ]
```

**Convolve:**
```
= 0 + 0 + 0 + 0 + 0 + 0.5 + 0 + 0 + 0.5 = 1.0
```

**Complete Input Gradient (6×6):**

After computing all positions:

```
∂L/∂I = [ 0.0  0.5  0.0 -0.5 -0.5  0.0 ]
        [ 0.0  1.0  0.0 -1.0 -1.0  0.0 ]
        [ 0.0  1.0  0.0 -1.0 -1.0  0.0 ]
        [ 0.0  1.0  0.0 -1.0 -1.0  0.0 ]
        [ 0.0  1.0  0.0 -1.0 -1.0  0.0 ]
        [ 0.0  0.5  0.0 -0.5 -0.5  0.0 ]
```

**Interpretation:**
- Column 1 (positive values): Gradient flows back to bright pixels on the left
- Columns 3-4 (negative values): Gradient flows back to edge region
- The gradient tells us how to adjust input pixels to minimize loss
- Pixels contributing to edge detection receive stronger gradients

---

## Parameter Update (Gradient Descent)

After computing gradients, we update the filter weights:

**Update Rule:**
```
K_new = K_old - α · ∂L/∂K
```

**Symbol Legend:**
- `α`: Learning rate (e.g., 0.01)
- `K_old`: Current filter weights
- `K_new`: Updated filter weights
- `∂L/∂K`: Computed gradient

**Example Update (α = 0.01):**

```
K_old = [ 1   0  -1 ]
        [ 1   0  -1 ]
        [ 1   0  -1 ]

∂L/∂K = [ 40.0  20.0   0.0 ]
        [ 40.0  20.0   0.0 ]
        [ 40.0  20.0   0.0 ]

K_new = [ 1   0  -1 ]   [ 40.0  20.0   0.0 ]
        [ 1   0  -1 ] - 0.01 × [ 40.0  20.0   0.0 ]
        [ 1   0  -1 ]   [ 40.0  20.0   0.0 ]

      = [ 1-0.40   0-0.20  -1-0.00 ]
        [ 1-0.40   0-0.20  -1-0.00 ]
        [ 1-0.40   0-0.20  -1-0.00 ]

      = [ 0.60  -0.20  -1.00 ]
        [ 0.60  -0.20  -1.00 ]
        [ 0.60  -0.20  -1.00 ]
```

**Interpretation:**
- Left column decreased: Reduces over-activation for bright regions
- Middle column became negative: Adjusts to better detect edges
- Right column unchanged: Already at optimal value for dark regions
- The filter is learning from data to improve edge detection

---

## Summary of Key Formulas

### Forward Pass:
```
1. Output size (no padding): n_out = n_in - f + 1
2. Output size (with padding): n_out = n_in + 2p - f + 1
3. Same padding: p = (f - 1) / 2
4. Convolution: Output[i,j] = Σ Σ I[i+m, j+n] · K[m,n]
```

### Backward Pass:
```
5. Filter gradient: ∂L/∂K[m,n] = Σ Σ I[i+m, j+n] · (∂L/∂Output)[i,j]
6. Input gradient: ∂L/∂I = (∂L/∂Output) * K_rotated (full convolution)
7. Parameter update: K_new = K_old - α · ∂L/∂K
```

---

## Practical Considerations

### 1. Computational Complexity

For an input of size `(n × n)`, filter of size `(f × f)`:
- **Forward pass**: `O((n - f + 1)² · f²)` operations
- **Backward pass**: Similar complexity
- With padding, replace `n` with `n + 2p`

### 2. Memory Requirements

- **Input**: `n × n` values
- **Filter**: `f × f` values (typically small, e.g., 9 for 3×3)
- **Output**: `(n - f + 1)² ` values
- **Gradients**: Same as their corresponding tensors

### 3. Choice of Padding

| Padding Type | Use Case |
|--------------|----------|
| Valid (p=0) | When size reduction is acceptable, fewer parameters |
| Same (p=(f-1)/2) | Maintain spatial dimensions throughout network |
| Full (p=f-1) | Rarely used, increases computation |

### 4. Filter Size Selection

- **3×3**: Most common, good balance of receptive field and computation
- **5×5, 7×7**: Larger receptive field, more computation
- **1×1**: Dimension reduction, no spatial information
- **Odd sizes preferred**: Symmetric padding, clear center pixel

---

## Connection to Next Topic

This foundation in edge detection and padding sets the stage for understanding:

1. **Strided Convolutions**: Control output size by skipping positions
2. **Pooling Layers**: Downsample feature maps for efficiency
3. **Multiple Channels**: Extend to RGB images and feature maps
4. **Deep Networks**: Stack multiple convolutional layers
5. **Learned Filters**: Automatic feature discovery through backpropagation

The mathematical framework established here (convolution, gradient computation, parameter updates) applies universally across all CNN architectures. The key insight is that **filters are learnable parameters** that automatically discover optimal features through gradient descent, moving beyond hand-crafted edge detectors to complex, hierarchical feature representations.

---

## Appendix: Numerical Stability and Implementation Tips

### 1. Filter Initialization

Instead of hand-crafted values, initialize randomly:
```
K ~ N(0, √(2/n_in))  (He initialization)
```

### 2. Gradient Clipping

Prevent exploding gradients:
```
if ||∂L/∂K|| > threshold:
    ∂L/∂K = threshold · (∂L/∂K / ||∂L/∂K||)
```

### 3. Vectorized Implementation

Use matrix operations instead of loops for efficiency:
- `im2col`: Transform convolution into matrix multiplication
- GPU acceleration for parallel computation

### 4. Bias Terms

In practice, add bias to each output:
```
Output[i,j] = (Σ Σ I[i+m, j+n] · K[m,n]) + b
```

Where `b` is a learnable scalar per filter.

---

## End of Guide

This guide has covered edge detection and padding in comprehensive detail, from basic concepts through complete mathematical derivations to full forward and backward propagation examples. Every formula has been explained in plain English, all symbols defined, and calculations shown step-by-step. This foundation prepares you for deeper CNN concepts while maintaining mathematical rigor and practical intuition.