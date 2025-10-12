#!/usr/bin/env python3
"""
Batch-prepend tailored Theory markdown to Part 4 (Clustering) notebooks.

Edits the following notebooks in-place:
- Part 4 - Clustering
  * Section 24 - K-Means Clustering/Python/k_means_clustering.ipynb
  * Section 25 - Hierarchical Clustering/Python/hierarchical_clustering.ipynb

Behavior:
- Loads notebook JSON
- If the first cell already starts with a Theory marker ("# Theory —" or variants), skips
- Otherwise prepends a Markdown cell with tailored content
- Preserves kernelspec, language_info, outputs, execution counts

Run:
  python tools/batch_prepend_theory_part4.py
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

KMEANS_MD = """# Theory — K-Means Clustering

What it solves
- Unsupervised grouping of similar points into K clusters (e.g., customer segmentation, image color quantization, document/topic sketching).
- Produces K centers ("centroids") and assigns each point to its nearest centroid.

Plain intuition
- Place K pins on the map (initial centroids).
- Repeatedly:
  1) Assign each point to its nearest pin.
  2) Move each pin to the average (mean) of points assigned to it.
- Stop when pins stop moving much.

Algorithm (paper-and-pencil)
Given data X = {x₁,…,xₙ} in ℝᵈ and a chosen K:
1) Initialize K centroids μ₁,…,μ_K (random or k-means++).
2) Assignment step: for each point x, set cluster c(x) = argmin_k ||x − μ_k||².
3) Update step: for each cluster k, recompute μ_k = mean({x : c(x) = k}).
4) Repeat steps 2–3 until assignments stop changing or max iterations reached.

Objective (math)
- Minimize within-cluster sum of squares (WCSS, "inertia"):
  J(μ, c) = Σ_{k=1..K} Σ_{x: c(x)=k} ||x − μ_k||²
- Each update step greedily reduces J; algorithm converges to a local minimum.

Initialization (k-means++)
- Pick first centroid uniformly from data.
- For each subsequent centroid, sample points with probability proportional to squared distance to nearest existing centroid.
- Leads to better starts and often faster convergence.

Choosing K
- Elbow method: plot inertia vs K; pick K at a visible "elbow".
- Silhouette score: average silhouette across points ([-1,1]); larger is better; compare across K.
- Domain constraints: budget, interpretability, or business rules may set K.

Scaling and distance
- K-Means uses Euclidean distance; features must be on comparable scales.
- Standardize/normalize features first (e.g., StandardScaler) to avoid dominance by large-scale features.

Tiny example (paper-and-pencil)
Points: A(0,0), B(0,1), C(1,0), D(5,5), E(5,6), F(6,5); K=2
- Init μ₁≈A, μ₂≈D
- Assign: {A,B,C} → μ₁, {D,E,F} → μ₂
- Update μ₁=mean(A,B,C)=(1/3,1/3), μ₂=mean(D,E,F)≈(5.33,5.33)
- Reassign: same groups; converged.

Pros, cons, pitfalls
- Pros: Simple, fast (O(nKd) per iteration), scalable (MiniBatchKMeans).
- Cons: Requires K; assumes roughly spherical, equal-variance clusters; sensitive to outliers.
- Pitfalls: Not scaling features; poor initialization; using K-Means for non-convex shapes (e.g., moons).

How this notebook implements it
- Dataset: Mall_Customers.csv (e.g., Annual Income vs Spending Score).
- Steps: optionally scale → try different K → plot elbow → fit K-Means → visualize clusters and centroids.
- Tips: confirm with silhouette; try k-means++ init; use random_state for reproducibility.

Quick checklist
- Scale features.
- Pick K (elbow/silhouette/business).
- Initialize (k-means++), fit, visualize.
- Validate clusters (cohesion/separation, business sense).
"""

HCLUST_MD = """# Theory — Hierarchical Clustering (Agglomerative)

What it solves
- Builds a hierarchy (tree) of clusters without pre-specifying K. Useful for dendrogram inspection and multi-scale groupings.

Two flavors
- Agglomerative (bottom-up, common): start with each point as its own cluster; iteratively merge closest clusters.
- Divisive (top-down, rarer): start with all points; iteratively split.

Distance and linkage
- Distance: often Euclidean; any metric is possible (cosine, Manhattan).
- Linkage defines cluster-to-cluster distance:
  • Single: min pairwise distance (can chain; good for finding elongated clusters)
  • Complete: max pairwise distance (compact, equal-sized bias)
  • Average: mean pairwise distance (UPGMA)
  • Ward: increase in total within-cluster variance (works well for Euclidean, compact clusters)

Agglomerative algorithm (paper-and-pencil)
1) Start with n singleton clusters.
2) Compute distances between all clusters.
3) Merge the two closest clusters (by chosen linkage).
4) Update distances; repeat 2–3 until one cluster remains.
5) The sequence of merges forms a dendrogram; cutting the dendrogram at a height gives K clusters.

Complexity
- Naive agglomerative is O(n² log n) in time and O(n²) memory due to the distance matrix; suitable for up to tens of thousands of points (depending on RAM).

Choosing K (cut height)
- Dendrogram: look for large vertical gaps between merges; cut above a big jump to get well-separated clusters.
- Compare linkages: Ward tends to produce compact clusters suitable for Euclidean data.

Tiny example (sketch)
Points: A,B,C near (0,0…1), and D,E,F near (5,5…6)
- With Ward/average linkage:
  • Merge A-B, then (AB)-C → cluster1
  • Merge D-E, then (DE)-F → cluster2
  • Finally merge cluster1 and cluster2 at a large height.
- Cutting before the last merge yields 2 clusters.

Pros, cons, pitfalls
- Pros: No need to choose K upfront; dendrogram gives interpretability; flexible linkages/metrics.
- Cons: O(n²) memory/time scaling; sensitive to noise/outliers; results vary with linkage choice.
- Pitfalls: Using Ward with non-Euclidean metrics; misinterpreting small dendrogram gaps as significant.

How this notebook implements it
- Dataset: Mall_Customers.csv.
- Steps: optionally scale → compute linkage (e.g., Ward) → plot dendrogram → pick K → fit AgglomerativeClustering → visualize clusters.
- Tips: try different linkages; confirm clusters with silhouette or domain intuition.

Quick checklist
- Pick distance metric and linkage (Ward + Euclidean is a strong default).
- Inspect dendrogram to decide K.
- Fit and visualize; validate separations and business meaning.
"""

TARGETS: List[Tuple[str, str]] = [
    (
        "DataScience/4. Machine Learning A-Z/Part 4 - Clustering/Section 24 - K-Means Clustering/Python/k_means_clustering.ipynb",
        KMEANS_MD,
    ),
    (
        "DataScience/4. Machine Learning A-Z/Part 4 - Clustering/Section 25 - Hierarchical Clustering/Python/hierarchical_clustering.ipynb",
        HCLUST_MD,
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
