#!/usr/bin/env python3
"""
Replace the top 'Theory' cell in Part 7 (NLP) with a much more detailed explanation,
matching the depth and style of the user's UCB write-up. If a Theory cell isn't present,
the content will be prepended.

Target:
- DataScience/4. Machine Learning A-Z/Part 7 - Natural Language Processing/Section 36 - Natural Language Processing/Python/natural_language_processing.ipynb
"""
from __future__ import annotations

import sys
from pathlib import Path

# Ensure project root is on sys.path so 'tools' package imports succeed
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from tools.nb_theory import load_notebook, save_notebook, replace_or_prepend_theory  # noqa: E402

NLP_MD = """# What is Text Classification (Bag‑of‑Words / TF‑IDF)?

A way to turn raw **text** (reviews, tweets, tickets) into **numbers** so a standard ML model (Naive Bayes, Logistic Regression, SVM) can predict a **label** (e.g., positive/negative).

Rule of thumb: “Count what words appear, weight them sensibly, then feed those numeric vectors to a classifier.”

Think product reviews: for each review you output an integer vector representing word usage; a classifier learns patterns like “love” → positive, “hate” → negative.

---

# The pipeline at a glance

1) Clean text: lowercase, strip punctuation/numbers (optional), normalize whitespace.
2) Tokenize: split into words (tokens).
3) Build vocabulary V: unique tokens from the training set after cleaning.
4) Vectorize each document into ℝ^|V| using either:
   - Bag‑of‑Words counts (how many times each token appears),
   - TF (term frequency),
   - TF‑IDF (term frequency scaled by how unique the word is across documents).
5) Train a linear classifier (e.g., Logistic Regression, SVM) on these vectors.
6) Evaluate on held‑out data (confusion matrix, precision/recall/F1, ROC‑AUC).

---

# Variables and notation

- N: number of documents (training examples)
- V: vocabulary (set of unique tokens after preprocessing), |V| = vocabulary size
- d: a document (sequence of tokens)
- count(d, j): number of times token j appears in document d
- |d|: total number of tokens in document d (after preprocessing)
- df(j): document frequency; number of documents containing token j
- TF(d, j) = count(d, j) / |d|    (term frequency)
- IDF(j) = log((N + 1) / (df(j) + 1)) + 1    (inverse document frequency; smoothed)
- TF‑IDF(d, j) = TF(d, j) × IDF(j)

Note: Using log base e is standard; other bases just scale features.

---

# How vectorization works (paper‑and‑pencil)

Tiny corpus (3 docs):
- d1: “love this phone”
- d2: “hate this case”
- d3: “love love this case”

Vocabulary (sorted): [“case”, “hate”, “love”, “phone”, “this”] → indices [0..4]

Bag‑of‑Words counts:
- d1: [0, 0, 1, 1, 1]
- d2: [1, 1, 0, 0, 1]
- d3: [1, 0, 2, 0, 1]

Term Frequency (TF):
- Example for d3 and token “love”: TF(d3, “love”) = 2 / 4 = 0.5 (4 tokens total)

IDF with smoothing:
- df(“case”) = 2 (d2, d3) → IDF = log((3+1)/(2+1)) + 1 = log(4/3) + 1
- df(“hate”) = 1 → IDF = log(4/2) + 1 = log(2) + 1
- df(“love”) = 2 → IDF = log(4/3) + 1
- df(“phone”) = 1 → IDF = log(2) + 1
- df(“this”) = 3 → IDF = log(4/4) + 1 = log(1) + 1 = 1

TF‑IDF(d, j) = TF(d, j) × IDF(j) gives you real‑valued feature vectors where rare-but-informative tokens get higher weight.

---

# Classifier intuition and math

- Logistic Regression:
  - Model: p(y=1|x) = σ(wᵀx + b), with σ(z) = 1/(1+e^{−z})
  - Loss: average log‑loss + regularization (L2 by default):  
    L = −(1/N) Σ [ y log p + (1−y) log(1−p) ] + λ/2 ||w||²

- Linear SVM (hinge loss):
  - Decision: f(x) = wᵀx + b; predict sign(f(x))
  - Optimize: minimize (1/2)||w||² + C Σ ξ_i, s.t. y_i f(x_i) ≥ 1 − ξ_i, ξ_i ≥ 0

- Multinomial Naive Bayes:
  - P(c | d) ∝ P(c) Π_j P(w_j | c)^{count(d, j)} (computed in log space)

Because BoW/TF‑IDF produces high‑dimensional sparse vectors, simple linear models often work very well.

---

# Step‑by‑step example (tiny)

Suppose we build TF‑IDF vectors for d1..d3 above and train a Logistic Regression (binary: positive vs negative).
- Assign labels: d1=positive, d2=negative, d3=positive.
- Build vectors as shown (counts → TF → TF‑IDF).
- Fit Logistic Regression (L2 regularization).
- Intuition: “love” gets positive weight; “hate” gets negative weight; “phone” and “case” weights depend on co‑occurrence.

---

# Pseudocode

```
input: raw_docs (train), raw_docs_test (test), labels (train)
clean(train), clean(test)                  # lowercase, remove punctuation, etc.
fit_vectorizer(train)                      # build vocabulary, compute IDF
X_train = vectorize(train)                 # counts or TF‑IDF
X_test  = vectorize(test)                  # using the same fitted vectorizer
fit_linear_classifier(X_train, labels)
pred = predict(X_test)
evaluate(pred, labels_test)
```

---

# Minimal Python (ready to paste)

```python
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report

X = texts  # list of raw strings
y = labels # 0/1 or class labels

pipe = Pipeline([
    ("tfidf", TfidfVectorizer(
        lowercase=True, stop_words="english",
        ngram_range=(1,2), min_df=2, max_df=0.9,
        norm="l2", use_idf=True, smooth_idf=True
    )),
    ("clf", LogisticRegression(C=1.0, max_iter=500))
])

X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
pipe.fit(X_tr, y_tr)
y_pr = pipe.predict(X_te)
print(classification_report(y_te, y_pr))
```

Notes:
- Use Pipeline so the vectorizer is fit **only** on training data (prevents leakage).
- Try SVM with LinearSVC or SGDClassifier for strong baselines.

---

# Practical tips, pitfalls, and variants

- Leakage: never fit Vectorizer on full data before splitting; use Pipeline or fit on train then transform test.
- Imbalance: consider class_weight="balanced" or tune thresholds; track precision/recall/F1.
- Vocabulary size: control with min_df/max_df; include bigrams ngram_range=(1,2) for short texts.
- OOV words: unseen tokens in test are ignored (feature is 0) — normal for BoW/TF‑IDF.
- Alternatives: character n‑grams (robust to misspellings), hashing trick (FeatureHasher), word embeddings (Word2Vec/GloVe), transformer embeddings for more context (beyond this course scope).

---

# How this notebook implements it

- Dataset: Restaurant_Reviews.tsv (labeled positive/negative).
- Steps: clean → (optional stemming/stopwords) → CountVectorizer or TfidfVectorizer → train classifier (often Naive Bayes/LogReg) → confusion matrix/accuracy.
- Tip: Start with TF‑IDF + Logistic Regression or Linear SVM; then adjust min_df/max_df and ngram_range; watch precision/recall if classes are imbalanced.

---

# Quick cheat sheet

- Clean consistently (lowercase, strip punctuation).
- Vectorize with Count or TF‑IDF; fit on train only.
- Start with Logistic Regression or Linear SVM.
- Track accuracy + precision/recall/F1; use stratified splits.
- Tune ngram_range, min_df/max_df; consider bigrams.
"""

def main() -> int:
    nb_path = ROOT / "DataScience/4. Machine Learning A-Z/Part 7 - Natural Language Processing/Section 36 - Natural Language Processing/Python/natural_language_processing.ipynb"
    nb = load_notebook(nb_path)
    replace_or_prepend_theory(nb, NLP_MD)
    save_notebook(nb_path, nb)
    print(f"Replaced Theory cell in: {nb_path}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
