#!/usr/bin/env python3
"""
Batch-prepend tailored Theory markdown to Part 7 (Natural Language Processing) notebooks.

Edits the following notebooks in-place:
- Part 7 - Natural Language Processing
  * Section 36 - Natural Language Processing/Python/natural_language_processing.ipynb

Behavior:
- Loads notebook JSON
- If the first cell already starts with a Theory marker ("# Theory —" or variants), skips
- Otherwise prepends a Markdown cell with tailored content
- Preserves kernelspec, language_info, outputs, execution counts

Run:
  python tools/batch_prepend_theory_part7.py
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

NLP_MD = """# Theory — NLP Classification Pipeline (Bag‑of‑Words/TF‑IDF)

What it solves
- Turn raw text (reviews, tweets, tickets) into numeric features so a classifier (Naive Bayes, Logistic Regression, SVM) can predict sentiment, topic, or intent.

Plain intuition
- Count which words appear in each document (bag‑of‑words).
- Optionally down‑weight very common words and up‑weight rare-but-informative words (TF‑IDF).
- Feed those features to a standard classifier.

Step-by-step (paper‑and‑pencil)
1) Clean text: lowercasing, remove punctuation, keep letters/numbers; optionally remove stopwords; optionally stem/lemmatize.
2) Tokenize: split into tokens (words).
3) Build vocabulary: the set of unique tokens across training texts (after cleaning).
4) Vectorize:
   - Bag‑of‑Words (counts): x_j = number of times token j appears in the document.
   - TF (term frequency): x_j = count / document_length.
   - TF‑IDF: x_j = TF * IDF, where IDF_j = log((N + 1)/(df_j + 1)) + 1 (N docs, df_j docs contain token j).
5) Train a classifier on these vectors.
6) Evaluate with a held‑out test set.

Core math
- Count vector for doc d: x(d) ∈ ℝ^V (V = vocabulary size).
- TF‑IDF weighting:
  TF(d, j) = count(d, j) / |d|
  IDF(j) = log((N + 1)/(df(j) + 1)) + 1
  TF‑IDF(d, j) = TF(d, j) * IDF(j)
- Classifier examples:
  • Naive Bayes (Multinomial): P(c|x) ∝ P(c) ∏_j P(w_j|c)^{count(d, j)}
  • Logistic Regression/SVM: linear model on x(d) with cross‑entropy/hinge loss.

Tiny example
Corpus (3 reviews):
- d1: "love this phone"
- d2: "hate this case"
- d3: "love love this case"
Vocabulary (sorted): ["case","hate","love","phone","this"] → indices [0..4]
Count vectors:
- d1: [0,0,1,1,1]
- d2: [1,1,0,0,1]
- d3: [1,0,2,0,1]
If using TF‑IDF, compute df and IDF, then multiply. A linear classifier can learn that "love" → positive, "hate" → negative.

Hyperparameters and tuning
- Vectorizer:
  • ngram_range=(1,1) vs (1,2) to include bigrams.
  • min_df / max_df to drop rare or too‑common terms.
  • binary=True to use presence/absence instead of counts.
  • use_idf=True, smooth_idf=True, norm="l2".
- Classifier:
  • Naive Bayes: alpha (Laplace/Lidstone smoothing).
  • Logistic/SVM: C (regularization), penalty, class_weight for imbalance.

Pitfalls
- Leakage: Always fit vectorizer on the train split only (use Pipeline).
- Imbalance: consider stratified splits and metrics beyond accuracy (precision/recall/F1, ROC‑AUC).
- OOV (out‑of‑vocabulary): unseen test tokens are ignored; this is normal for BoW/TF‑IDF.
- Overfitting with large vocabularies: use min_df/max_df, regularization, or feature selection.

How this notebook implements it
- Dataset: Restaurant_Reviews.tsv (labelled positive/negative).
- Steps: cleaning → vectorization (Bag‑of‑Words/TF‑IDF) → classifier → confusion matrix/accuracy.
- Tip: wrap preprocessing + model in sklearn Pipeline to avoid leakage and ease GridSearchCV.

Quick checklist
- Clean and tokenize consistently.
- Vectorize with CountVectorizer or TfidfVectorizer (fit on train only).
- Pick a linear classifier baseline (NB/LogReg/SVM).
- Evaluate with suitable metrics; watch class imbalance.
"""

TARGETS: List[Tuple[str, str]] = [
    (
        "DataScience/4. Machine Learning A-Z/Part 7 - Natural Language Processing/Section 36 - Natural Language Processing/Python/natural_language_processing.ipynb",
        NLP_MD,
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
