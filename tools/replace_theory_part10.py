#!/usr/bin/env python3
"""
Replace the top 'Theory' cells in Part 10 (Model Selection & Boosting) with much more detailed explanations,
matching the depth and style of the user's UCB write-up. If a Theory cell isn't present,
the content will be prepended.

Targets:
- DataScience/4. Machine Learning A-Z/Part 10 - Model Selection and Boosting/Section 48 - Model Selection/Python/k_fold_cross_validation.ipynb
- DataScience/4. Machine Learning A-Z/Part 10 - Model Selection and Boosting/Section 48 - Model Selection/Python/grid_search.ipynb
- DataScience/4. Machine Learning A-Z/Part 10 - Model Selection and Boosting/Section 49 - XGBoost/Python/xg_boost.ipynb
"""
from __future__ import annotations

import sys
from pathlib import Path

# Ensure project root is on sys.path so 'tools' package imports succeed
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from tools.nb_theory import load_notebook, save_notebook, replace_or_prepend_theory  # noqa: E402

KFCV_MD = """# What is K‑Fold Cross‑Validation (CV)?

A method to estimate a model’s **generalization performance** using only your training data, and to compare models/hyperparameters **fairly**.

Rule of thumb: “Split train data into K parts; rotate which part you validate on; average the scores.”

Think of it as multiple train/validation experiments, each on a different slice, to reduce the luck (variance) of a single split.

---

# Variables and notation

- N: number of training examples
- K: number of folds (e.g., 5 or 10)
- Folds: disjoint index sets \\(\\mathcal{S}_1,\\ldots,\\mathcal{S}_K\\) partitioning \\(\\{1,\\ldots,N\\}\\)
- For fold k:
  - Train set: \\(\\mathcal{T}_k = \\{1,\\ldots,N\\} \\setminus \\mathcal{S}_k\\)
  - Val set: \\(\\mathcal{V}_k = \\mathcal{S}_k\\)
- Score on fold k: \\(s_k\\) (e.g., ROC‑AUC, accuracy, F1, RMSE)
- CV estimate: \\(\\bar{s} = \\frac{1}{K}\\sum_{k=1}^K s_k\\), with std \\(\\sigma_s = \\sqrt{\\frac{1}{K-1}\\sum_k (s_k-\\bar{s})^2}\\)

---

# Step‑by‑step (paper‑and‑pencil)

1) Shuffle (if i.i.d.) and form K folds (use **StratifiedKFold** for classification to keep class ratios in each fold).
2) For each fold k = 1..K:
   - Fit the entire **preprocessing + model** on \\(\\mathcal{T}_k\\) (only the train portion).
   - Predict on \\(\\mathcal{V}_k\\); compute score \\(s_k\\).
3) Report mean ± std across folds (\\(\\bar{s} \\pm \\sigma_s\\)).

Tiny example (K=5): scores = [0.78, 0.80, 0.76, 0.79, 0.77] → mean = 0.78, std ≈ 0.014.

---

# Why K‑Fold helps

- Using multiple splits **reduces variance** vs a single train/val split.
- Ensures you don’t get fooled by an especially easy/hard validation subset.

---

# Pseudocode

```
make_folds(X, y, K)  # stratified if classification
scores = []
for k in 1..K:
  X_tr, y_tr = union folds != k
  X_va, y_va = fold k
  pipe.fit(X_tr, y_tr)          # Pipeline: preprocessing + model
  y_pr = pipe.predict(X_va)
  s_k  = metric(y_va, y_pr)
  scores.append(s_k)
mean, std = average(scores), stdev(scores)
```

---

# Minimal Python (sklearn)

```python
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

pipe = Pipeline([
    ("scaler", StandardScaler()),
    ("clf", LogisticRegression(max_iter=1000))
])

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(pipe, X, y, cv=cv, scoring="roc_auc", n_jobs=-1)
print(f"ROC-AUC: {scores.mean():.3f} ± {scores.std():.3f}")
```

---

# Practical tips, pitfalls, and variants

- Use **Pipeline** so imputation/scaling/encoding are fit **inside** each fold (prevents leakage).
- Classification: **StratifiedKFold**; grouped data: **GroupKFold**; time series: **TimeSeriesSplit** (no shuffling!).
- Report both mean and std; use **RepeatedStratifiedKFold** for more stability.
- Imbalanced data: choose metrics beyond accuracy (ROC‑AUC, PR‑AUC, F1).
- Don’t tune hyperparameters on the test set; keep a final untouched test set or use **nested CV** for an unbiased estimate.

---

# Quick cheat sheet

- K=5 or 10; stratify classification; use Pipeline to avoid leakage
- Report mean ± std; pick metrics aligned with your goal
- Time series → TimeSeriesSplit (no shuffle)
"""

GRID_MD = """# What is Grid Search (with CV)?

A way to **systematically search** over a set (grid) of hyperparameter values using **cross‑validation** to pick the best.

Rule of thumb: “Wrap your preprocessing + model in a Pipeline; define a param grid; evaluate each combo with K‑fold CV; keep the best.”

---

# Variables and notation

- Pipeline steps: e.g., "prep" (ColumnTransformer), "clf" (estimator)
- Param grid: dictionary mapping parameter names to lists of values  
  (Pipeline params use `step__param`, e.g., `clf__C`, `prep__num__imputer__strategy`)
- CV splitter: K‑Fold/StratifiedKFold/GroupKFold/TimeSeriesSplit
- Scoring: metric to maximize/minimize (e.g., "roc_auc", "neg_root_mean_squared_error")

---

# Step‑by‑step (paper‑and‑pencil)

1) Define your **Pipeline**: preprocessing → estimator.
2) Define **param_grid**: list of dicts or a dict of lists (all combinations tried).
3) Run **GridSearchCV** with your CV splitter and scoring.
4) Fit on training data; GridSearchCV:
   - For each param combo: runs CV, stores mean/std fold scores.
   - Picks the best combo by mean validation score (ties broken by cross‑val rules).
5) Access **best_params_**, **best_score_**, **best_estimator_**; evaluate on the final **test** set.

---

# Pseudocode

```
pipe = Pipeline([...])
param_grid = {
  "clf__C": [0.1, 1, 10],
  "clf__penalty": ["l2"],
}
gscv = GridSearchCV(pipe, param_grid, cv=KFold, scoring="roc_auc", n_jobs=-1)
gscv.fit(X_train, y_train)
best = gscv.best_estimator_
test_score = metric(y_test, best.predict(X_test))
```

---

# Minimal Python (sklearn)

```python
from sklearn.model_selection import GridSearchCV, StratifiedKFold
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

pipe = Pipeline([
    ("scaler", StandardScaler()),
    ("clf", SVC(probability=True))
])

param_grid = {
    "clf__C": [0.1, 1, 10],
    "clf__gamma": ["scale", 0.1, 0.01],
    "clf__kernel": ["rbf"]
}

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
gscv = GridSearchCV(pipe, param_grid, cv=cv, scoring="roc_auc", n_jobs=-1)
gscv.fit(X_train, y_train)

print("Best params:", gscv.best_params_)
print("CV best score:", gscv.best_score_)
print("Test ROC-AUC:", gscv.score(X_test, y_test))
```

---

# Practical tips, pitfalls, and variants

- Always put preprocessing in the **Pipeline**; hyperparameters must only see training folds (avoid leakage).
- Start coarse with **RandomizedSearchCV** (random combos) to scan large spaces, then refine with GridSearchCV.
- Use an appropriate **scoring**; for imbalanced data prefer ROC‑AUC/PR‑AUC over accuracy.
- Consider **successive halving** (HalvingGridSearchCV) for efficiency on larger models.
- Keep a final **test** set untouched; or use **nested CV** for an unbiased performance estimate.

---

# Quick cheat sheet

- Pipeline everything; param names use `step__param`
- Start with RandomizedSearch; refine with GridSearch
- Keep test set clean; report CV mean ± std
"""

XGB_MD = """# What is XGBoost (Extreme Gradient Boosting)?

A high‑performance gradient boosting library for **tree‑based** models (classification/regression). Strong default for **tabular** data.

Rule of thumb: “Add small decision trees one‑by‑one; each new tree corrects errors of the previous ones using gradients.”

---

# Core idea and notation

- At iteration t, the model is \\(\\hat{y}^{(t)}(x) = \\hat{y}^{(t-1)}(x) + f_t(x)\\), where \\(f_t\\) is a new regression tree.
- Objective to minimize:
\\[
\\mathcal{L}^{(t)} = \\sum_{i=1}^N l\\big(y_i, \\hat{y}^{(t-1)}_i + f_t(x_i)\\big) \\, + \\, \\Omega(f_t)
\\]
- Using Taylor expansion around \\(\\hat{y}^{(t-1)}\\):
  - First derivative (gradient): \\(g_i = \\partial_{\\hat{y}} l(y_i, \\hat{y}^{(t-1)}_i)\\)
  - Second derivative (Hessian): \\(h_i = \\partial^2_{\\hat{y}} l(y_i, \\hat{y}^{(t-1)}_i)\\)
- For each leaf j with index set \\(I_j\\), define \\(G_j = \\sum_{i\\in I_j} g_i\\), \\(H_j = \\sum_{i\\in I_j} h_i\\).
- The optimal leaf weight is approx:
\\[
w_j^* = -\\frac{G_j}{H_j + \\lambda}
\\]
- The split **gain** when splitting a node into left/right:
\\[
\\text{Gain} = \\frac{1}{2}\\left( \\frac{G_L^2}{H_L + \\lambda} + \\frac{G_R^2}{H_R + \\lambda} - \\frac{G^2}{H + \\lambda} \\right) - \\gamma
\\]
(\\(\\lambda\\): L2 regularization; \\(\\gamma\\): min loss reduction to make a split)

---

# Important hyperparameters (and roles)

- `eta` (learning rate): 0.01–0.3; smaller needs more trees, can generalize better.
- `n_estimators` (num_boost_round): number of trees; pair with early stopping.
- `max_depth` / `max_leaves`: tree complexity; deeper can overfit.
- `min_child_weight`: larger → more conservative splits.
- `subsample`, `colsample_bytree`: row/feature subsampling for regularization and speed.
- `reg_alpha` (L1), `reg_lambda` (L2): regularize leaf weights.
- `gamma`: required loss reduction to split (tree-specific penalty).
- Imbalance: `scale_pos_weight` ≈ (neg/pos ratio) for binary classification.

---

# Step‑by‑step (paper‑and‑pencil)

1) Initialize \\(\\hat{y}^{(0)}\\) (e.g., constant prediction).
2) For t = 1..T:
   - Compute gradients \\(g_i\\) and Hessians \\(h_i\\) for current predictions.
   - Build a new tree by choosing splits that maximize **Gain**.
   - Add the scaled tree to the model: \\(\\hat{y}^{(t)} = \\hat{y}^{(t-1)} + \\eta f_t(x)\\).
   - Optionally use early stopping based on validation set.

---

# Pseudocode

```
y_hat = init_constant()
for t in 1..T:
  g, h = grad_hess(loss, y, y_hat)
  tree = build_tree_by_gain(X, g, h, lambda, gamma, max_depth, min_child_weight)
  y_hat = y_hat + eta * tree.predict(X)
  if early_stopping and no_improvement: break
```

---

# Minimal Python (sklearn API)

```python
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split

X_tr, X_va, y_tr, y_va = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

xgb = XGBClassifier(
    n_estimators=1000, learning_rate=0.05, max_depth=4,
    subsample=0.8, colsample_bytree=0.8,
    reg_lambda=1.0, reg_alpha=0.0, gamma=0.0,
    eval_metric="auc", n_jobs=-1, random_state=42
)
xgb.fit(X_tr, y_tr, eval_set=[(X_va, y_va)], verbose=False, early_stopping_rounds=50)
print("Best iteration:", xgb.best_iteration)
print("Val AUC:", xgb.best_score)
```

---

# Practical tips, pitfalls, and variants

- Always monitor a **validation** metric with **early stopping** to avoid overfitting.
- Tune `eta` jointly with `n_estimators` (smaller eta → more trees).
- Keep trees shallow to start (max_depth 3–6).
- Use CV/Grid/RandomizedSearch to tune; mind interaction of hyperparameters.
- Be careful with leakage (all preprocessing fit on train only).
- Interpretability: feature importances can be biased; consider permutation importance/SHAP.

---

# Quick cheat sheet

- Additive trees: each corrects previous errors using gradients
- Gain formula drives splits; regularize with \\(\\lambda,\\gamma\\)
- Use early stopping; shallow trees; tune subsampling
"""

def main() -> int:
    kfold_path = ROOT / "DataScience/4. Machine Learning A-Z/Part 10 - Model Selection and Boosting/Section 48 - Model Selection/Python/k_fold_cross_validation.ipynb"
    grid_path  = ROOT / "DataScience/4. Machine Learning A-Z/Part 10 - Model Selection and Boosting/Section 48 - Model Selection/Python/grid_search.ipynb"
    xgb_path   = ROOT / "DataScience/4. Machine Learning A-Z/Part 10 - Model Selection and Boosting/Section 49 - XGBoost/Python/xg_boost.ipynb"

    # K-Fold CV
    nb = load_notebook(kfold_path)
    replace_or_prepend_theory(nb, KFCV_MD)
    save_notebook(kfold_path, nb)
    print(f"Replaced Theory cell in: {kfold_path}")

    # Grid Search
    nb2 = load_notebook(grid_path)
    replace_or_prepend_theory(nb2, GRID_MD)
    save_notebook(grid_path, nb2)
    print(f"Replaced Theory cell in: {grid_path}")

    # XGBoost
    nb3 = load_notebook(xgb_path)
    replace_or_prepend_theory(nb3, XGB_MD)
    save_notebook(xgb_path, nb3)
    print(f"Replaced Theory cell in: {xgb_path}")

    return 0

if __name__ == "__main__":
    raise SystemExit(main())
