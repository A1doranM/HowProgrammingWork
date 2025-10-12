#!/usr/bin/env python3
"""
Batch-prepend tailored Theory markdown to Part 3 (Classification) notebooks.

Edits the following notebooks in-place:
- Part 3 - Classification
  * Section 14 - Logistic Regression/Python/logistic_regression.ipynb
  * Section 15 - K-Nearest Neighbors (K-NN)/Python/k_nearest_neighbors.ipynb
  * Section 16 - Support Vector Machine (SVM)/Python/support_vector_machine.ipynb
  * Section 17 - Kernel SVM/Python/kernel_svm.ipynb
  * Section 18 - Naive Bayes/Python/naive_bayes.ipynb
  * Section 19 - Decision Tree Classification/Python/decision_tree_classification.ipynb
  * Section 20 - Random Forest Classification/Python/random_forest_classification.ipynb

Behavior:
- Loads notebook JSON
- If the first cell already starts with a Theory marker ("# Theory —" or variants), skips
- Otherwise prepends a Markdown cell with tailored content
- Preserves kernelspec, language_info, outputs, execution counts

Run:
  python tools/batch_prepend_theory_part3.py
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

def prepend(nb_path: Path, content: str) -> Tuple[bool, str]:
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

LOGREG_MD = """# Theory — Logistic Regression (Binary Classification)

What it solves
- Predicts the probability that an example belongs to class 1 (yes/no, churn/no-churn, click/no-click).
- Turns linear combinations of features into probabilities 0–1.

Plain intuition
- Draw a straight line (or hyperplane) that separates classes in feature space.
- Pass the distance to the line through an S-shaped function to get a probability.

Core math
- Model: p(y=1|x) = σ(z), with z = w^T x + b and σ(z) = 1 / (1 + e^{-z})
- Loss (to minimize): average negative log-likelihood (log-loss) + regularization:
  L(w,b) = -(1/n) Σ [ y log p + (1-y) log (1-p) ] + λ/2 ||w||²
  where λ controls L2 regularization strength (in sklearn, C = 1/λ).
- Decision: predict 1 if p >= threshold (default 0.5), else 0.

Assumptions and cautions
- Linear decision boundary in the original feature space.
- Outliers can impact w; regularization helps.
- Multicollinearity makes coefficients unstable; consider standardization and feature selection.

Hyperparameters (sklearn)
- C (inverse regularization strength): smaller C = stronger regularization.
- penalty: "l2" (common), "l1" (sparse), "elasticnet".
- solver: "liblinear", "lbfgs", "saga" (choose per penalty/data size).
- class_weight: "balanced" helps with class imbalance.
- max_iter: ensure convergence.

Tiny example (paper-and-pencil)
- Single feature x with w = 2, b = -4 → z = 2x - 4.
- σ(z) rises from ~0 (x<<2) to ~1 (x>>2). Threshold near x ≈ 2.

Pros, cons, pitfalls
- Pros: Probabilistic outputs, simple, fast, well-understood.
- Cons: Linear boundary; underfits complex patterns; sensitive to unscaled features.
- Pitfalls: Using 0.5 threshold blindly; ignore class imbalance or calibration.

How this notebook implements it
- Dataset: Social_Network_Ads.csv (2D visualization).
- Steps: split → scale (StandardScaler) → fit → predict → confusion matrix → 2D decision region plot.
- Tips: inspect ROC-AUC/PR, tune C, adjust threshold for business costs.

Quick checklist
- Scale features; set C and penalty.
- Evaluate with ROC/PR; adjust threshold if needed.
- Check coefficients and decision boundary for sense-making.
"""

KNN_MD = """# Theory — K-Nearest Neighbors (K-NN)

What it solves
- Classifies a point by the majority class among its K closest neighbors.
- Non-parametric, works well when classes form local neighborhoods.

Plain intuition
- "Show me the K most similar past cases; vote on the label."

Core ideas and math
- Distance metric d(x, x'): Euclidean (default), Manhattan, Minkowski, cosine, etc.
- Prediction:
  • Choose K neighbors with smallest distances.
  • Majority vote (weights can be uniform or distance-weighted).
- Decision boundary: highly flexible, can be wiggly for small K.

Hyperparameters
- n_neighbors (K): small → low bias, high variance; large → smoother boundary.
- weights: "uniform" vs "distance".
- metric/p (Minkowski): p=2 Euclidean, p=1 Manhattan.
- leaf_size, algorithm (auto/kd_tree/ball_tree) affect speed.

Scaling
- Mandatory: scale features so distances are comparable.

Tiny example
- In 2D, K=5; new point looks at 5 closest; if 3 are red, 2 are blue → classify as red.

Pros, cons, pitfalls
- Pros: Very simple; no training time; adapts to complex shapes.
- Cons: Prediction can be slow (needs neighbors); memory-heavy; sensitive to irrelevant features and scale.
- Pitfalls: K too small (overfit), not scaling, using heterogeneous units.

How this notebook implements it
- Dataset: Social_Network_Ads.csv.
- Steps: split → scale → fit KNN → confusion matrix → plot decision regions.
- Tips: tune K via cross-validation; try distance weights.

Quick checklist
- Scale features.
- Choose K by CV (odd K helps avoid ties).
- Consider distance-weighted voting.
"""

SVM_LINEAR_MD = """# Theory — Support Vector Machine (Linear SVM)

What it solves
- Finds the maximum-margin separating hyperplane between two classes.
- Robust classifier that focuses on difficult "support vectors".

Core math (hinge loss)
- Decision function: f(x) = w^T x + b; prediction sign(f(x)).
- Optimize:
  minimize (1/2)||w||² + C Σ ξ_i
  s.t. y_i (w^T x_i + b) ≥ 1 - ξ_i,  ξ_i ≥ 0
- Equivalent to minimizing hinge loss: max(0, 1 - y f(x)) with L2 regularization.
- C trades margin size vs. misclassification penalties.

Why it works
- Maximizing margin improves generalization; only points near the boundary (support vectors) matter.

Hyperparameters
- C: larger emphasizes correct classification (smaller margin), smaller emphasizes wider margin.
- class_weight: handle imbalance.
- tol, max_iter: convergence controls.

Scaling
- Essential: SVM is sensitive to feature scales.

Pros, cons, pitfalls
- Pros: Strong margins; robust to outliers in features.
- Cons: Linear boundary only; requires scaling; C needs tuning.
- Pitfalls: Too large C overfits; not scaling.

How this notebook implements it
- Dataset: Social_Network_Ads.csv.
- Steps: split → scale → fit Linear SVM → evaluate → visualize decision regions.
- Tips: tune C; compare vs Logistic Regression baseline.
"""

KERNEL_SVM_MD = """# Theory — Kernel SVM (RBF)

What it solves
- Nonlinear classification by implicitly mapping features into a higher-dimensional space.
- Captures curved boundaries (e.g., rings, spirals) using the kernel trick.

Kernel trick
- Replace dot-products with a kernel K(x, x').
- RBF kernel: K(x, x') = exp(-γ ||x - x'||²)
  • γ controls how far influence of a point reaches (small γ = smoother boundary; large γ = wiggly).

Hyperparameters
- C: margin vs errors trade-off.
- gamma (γ): complexity of boundary.
- class_weight, tol, max_iter as usual.

Scaling
- Mandatory; distances feed the kernel.

Pros, cons, pitfalls
- Pros: Powerful nonlinear boundaries; often strong performance out-of-the-box.
- Cons: γ and C interplay; can overfit; less interpretable; prediction cost scales with support vectors.
- Pitfalls: Too large γ overfits; too small γ underfits; not scaling.

How this notebook implements it
- Dataset: Social_Network_Ads.csv.
- Steps: split → scale → SVC(kernel="rbf", C, gamma) → evaluate → visualize 2D boundary.
- Tips: grid search C, γ; use stratified CV and ROC-AUC.
"""

NAIVE_BAYES_MD = """# Theory — Naive Bayes (Gaussian NB)

What it solves
- Fast probabilistic classifier using Bayes' rule with a strong independence assumption.
- Works well on high-dimensional sparse text (Multinomial NB) and simple continuous data (Gaussian NB).

Bayes with naive assumption
- Predict class c that maximizes P(c | x) ∝ P(c) Π_j P(x_j | c)
- Gaussian NB models each feature j as Normal(μ_{c,j}, σ²_{c,j}) within class c.
- Compute in log-space for stability:
  log P(c | x) = log P(c) + Σ_j log N(x_j; μ_{c,j}, σ²_{c,j}) + const

Assumptions and variants
- Features are conditionally independent given class (often false, but works surprisingly well).
- Variants: GaussianNB (continuous), MultinomialNB/BernoulliNB (counts/binary features).

Hyperparameters (sklearn)
- var_smoothing adds ε to variance estimates for stability.

Pros, cons, pitfalls
- Pros: Extremely fast; few parameters; good baseline.
- Cons: Independence assumption; continuous features may not be Gaussian.
- Pitfalls: Unscaled features ok for GaussianNB but heavy tails can mislead; consider transformations.

How this notebook implements it
- Dataset: Social_Network_Ads.csv.
- Steps: split → scale (optional for GaussianNB) → fit → confusion matrix → plot decision regions.
- Tips: try without scaling, compare; inspect per-class Gaussian params.
"""

DT_CLF_MD = """# Theory — Decision Tree Classification (CART)

What it solves
- Recursive partitioning of the feature space into axis-aligned regions.
- Interpretable rules ("if-then") and non-linear decision boundaries.

Core concepts
- Split a node using feature/threshold that maximizes impurity reduction.
- Impurity measures:
  • Gini: 1 - Σ p_k²
  • Entropy: -Σ p_k log p_k
- Stop criteria: max_depth, min_samples_split, min_samples_leaf, etc.
- Prediction: class of the majority in a leaf.

Hyperparameters
- max_depth, min_samples_split/leaf: regularize and avoid overfitting.
- criterion: "gini" (default) or "entropy".
- class_weight: handle imbalance.

Pros, cons, pitfalls
- Pros: Interpretable; handles mixed data; little preprocessing.
- Cons: High variance (overfits); axis-aligned splits only.
- Pitfalls: Deep trees; small leaves; not scaling features isn’t required.

How this notebook implements it
- Dataset: Social_Network_Ads.csv.
- Steps: split → (scaling optional) → DecisionTreeClassifier → evaluate → visualize contour + tree intuition.
- Tips: control depth; check feature importance; validate with CV.
"""

RF_CLF_MD = """# Theory — Random Forest Classification

What it solves
- Ensemble of decision trees trained on bootstrapped samples with feature subsampling.
- Reduces variance of single trees; strong default baseline.

Core ideas
- Bagging: train each tree on a bootstrap sample (~63% of unique samples).
- Feature randomness: at each split, consider a random subset of features.
- Prediction: majority vote across trees.

Hyperparameters
- n_estimators: number of trees (100–500+ common).
- max_depth, min_samples_split/leaf: control tree complexity.
- max_features: features considered per split (sqrt for classification is default).
- class_weight, bootstrap, oob_score (out-of-bag estimate).

Pros, cons, pitfalls
- Pros: Strong accuracy; robust; handles non-linearities and interactions; less tuning.
- Cons: Less interpretable than a single tree; larger models; biased importance if features have different scales or cardinalities.
- Pitfalls: Too shallow/too few trees underfit; too many trees increase latency.

How this notebook implements it
- Dataset: Social_Network_Ads.csv.
- Steps: split → (scaling optional) → RandomForestClassifier → evaluate → visualize regions.
- Tips: tune n_estimators, max_depth, max_features; use oob_score for quick validation.
"""

TARGETS: List[Tuple[str, str]] = [
    (
        "DataScience/4. Machine Learning A-Z/Part 3 - Classification/Section 14 - Logistic Regression/Python/logistic_regression.ipynb",
        LOGREG_MD,
    ),
    (
        "DataScience/4. Machine Learning A-Z/Part 3 - Classification/Section 15 - K-Nearest Neighbors (K-NN)/Python/k_nearest_neighbors.ipynb",
        KNN_MD,
    ),
    (
        "DataScience/4. Machine Learning A-Z/Part 3 - Classification/Section 16 - Support Vector Machine (SVM)/Python/support_vector_machine.ipynb",
        SVM_LINEAR_MD,
    ),
    (
        "DataScience/4. Machine Learning A-Z/Part 3 - Classification/Section 17 - Kernel SVM/Python/kernel_svm.ipynb",
        KERNEL_SVM_MD,
    ),
    (
        "DataScience/4. Machine Learning A-Z/Part 3 - Classification/Section 18 - Naive Bayes/Python/naive_bayes.ipynb",
        NAIVE_BAYES_MD,
    ),
    (
        "DataScience/4. Machine Learning A-Z/Part 3 - Classification/Section 19 - Decision Tree Classification/Python/decision_tree_classification.ipynb",
        DT_CLF_MD,
    ),
    (
        "DataScience/4. Machine Learning A-Z/Part 3 - Classification/Section 20 - Random Forest Classification/Python/random_forest_classification.ipynb",
        RF_CLF_MD,
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
