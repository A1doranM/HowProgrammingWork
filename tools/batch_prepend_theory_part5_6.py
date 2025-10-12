#!/usr/bin/env python3
"""
Batch-prepend tailored Theory markdown to selected notebooks (Parts 5 and 6).

Edits the following notebooks in-place:
- Part 5 - Association Rule Learning
  * Section 28 - Apriori/Python/apriori.ipynb
  * Section 29 - Eclat/Python/eclat.ipynb
- Part 6 - Reinforcement Learning
  * Section 32 - UCB/Python/upper_confidence_bound.ipynb
  * Section 33 - Thompson Sampling/Python/thompson_sampling.ipynb

Behavior:
- Loads notebook JSON
- If the first cell already starts with a Theory marker ("# Theory —" or variants), skips
- Otherwise prepends a Markdown cell with tailored content
- Preserves kernelspec, language_info, outputs, execution counts

Run:
  python tools/batch_prepend_theory_part5_6.py
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

APR_MD = """# Theory — Apriori (Association Rule Learning)

What it solves
- Find product combinations that often appear together in shopping baskets, web sessions, or events.
- Turn those combinations into “if A then likely B” rules for cross-sell, recommendations, layout, or alerts.

Plain intuition
- If a larger set of items is frequent, all its subsets must also be frequent.
- So we can grow frequent sets level-by-level (1-item → 2-item → 3-item …), pruning candidates early using this property.

Tiny shop example
Transactions (5 baskets):
- T1: {milk, bread, eggs}
- T2: {milk, bread}
- T3: {bread, butter}
- T4: {milk, eggs}
- T5: {bread, eggs}

Minimum support: 2 of 5 (40%)

Step-by-step (paper-and-pencil)
1) Count 1-itemsets:
   - milk: 3 (T1,T2,T4), bread: 4 (T1,T2,T3,T5), eggs: 3 (T1,T4,T5), butter: 1 (T3)
   Keep frequent singles: {milk, bread, eggs}
2) Generate 2-item candidates from survivors:
   - {milk,bread}, {milk,eggs}, {bread,eggs}
   Count each:
   - {milk,bread}: 2 (T1,T2), {milk,eggs}: 2 (T1,T4), {bread,eggs}: 2 (T1,T5)
   All frequent → keep all three pairs
3) Try 3-item candidate {milk,bread,eggs}:
   - Appears once (T1) → not frequent
Stop. Frequent itemsets: singles (except butter) and all three pairs.

From frequent itemsets to rules
- For pair {A,B}, build A → B and B → A.
- Metrics:
  - support(X) = count(X)/N
  - confidence(A→B) = support(A∪B)/support(A)
  - lift(A→B) = confidence(A→B) / support(B)
    • lift > 1: A and B co-occur more than chance; good signal.

Core math and assumptions
- Apriori searches the power set in a breadth-first manner with anti-monotonic support:
  If X is frequent ⇒ all subsets of X are frequent.
- No probabilistic assumptions; purely frequency-based co-occurrence.

Hyperparameters and tuning
- min_support: too low → explosion of candidates; too high → miss useful combos.
- min_confidence, min_lift when filtering rules after frequent itemsets are found.
- Consider separate mins for larger itemset sizes.

Pros, cons, pitfalls
- Pros: Simple, explainable; easy pruning.
- Cons: Multiple passes over data; candidate explosion on dense/low-support data.
- Pitfalls: Spurious rules when an item is globally common (lift helps catch this).

How this notebook implements it
- Dataset: Market_Basket_Optimisation.csv (each row is a basket; columns are items purchased).
- Steps: load data → transform to transactions → run Apriori → filter by min_support/min_conf/lift → inspect top rules.
- Tips: tune thresholds to keep the result set useful and manageable.

Quick checklist
- Pick min_support (e.g., ≥ 1% or “≥ 100 baskets”).
- Mine frequent itemsets level-by-level; prune using Apriori property.
- Build rules from frequent sets; filter by confidence and lift.
- Sanity check results for seasonality, promotions, or catalog idiosyncrasies.
"""

ECLAT_MD = """# Theory — Eclat (Association Rule Learning)

What it solves
- Same goal as Apriori: find frequent itemsets. Eclat is often faster on denser datasets by using vertical data format.

Plain intuition (vertical TID sets)
- Build item → {transaction IDs} once.
- To get support({A,B}), intersect TID(A) ∩ TID(B) and take its size.
- Grow itemsets depth-first by intersecting TID sets; prune when intersection is too small.

Tiny shop example (same 5 baskets)
- milk → {1,2,4}
- bread → {1,2,3,5}
- eggs → {1,4,5}
- butter → {3}
Drop butter (support 1).

Depth-first intersections
- Prefix milk ({1,2,4}):
  * milk∩bread = {1,2} (2) → frequent
  * milk∩eggs  = {1,4} (2) → frequent
  * Extend deeper: {milk,bread}∩eggs = {1} (1) → stop branch
- Prefix bread ({1,2,3,5}):
  * bread∩eggs = {1,5} (2) → frequent
- Prefix eggs: nothing after eggs; stop.
Frequent itemsets match Apriori result.

Core idea and complexity
- One full scan to build vertical TID sets; then fast set intersections.
- Depth-first recursion often uses less memory than breadth-first candidate generation.

Hyperparameters and tuning
- min_support threshold as in Apriori.
- Ordering of items can affect performance; try support-descending ordering.

Pros, cons, pitfalls
- Pros: Fewer full scans; fast intersections; great on moderately dense data.
- Cons: Large TID sets can stress memory; sparse data may still be slow.
- Pitfalls: Very low min_support can blow up recursion depth and memory.

How this notebook implements it
- Dataset: Market_Basket_Optimisation.csv.
- Steps: transactions → vertical map item→TIDset → recursive intersections → frequent itemsets → rules (support/confidence/lift).

Quick checklist
- Build item→TIDset once.
- Intersect to grow {A,B}, {A,B,C}, …
- Prune on min_support.
- Generate rules and filter by confidence and lift.
"""

UCB_MD = """# Theory — Upper Confidence Bound (UCB) for Multi‑Armed Bandits

What it solves
- Choose the best option (e.g., ad/variant) when true success rates are unknown and must be learned online.
- Balance exploration (try uncertain options) and exploitation (choose the current best).

Setting
- K arms (ads). Each round t = 1…T, pick one arm; observe binary reward (click=1/no click=0).
- Goal: maximize cumulative reward (clicks) with minimal regret vs. the (unknown) best arm.

Key idea
- For each arm i, maintain:
  * n_i(t): times arm i was chosen
  * x̄_i(t): average reward of arm i
- Choose the arm with the highest UCB:
  UCB_i(t) = x̄_i(t) + exploration_term
  exploration_term ≈ sqrt((3/2) * ln t / n_i(t))
  (Constant factor varies by derivation; ln t growth encourages exploration of under-sampled arms.)

Algorithm (paper-and-pencil)
1) Initialization: pull each arm once to get a starting estimate.
2) For round t = K+1…T:
   - For each arm i: if n_i=0, set UCB_i = +∞ (force at least one pull).
   - Else compute:
       x̄_i = (sum of rewards for i) / n_i
       delta_i = sqrt((3/2) * ln t / n_i)
       UCB_i = x̄_i + delta_i
   - Pick i* = argmax UCB_i; observe reward r∈{0,1}; update n_i* and x̄_i*.
3) Repeat.

Why this works (intuition)
- The second term is a confidence “bonus” that shrinks as n_i grows.
- Early on, uncertain arms get boosted; over time, the best true-CTR arm dominates.

Tiny example (3 ads, 10 rounds)
- Rounds 1–3: pull each ad once.
- Round 4+: compute UCB for each, pick the max; update counts and means; repeat.
- You’ll see the algorithm drift toward the arm with the highest observed CTR while still testing others occasionally.

Pros, cons, pitfalls
- Pros: No learning rate; strong theoretical guarantees; simple to implement.
- Cons: Assumes stationarity (true CTRs don’t change). Can be slow to adapt to nonstationary environments.
- Pitfalls: Forgetting to initialize each arm at least once; comparing different time horizons across variants.

How this notebook implements it
- Dataset: Ads_CTR_Optimisation.csv (simulated clicks per round).
- Loop over T rounds, compute UCB for each ad, select the max, accumulate rewards.
- Visualize selections (histogram) to see which ad wins.

Quick checklist
- Pull each arm at least once.
- Use UCB_i = x̄_i + sqrt((3/2) * ln t / n_i).
- Track cumulative reward and selections per arm.
- If nonstationary, consider sliding windows or other bandit variants.
"""

THOMPSON_MD = """# Theory — Thompson Sampling (Bayesian Bandits)

What it solves
- Same bandit problem as UCB: choose the best option while learning CTRs online.
- Thompson Sampling uses Bayesian posterior sampling to balance exploration and exploitation.

Setting
- K arms (ads). Binary rewards (click / no click). We model each arm’s CTR p_i with a Beta prior.

Core idea (Beta–Binomial)
- Prior for each arm i: Beta(α_i, β_i), often α=1, β=1 (uniform).
- After observing s successes (clicks) and f failures (no clicks), posterior is Beta(α_i+s, β_i+f).
- At each round:
  1) For each arm i, sample θ_i ~ Beta(α_i, β_i).
  2) Choose arm with largest sampled θ_i.
  3) Observe reward r∈{0,1}; update:
     α_i ← α_i + r
     β_i ← β_i + (1 - r)

Why this works (intuition)
- If an arm looks promising, its sampled θ tends to be larger (exploitation).
- Arms with fewer observations have wider posteriors, leading to occasional high samples (exploration).
- Naturally balances try-new vs. use-best without explicit confidence bonuses.

Tiny example (3 ads)
- Initialize all α=1, β=1.
- Each round, draw θ from Beta for each ad, pick the max, update α/β with the observed click.
- Over time, the best ad accumulates α faster and gets picked more often.

Hyperparameters
- Prior (α0, β0): encodes belief before data; α0=β0=1 is uninformative.
- In highly sparse click settings, slightly informative priors (e.g., α0=1, β0=2) can stabilize early rounds.

Pros, cons, pitfalls
- Pros: Very effective and simple; adapts to uncertainty naturally; competitive regret bounds.
- Cons: Assumes stationarity unless you add mechanisms (e.g., discounting).
- Pitfalls: Forgetting that early random fluctuations can look “lucky”; ensure long enough horizon.

How this notebook implements it
- Dataset: Ads_CTR_Optimisation.csv.
- For each round: sample θ from current Beta for each ad, pick the best, update α/β from the observed reward.
- Visualize final selections to see which ad wins.

Quick checklist
- Initialize α=1, β=1 (or a sensible prior).
- Sample θ_i ~ Beta(α_i, β_i), pick argmax.
- Update α/β with observed reward.
- Consider prior tuning or discounting if environment drifts.
"""

TARGETS: List[Tuple[str, str]] = [
    (
        "DataScience/4. Machine Learning A-Z/Part 5 - Association Rule Learning/Section 28 - Apriori/Python/apriori.ipynb",
        APR_MD,
    ),
    (
        "DataScience/4. Machine Learning A-Z/Part 5 - Association Rule Learning/Section 29 - Eclat/Python/eclat.ipynb",
        ECLAT_MD,
    ),
    (
        "DataScience/4. Machine Learning A-Z/Part 6 - Reinforcement Learning/Section 32 - Upper Confidence Bound (UCB)/Python/upper_confidence_bound.ipynb",
        UCB_MD,
    ),
    (
        "DataScience/4. Machine Learning A-Z/Part 6 - Reinforcement Learning/Section 33 - Thompson Sampling/Python/thompson_sampling.ipynb",
        THOMPSON_MD,
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
