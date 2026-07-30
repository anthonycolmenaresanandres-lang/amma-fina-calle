#!/usr/bin/env python3
"""Route AMMA operating work and learn from verified, non-PII outcomes."""

from __future__ import annotations

import argparse
import json
import re
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable


APPROVAL_PATTERNS = {
    "external_write": r"\b(send|publish|push|merge|deploy|invite|contact|message|email\s+them)\b|\bpost\s+(to|on)\b",
    "money": r"\b(pay|purchase|buy|spend|charge|subscribe|refund)\b",
    "secrets": r"\b(secret|api\s*key|password|credential|access\s*token)\b",
    "access": r"\b(grant|revoke|permission|authorize|add\s+user|create\s+account)\b",
    "destructive": r"\b(delete|remove|wipe|drop|destroy|reset|uninstall)\b",
    "production": r"\b(production|prod|live|main\s+branch)\b",
}

SENSITIVE_PATTERN = re.compile(
    r"(?:[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|\b(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}\b|"
    r"\b(?:sk|pk)_(?:live|test)_[A-Za-z0-9]+\b|\b(?:api[_ -]?key|password|secret|token)\s*[:=])",
    re.IGNORECASE,
)


def normalize(text: str) -> str:
    return re.sub(r"[^a-z0-9']+", " ", text.lower()).strip()


def load_map(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def skill_roots(project_root: Path) -> list[Path]:
    home = Path.home()
    roots = [
        project_root / ".agents" / "skills",
        project_root / ".claude" / "skills",
        home / ".agents" / "skills",
        home / ".claude" / "skills",
        home / ".codex" / "skills",
        home / ".codex" / "skills" / ".system",
    ]
    plugin_cache = home / ".codex" / "plugins" / "cache"
    if plugin_cache.exists():
        roots.extend(plugin_cache.glob("*/*/*/skills"))
    return roots


def parse_skill_name(path: Path) -> str | None:
    try:
        head = path.read_text(encoding="utf-8-sig")[:4096]
    except (OSError, UnicodeError):
        return None
    match = re.search(r"(?m)^name:\s*[\"']?([^\r\n\"']+)", head)
    return match.group(1).strip() if match else None


def discover_skills(roots: Iterable[Path]) -> set[str]:
    names: set[str] = set()
    for root in roots:
        if not root.exists():
            continue
        for skill_file in root.rglob("SKILL.md"):
            name = parse_skill_name(skill_file)
            if name:
                names.add(name.lower())
    return names


def score_workflow(query: str, workflow: dict) -> tuple[int, list[str]]:
    normalized = normalize(query)
    tokens = set(normalized.split())
    score = 0
    reasons: list[str] = []
    for phrase in workflow["triggers"]:
        clean = normalize(phrase)
        phrase_tokens = set(clean.split())
        if clean and clean in normalized:
            score += 12 + len(phrase_tokens)
            reasons.append(f"phrase:{phrase}")
        else:
            overlap = len(tokens & phrase_tokens)
            if overlap >= min(2, len(phrase_tokens)):
                score += overlap * 2
    matched_keywords = [word for word in workflow["keywords"] if word in tokens]
    score += 2 * len(matched_keywords)
    if matched_keywords:
        reasons.append("keywords:" + ",".join(matched_keywords))
    return score, reasons


def reorder_specialists(workflow_name: str, query: str, candidates: list[str]) -> list[str]:
    normalized = normalize(query)
    if workflow_name == "revenue_power_hour":
        if any(phrase in normalized for phrase in ["existing list", "lead tracker", "pipeline", "grounded leads"]):
            return ["prioritize-accounts"] + [item for item in candidates if item != "prioritize-accounts"]
        if any(phrase in normalized for phrase in [
            "pitch", "flyer", "objection", "follow up", "follow-up", "demo script",
            "close", "closing", "conversion", "sales material", "customer psychology",
        ]):
            return ["amma-sales-conversion"] + [item for item in candidates if item != "amma-sales-conversion"]
    if workflow_name == "finance_review":
        if any(word in normalized.split() for word in ["integrate", "webhook", "checkout", "subscription"]):
            return ["payments"] + [item for item in candidates if item != "payments"]
    return candidates


def approval_gates(query: str) -> list[str]:
    return [name for name, pattern in APPROVAL_PATTERNS.items() if re.search(pattern, query, re.IGNORECASE)]


def route(query: str, operating_map: dict, installed: set[str]) -> dict:
    ranked = []
    for name, workflow in operating_map["workflows"].items():
        score, reasons = score_workflow(query, workflow)
        ranked.append((score, name, reasons, workflow))
    ranked.sort(key=lambda item: (-item[0], item[1]))
    best_score, name, reasons, workflow = ranked[0]
    next_score = ranked[1][0] if len(ranked) > 1 else 0
    if best_score >= 16 and best_score - next_score >= 3:
        confidence = "high"
    elif best_score >= 8:
        confidence = "medium"
    else:
        confidence = "low"

    if confidence == "low":
        return {
            "query": query,
            "decision": "inspect",
            "workflow": None,
            "role": None,
            "factory_stage": None,
            "confidence": confidence,
            "primary_skill": None,
            "alternate_skill": None,
            "missing_skills": [],
            "evidence_sources": ["OPERATIONS/HANDOFF_LOG.md", "OPERATIONS/CODEX_QUEUE.md"],
            "kpi": None,
            "finish_minutes": None,
            "approval_gates": approval_gates(query),
            "reason": "No AMMA workflow cleared the confidence threshold.",
        }

    candidates = reorder_specialists(name, query, list(workflow["skills"]))
    available = [candidate for candidate in candidates if candidate.lower() in installed]
    missing = [candidate for candidate in candidates if candidate.lower() not in installed]
    return {
        "query": query,
        "decision": "use" if available else "capability_gap",
        "workflow": name,
        "role": workflow["role"],
        "factory_stage": workflow["factory_stage"],
        "confidence": confidence,
        "primary_skill": available[0] if available else None,
        "alternate_skill": available[1] if len(available) > 1 else None,
        "missing_skills": missing,
        "evidence_sources": workflow["evidence_sources"],
        "kpi": workflow["kpi"],
        "finish_minutes": workflow["finish_minutes"],
        "approval_gates": approval_gates(query),
        "reason": "; ".join(reasons) or f"score:{best_score}",
    }


def default_state_file() -> Path:
    return Path.home() / ".codex" / "state" / "amma-business-intelligence" / "outcomes.jsonl"


def reject_sensitive(values: Iterable[str]) -> None:
    for value in values:
        if SENSITIVE_PATTERN.search(value):
            raise ValueError("Outcome fields must not contain PII, secrets, credentials, email addresses, or phone numbers.")
        if len(value) > 500:
            raise ValueError("Outcome fields must be 500 characters or fewer.")


def record_outcome(args: argparse.Namespace, operating_map: dict) -> dict:
    if args.workflow not in operating_map["workflows"]:
        raise ValueError(f"Unknown workflow: {args.workflow}")
    values = [args.workflow, args.recommended_skill, args.actual_skill, args.kpi_result, args.lesson]
    reject_sensitive(values)
    state_file = Path(args.state_file).expanduser()
    state_file.parent.mkdir(parents=True, exist_ok=True)
    row = {
        "recorded_at": datetime.now(timezone.utc).isoformat(),
        "workflow": args.workflow,
        "recommended_skill": args.recommended_skill,
        "actual_skill": args.actual_skill,
        "success": args.success == "yes",
        "kpi_result": args.kpi_result,
        "lesson": args.lesson,
    }
    with state_file.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(row, ensure_ascii=True, sort_keys=True) + "\n")
    return {"recorded": True, "state_file": str(state_file), "outcome": row}


def read_outcomes(state_file: Path) -> list[dict]:
    if not state_file.exists():
        return []
    rows = []
    for line in state_file.read_text(encoding="utf-8").splitlines():
        try:
            rows.append(json.loads(line))
        except json.JSONDecodeError:
            continue
    return rows


def learning_report(state_file: Path) -> dict:
    grouped: dict[str, list[dict]] = defaultdict(list)
    for row in read_outcomes(state_file):
        grouped[row.get("workflow", "unknown")].append(row)
    workflows = {}
    for workflow, rows in sorted(grouped.items()):
        samples = len(rows)
        successes = sum(bool(row.get("success")) for row in rows)
        corrections = sum(row.get("recommended_skill") != row.get("actual_skill") for row in rows)
        success_rate = successes / samples if samples else 0.0
        correction_rate = corrections / samples if samples else 0.0
        if samples < 3:
            recommendation = "insufficient_evidence"
        elif success_rate < 0.7 or correction_rate > 0.3:
            recommendation = "review_route"
        else:
            recommendation = "keep_monitoring"
        workflows[workflow] = {
            "samples": samples,
            "success_rate": round(success_rate, 3),
            "correction_rate": round(correction_rate, 3),
            "recommendation": recommendation,
        }
    return {
        "state_file": str(state_file),
        "total_verified_outcomes": sum(len(rows) for rows in grouped.values()),
        "workflows": workflows,
        "routing_change_authorized": False,
        "rule": "Review recommendations and approve a tested map change; never self-modify from outcome data.",
    }


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser(description=__doc__)
    result.add_argument("--map", dest="map_path", default=str(Path(__file__).resolve().parent.parent / "references" / "operating-map.json"))
    subparsers = result.add_subparsers(dest="command", required=True)

    route_parser = subparsers.add_parser("route")
    route_parser.add_argument("--query", required=True)
    route_parser.add_argument("--project-root", default=str(Path.cwd()))
    route_parser.add_argument("--json", action="store_true")

    record_parser = subparsers.add_parser("record")
    record_parser.add_argument("--workflow", required=True)
    record_parser.add_argument("--recommended-skill", required=True)
    record_parser.add_argument("--actual-skill", required=True)
    record_parser.add_argument("--success", choices=["yes", "no"], required=True)
    record_parser.add_argument("--kpi-result", required=True)
    record_parser.add_argument("--lesson", required=True)
    record_parser.add_argument("--state-file", default=str(default_state_file()))
    record_parser.add_argument("--json", action="store_true")

    report_parser = subparsers.add_parser("report")
    report_parser.add_argument("--state-file", default=str(default_state_file()))
    report_parser.add_argument("--json", action="store_true")
    return result


def main() -> int:
    args = parser().parse_args()
    operating_map = load_map(Path(args.map_path))
    try:
        if args.command == "route":
            installed = discover_skills(skill_roots(Path(args.project_root).resolve()))
            result = route(args.query, operating_map, installed)
        elif args.command == "record":
            result = record_outcome(args, operating_map)
        else:
            result = learning_report(Path(args.state_file).expanduser())
    except ValueError as error:
        print(json.dumps({"error": str(error)}))
        return 2
    if getattr(args, "json", False):
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        for key, value in result.items():
            print(f"{key}: {value}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
