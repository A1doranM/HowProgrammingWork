#!/usr/bin/env python3
"""
Replace the top 'Theory' cells in Part 8 (Deep Learning) with much more detailed explanations,
matching the depth and style of the user's UCB write-up. If a Theory cell isn't present,
the content will be prepended.

Targets:
- DataScience/4. Machine Learning A-Z/Part 8 - Deep Learning/Section 39 - Artificial Neural Networks (ANN)/Python/artificial_neural_network.ipynb
- DataScience/4. Machine Learning A-Z/Part 8 - Deep Learning/Section 40 - Convolutional Neural Networks (CNN)/Python/convolutional_neural_network.ipynb
"""
from __future__ import annotations

import sys
from pathlib import Path

# Ensure project root is on sys.path so 'tools' package imports succeed
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from tools.nb_theory import load_notebook, save_notebook, replace_or_prepend_theory  # noqa: E402

ANN_MD = """# What is an Artificial Neural Network (ANN)?

A flexible function approximator for learning **non‑linear mappings** from inputs to outputs (classification or regression).
Rule of thumb: “Stack linear transformations and non‑linear activations; train weights to minimize a loss.”

Think churn prediction: given customer features, an ANN learns weighted combinations and non‑linearities that separate churners from non‑churners.

---

# Variables and notation

- Input: \\(x \\in \\mathbb{R}^{d}\\) (feature vector), target \\(y\\) (class or real value)
- Hidden layer \\(\\ell\\): weights \\(W^{(\\ell)} \\in \\mathbb{R}^{h_{\\ell}\\times h_{\\ell-1}}\\), bias \\(b^{(\\ell)} \\in \\mathbb{R}^{h_{\\ell}}\\)
- Pre‑activation: \\(z^{(\\ell)} = W^{(\\ell)} a^{(\\ell-1)} + b^{(\\ell)}\\)
- Activation: \\(a^{(\\ell)} = f\\big(z^{(\\ell)}\\big)\\) (e.g., ReLU, tanh)
- Output logits: \\(z^{(L)}\\); output \\(\\hat{y}\\) via softmax (classification) or identity (regression)

Shapes (example):
- Input dim \\(d\\), hidden dims \\(h_1, h_2\\), classes \\(C\\)
- \\(W^{(1)}: h_1 \\times d\\), \\(W^{(2)}: h_2 \\times h_1\\), \\(W^{(L)}: C \\times h_2\\)

---

# Forward pass (2 hidden layers, classification)

1) \\(z^{(1)} = W^{(1)} x + b^{(1)}\\), \\(a^{(1)} = \\mathrm{ReLU}(z^{(1)})\\)
2) \\(z^{(2)} = W^{(2)} a^{(1)} + b^{(2)}\\), \\(a^{(2)} = \\mathrm{ReLU}(z^{(2)})\\)
3) \\(z^{(3)} = W^{(3)} a^{(2)} + b^{(3)}\\)
4) Softmax: \\(\\hat{y}_c = \\frac{e^{z^{(3)}_c}}{\\sum_{k=1}^C e^{z^{(3)}_k}}\\)

---

# Loss and optimization

- Cross‑entropy loss (classification):  
  \\[
  \\mathcal{L} = -\\frac{1}{N}\\sum_{i=1}^N \\sum_{c=1}^C y_{i,c} \\log(\\hat{y}_{i,c})
  \\]
- MSE (regression): \\(\\mathcal{L} = \\tfrac{1}{N}\\sum_i \\lVert y_i - \\hat{y}_i \\rVert^2\\)
- Regularization: L2 weight decay (\\(\\lambda \\lVert W \\rVert^2\\)), Dropout (randomly zero activations), Early stopping (monitor val loss)
- Optimizers:
  - SGD: \\(\\theta \\leftarrow \\theta - \\eta \\nabla_\\theta \\mathcal{L}\\)
  - Adam: adaptive learning rates via first/second moments

Backpropagation: efficient gradients via chain rule (compute \\(\\partial \\mathcal{L}/\\partial W^{(\\ell)}\\), \\(\\partial \\mathcal{L}/\\partial b^{(\\ell)}\\) layer by layer).

---

# Step‑by‑step tiny example

Binary classification, 2D input \\(x = [x_1, x_2]^\\top\\), one hidden layer (2 neurons), ReLU, sigmoid output.
- Random init \\(W^{(1)}\\in\\mathbb{R}^{2\\times 2}\\), \\(b^{(1)}\\in\\mathbb{R}^{2}\\); \\(W^{(2)}\\in\\mathbb{R}^{1\\times 2}\\), \\(b^{(2)}\\in\\mathbb{R}\\)
- Forward: compute \\(z^{(1)}\\), ReLU, then \\(z^{(2)}\\), sigmoid \\(\\hat{y}\\)
- Loss: cross‑entropy with label \\(y\\in\\{0,1\\}\\)
- Backprop: update weights; repeat — decision boundary becomes piecewise linear and bends to fit classes.

---

# Pseudocode

```
init weights W, biases b
for epoch in 1..E:
  for minibatch (X, y):
    # forward
    a = X
    for each layer l:
      z = W[l] @ a + b[l]
      a = activation(z)
    y_hat = last_activation(z_last)
    # loss + backprop
    L = loss(y_hat, y) + reg(W)
    grads = backprop(L, parameters)
    # update
    for p in parameters: p -= lr * grads[p]
```

---

# Minimal Python (ready to paste – Keras)

```python
from tensorflow.keras import layers as L, models, optimizers, callbacks

model = models.Sequential([
    L.Input(shape=(d,)),
    L.Dense(64, activation="relu"),
    L.Dropout(0.2),
    L.Dense(32, activation="relu"),
    L.Dense(C, activation="softmax"),
])

model.compile(optimizer=optimizers.Adam(1e-3),
              loss="sparse_categorical_crossentropy",
              metrics=["accuracy"])

es = callbacks.EarlyStopping(patience=10, restore_best_weights=True)
model.fit(X_train, y_train, validation_data=(X_val, y_val),
          epochs=100, batch_size=32, callbacks=[es])
```

---

# Practical tips, pitfalls, and variants

- Scale inputs (StandardScaler) for stable training.
- Use He initialization for ReLU, Xavier for tanh/sigmoid.
- Class imbalance: class weights or focal loss.
- Overfitting: dropout, L2, early stopping, smaller widths.
- Learning rate: monitor curves; use schedulers (ReduceLROnPlateau, cosine decay).
- Variants: BatchNorm, residual connections, GELU/SiLU activations.

---

# How this notebook implements it

- Dataset: Churn_Modelling.csv (tabular classification).
- Steps: preprocess (encode/scale) → define dense network → compile (Adam + cross‑entropy) → train with validation → evaluate.
- Tip: wrap preprocessing in Pipeline to avoid leakage; standardize numeric columns.

---

# Quick cheat sheet

- Input → Dense + ReLU ×(1–2) → Softmax
- Loss: cross‑entropy; Optimizer: Adam
- Regularize: dropout/L2; Early stopping
- Scale features; monitor val metrics
"""

CNN_MD = """# What is a Convolutional Neural Network (CNN)?

A network that learns **spatial features** by sliding filters (kernels) over inputs (images, sequences), capturing local patterns (edges → textures → parts → objects).
Rule of thumb: “Convolve → activate → pool (repeat), then classify.”

Think image recognition: early filters detect edges; deeper filters detect parts and objects.

---

# Variables and notation

- Input image: \\(X \\in \\mathbb{R}^{H\\times W\\times C}\\) (height, width, channels)
- Convolution kernel: \\(K \\in \\mathbb{R}^{k\\times k\\times C}\\), number of filters \\(F\\)
- Stride \\(s\\), padding \\(p\\)
- Output feature map (same padding): height \\(H' = \\lceil H/s \\rceil\\), width \\(W' = \\lceil W/s \\rceil\\), channels \\(F\\)

Convolution at location \\((i,j)\\): \\(Y[i,j,f] = \\sum_{u,v,c} K_f[u,v,c] \\cdot X[i+u, j+v, c] + b_f\\)

---

# Typical block

1) Conv2D(filters=F, kernel_size=k)  
2) Activation (ReLU)  
3) (BatchNorm)  
4) Pooling (MaxPool2D) to downsample  
Repeat ×N → Flatten/GlobalAveragePool → Dense → Softmax

Data augmentation (random flips/crops/rotations) helps regularization by increasing variation.

---

# Output size formula (valid padding)

\\[
H' = \\left\\lfloor \\frac{H - k + 2p}{s} \\right\\rfloor + 1, \\quad
W' = \\left\\lfloor \\frac{W - k + 2p}{s} \\right\\rfloor + 1
\\]

For “same” padding with \\(s=1\\): \\(H'=H, W'=W\\).

---

# Step‑by‑step tiny example

5×5 grayscale patch, 3×3 edge detector kernel:
- Slide kernel over 3×3 windows; multiply‑sum → highlights edges.
- Max pooling 2×2 halves both H and W → invariance to small shifts.

---

# Pseudocode

```
x = input_image
for block in conv_blocks:
  x = conv2d(x, filters=F, k=k, stride=s, padding=p)
  x = relu(x)
  if use_bn: x = batch_norm(x)
  x = max_pool(x, size=2)
x = flatten(x) or global_avg_pool(x)
logits = dense(x, units=C)
y_hat = softmax(logits)
loss = cross_entropy(y_hat, y)
opt.step(backprop(loss))
```

---

# Minimal Python (ready to paste – Keras)

```python
from tensorflow.keras import layers as L, models, optimizers, callbacks

model = models.Sequential([
    L.Input(shape=(H, W, C)),
    L.Conv2D(32, (3,3), activation="relu", padding="same"),
    L.MaxPool2D((2,2)),
    L.Conv2D(64, (3,3), activation="relu", padding="same"),
    L.MaxPool2D((2,2)),
    L.Flatten(),
    L.Dense(128, activation="relu"),
    L.Dropout(0.3),
    L.Dense(C, activation="softmax"),
])

model.compile(optimizer=optimizers.Adam(1e-3),
              loss="sparse_categorical_crossentropy",
              metrics=["accuracy"])

es = callbacks.EarlyStopping(patience=8, restore_best_weights=True)
model.fit(train_ds, validation_data=val_ds, epochs=50, callbacks=[es])
```

---

# Practical tips, pitfalls, and variants

- Normalize inputs (per‑channel mean/std); verify channel order (NHWC).
- Start small; confirm model can overfit a tiny subset.
- Use augmentation (flip/crop/rotate/color jitter) and dropout.
- Watch LR schedules; too high → divergence, too low → slow.
- Memory: tune batch size and feature maps; consider depthwise separable convs.
- Variants: ResNet (residual connections), DenseNet, MobileNet.

---

# How this notebook implements it

- Dataset: images loaded via Keras generators or folders.
- Steps: conv‑blocks → dense → compile (Adam + cross‑entropy) → train with augmentation → evaluate.
- Tip: visualize filters and feature maps to debug.

---

# Quick cheat sheet

- [Conv→ReLU→(BN)→Pool] ×2–3 → Dense → Softmax
- Normalize inputs; use augmentation
- Early stopping; tune LR and batch size
"""

def main() -> int:
    ann_path = ROOT / "DataScience/4. Machine Learning A-Z/Part 8 - Deep Learning/Section 39 - Artificial Neural Networks (ANN)/Python/artificial_neural_network.ipynb"
    cnn_path = ROOT / "DataScience/4. Machine Learning A-Z/Part 8 - Deep Learning/Section 40 - Convolutional Neural Networks (CNN)/Python/convolutional_neural_network.ipynb"

    # ANN
    nb = load_notebook(ann_path)
    replace_or_prepend_theory(nb, ANN_MD)
    save_notebook(ann_path, nb)
    print(f"Replaced Theory cell in: {ann_path}")

    # CNN
    nb2 = load_notebook(cnn_path)
    replace_or_prepend_theory(nb2, CNN_MD)
    save_notebook(cnn_path, nb2)
    print(f"Replaced Theory cell in: {cnn_path}")

    return 0

if __name__ == "__main__":
    raise SystemExit(main())
