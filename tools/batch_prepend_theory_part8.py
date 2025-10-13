#!/usr/bin/env python3
"""
Batch-prepend tailored Theory markdown to Part 8 (Deep Learning) notebooks.

Edits the following notebooks in-place:
- Part 8 - Deep Learning
  * Section 39 - Artificial Neural Networks (ANN)/Python/artificial_neural_network.ipynb
  * Section 40 - Convolutional Neural Networks (CNN)/Python/convolutional_neural_network.ipynb

Behavior:
- Loads notebook JSON
- If the first cell already starts with a Theory marker ("# Theory —" or variants), skips
- Otherwise prepends a Markdown cell with tailored content
- Preserves kernelspec, language_info, outputs, execution counts

Run:
  python tools/batch_prepend_theory_part8.py
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, List, Tuple

ROOT = Path(__file__).resolve().parents[1]  # project root

MARKER_PREFIXES = (
    "# Theory —",
    "# Theory -",
    "# Theory:",
    "# Теория —",
)

def load_notebook(nb_path: Path) -> Dict:
    with nb_path.open("r", encoding="utf-8") as f:
        return json.load(f)

def save_notebook(nb_path: Path, nb: Dict) -> None:
    tmp_path = nb_path.with_suffix(".ipynb.tmp")
    with tmp_path.open("w", encoding="utf-8") as f:
        json.dump(nb, f, ensure_ascii=False, indent=1)
        f.write("\n")
    tmp_path.replace(nb_path)

def already_has_theory(nb: Dict) -> bool:
    cells = nb.get("cells", [])
    if not cells:
        return False
    first = cells[0]
    if first.get("cell_type") != "markdown":
        return False
    src = first.get("source", "")
    text = "".join(src) if isinstance(src, list) else str(src)
    text = text.lstrip()
    return any(text.startswith(p) for p in MARKER_PREFIXES)

def md_cell(content: str) -> Dict:
    content = content.replace("\r\n", "\n").replace("\r", "\n")
    return {"cell_type": "markdown", "metadata": {}, "source": content}

def prepend(nb_path: Path, content: str):
    if not nb_path.exists():
        return False, f"Not found: {nb_path}"
    try:
        nb = load_notebook(nb_path)
    except Exception as e:
        return False, f"Failed to load notebook {nb_path}: {e}"
    if "cells" not in nb or not isinstance(nb["cells"], list):
        return False, f"Invalid notebook structure (missing cells): {nb_path}"
    if already_has_theory(nb):
        return True, f"Skip (already has Theory): {nb_path}"
    nb["cells"] = [md_cell(content)] + nb["cells"]
    try:
        save_notebook(nb_path, nb)
    except Exception as e:
        return False, f"Failed to save notebook {nb_path}: {e}"
    return True, f"Prepended Theory: {nb_path}"

ANN_MD = """# Theory — Artificial Neural Networks (ANN)

What it solves
- Learn complex non-linear mappings from inputs to outputs (classification or regression) by stacking simple units (neurons).
- Useful when linear models underfit: churn prediction, tabular credit risk, simple image/tabular/time series patterns.

Plain intuition
- Each neuron computes a weighted sum of inputs plus a bias, then applies a non-linear activation (e.g., ReLU).
- Layers of neurons compose these operations to approximate complex functions (Universal Approximation Theorem).

Forward pass (one hidden layer)
- Given input x ∈ ℝ^d:
  1) Hidden pre-activation: z¹ = W¹ x + b¹
  2) Hidden activation:    h = a(z¹)   (e.g., ReLU, tanh)
  3) Output logits:        z² = W² h + b²
  4) Output activation:    ŷ = softmax(z²) (classification) or identity (regression)

Core math
- Classification loss (cross-entropy):
  L = - (1/N) Σ_i Σ_c y_{i,c} log ŷ_{i,c}
- Regression loss: MSE = (1/N) Σ_i ||y_i - ŷ_i||²
- Backpropagation computes gradients ∂L/∂W, ∂L/∂b efficiently using chain rule.
- Optimizers update parameters:
  • SGD: θ ← θ - η ∂L/∂θ
  • Adam: adaptive moments (m, v) for per-parameter learning rates.

Regularization and stabilization
- Weight decay (L2), dropout (randomly zero activations), early stopping (monitor val loss).
- Batch Normalization stabilizes training by normalizing layer inputs.
- Initialization: He for ReLU, Xavier for tanh/sigmoid.

Tiny example (paper-and-pencil)
- Binary classification with 2D input and a small hidden layer (2 neurons).
- ReLU(x) = max(0, x) allows piecewise linear decision boundaries formed by hidden units.

Hyperparameters
- Architecture: number of layers/neurons.
- Activation: ReLU is a robust default; sigmoid/softmax in output layers.
- Optimizer + learning rate (and schedule).
- Batch size, epochs; dropout rate; weight decay λ.

Pros, cons, pitfalls
- Pros: Flexible function approximator; strong performance with enough data.
- Cons: More tuning; risk of overfitting; less interpretable than linear models.
- Pitfalls: Not scaling inputs; too large learning rate; no validation/early stopping; class imbalance ignored.

How this notebook implements it
- Dataset: Churn_Modelling.csv (tabular classification).
- Steps: preprocessing → define dense model → compile(loss, optimizer, metrics) → train/validate → evaluate.
- Tips: Standardize inputs; use dropout/early stopping; tune width/depth minimally.

Quick checklist
- Scale numeric features.
- Start with 1–2 hidden layers (e.g., 16–64 units) + ReLU + dropout.
- Use cross-entropy + Adam; monitor validation metrics.
- Early stopping; adjust learning rate if unstable.
"""

CNN_MD = """# Theory — Convolutional Neural Networks (CNN)

What it solves
- Extract spatial/temporal patterns with shared filters: image recognition, text CNNs, audio, video.
- Convolution layers learn local features (edges → textures → parts → objects).

Plain intuition
- Slide a small filter (kernel) over the image; each position computes a weighted sum = feature map.
- Stacking convolutions builds hierarchical features; pooling downsamples to gain invariance and reduce compute.

Convolution basics
- Input: H×W×C (height, width, channels).
- Kernel: k×k×C weights; Stride s controls step; Padding p preserves size.
- Output feature map size (same conv): ~H×W×F where F filters produce F channels.

Typical block
- [Conv → Activation (ReLU) → (BatchNorm) → Pool] × N → Flatten/GlobalPool → Dense → Softmax.
- Data augmentation (random flips/crops) synthetically enlarges dataset and regularizes.

Tiny example (paper-and-pencil)
- 5×5 grayscale patch convolved with a 3×3 edge-detect kernel; multiply-and-sum at each 3×3 window.
- Pooling (2×2 max) halves spatial size.

Training
- Same losses/optimizers as ANN (cross-entropy + Adam common).
- Care with input normalization and batch sizes (GPU memory).

Hyperparameters
- Kernel size (3×3 default), filters per layer (32, 64, 128…), stride/padding, number of conv blocks.
- Pooling type (max/avg), dropout rates, learning rate, augmentation settings.

Pros, cons, pitfalls
- Pros: Parameter sharing → fewer weights; strong inductive bias for images.
- Cons: Memory/computation heavy; sensitive to LR/initialization; brittle on domain shift.
- Pitfalls: Wrong input shape/order; over‑augmentation; not normalizing inputs; too deep too soon.

How this notebook implements it
- Dataset: images loaded via Keras utilities (flow_from_directory or generators).
- Steps: define Conv2D/MaxPool blocks → flatten → dense → compile → train with augmentation → evaluate.
- Tips: Start small; confirm overfitting on a small subset; then regularize/augment.

Quick checklist
- Normalize inputs; verify channel ordering.
- 2–3 conv blocks (3×3) + ReLU + pooling; then dense + softmax.
- Use augmentation and dropout; monitor val metrics; early stopping.
"""

TARGETS: List[Tuple[str, str]] = [
    (
        "DataScience/4. Machine Learning A-Z/Part 8 - Deep Learning/Section 39 - Artificial Neural Networks (ANN)/Python/artificial_neural_network.ipynb",
        ANN_MD,
    ),
    (
        "DataScience/4. Machine Learning A-Z/Part 8 - Deep Learning/Section 40 - Convolutional Neural Networks (CNN)/Python/convolutional_neural_network.ipynb",
        CNN_MD,
    ),
]

def main() -> int:
    any_fail = False
    for rel, content in TARGETS:
        nb_path = ROOT / rel
        ok, msg = prepend(nb_path, content)
        print(msg)
        if not ok:
            any_fail = True
    return 1 if any_fail else 0

if __name__ == "__main__":
    raise SystemExit(main())
