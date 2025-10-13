#!/usr/bin/env python3
"""
Fix LaTeX delimiters in Jupyter notebooks' markdown cells.

Goal:
- Ensure all LaTeX is wrapped with $$ ... $$ (display math), per requirement.
- Convert \[ ... \] and \( ... \) and single $ ... $ to $$ ... $$.
- Convert bracket-only math blocks:
    lines with only "[" then formula lines then only "]"
  into $$ ... $$ blocks.
- Preserve existing $$ ... $$ blocks unchanged (no double-wrapping).
- Do NOT alter code fences (``` ... ``` or ~~~ ... ~~~) or inline code `...`.

Usage:
  python tools/fix_latex_wrapping.py --root "DataScience/4. Machine Learning A-Z" --dry-run
  python tools/fix_latex_wrapping.py --root "DataScience/4. Machine Learning A-Z" --apply

Notes:
- Writes notebooks back only if changes were made (unless --dry-run).
- Counts replacements per file and prints a summary.
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Dict, List, Tuple

# Regex helpers
FENCE_RE = re.compile(r"(```.*?```|~~~.*?~~~)", re.DOTALL)
INLINE_CODE_RE = re.compile(r"`[^`]*`", re.DOTALL)
DOLLAR_BLOCK_RE = re.compile(r"\$\$(.+?)\$\$", re.DOTALL)

# Bracket-only block: a line with just '[' then content then a line with just ']'
BRACKET_BLOCK_RE = re.compile(
    r"(?m)^[ \t]*\[[ \t]*\r?\n([\s\S]*?)\r?\n[ \t]*\][ \t]*$"
)

# Display math \[ ... \] (may span multiple lines)
DISPLAY_BRACKETS_RE = re.compile(r"\\\[(.+?)\\\]", re.DOTALL)

# Inline math \( ... \)
INLINE_PARENS_RE = re.compile(r"\\\((.+?)\\\)", re.DOTALL)

# Single-dollar inline math $ ... $ but NOT $$ ... $$
SINGLE_DOLLAR_RE = re.compile(r"(?<!\$)\$(?!\$)(.+?)(?<!\$)\$(?!\$)", re.DOTALL)


def load_notebook(path: Path) -> Dict:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def save_notebook(path: Path, nb: Dict) -> None:
    tmp = path.with_suffix(".ipynb.tmp")
    with tmp.open("w", encoding="utf-8") as f:
        json.dump(nb, f, ensure_ascii=False, indent=1)
        f.write("\n")
    tmp.replace(path)


def _protect_placeholders(text: str) -> Tuple[str, Dict[str, str]]:
    """
    Replace code fences, inline code, and $$...$$ blocks with placeholders.
    Return modified text and a mapping of placeholder->original.
    """
    placeholders: Dict[str, str] = {}

    # 1) Protect code fences first
    def _subst_fence(m):
        key = f"__FENCE_{len(placeholders)}__"
        placeholders[key] = m.group(0)
        return key

    text = FENCE_RE.sub(_subst_fence, text)

    # 2) Protect inline code (backticks)
    def _subst_inline(m):
        key = f"__INLINE_{len(placeholders)}__"
        placeholders[key] = m.group(0)
        return key

    text = INLINE_CODE_RE.sub(_subst_inline, text)

    # 3) Protect existing $$...$$ math blocks
    def _subst_dollar_block(m):
        key = f"__DOLLARBLOCK_{len(placeholders)}__"
        placeholders[key] = m.group(0)
        return key

    text = DOLLAR_BLOCK_RE.sub(_subst_dollar_block, text)

    return text, placeholders


def _restore_placeholders(text: str, placeholders: Dict[str, str]) -> str:
    # Restore in reverse insertion order (dict preserves insertion order in Python 3.7+)
    for key in reversed(list(placeholders.keys())):
        text = text.replace(key, placeholders[key])
    return text


def fix_markdown(text: str) -> Tuple[str, Dict[str, int]]:
    """
    Apply LaTeX delimiter fixes to a markdown string, returning new_text and counts.
    """
    original = text

    # Normalize line endings to \n
    text = text.replace("\r\n", "\n").replace("\r", "\n")

    # Protect code fences, inline code, and existing $$...$$
    text, placeholders = _protect_placeholders(text)

    counts = {"bracket_blocks": 0, "display_brackets": 0, "inline_parens": 0, "single_dollars": 0}

    # 1) Convert bracket-only blocks:
    def repl_bracket_block(m):
        counts["bracket_blocks"] += 1
        inner = m.group(1).strip("\n")
        return f"$$\n{inner}\n$$"

    # Use a loop to catch multiple separate bracket blocks (sub handles all; still count via callback)
    text = BRACKET_BLOCK_RE.sub(repl_bracket_block, text)

    # 2) Convert \[ ... \] → $$ ... $$
    def repl_display(m):
        counts["display_brackets"] += 1
        inner = m.group(1).strip()
        # Put on dedicated lines
        return f"$$\n{inner}\n$$"

    text = DISPLAY_BRACKETS_RE.sub(repl_display, text)

    # 3) Convert \( ... \) → $$ ... $$
    def repl_inline_parens(m):
        counts["inline_parens"] += 1
        inner = m.group(1).strip()
        return f"$${inner}$$"

    text = INLINE_PARENS_RE.sub(repl_inline_parens, text)

    # 4) Convert single $ ... $ → $$ ... $$
    def repl_single_dollar(m):
        counts["single_dollars"] += 1
        inner = m.group(1).strip()
        return f"$${inner}$$"

    text = SINGLE_DOLLAR_RE.sub(repl_single_dollar, text)

    # Restore placeholders
    text = _restore_placeholders(text, placeholders)

    changed = text != original
    return (text if changed else original), counts


def process_notebook(path: Path, apply: bool) -> Tuple[bool, Dict[str, int]]:
    """
    Process a single .ipynb file. Return (changed?, counts_sum)
    """
    nb = load_notebook(path)
    changed_any = False
    sum_counts = {"bracket_blocks": 0, "display_brackets": 0, "inline_parens": 0, "single_dollars": 0}

    cells: List[Dict] = nb.get("cells", [])
    for idx, cell in enumerate(cells):
        if cell.get("cell_type") != "markdown":
            continue
        src = cell.get("source", "")
        if isinstance(src, list):
            text = "".join(src)
        else:
            text = str(src)

        new_text, counts = fix_markdown(text)

        # Accumulate counts
        for k, v in counts.items():
            sum_counts[k] += v

        if new_text != text:
            changed_any = True
            # Write back; keep as string to avoid list vs string fragmentation
            cell["source"] = new_text

    if apply and changed_any:
        save_notebook(path, nb)

    return changed_any, sum_counts


def walk_and_process(root: Path, apply: bool) -> Tuple[int, int, Dict[str, int]]:
    files = list(root.rglob("*.ipynb"))
    total = len(files)
    changed = 0
    totals = {"bracket_blocks": 0, "display_brackets": 0, "inline_parens": 0, "single_dollars": 0}

    for nb_path in files:
        ch, counts = process_notebook(nb_path, apply)
        if ch:
            changed += 1
        for k, v in counts.items():
            totals[k] += v
        action = "Would change" if not apply and ch else ("Changed" if apply and ch else "No change")
        print(f"{action}: {nb_path}")

    return total, changed, totals


def main():
    ap = argparse.ArgumentParser(description="Fix LaTeX delimiters in notebook markdown cells.")
    ap.add_argument("--root", type=str, required=True, help="Root directory to search for .ipynb files")
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--dry-run", action="store_true", help="Show what would change without writing files")
    g.add_argument("--apply", action="store_true", help="Apply changes to files")
    args = ap.parse_args()

    root = Path(args.root).resolve()
    if not root.exists():
        print(f"Root path not found: {root}")
        return 2

    total, changed, totals = walk_and_process(root, apply=args.apply)

    print("\nSummary:")
    print(f"  Notebooks scanned: {total}")
    print(f"  Notebooks {'changed' if args.apply else 'that would change'}: {changed}")
    print("  Replacements:")
    for k in ["bracket_blocks", "display_brackets", "inline_parens", "single_dollars"]:
        print(f"    {k}: {totals[k]}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
