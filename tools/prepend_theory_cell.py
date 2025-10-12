#!/usr/bin/env python3
"""
Prepend a Markdown theory cell to a Jupyter notebook (.ipynb).

Usage:
  python tools/prepend_theory_cell.py <path_to_notebook.ipynb> <path_to_markdown.md>

Behavior:
- Loads the notebook JSON (nbformat v4+)
- If the first cell already starts with the marker heading (e.g., "# Theory —"),
  it will skip to avoid duplication.
- Otherwise, it prepends a new Markdown cell containing the provided markdown content.
- Preserves all existing metadata, kernelspec, outputs, and execution counts.

Notes:
- This script does not execute the notebook; it only edits the JSON structure.
- It writes the notebook back to the same file path.

Exit codes:
- 0 on success
- non-zero on failure
"""
import json
import sys
from pathlib import Path

MARKER_PREFIXES = (
    "# Theory —",
    "# Theory -",
    "# Theory:",
    "# Теория —",  # allow optional localized heading
)

def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        # Fallback to latin-1 if needed
        return path.read_text(encoding="latin-1")

def load_notebook(nb_path: Path) -> dict:
    with nb_path.open("r", encoding="utf-8") as f:
        return json.load(f)

def save_notebook(nb_path: Path, nb: dict) -> None:
    tmp_path = nb_path.with_suffix(".ipynb.tmp")
    with tmp_path.open("w", encoding="utf-8") as f:
        json.dump(nb, f, ensure_ascii=False, indent=1)
        f.write("\n")
    tmp_path.replace(nb_path)

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

def make_markdown_cell(content: str) -> dict:
    # Normalize line endings
    content = content.replace("\r\n", "\n").replace("\r", "\n")
    return {
        "cell_type": "markdown",
        "metadata": {},
        "source": content,
    }

def main(argv):
    if len(argv) != 3:
        print("Usage: python tools/prepend_theory_cell.py <notebook.ipynb> <theory.md>", file=sys.stderr)
        return 2

    nb_path = Path(argv[1]).resolve()
    md_path = Path(argv[2]).resolve()

    if not nb_path.exists():
        print(f"Notebook not found: {nb_path}", file=sys.stderr)
        return 3
    if not md_path.exists():
        print(f"Markdown content not found: {md_path}", file=sys.stderr)
        return 4

    try:
        nb = load_notebook(nb_path)
    except Exception as e:
        print(f"Failed to read notebook JSON: {e}", file=sys.stderr)
        return 5

    try:
        content = read_text(md_path)
    except Exception as e:
        print(f"Failed to read markdown: {e}", file=sys.stderr)
        return 6

    if "cells" not in nb or not isinstance(nb["cells"], list):
        print("Invalid notebook structure: missing 'cells' array", file=sys.stderr)
        return 7

    if already_has_theory(nb):
        print("Theory cell already present at top; skipping modification.")
        return 0

    theory_cell = make_markdown_cell(content)
    nb["cells"] = [theory_cell] + nb["cells"]

    try:
        save_notebook(nb_path, nb)
    except Exception as e:
        print(f"Failed to save notebook: {e}", file=sys.stderr)
        return 8

    print(f"Prepended theory cell to: {nb_path}")
    return 0

if __name__ == "__main__":
    sys.exit(main(sys.argv))
