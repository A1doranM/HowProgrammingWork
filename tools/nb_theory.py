#!/usr/bin/env python3
"""
Reusable helpers for inserting or replacing a top-level 'Theory' markdown cell
in Jupyter notebooks (.ipynb, nbformat v4+).

API:
- load_notebook(nb_path: Path) -> dict
- save_notebook(nb_path: Path, nb: dict) -> None
- is_theory_heading(text: str) -> bool
- replace_or_prepend_theory(nb: dict, markdown: str) -> None
    If the first cell is a markdown cell starting with a Theory heading,
    replace its source with `markdown`. Otherwise, prepend a new markdown cell.

Notes:
- Preserves kernelspec, language_info, outputs, and execution counts.
- Normalizes line endings for markdown content.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Dict

# Accepted headings for top Theory cell detection
MARKER_PREFIXES = (
    "# Theory —",
    "# Theory -",
    "# Theory:",
    "# Теория —",  # localized variant
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

def is_theory_heading(text: str) -> bool:
    t = text.lstrip()
    return any(t.startswith(p) for p in MARKER_PREFIXES)

def replace_or_prepend_theory(nb: Dict, markdown: str) -> None:
    if "cells" not in nb or not isinstance(nb["cells"], list):
        raise ValueError("Invalid notebook structure: missing 'cells' array")
    # Normalize new markdown content line endings
    markdown = markdown.replace("\r\n", "\n").replace("\r", "\n")
    top_is_theory = False
    if nb["cells"]:
        first = nb["cells"][0]
        if first.get("cell_type") == "markdown":
            src = first.get("source", "")
            if isinstance(src, list):
                src_text = "".join(src)
            else:
                src_text = str(src)
            top_is_theory = is_theory_heading(src_text)

    if top_is_theory:
        # Replace source of the first markdown cell
        nb["cells"][0]["source"] = markdown
    else:
        # Prepend a new markdown cell
        theory_cell = {"cell_type": "markdown", "metadata": {}, "source": markdown}
        nb["cells"] = [theory_cell] + nb["cells"]
