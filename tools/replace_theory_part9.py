#!/usr/bin/env python3
"""
Replace the top 'Theory' cells in Part 9 (Dimensionality Reduction) with much more detailed explanations,
matching the depth and style of the user's UCB write-up. If a Theory cell isn't present,
the content will be prepended.

Targets:
- DataScience/4. Machine Learning A-Z/Part 9 - Dimensionality Reduction/Section 43 - Principal Component Analysis (PCA)/Python/principal_component_analysis.ipynb
- DataScience/4. Machine Learning A-Z/Part 9 - Dimensionality Reduction/Section 44 - Linear Discriminant Analysis (LDA)/Python/linear_discriminant_analysis.ipynb
- DataScience/4. Machine Learning A-Z/Part 9 - Dimensionality Reduction/Section 45 - Kernel PCA/Python/kernel_pca.ipynb
"""
from __future__ import annotations

import sys
from pathlib import Path

# Ensure project root is on sys.path so 'tools' package imports succeed
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from tools.nb_theory import load_notebook, save_notebook, replace_or_prepend_theory  # noqa: E402

PCA_MD = """# What is PCA (Principal Component Analysis)?

An **unsupervised** method to compress data by projecting it into a **lower‑dimensional space** that preserves as much **variance** as possible.

Rule of thumb: “Find the directions where the cloud of points spreads the most, then drop the rest.”

Think product analytics: dozens of correlated features (price, rating, views). PCA finds a small number of combined ‘axes’ (PC1, PC2, …) that summarize most variation.

---

# Variables and notation

- Data matrix: \\(X \\in \\mathbb{R}^{N \\times d}\\) (rows = samples, columns = features)
- Centered data: \\(\\tilde{X} = X - \\mathbf{1}\\mu^\\top\\), \\(\\mu \\in \\mathbb{R}^{d}\\) is the column mean
- Covariance: \\(\\Sigma = \\frac{1}{N-1}\\tilde{X}^\\top \\tilde{X} \\in \\mathbb{R}^{d \\times d}\\)
- Eigenpairs: \\(\\Sigma v_k = \\lambda_k v_k\\), with \\(\\lambda_1 \\ge \\lambda_2 \\ge \\dots \\ge \\lambda_d \\ge 0\\)
- Principal components (PCs): eigenvectors \\(v_k\\)
- Explained variance ratio (EVR): \\(\\text{EVR}_k = \\lambda_k / \\sum_{j=1}^d \\lambda_j\\)

Projection onto first \\(m\\) PCs (\\(m \\le d\\)):
\\[
Z = \\tilde{X} V_m, \\quad V_m = [v_1, v_2, \\ldots, v_m] \\in \\mathbb{R}^{d \\times m}
\\]

---

# Step‑by‑step (paper‑and‑pencil)

1) Standardize/center features (important if scales differ).  
2) Form covariance \\(\\Sigma\\) or use SVD: \\(\\tilde{X} = U S V^\\top\\) (then \\(V\\) holds PCs, \\(S^2/(N-1)\\) eigenvalues).  
3) Sort eigenpairs by \\(\\lambda\\) descending; pick \\(m\\) via cumulative EVR (e.g., \\(\\ge 95\\%\\)).  
4) Project: \\(Z = \\tilde{X} V_m\\).  
5) Use \\(Z\\) for visualization or as input to a downstream model.

Tiny 2D example:
- Points roughly along a slanted line → PC1 aligns with that line (large \\(\\lambda_1\\)), PC2 orthogonal (small \\(\\lambda_2\\)).  
- Projecting onto PC1 (\\(m=1\\)) keeps most information with a single coordinate.

---

# Intuition: why PCA works

Variance as “signal”: directions with large variance often carry more information (under Gaussian/noise assumptions). PCA rotates the coordinate system to maximize variance along the first axis, then the next, with orthogonality constraints → minimal reconstruction error in a least‑squares sense.

---

# Pseudocode

```
X = data  # shape (N, d)
Xc = center(X)                           # subtract column means
Sigma = (Xc.T @ Xc) / (N-1)              # covariance
lambda, V = eig(Sigma)                   # eigenvalues, eigenvectors
order = argsort(lambda)[::-1]            # descending
V = V[:, order]; lambda = lambda[order]
choose m based on cumulative sum(lambda) / sum(lambda)
Z = Xc @ V[:, :m]                        # projected data
```

---

# Minimal Python (sklearn)

```python
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.pipeline import Pipeline

pipe = Pipeline([
    ("scaler", StandardScaler()),
    ("pca", PCA(n_components=0.95, svd_solver="auto")),   # keep 95% variance
])
Z = pipe.fit_transform(X)
evr = pipe.named_steps["pca"].explained_variance_ratio_
```

---

# Practical tips, pitfalls, and variants

- Always center; scale when features are in different units.
- EVR threshold (0.90–0.99) controls compression vs information.
- PCs are **linear combinations** of original features (interpret with caution).
- Outliers can dominate variance — consider robust scaling or outlier handling.
- Whitening (optional): scales PCs to unit variance; can amplify noise.

---

# How this notebook implements it

- Dataset: Wine.csv (multiclass).  
- Steps: scale → fit PCA → inspect EVR → project → train classifier → visualize in PC space.  
- Tip: use Pipeline so PCA is fit on training only (avoid leakage).

---

# Quick cheat sheet

- Scale/center → Covariance/SVD → Sort eigenpairs → Choose EVR → Project
- Use projected features for visualization or faster modeling
"""

LDA_MD = """# What is LDA (Linear Discriminant Analysis) for projection?

A **supervised** dimensionality reduction method: project data into a lower‑dimensional space that **maximizes class separability**.

Rule of thumb: “Push class means far apart while keeping each class compact.”

---

# Variables and notation

- Classes: \\(\\mathcal{C} = \\{1, \\dots, C\\}\\), with \\(n_c\\) points in class \\(c\\)
- Means: per class \\(\\mu_c\\), global \\(\\mu\\)
- Within‑class scatter:  
\\[
S_W = \\sum_{c=1}^C \\sum_{x \\in c} (x - \\mu_c)(x - \\mu_c)^\\top
\\]
- Between‑class scatter:  
\\[
S_B = \\sum_{c=1}^C n_c (\\mu_c - \\mu)(\\mu_c - \\mu)^\\top
\\]
- Objective (Fisher criterion): find \\(W \\in \\mathbb{R}^{d \\times m}\\) maximizing  
\\[
J(W) = \\frac{|W^\\top S_B W|}{|W^\\top S_W W|}, \\quad m \\le C-1
\\]
- Leads to generalized eigenproblem: \\(S_B w = \\lambda S_W w\\) (take top \\(m\\) eigenvectors).

Projection: \\(Z = X W\\).

---

# Step‑by‑step (paper‑and‑pencil)

1) Compute \\(\\mu_c\\) and \\(\\mu\\).  
2) Build \\(S_W\\) and \\(S_B\\).  
3) Solve \\(S_B w = \\lambda S_W w\\).  
4) Sort solutions by \\(\\lambda\\) descending; choose \\(m \\le C-1\\).  
5) Project points using \\(W\\).

Tiny example (2 classes, 2D):  
- Class means separated along some direction; LDA finds that line, scaled by inverse within‑class variance.  
- Projecting onto that line yields maximum class separation in 1D.

---

# Intuition: why LDA works

Unlike PCA (variance only), LDA uses **labels** to prefer directions where **between‑class** variance is large and **within‑class** variance is small. This improves downstream classification when assumptions hold.

---

# Pseudocode

```
compute class means mu_c and global mean mu
S_W = sum_c sum_{x in c} (x-mu_c)(x-mu_c).T
S_B = sum_c n_c (mu_c-mu)(mu_c-mu).T
solve S_B w = lambda S_W w
W = eigenvectors sorted by lambda (take first m <= C-1)
Z = X @ W
```

---

# Minimal Python (sklearn)

```python
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis as LDA
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

pipe = Pipeline([
    ("scaler", StandardScaler()),
    ("lda", LDA(n_components=2, solver="svd")),  # m <= C-1
])
Z = pipe.fit_transform(X, y)
```

---

# Practical tips, pitfalls, and variants

- \\(m \\le C-1\\) — cannot project to more dims than classes minus one.
- Assumes classes have roughly Gaussian distributions with **shared covariance**.
- If \\(S_W\\) is singular (few samples, many features), use shrinkage or regularization.
- Sensitive to class imbalance — consider class priors/weights.
- LDA can be used as a classifier directly; here we focus on its projection.

---

# How this notebook implements it

- Dataset: Wine.csv (3 classes).  
- Steps: scale → fit LDA on train (with labels) → project train/test → train classifier → visualize.  
- Tip: keep preprocessing + LDA + classifier in one Pipeline.

---

# Quick cheat sheet

- Supervised projection maximizing separation
- Solve \\(S_B w = \\lambda S_W w\\), take top \\(m \\le C-1\\)
- Use projected features for simple classifiers
"""

KPCA_MD = """# What is Kernel PCA?

A **nonlinear** dimensionality reduction method: map data into a high‑dimensional feature space via a **kernel**, then perform PCA **there**.

Rule of thumb: “Use a kernel (e.g., RBF) to ‘unroll’ curved manifolds so linear PCA can separate them.”

---

# Variables and notation

- Kernel function: \\(k(x, x')\\) (e.g., RBF: \\(\\exp(-\\gamma \\lVert x-x' \\rVert^2)\\))
- Gram matrix: \\(K \\in \\mathbb{R}^{N \\times N}\\) with \\(K_{ij} = k(x_i, x_j)\\)
- Centered Gram:  
\\[
\\tilde{K} = K - \\mathbf{1}K - K\\mathbf{1} + \\mathbf{1}K\\mathbf{1}, \\quad \\mathbf{1} = \\frac{1}{N}\\mathbf{e}\\mathbf{e}^\\top
\\]
- Eigenproblem: \\(\\tilde{K} \\alpha = \\lambda \\alpha\\), with \\(\\alpha\\) normalized appropriately
- Projection of a new point \\(x\\):  
\\[
z_k(x) = \\sum_{i=1}^N \\alpha_{ik} \\big( k(x, x_i) - \\text{centering terms} \\big)
\\]

---

# Step‑by‑step (paper‑and‑pencil)

1) Compute kernel matrix \\(K\\) on training data.  
2) Center \\(K\\) → \\(\\tilde{K}\\).  
3) Solve eigenproblem on \\(\\tilde{K}\\); sort eigenpairs by eigenvalue.  
4) Keep first \\(m\\) components; store \\(\\alpha\\) and training points.  
5) To project a new \\(x\\): compute its kernel with all training points, center consistently, then apply \\(\\alpha\\).

Tiny example: two concentric circles in 2D  
- Linear PCA fails (variance not aligned with circular separation).  
- Kernel PCA with RBF can separate by mapping points according to radial similarity → linear separation in feature space.

---

# Intuition: why Kernel PCA works

The **kernel trick** computes dot products in a high‑dimensional (possibly infinite) feature space without explicit mapping. PCA in that space captures nonlinear structure present in the original data.

---

# Pseudocode

```
# fit
K = kernel_matrix(X, X)                  # NxN
Kc = center_gram(K)
lambda, alpha = eig(Kc)                  # sort descending
select m; store alpha[:, :m], X

# transform new x
k_x = kernel_vector(x, X)                # length N
k_xc = center_against_training(k_x, K)   # use training stats
z = alpha[:, :m].T @ k_xc
```

---

# Minimal Python (sklearn)

```python
from sklearn.decomposition import KernelPCA
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

pipe = Pipeline([
    ("scaler", StandardScaler()),
    ("kpca", KernelPCA(n_components=2, kernel="rbf", gamma=0.1, fit_inverse_transform=False)),
])
Z = pipe.fit_transform(X)
```

---

# Practical tips, pitfalls, and variants

- **Scale features** first, especially for RBF.  
- \\(\\gamma\\) controls locality: too large → overfit; too small → underfit.  
- Memory/time: Gram matrix is \\(\\mathcal{O}(N^2)\\) — beware for large N.  
- Preimage problem: mapping back to original space is approximate or unavailable.  
- For very large datasets, consider approximate kernels or other nonlinear DR (UMAP, t‑SNE for visualization only).

---

# How this notebook implements it

- Dataset: Wine.csv / Social_Network_Ads.csv (depending on variant).  
- Steps: scale → KernelPCA(RBF, \\(\\gamma\\)) → project → train classifier → visualize.  
- Tip: tune \\(\\gamma\\) via cross‑validation and visualize decision boundaries.

---

# Quick cheat sheet

- Nonlinear DR via kernels (RBF default)
- Build Gram, center, eigendecompose
- Tune \\(\\gamma\\), mind \\(\\mathcal{O}(N^2)\\) memory
"""

def main() -> int:
    pca_path = ROOT / "DataScience/4. Machine Learning A-Z/Part 9 - Dimensionality Reduction/Section 43 - Principal Component Analysis (PCA)/Python/principal_component_analysis.ipynb"
    lda_path = ROOT / "DataScience/4. Machine Learning A-Z/Part 9 - Dimensionality Reduction/Section 44 - Linear Discriminant Analysis (LDA)/Python/linear_discriminant_analysis.ipynb"
    kpca_path = ROOT / "DataScience/4. Machine Learning A-Z/Part 9 - Dimensionality Reduction/Section 45 - Kernel PCA/Python/kernel_pca.ipynb"

    # PCA
    nb = load_notebook(pca_path)
    replace_or_prepend_theory(nb, PCA_MD)
    save_notebook(pca_path, nb)
    print(f"Replaced Theory cell in: {pca_path}")

    # LDA
    nb2 = load_notebook(lda_path)
    replace_or_prepend_theory(nb2, LDA_MD)
    save_notebook(lda_path, nb2)
    print(f"Replaced Theory cell in: {lda_path}")

    # Kernel PCA
    nb3 = load_notebook(kpca_path)
    replace_or_prepend_theory(nb3, KPCA_MD)
    save_notebook(kpca_path, nb3)
    print(f"Replaced Theory cell in: {kpca_path}")

    return 0

if __name__ == "__main__":
    raise SystemExit(main())
