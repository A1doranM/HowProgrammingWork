#!/usr/bin/env python3
"""
Batch-prepend tailored Theory markdown to Part 9 (Dimensionality Reduction) notebooks.

Edits the following notebooks in-place:
- Part 9 - Dimensionality Reduction
  * Section 43 - PCA/Python/principal_component_analysis.ipynb
  * Section 44 - LDA/Python/linear_discriminant_analysis.ipynb
  * Section 45 - Kernel PCA/Python/kernel_pca.ipynb

Behavior:
- Loads notebook JSON
- If the first cell already starts with a Theory marker ("# Theory —" or variants), skips
- Otherwise prepends a Markdown cell with tailored content
- Preserves kernelspec, language_info, outputs, execution counts

Run:
  python tools/batch_prepend_theory_part9.py
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

PCA_MD = """# Theory — Principal Component Analysis (PCA)

What it solves
- Unsup. dimensionality reduction: project data into a lower‑D space that keeps as much variance as possible.
- Goals: visualization (2D/3D), noise reduction, speedup for downstream models, decorrelation.

Plain intuition
- Find a direction (axis) through the cloud of points along which the data varies the most; project onto it.
- Then find the next direction orthogonal to the first with maximum remaining variance; and so on.

Step‑by‑step (paper‑and‑pencil)
1) Standardize/center features (important if scales differ): x ← (x − mean) / std or at least x − mean.
2) Compute covariance matrix Σ (or use SVD on centered X).
3) Eigen-decompose Σ: Σv_k = λ_k v_k (λ: variance captured by v_k).
4) Sort eigenvectors by λ descending; select top m; form projection matrix V_m.
5) Transform: Z = X_centered · V_m.

Core math
- Given centered data matrix X (n×d), covariance Σ = (1/(n−1)) XᵀX.
- Eigenpairs (λ₁ ≥ λ₂ ≥ … ≥ λ_d, v₁..v_d).
- Explained variance ratio for PC k: λ_k / Σ_j λ_j. Choose m by desired cumulative ratio (e.g., 95%).

SVD connection
- X = U S Vᵀ; columns of V are PCs; S²/(n−1) are eigenvalues.

Tiny example
- Points near a slanted line in 2D: PC1 aligns with the line (max variance), PC2 orthogonal (small variance).
- Projecting to 1D along PC1 keeps most structure.

Hyperparameters and choices
- Standardize first if features have different units/scales.
- n_components: integer (e.g., 2) or float in (0,1] for variance fraction.
- svd_solver: "auto", "full", "randomized" (fast approx for large d).

Pros, cons, pitfalls
- Pros: Simple, fast, decorrelates features; improves visualization/speed.
- Cons: Linear; components are combinations of original features (less interpretable); sensitive to scaling/outliers.
- Pitfalls: Forgetting to center/scale; interpreting PCs as single features; using PCA on categorical encodings without care.

How this notebook implements it
- Dataset: Wine.csv.
- Steps: scale → fit PCA → inspect explained variance → transform → train classifier in reduced space → visualize.
- Tip: wrap StandardScaler+PCA+Classifier in Pipeline to avoid leakage.

Quick checklist
- Scale/center.
- Pick components via explained variance.
- Transform and evaluate downstream model.
"""

LDA_MD = """# Theory — Linear Discriminant Analysis (LDA) for Dimensionality Reduction

What it solves
- Supervised projection that maximizes class separability.
- Useful for visualization and as a preprocessing step for classifiers when classes are roughly Gaussian with shared covariance.

Plain intuition
- Find directions where class means are far apart but within-class spread is small.

Core math (Fisher criterion)
- For C classes with means μ_c and global mean μ:
  • Within-class scatter: S_W = Σ_c Σ_{x∈c} (x − μ_c)(x − μ_c)ᵀ
  • Between-class scatter: S_B = Σ_c n_c (μ_c − μ)(μ_c − μ)ᵀ
- Find projection W (d×m) that maximizes J(W) = |Wᵀ S_B W| / |Wᵀ S_W W|.
- Leads to generalized eigenproblem: S_B w = λ S_W w. Take top m eigenvectors (m ≤ C−1).

Tiny example
- Two Gaussian clusters: LDA finds the line connecting their means, scaled by inverse within-class variance.

Assumptions and notes
- Classes roughly Gaussian with identical covariance matrices; else boundaries may not be linear.
- Must be supervised; output dimension ≤ C−1.

Hyperparameters/practice
- n_components ≤ (C−1). Scale inputs first for numeric stability.
- Solver choices in sklearn: "svd" (no S_W inversion), "lsqr", "eigen" (use shrinkage for stability).

Pros, cons, pitfalls
- Pros: Uses label info; often better than PCA for classification.
- Cons: Requires class labels; sensitive to covariance estimates (ill-conditioned with small n).
- Pitfalls: Class imbalance; singular S_W (use regularization/shrinkage).

How this notebook implements it
- Dataset: Wine.csv.
- Steps: scale → split → LDA (fit on train labels) → transform → classifier → visualize.
- Tip: ensure transformation is fit on train only (Pipeline).

Quick checklist
- Scale; choose ≤ C−1 components.
- Fit LDA on train; transform train/test consistently.
- Evaluate classifier in reduced space.
"""

KPCA_MD = """# Theory — Kernel PCA (Nonlinear Dimensionality Reduction)

What it solves
- Captures nonlinear manifolds by implicitly mapping data to a high‑D feature space and doing PCA there (kernel trick).

Plain intuition
- Replace dot products with kernel evaluations K(x_i, x_j) so PCA happens in feature space without computing φ(x) explicitly.

Core steps
1) Compute Gram matrix K_ij = k(x_i, x_j) (e.g., RBF: exp(−γ||x_i−x_j||²)).
2) Center K in feature space: K̃ = K − 1K − K1 + 1K1 (with 1 = (1/n)eeᵀ).
3) Solve eigenproblem on K̃: K̃ α = λ α; components are α vectors.
4) Project new x: compute k(x, X_train), center similarly, then project via α.

Kernels
- RBF (γ), Polynomial (degree, coef0), Sigmoid. RBF is a strong default; γ sets locality (too large → overfit; too small → underfit).

Tiny example
- Two concentric circles in 2D: linear PCA fails; Kernel PCA with RBF can separate along the “unrolled” manifold.

Pros, cons, pitfalls
- Pros: Nonlinear structure capture; powerful with a good kernel.
- Cons: O(n²) memory/time for Gram matrix; sensitive to kernel params; preimage not straightforward.
- Pitfalls: Not scaling inputs before RBF; picking γ blindly; extrapolation to far-away points is tricky.

How this notebook implements it
- Dataset: Wine.csv / Social_Network_Ads.csv depending on variant.
- Steps: scale → KernelPCA(n_components, kernel="rbf", gamma) → transform → classifier → visualize.
- Tip: tune γ with CV; combine with a simple classifier.

Quick checklist
- Scale features.
- Choose kernel and parameters (γ for RBF).
- Fit on train; transform consistently; validate downstream model.
"""

TARGETS: List[Tuple[str, str]] = [
    (
        "DataScience/4. Machine Learning A-Z/Part 9 - Dimensionality Reduction/Section 43 - Principal Component Analysis (PCA)/Python/principal_component_analysis.ipynb",
        PCA_MD,
    ),
    (
        "DataScience/4. Machine Learning A-Z/Part 9 - Dimensionality Reduction/Section 44 - Linear Discriminant Analysis (LDA)/Python/linear_discriminant_analysis.ipynb",
        LDA_MD,
    ),
    (
        "DataScience/4. Machine Learning A-Z/Part 9 - Dimensionality Reduction/Section 45 - Kernel PCA/Python/kernel_pca.ipynb",
        KPCA_MD,
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
