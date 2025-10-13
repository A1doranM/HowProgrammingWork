#!/usr/bin/env python3
"""
Batch-prepend tailored Theory markdown to Part 10 (Model Selection & Boosting) notebooks.

Edits the following notebooks in-place:
- Part 10 - Model Selection and Boosting
  * Section 48 - Model Selection/Python/k_fold_cross_validation.ipynb
  * Section 48 - Model Selection/Python/grid_search.ipynb
  * Section 49 - XGBoost/Python/xg_boost.ipynb

Behavior:
- Loads notebook JSON
- If the first cell already starts with a Theory marker ("# Theory —" or variants), skips
- Otherwise prepends a Markdown cell with tailored content
- Preserves kernelspec, language_info, outputs, execution counts

Run:
  python tools/batch_prepend_theory_part10.py
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

KFCV_MD = """# Theory — K‑Fold Cross‑Validation

What it solves
- Estimate a model’s generalization performance using only training data, and compare models/hyperparameters fairly.
- Reduces variance vs single train/validation split.

Plain intuition
- Split the training set into K equal parts (“folds”).
- Train on K−1 folds and validate on the remaining fold; rotate the held‑out fold K times.
- Average the K validation scores → a more stable estimate.

Step-by-step (paper‑and‑pencil)
1) Shuffle and split data into folds (StratifiedKFold for classification to keep class ratios).
2) For fold i=1..K:
   - Fit preprocessing + model on folds ≠ i.
   - Evaluate on fold i → score_i.
3) Report mean(score_i) and std(score_i).

Core points
- Use a Pipeline so that all preprocessing (imputation, scaling, vectorization) is fitted inside each fold → avoids leakage.
- For imbalanced data, prefer stratified CV and metrics beyond accuracy (F1/ROC‑AUC/PR‑AUC).
- For time series, do not shuffle: use TimeSeriesSplit (train on past, validate on future).

Tiny example
- K=5; scores: [0.78, 0.80, 0.76, 0.79, 0.77] → mean=0.78, std≈0.014.

Hyperparameters
- K (5 or 10 common), shuffle=True with random_state for reproducibility.
- StratifiedKFold for classification; GroupKFold for grouped leakage cases.

Pros, cons, pitfalls
- Pros: Better use of data; lower variance estimate.
- Cons: K fits per evaluation → more compute.
- Pitfalls: Leakage when transforms are fit outside CV; using standard KFold on imbalanced classification; using random CV for time series.

How this notebook implements it
- Dataset: Social_Network_Ads.csv.
- Steps: build preprocessing+classifier pipeline → cross_val_score with KFold/StratifiedKFold → report mean/std.
- Tip: also analyze per‑fold variance; consider RepeatedStratifiedKFold for stability.

Quick checklist
- Use Pipeline and StratifiedKFold; pick a proper metric.
- Report mean ± std across folds.
- For time series, use TimeSeriesSplit.
"""

GRID_MD = """# Theory — Grid Search with Cross‑Validation

What it solves
- Systematically find good hyperparameters for a model using K‑fold CV.

Plain intuition
- Define a grid of hyperparameter combinations.
- For each combo, run CV and compute mean validation score.
- Select the best combo; refit on the full training set.

Step-by-step
1) Define Pipeline (preprocessing + estimator).
2) Define param_grid dict (keys are pipeline step names + __ + param, e.g., "clf__C").
3) Instantiate GridSearchCV(estimator, param_grid, scoring, cv, n_jobs).
4) Fit on training data; access best_params_, best_score_.
5) Evaluate the refitted best_estimator_ on held‑out test set.

Alternatives
- RandomizedSearchCV: sample random combinations; faster on large spaces; can outperform grid with the same budget.
- Successive halving (HalvingGridSearchCV) for efficient resource allocation.

Metrics & CV
- Choose scoring consistent with business goal (ROC‑AUC, F1, RMSE).
- Use StratifiedKFold for classification; GroupKFold when needed.

Pitfalls
- Leakage: put preprocessing inside Pipeline; tune inside CV only.
- Tuning on the test set (“peeking”); prefer a validation set or nested CV if you must report unbiased performance.
- Too wide grids → high compute; start coarse, then refine.

How this notebook implements it
- Dataset: Social_Network_Ads.csv.
- Steps: pipeline → param_grid → GridSearchCV(cv=K) → fit → examine best_params_ → test evaluation.
- Tip: set n_jobs=-1; fix random_state; log results (cv_results_) for later analysis.

Quick checklist
- Wrap preprocessing + model in Pipeline.
- Use appropriate scoring and stratified CV.
- Start with RandomizedSearchCV for coarse search; refine with GridSearchCV.
"""

XGB_MD = """# Theory — XGBoost (Extreme Gradient Boosting)

What it solves
- High‑performance tree‑based gradient boosting for classification/regression; strong tabular baseline.

Plain intuition
- Build trees sequentially; each new tree fits the gradient of the loss (errors) made so far.
- Many small improvements (weak learners) add up to a strong model.

Core math (sketch)
- Objective at iteration t: L = Σ_i l(y_i, ŷ_i^{(t-1)} + f_t(x_i)) + Ω(f_t)
  • l: loss (e.g., logistic), f_t: new tree, Ω: regularization (L1/L2 + tree complexity)
- Add tree f_t that best reduces L using a second‑order Taylor approximation (gradient + Hessian).

Important hyperparameters
- Learning rate (eta): 0.01–0.3; smaller eta → more trees needed, better generalization.
- n_estimators (num_boost_round): total boosting rounds; use early stopping with a validation set.
- max_depth / max_leaves: tree complexity; deeper trees can overfit.
- min_child_weight: minimum sum of instance weight in a leaf; larger → conservative.
- subsample / colsample_bytree: row/feature subsampling for regularization and speed.
- reg_alpha (L1), reg_lambda (L2): regularize leaf weights.
- gamma: minimum loss reduction to make a split.
- scale_pos_weight: handle class imbalance (= negative/positive ratio).

Training tips
- Always monitor validation metric with early_stopping_rounds (e.g., 50).
- Tune eta with n_estimators jointly; use smaller eta with more rounds.
- Start with shallow trees (max_depth 3–6) and moderate subsampling.

Tiny example (concept)
- Begin with constant prediction (e.g., average log‑odds).
- Tree 1 fits residuals; add scaled by eta; repeat → decision function improves iteratively.

Pros, cons, pitfalls
- Pros: Excellent accuracy on tabular data; handles missing values; many regularization knobs.
- Cons: Many hyperparameters; can overfit if unchecked; longer training on very large datasets.
- Pitfalls: No early stopping; too deep trees; leakage in preprocessing; not using proper metric for imbalance.

How this notebook implements it
- Dataset: Data.csv / Churn_Modelling.csv depending on variant.
- Steps: split → build DMatrix (or sklearn API) → fit with eval_set and early stopping → evaluate.
- Tip: Use sklearn API (XGBClassifier/XGBRegressor) for easy Pipeline/CV integration.

Quick checklist
- Use validation set + early stopping.
- Tune depth, learning rate, rounds, and subsampling.
- Check feature importance cautiously; validate with CV.
"""

TARGETS: List[Tuple[str, str]] = [
    (
        "DataScience/4. Machine Learning A-Z/Part 10 - Model Selection and Boosting/Section 48 - Model Selection/Python/k_fold_cross_validation.ipynb",
        KFCV_MD,
    ),
    (
        "DataScience/4. Machine Learning A-Z/Part 10 - Model Selection and Boosting/Section 48 - Model Selection/Python/grid_search.ipynb",
        GRID_MD,
    ),
    (
        "DataScience/4. Machine Learning A-Z/Part 10 - Model Selection and Boosting/Section 49 - XGBoost/Python/xg_boost.ipynb",
        XGB_MD,
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
