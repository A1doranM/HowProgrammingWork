#!/usr/bin/env python3
"""
Batch-prepend tailored Theory markdown to Part 1 (Data Preprocessing) notebooks.

Edits the following notebooks in-place:
- Part 1 - Data Preprocessing
  * Section 2 -------------------- Part 1 - Data Preprocessing --------------------/Python/data_preprocessing_template.ipynb
  * Section 2 -------------------- Part 1 - Data Preprocessing --------------------/Python/data_preprocessing_tools.ipynb

Behavior:
- Loads notebook JSON
- If the first cell already starts with a Theory marker ("# Theory —" or variants), skips
- Otherwise prepends a Markdown cell with tailored content
- Preserves kernelspec, language_info, outputs, execution counts

Run:
  python tools/batch_prepend_theory_part1.py
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

PIPELINE_MD = """# Theory — Data Preprocessing Pipeline

Why preprocessing matters
- Real-world data is messy: missing values, inconsistent categories, different scales, outliers, skewed distributions.
- Good models rely on consistent inputs. Preprocessing turns raw tables into clean numeric matrices that models can learn from.
- Key principle: avoid data leakage — compute any statistics (means, scalers, encoders) on training data only and apply to validation/test data later.

Typical pipeline (plain-English and order of operations)
1) Define the problem and the `target` (y). Is it regression (numeric y) or classification (categorical y)?
2) Split early: create train/test (and optionally validation) splits BEFORE computing any statistics.
3) Handle missing values:
   - Numeric: mean/median imputation; optionally add a “was_missing” indicator column.
   - Categorical: most frequent category (mode); optionally add explicit “Missing” category.
   - Advanced: KNNImputer, MICE/IterativeImputer for richer patterns.
4) Encode categorical features:
   - One-Hot Encoding (OHE): safe default for unordered categories (country, color).
   - Ordinal Encoding: only if categories have an inherent order (low < medium < high).
   - High cardinality: consider hashing or target encoding (with care to avoid leakage).
5) Scale/normalize numeric features:
   - StandardScaler (zero mean, unit variance): default for many models (SVM, KNN, linear/logistic regression).
   - MinMaxScaler [0,1]: preserves shape; often used for neural nets or bounded features.
   - RobustScaler: resilient to outliers by using median/IQR.
   - Trees/forests/boosting usually do NOT need scaling.
6) Optional feature engineering:
   - Date/time decomposition (year, month, dow), interactions, binning, log/Box–Cox/Yeo–Johnson transformations.
   - Text: Bag-of-Words/TF‑IDF; Images: normalization/augmentation (outside this course’s scope).
7) Fit model on the preprocessed training matrix. Use cross‑validation with the entire pipeline to choose hyperparameters.
8) Evaluate on held‑out test data. Inspect residuals (regression), confusion matrices/ROC/PR (classification).

Essential scikit‑learn tools
- SimpleImputer, OneHotEncoder, OrdinalEncoder, StandardScaler, MinMaxScaler, RobustScaler
- ColumnTransformer: apply different transforms to numeric vs categorical columns.
- Pipeline: chain transforms and estimator as a single object.
- train_test_split, cross_val_score/GridSearchCV: split and evaluate without leakage.

Tiny worked example (paper‑and‑pencil)
Dataset (Country, Age, Salary, Purchased):
- Row1: France, 44, 72000, Yes
- Row2: Spain, 27, 48000, No
- Row3: Germany, 30, NaN, Yes
- Row4: Spain, 38, 61000, No
- Row5: France, 40,  NaN, Yes

Step‑by‑step:
- Train/test split first (e.g., 80/20).
- Impute missing Salary (numeric): median of train salaries; add indicator if desired.
- Encode Country with OHE: France→[1,0,0], Germany→[0,1,0], Spain→[0,0,1].
- Scale numeric features (Age, Salary) with StandardScaler fitted on train only; transform test with the same scaler.
- Target Purchased (Yes/No) becomes y (e.g., 1/0).

Leakage watchlist
- Never fit imputer/scaler/encoder on full data before splitting.
- Do not target‑encode using the entire y; use CV folds or leave‑one‑out schemes.
- Avoid peeking at test data during feature selection.

Pros, cons, pitfalls
- Pros: Cleaner, more stable models; reproducibility; fewer surprises at deployment.
- Cons: More steps; need careful orchestration.
- Pitfalls: Fitting transforms on full data; mismatched columns between train/test; unseen categories at prediction time (set OneHotEncoder(handle_unknown="ignore")).

Quick checklist
- Identify target and task type.
- Split early (train/test).
- Impute → Encode → Scale in a ColumnTransformer + Pipeline.
- Validate via CV; keep the pipeline intact.
- Export the fitted pipeline for production use.
"""

TOOLS_MD = """# Theory — Preprocessing Tools and When to Use Them

Goal
- Understand the main preprocessing operators in scikit‑learn, what they do, when to use them, and typical settings.

Core transformers (with practical guidance)
1) Imputation (handle missing values)
   - SimpleImputer(strategy="mean"/"median"/"most_frequent"/"constant")
     • Numeric: median is robust; mean is ok without heavy outliers.
     • Categorical: most_frequent; or constant like "Missing".
     • AddMissingIndicator or a custom “was_missing” flag can help models.
   - KNNImputer: leverages nearest neighbors; slower; sensitive to scaling.

2) Encoding categoricals
   - OneHotEncoder(sparse_output=False, handle_unknown="ignore")
     • Default for nominal features; avoids implying order.
     • handle_unknown="ignore" prevents failure on unseen categories at inference.
   - OrdinalEncoder: only for truly ordered categories (e.g., education levels).
   - High cardinality: Hashing trick (FeatureHasher) or target encoding (with strict CV to avoid leakage).

3) Scaling/normalization (numeric only)
   - StandardScaler: default for linear/SVM/KNN; centers and scales.
   - MinMaxScaler: [0,1] range; good when features are bounded or for neural nets.
   - RobustScaler: uses median/IQR; robust to outliers.
   - Normalizer (L2): rescales each sample vector to unit norm; mostly for text/embeddings.

4) Column selection/routing
   - ColumnTransformer([("num", num_pipeline, num_cols), ("cat", cat_pipeline, cat_cols)])
     • Apply numeric pipeline (impute→scale) to numeric columns, categorical pipeline (impute→OHE) to categorical columns.
     • Keeps column order consistent.

5) Orchestration and evaluation
   - Pipeline(steps=[("prep", preprocessor), ("model", estimator)])
     • Encapsulates all preprocessing + model in one object.
     • safe with cross_val_score/GridSearchCV (prevents leakage).
   - train_test_split, StratifiedKFold (classification), GroupKFold (grouped data).

6) Targets and labels
   - LabelEncoder: for single target labels (y) only; not for feature columns.
   - One-vs-Rest strategies and probability calibration happen after preprocessing.

Common patterns (paper‑and‑pencil)
- Numeric only: SimpleImputer(median) → StandardScaler.
- Mixed data: ColumnTransformer(num=[imputer+scaler], cat=[imputer+OHE]) → model.
- Trees/forests/boosting: often skip scaling; still impute and OHE for categoricals (or consider tree libs with native categoricals).
- Time series: split by time; fit transforms only on past data; avoid shuffling.

Pitfalls and fixes
- Leakage: always fit transforms inside the CV loop via Pipeline.
- Unseen categories: OneHotEncoder(handle_unknown="ignore").
- Mismatched columns/order: use ColumnTransformer; avoid manual concat with different trains/tests.
- Rare categories: group into "Other" before OHE to reduce sparsity.
- Skewed numerics: log/Box‑Cox/Yeo‑Johnson transforms before scaling.

Quick checklist
- Choose imputation per type and outliers (median for numeric is safe).
- OHE nominal categoricals; Ordinal encode truly ordered ones.
- Scale for distance‑based/linear margin models.
- Wrap everything in ColumnTransformer + Pipeline; validate with CV.
"""

TARGETS: List[Tuple[str, str]] = [
    (
        "DataScience/4. Machine Learning A-Z/Part 1 - Data Preprocessing/Section 2 -------------------- Part 1 - Data Preprocessing --------------------/Python/data_preprocessing_template.ipynb",
        PIPELINE_MD,
    ),
    (
        "DataScience/4. Machine Learning A-Z/Part 1 - Data Preprocessing/Section 2 -------------------- Part 1 - Data Preprocessing --------------------/Python/data_preprocessing_tools.ipynb",
        TOOLS_MD,
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
