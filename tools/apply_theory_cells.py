#!/usr/bin/env python3
"""
Apply tailored 'Theory' markdown cells to all Python notebooks in:
- DataScience/4. Machine Learning A-Z/Part 1 .. Part 6

This script prepends a markdown cell that explains the algorithm in the notebook
in accessible language while covering core math, a tiny step-by-step example,
hyperparameters, pros/cons, pitfalls, and how the notebook implements it.

Behavior:
- Skips a notebook if its first cell already begins with a Theory marker.
- Preserves kernelspec, metadata, outputs, and all original cells.
- Writes in-place.

Run from repo root:
  python tools/apply_theory_cells.py
"""
import json
from pathlib import Path

ROOT = Path(".").resolve()

MARKER_PREFIXES = (
    "# Theory —",
    "# Theory -",
    "# Theory:",
    "# Теория —",
)

def load_nb(p: Path) -> dict:
    with p.open("r", encoding="utf-8") as f:
        return json.load(f)

def save_nb(p: Path, nb: dict) -> None:
    tmp = p.with_suffix(".ipynb.tmp")
    with tmp.open("w", encoding="utf-8") as f:
        json.dump(nb, f, ensure_ascii=False, indent=1)
        f.write("\n")
    tmp.replace(p)

def already_has_theory(nb: dict) -> bool:
    cells = nb.get("cells", [])
    if not cells:
        return False
    first = cells[0]
    if first.get("cell_type") != "markdown":
        return False
    src = first.get("source", "")
    if isinstance(src, list):
        src0 = "".join(src).lstrip()
    else:
        src0 = str(src).lstrip()
    return any(src0.startswith(prefix) for prefix in MARKER_PREFIXES)

def md(s: str) -> str:
    # Normalize line endings for Jupyter
    return s.replace("\r\n", "\n").replace("\r", "\n")

def cell_markdown(content: str) -> dict:
    return {"cell_type": "markdown", "metadata": {}, "source": content}

# --- Theory content ---

TP = {}

TP["Part 1 - Data Preprocessing/Section 2 -------------------- Part 1 - Data Preprocessing --------------------/Python/data_preprocessing_template.ipynb"] = md("""# Theory — Data Preprocessing Pipeline

Why this matters
- Models learn patterns from numbers. Real data has missing values, mixed formats (text/categories), different scales, outliers, and time/order effects. Proper preprocessing avoids biased models and information leakage.

What we do (standard supervised setup)
1) Split data into train/test before any learning (to measure generalization).
2) Handle missing values (impute): numerical (mean/median), categorical (most frequent or special category).
3) Encode categories into numbers (One-Hot for nominal; Ordinal for ordered categories).
4) Scale features so distances/gradients are well-behaved (StandardScaler or MinMaxScaler). Fit scaler on train only.
5) Optional feature engineering/selection, remove leakage columns (e.g., target-derived).
6) Train model on processed train; evaluate on processed test.

Core concepts and math
- One-Hot Encoding: expand a categorical feature with k categories into k binary features (or k-1 to avoid perfect collinearity).
- Standardization: z = (x - μ)/σ estimated from training data only.
- MinMax scaling: z = (x - min)/(max - min).
- Data leakage: any use of test statistics (like μ, σ, imputation values) in training transformations biases metrics.

Tiny paper-and-pencil example
- Age: [20, None, 40, 60] → impute mean (20 + 40 + 60)/3 = 40 ⇒ [20, 40, 40, 60]
- City: [A, B, A, C] → One-Hot: City_A, City_B, City_C
- Scale Age with μ=40, σ≈16.33 ⇒ z-scores.

Pros / Pitfalls
+ Models converge faster and compare fairly across features.
+ Categorical information is preserved via encoding.
- Leakage is easy to introduce; always fit transformers on train only.
- High-cardinality categories → very wide sparse matrices; consider hashing/target encoding carefully.

How this notebook implements it
- Reads Data.csv
- Uses scikit-learn: train_test_split, SimpleImputer, OneHotEncoder, StandardScaler
- Applies fit on train; transform on test

Quick checklist
- Split first • Impute • Encode • Scale • No leakage • Keep pipeline repeatable
""")

TP["Part 1 - Data Preprocessing/Section 2 -------------------- Part 1 - Data Preprocessing --------------------/Python/data_preprocessing_tools.ipynb"] = md("""# Theory — Common Preprocessing Tools

What this shows
- A tour of scikit-learn utilities: handling missing values, encoding categories, scaling, splitting data, building reusable pipelines.

Key tools
- SimpleImputer: strategy = mean/median/most_frequent/constant
- OneHotEncoder: handle_unknown, drop (to avoid collinearity)
- StandardScaler vs MinMaxScaler: standardize vs bounding to [0,1]
- ColumnTransformer: apply different transforms to numeric vs categorical columns
- Pipeline: chain steps and avoid leakage (fit on train only)

Math snippets
- Standardization: z = (x - μ)/σ
- One-Hot: category j becomes vector e_j
- Train/test split: holdout set approximates performance on unseen data

Pitfalls
- Fit transforms on test set → leakage
- Improper handling of unseen categories
- Scaling target y in regression without carefully inverting for metrics

Notebook pointers
- Demonstrates Data.csv preprocessing with scikit-learn transformers
- Shows how to combine steps safely

Checklist
- Identify num/cat • Choose imputation • Choose encoding • Choose scaler • Build ColumnTransformer+Pipeline • Split first
""")

# Part 2 — Regression
TP["Part 2 - Regression/Section 4 - Simple Linear Regression/Python/simple_linear_regression.ipynb"] = md("""# Theory — Simple Linear Regression

Problem and idea
- Predict a numeric target y from one feature x using a straight line y ≈ b0 + b1 x.

Core math (OLS)
- Objective: minimize Mean Squared Error (MSE)
  J(b0, b1) = (1/n) Σ_i (y_i - (b0 + b1 x_i))^2
- Closed-form solution:
  b1 = Cov(x,y) / Var(x) = Σ (x_i - x̄)(y_i - ȳ) / Σ (x_i - x̄)^2
  b0 = ȳ - b1 x̄

Assumptions
- Linearity in parameters, errors ~ 0 mean and constant variance, independence, approximate normality for inference.

Step-by-step tiny example
- Points: (1,1), (2,2), (3,2)
  x̄=2, ȳ=5/3. Cov= ((-1)(-2/3) + 0(1/3) + 1(1/3)) = 1
  Var= 2 ⇒ b1=0.5, b0= 5/3 - 0.5*2 = 1/6. Line: ŷ = 1/6 + 0.5x

Pros/Cons
+ Interpretable, fast, closed-form
- Misses non-linear patterns; sensitive to outliers

Notebook specifics
- Dataset: Salary_Data.csv
- API: sklearn.linear_model.LinearRegression
- Evaluate with R^2 and plots

Checklist
- Plot data • Fit OLS • Inspect slope/intercept • Check residuals • Beware outliers
""")

TP["Part 2 - Regression/Section 5 - Multiple Linear Regression/Python/multiple_linear_regression.ipynb"] = md("""# Theory — Multiple Linear Regression

What it solves
- Predict y from multiple features X = [x1, x2, …, xp] using y ≈ Xβ + ε.

Matrix form and OLS
- Objective: minimize J(β) = (1/n) ||y - Xβ||^2
- Normal equation: β̂ = (XᵀX)⁻¹ Xᵀ y (if XᵀX invertible)
- Alternatively use QR/SVD or gradient descent

Assumptions and issues
- Linearity, weak multicollinearity, homoscedastic errors, independence
- Multicollinearity inflates variance; diagnose with VIF

Feature handling
- One-Hot encode categorical variables
- Consider interactions/polynomial terms; regularize if needed (Ridge/Lasso)

Toy example (intuition)
- Two features x1, x2; line fits a plane minimizing squared residuals

Pros/Cons
+ Simple baseline; interpretable coefficients
- Collinearity, outliers, nonlinearity can break assumptions

Notebook specifics
- Dataset: 50_Startups.csv (R&D, Administration, Marketing, State)
- API: sklearn.linear_model.LinearRegression
- One-Hot for 'State'; watch dummy variable trap (sklearn handles via full rank solvers)

Checklist
- Encode cats • Inspect VIF • Fit OLS • Evaluate • Consider regularization
""")

TP["Part 2 - Regression/Section 6 - Polynomial Regression/Python/polynomial_regression.ipynb"] = md("""# Theory — Polynomial Regression

Idea
- Model non-linear relationships by expanding features: ϕ(x) = [1, x, x², …, x^d], then fit linear regression on ϕ(x).

Math
- y ≈ β₀ + β₁x + β₂x² + … + β_d x^d
- Fit with OLS in feature space ϕ(x)

Bias-variance
- Higher degree increases flexibility (lower bias) but risks overfitting (higher variance)
- Choose degree via validation or information criteria

Scaling
- Always scale features after polynomial expansion (magnitudes explode)

Toy example
- Data shaped like a curve: a quadratic (d=2) often captures U-shapes

Pros/Cons
+ Simple, effective for smooth curves
- Extrapolation unstable, high-degree oscillations

Notebook specifics
- Dataset: Position_Salaries.csv
- API: sklearn.preprocessing.PolynomialFeatures + LinearRegression
- Compare linear vs polynomial fits

Checklist
- Expand to degree d • Scale if needed • Fit OLS • Validate degree
""")

TP["Part 2 - Regression/Section 7 - Support Vector Regression (SVR)/Python/support_vector_regression.ipynb"] = md("""# Theory — Support Vector Regression (ε-SVR)

Intuition
- Fit a function f(x) with maximum flatness while allowing deviations within an ε-tube and penalizing larger errors.

Optimization (primal, RBF kernel common)
- Minimize (1/2)||w||² + C Σ (ξ_i + ξ*_i)
  subject to:
    y_i - ⟨w, ϕ(x_i)⟩ - b ≤ ε + ξ_i
    ⟨w, ϕ(x_i)⟩ + b - y_i ≤ ε + ξ*_i
    ξ_i, ξ*_i ≥ 0
- Kernel trick: K(x, x′) = exp(-γ ||x - x′||²) or polynomial

Key hyperparameters
- C: penalty for errors outside ε (large C = less regularization)
- ε: tube width (larger ε = fewer support vectors)
- γ (RBF): influence radius of points (large γ = peaky)

Preprocessing
- Scale features! Distances drive kernels.

Pros/Cons
+ Robust to outliers inside the ε-tube; flexible with kernels
- Sensitive to C/ε/γ; scaling required; slower on large n

Notebook specifics
- Dataset: Position_Salaries.csv
- API: sklearn.svm.SVR with RBF kernel; StandardScaler on X and y
- Tune C, ε, γ via CV if needed

Checklist
- Scale X (and y for regression) • Choose kernel • Tune C/ε/γ • Inspect support vectors
""")

TP["Part 2 - Regression/Section 8 - Decision Tree Regression/Python/decision_tree_regression.ipynb"] = md("""# Theory — Decision Tree Regression (CART)

What it does
- Recursively partition feature space to predict a constant value per region.

Splitting criterion
- At each node, choose split that maximally reduces variance (MSE) in child nodes:
  Δ = Var(parent) - [ (n_L/n) Var(L) + (n_R/n) Var(R) ]

Stopping / Regularization
- max_depth, min_samples_split, min_samples_leaf, max_leaf_nodes
- Prune to reduce overfitting

Pros/Cons
+ Nonlinear, handles mixed features, interpretable splits
- High variance; small changes can alter tree; tends to overfit without constraints

Notebook specifics
- Dataset: Position_Salaries.csv
- API: sklearn.tree.DecisionTreeRegressor
- Visualize step-like predictions

Checklist
- Control depth/leaves • Fit • Plot • Consider ensembling for stability
""")

TP["Part 2 - Regression/Section 9 - Random Forest Regression/Python/random_forest_regression.ipynb"] = md("""# Theory — Random Forest Regression

Idea
- Bagging ensemble of decision trees trained on bootstrapped samples with feature subsampling; average predictions to reduce variance.

Key mechanisms
- Bootstrap sample per tree; random subset of features at each split
- Prediction: ŷ = (1/T) Σ_t tree_t(x)

Hyperparameters
- n_estimators, max_depth, max_features, min_samples_leaf, bootstrap
- OOB (out-of-bag) score estimates generalization without a full CV

Pros/Cons
+ Strong baseline, handles nonlinearities, robust to outliers
- Less interpretable; can be biased with unbalanced features; larger models

Notebook specifics
- Dataset: Position_Salaries.csv
- API: sklearn.ensemble.RandomForestRegressor
- Use many trees; check stability

Checklist
