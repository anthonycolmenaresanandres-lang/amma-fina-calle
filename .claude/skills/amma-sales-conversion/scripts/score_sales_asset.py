#!/usr/bin/env python3
"""Directional AMMA sales-asset scorer with hard honesty and dark-pattern gates."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


DIMENSIONS = {
    "customer_recognition": [r"\byou\b", r"\byour\b", r"\busted\b", r"\bsu\b"],
    "workflow_problem": [r"update", r"waiting", r"stale", r"generic", r"headache", r"dolor", r"tiempo", r"complic"],
    "practical_outcome": [r"clear", r"clean", r"easy", r"simple", r"control", r"memorable", r"claro", r"fácil", r"marca"],
    "verified_proof": [r"colattao", r"live demo", r"working client", r"case stud", r"prueba", r"en vivo"],
    "friction_reduction": [r"nothing to download", r"no download", r"we handle", r"two minutes", r"lightweight", r"sin descargar", r"nos encargamos"],
    "transparent_scope": [r"does not", r"not included", r"demo", r"pilot", r"separate", r"no payment", r"no pos", r"no incluye", r"piloto"],
    "risk_reduction": [r"pilot", r"fixed quote", r"in writing", r"written scope", r"sin compromiso", r"precio fijo", r"por escrito"],
    "specific_action": [r"scan", r"reply", r"request a build", r"send a pilot", r"schedule", r"escanee", r"responda", r"agend"],
    "owner_autonomy": [r"owner page", r"private page", r"you control", r"update your own", r"página privada", r"usted controla", r"actualizar su propio"],
    "measurement_ready": [r"hook[_ -]?id", r"proof[_ -]?id", r"cta[_ -]?id", r"experiment[_ -]?id"],
}

BLOCKING_PATTERNS = {
    "guaranteed outcome": r"\bguarantee(?:d|s)?\b|\bventas garantizadas\b",
    "unsupported retention outcome": r"turn first[- ]timers into regulars|bring them back|keeps customers|los hace volver|retiene a sus clientes",
    "unsupported numeric lift": r"\b(?:double|triple) (?:sales|revenue|traffic)\b|\b\d+% (?:more|increase|lift)\b",
    "fabricated scarcity or demand": r"only \d+ left|\bcountdown\b|selling fast|everyone is buying|most owners (?:buy|choose|use)",
    "future capability presented as current": r"collectible loyalty|backend loyalty|online ordering is live|payments are live",
}

FIELD_PLACEHOLDERS = {
    "placeholder contact": r"\[\s*(?:your )?(?:email|phone|instagram|contact)\b[^\]]*\]",
    "template placeholder": r"\[(?:name|business name|link|date|time)\]",
    "lorem ipsum": r"lorem ipsum",
}

WARNING_PATTERNS = {
    "overbroad privacy wording": r"\bno data collection\b|\bsin recolección de datos\b",
    "vague social proof": r"\bmost (?:customers|restaurants|owners)\b|\bla mayoría de (?:clientes|restaurantes|dueños)\b",
    "psychological labeling": r"\bpersonality type\b|\bsusceptib|\bvulnerable owner\b|\bmanipulat(?:e|ion)\b",
}


def matches_any(patterns: list[str], text: str) -> bool:
    return any(re.search(pattern, text, re.IGNORECASE) for pattern in patterns)


def score_text(text: str, mode: str) -> dict:
    dimensions = {name: matches_any(patterns, text) for name, patterns in DIMENSIONS.items()}
    score = sum(10 for present in dimensions.values() if present)
    blocking = [label for label, pattern in BLOCKING_PATTERNS.items() if re.search(pattern, text, re.IGNORECASE)]
    if mode == "field":
        blocking.extend(label for label, pattern in FIELD_PLACEHOLDERS.items() if re.search(pattern, text, re.IGNORECASE))
    warnings = [label for label, pattern in WARNING_PATTERNS.items() if re.search(pattern, text, re.IGNORECASE)]
    question_count = len(re.findall(r"\?", text)) + len(re.findall(r"¿", text))
    if question_count > 2:
        warnings.append("multiple questions may create competing calls to action")
    return {
        "mode": mode,
        "score": score,
        "score_use": "directional checklist only; not a conversion prediction",
        "dimensions": dimensions,
        "blocking_issues": sorted(set(blocking)),
        "warnings": sorted(set(warnings)),
        "field_ready": mode == "field" and not blocking,
    }


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser(description=__doc__)
    source = result.add_mutually_exclusive_group(required=True)
    source.add_argument("--file")
    source.add_argument("--text")
    result.add_argument("--mode", choices=["draft", "field"], default="draft")
    result.add_argument("--json", action="store_true")
    return result


def main() -> int:
    args = parser().parse_args()
    text = Path(args.file).read_text(encoding="utf-8-sig") if args.file else args.text
    result = score_text(text, args.mode)
    result["source"] = args.file or "inline"
    if args.json:
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        for key, value in result.items():
            print(f"{key}: {value}")
    return 2 if result["blocking_issues"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
