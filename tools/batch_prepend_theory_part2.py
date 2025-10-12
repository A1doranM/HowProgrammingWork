#!/usr/bin/env python3
"""
Batch-prepend tailored Theory markdown to Part 2 (Regression) notebooks.

Edits the following notebooks in-place:
- Part 2 - Regression
  * Section 4 - Simple Linear Regression/Python/simple_linear_regression.ipynb
  * Section 5 - Multiple Linear Regression/Python/multiple_linear_regression.ipynb
  * Section 6 - Polynomial Regression/Python/polynomial_regression.ipynb
  * Section 7 - Support Vector Regression (SVR)/Python/support_vector_regression.ipynb
  * Section 8 - Decision Tree Regression/Python/decision_tree_regression.ipynb
  * Section 9 - Random Forest Regression/Python/random_forest_regression.ipynb

Behavior:
- Loads notebook JSON
- If the first cell already starts with a Theory marker ("# Theory —" or variants), skips
- Otherwise prepends a Markdown cell with tailored content
- Preserves kernelspec, language_info, outputs, execution counts

Run:
  python tools/batch_prepend_theory_part2.py
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

SLR_MD = """# Theory — Simple Linear Regression

What it solves
- Predict a numeric target y from a single feature x using a straight line.
- Examples: predict salary from years of experience; predict price from size.

Plain intuition
- Fit a line y ≈ b0 + b1 x through the cloud of points so that squared vertical distances are as small as possible.

Core math (Ordinary Least Squares)
- Model: y_i = b0 + b1 x_i + ε_i
- Objective: minimize MSE = (1/n) Σ (y_i − (b0 + b1 x_i))²
- Closed-form solution:
  b1 = cov(x,y) / var(x)
  b0 = ȳ − b1 x̄
- Predictions: ŷ = b0 + b1 x; Residuals: r_i = y_i − ŷ_i

Assumptions (diagnostics)
- Linearity, independent errors, constant variance (homoscedasticity), errors roughly normal (for inference).
- Outliers can pull the line; consider robust methods or inspect residuals.

Evaluation
- MSE, RMSE, MAE; R² = 1 − SS_res/SS_tot; visualize residuals vs fitted.

Tiny example (paper-and-pencil)
- x: [1,2,3], y: [2,2,4]
  x̄=2, ȳ=8/3
  cov(x,y) = [(1−2)(2−8/3) + (2−2)(2−8/3) + (3−2)(4−8/3)]/3 = (2/3)/3? (compute with sample or population definition)
  Using sample formulas gives b1 ≈ 1.0, b0 ≈ 1.0 → line y = 1 + 1·x

Pros, cons, pitfalls
- Pros: Interpretable, fast, closed-form.
- Cons: Only linear trend; sensitive to outliers.
- Pitfalls: Extrapolation risks; not checking residual plots.

How this notebook implements it
- Dataset: Salary_Data.csv
- Steps: split → fit LinearRegression → predict → evaluate/visualize scatter + fitted line.

Quick checklist
- Plot x vs y first.
- Fit, compute metrics, inspect residual plot.
- Beware of extrapolation outside x range.
"""

MLR_MD = """# Theory — Multiple Linear Regression

What it solves
- Predict a numeric target from multiple features: y ≈ β0 + β1 x1 + … + βp xp.

Matrix form and OLS
- y = Xβ + ε, with X (n×(p+1)) incl. intercept column of 1s.
- Minimize ||y − Xβ||². Normal equation (when invertible):
  β̂ = (Xᵀ X)^{-1} Xᵀ y
- In practice use numerical solvers (QR/SVD) for stability.

Assumptions and issues
- Linearity, independence, homoscedasticity, normal errors (for inference).
- Multicollinearity inflates variance of β̂ (unstable coefficients).
  • Detect via VIF; fix with feature selection, regularization, or PCA.

Feature scaling and preprocessing
- Scale features if using regularization or comparing coefficients.
- One-hot encode categoricals; avoid dummy variable trap (drop one level).

Evaluation
- Train/test split; RMSE/MAE/R²; cross-validation; learning curves.

Pros, cons, pitfalls
- Pros: Interpretable coefficients; baselines well.
- Cons: Sensitive to collinearity/outliers; linear boundary in features.
- Pitfalls: Leakage (fit scaler/encoder on train only), p-hacking, overfitting with many features.

How this notebook implements it
- Dataset: 50_Startups.csv
- Steps: preprocess (one-hot state) → split → fit → backward elimination or standard LinearRegression → evaluate.

Quick checklist
- Preprocess correctly (one-hot, scale if needed).
- Check multicollinearity (VIF).
- Validate with CV; inspect residuals.
"""

POLY_MD = """# Theory — Polynomial Regression

What it solves
- Capture curved relationships by expanding features with polynomial terms, then using linear regression on the expanded design.

Key idea
- Construct features: for 1D x, create [x, x², x³, …, x^d]. For multi-D, include interactions.
- Still linear in parameters β, but non-linear in original x.

Math
- y ≈ β0 + β1 x + β2 x² + … + βd x^d
- Fit via OLS on the expanded matrix Φ(X).

Choosing degree d
- Too small → underfit; too large → overfit.
- Use validation/regularization (Ridge/Lasso) to control complexity.

Scaling
- Strongly recommended before polynomial expansion (features explode in magnitude).

Tiny example
- Points near a quadratic curve; degree d=2 fits well; d=10 can oscillate wildly between points (Runge phenomenon).

Pros, cons, pitfalls
- Pros: Simple and effective for smooth curves; interpretable basis terms.
- Cons: Feature explosion; extrapolation can blow up.
- Pitfalls: Not scaling; high-degree oscillations; forgetting interactions when needed.

How this notebook implements it
- Dataset: Position_Salaries.csv
- Steps: PolynomialFeatures(degree) → LinearRegression on transformed X → plot curve.

Quick checklist
- Scale then expand; choose degree via CV.
- Consider Ridge/Lasso for stability.
- Visualize fit vs scatter.
"""

SVR_MD = """# Theory — Support Vector Regression (ε-SVR)

What it solves
- Predict a numeric target with a model that ignores small errors (within an ε tube) and penalizes larger deviations.

Core idea (ε-insensitive loss)
- Fit function f(x) so that most points are within ±ε of predictions:
  minimize (1/2)||w||² + C Σ (ξ_i + ξ_i*)
  s.t. y_i − f(x_i) ≤ ε + ξ_i,  f(x_i) − y_i ≤ ε + ξ_i*,  ξ_i, ξ_i* ≥ 0
- Kernel trick enables non-linear f via kernels (RBF common).

Hyperparameters
- C: penalty for violations (larger C fits data more tightly).
- epsilon ε: tube width (larger ε ignores more small errors).
- kernel: "rbf"/"linear"/"poly"; gamma in RBF controls locality.

Scaling
- Mandatory; SVR uses distances.

Pros, cons, pitfalls
- Pros: Robust to outliers within ε; flexible with kernels.
- Cons: Sensitive to C/ε/γ; prediction cost depends on support vectors.
- Pitfalls: Not scaling; picking huge γ (overfit) or too small (underfit).

How this notebook implements it
- Dataset: Position_Salaries.csv
- Steps: scale X and y → SVR(RBF, C, ε, γ) → inverse-transform predictions → plot smooth curve.

Quick checklist
- Scale X and y.
- Tune C, ε, γ via CV.
- Inspect support vectors and residuals.
"""

DT_REG_MD = """# Theory — Decision Tree Regression (CART)

What it solves
- Predict numeric targets by recursively partitioning feature space and using mean values in leaves.

Core concepts
- Split a node at feature/threshold that maximizes variance reduction (MSE decrease).
- Stop with max_depth, min_samples_split/leaf, or no improvement.
- Prediction: average of training targets in the leaf.

Pros, cons, pitfalls
- Pros: Non-linear, interpretable, handles mixed data and interactions.
- Cons: High variance (overfits) without constraints; piecewise constant steps.
- Pitfalls: Too-deep trees; small leaves; unscaled features are fine.

How this notebook implements it
- Dataset: Position_Salaries.csv
- Steps: DecisionTreeRegressor(max_depth, min_samples_leaf) → plot step-like prediction vs scatter.

Quick checklist
- Limit depth/leaf sizes.
- Validate via CV; check residual patterns.
- Consider ensembles (Random Forest, GBM) for smoother fits.
"""

RF_REG_MD = """# Theory — Random Forest Regression

What it solves
- Ensemble of decision trees for regression to reduce variance and improve generalization.

Core ideas
- Bagging: train each tree on a bootstrap sample.
- Feature subsampling at each split (random subset of features).
- Prediction: average predictions of all trees.

Hyperparameters
- n_estimators (100–500+), max_depth, min_samples_split/leaf
- max_features (often "sqrt" or a fraction)
- bootstrap, oob_score for out-of-bag validation.

Pros, cons, pitfalls
- Pros: Strong accuracy, robust, handles non-linearities and interactions.
- Cons: Less interpretable; larger models; potential bias in feature importance.
- Pitfalls: Too few trees; not controlling leaf sizes; leakage in preprocessing.

How this notebook implements it
- Dataset: Position_Salaries.csv
- Steps: RandomForestRegressor(n_estimators) → average predictions → plot smooth curve.

Quick checklist
- Tune n_estimators, depth, max_features.
- Use OOB and CV to validate.
- Inspect residuals and feature importances carefully.
"""

TARGETS: List[Tuple[str, str]] = [
    (
        "DataScience/4. Machine Learning A-Z/Part 2 - Regression/Section 4 - Simple Linear Regression/Python/simple_linear_regression.ipynb",
        SLR_MD,
    ),
    (
        "DataScience/4. Machine Learning A-Z/Part 2 - Regression/Section 5 - Multiple Linear Regression/Python/multiple_linear_regression.ipynb",
        MLR_MD,
    ),
    (
        "DataScience/4. Machine Learning A-Z/Part 2 - Regression/Section 6 - Polynomial Regression/Python/polynomial_regression.ipynb",
        POLY_MD,
    ),
    (
        "DataScience/4. Machine Learning A-Z/Part 2 - Regression/Section 7 - Support Vector Regression (SVR)/Python/support_vector_regression.ipynb",
        SVR_MD,
    ),
    (
        "DataScience/4. Machine Learning A-Z/Part 2 - Regression/Section 8 - Decision Tree Regression/Python/decision_tree_regression.ipynb",
        DT_REG_MD,
    ),
    (
        "DataScience/4. Machine Learning A-Z/Part 2 - Regression/Section 9 - Random Forest Regression/Python/random_forest_regression.ipynb",
        RF_REG_MD,
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
