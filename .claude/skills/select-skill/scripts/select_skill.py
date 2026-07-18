#!/usr/bin/env python3
"""Rank installed skills for a request using deterministic lexical scoring."""

from __future__ import annotations

import argparse
import json
import os
import re
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Iterable


STOPWORDS = {
    "a", "an", "and", "are", "as", "at", "be", "can", "do", "for", "from",
    "help", "i", "in", "is", "it", "me", "my", "of", "on", "or", "please",
    "the", "this", "to", "use", "want", "with", "you",
}

ROUTE_HINTS = {
    "email": ("gmail", "gmail-inbox-triage"),
    "inbox": ("gmail", "gmail-inbox-triage"),
    "calendar": ("google-calendar", "google-calendar-daily-brief"),
    "schedule": ("google-calendar", "google-calendar-group-scheduler"),
    "spreadsheet": ("spreadsheets", "excel-live-control", "google-sheets"),
    "excel": ("spreadsheets", "excel-live-control"),
    "xlsx": ("spreadsheets", "excel-live-control"),
    "csv": ("spreadsheets",),
    "document": ("documents", "google-docs"),
    "docx": ("documents",),
    "pdf": ("pdf",),
    "presentation": ("presentations", "google-slides"),
    "slides": ("presentations", "google-slides"),
    "image": ("imagegen", "visual-director", "image-prompt-engine"),
    "photo": ("imagegen", "image-recognition-qa"),
    "video": ("amma-video-game-visuals", "remotion-create", "video-storyboard-builder"),
    "motion": ("amma-video-game-visuals", "remotion-create"),
    "game": ("amma-video-game-visuals", "v4-new-features"),
    "phaser": ("amma-video-game-visuals", "v4-new-features"),
    "sprite": ("sprites-and-images", "animations", "amma-video-game-visuals"),
    "design": ("frontend-design", "visual-director"),
    "frontend": ("frontend-design", "web-design-guidelines"),
    "ui": ("frontend-design", "web-design-guidelines"),
    "audit": ("web-design-guidelines", "security-best-practices"),
    "github": ("github", "yeet"),
    "github pull request checks": ("gh-fix-ci",),
    "pull request checks": ("gh-fix-ci",),
    "pull request": ("github", "gh-fix-ci", "yeet"),
    "failing": ("gh-fix-ci", "repo-debugger"),
    "ci": ("gh-fix-ci",),
    "deploy": ("deployments-cicd", "yeet"),
    "vercel": ("deployments-cicd", "vercel-cli", "verification"),
    "browser": ("agent-browser", "control-chrome", "control-in-app-browser"),
    "chrome": ("control-chrome", "agent-browser"),
    "security": ("security-best-practices", "security-threat-model"),
    "threat": ("security-threat-model",),
    "sales": ("sales", "sales-index"),
    "lead": ("sales", "sales-index"),
    "skill selection": ("select-skill",),
    "small model": ("select-skill",),
    "less capable": ("select-skill",),
    "haiku": ("select-skill",),
    "skill": ("skill-creator", "codex-workflow-builder"),
    "plugin": ("plugin-creator", "codex-workflow-builder"),
    "workflow": ("codex-workflow-builder", "sop-builder"),
    "sop": ("sop-builder",),
}

APPROVAL_PATTERNS = {
    "external_write": r"\b(send|publish|push|merge|deploy|invite|email\s+them)\b|\bpost\s+(to|on)\b",
    "money": r"\b(pay|purchase|buy|spend|charge|subscribe|subscription)\b",
    "secrets": r"\b(secret|api\s*key|password|credential|access\s*token)\b",
    "access": r"\b(grant|revoke|permission|authorize|add\s+user|create\s+account)\b",
    "destructive": r"\b(delete|remove|wipe|drop|destroy|reset|uninstall)\b",
    "production": r"\b(production|prod|live|main\s+branch)\b",
}


@dataclass(frozen=True)
class Skill:
    name: str
    description: str
    path: str


@dataclass(frozen=True)
class Candidate:
    name: str
    score: int
    reason: str
    description: str
    path: str


def normalize(text: str) -> str:
    return " ".join(re.findall(r"[a-z0-9]+", text.lower()))


def terms(text: str) -> set[str]:
    output: set[str] = set()
    for token in re.findall(r"[a-z0-9]+", text.lower()):
        if token in STOPWORDS or len(token) < 2:
            continue
        output.add(token)
        if len(token) > 4 and token.endswith("s"):
            output.add(token[:-1])
        if len(token) > 5 and token.endswith("ing"):
            output.add(token[:-3])
        if len(token) > 4 and token.endswith("ed"):
            output.add(token[:-2])
    return output


def parse_frontmatter(path: Path) -> Skill | None:
    try:
        text = path.read_text(encoding="utf-8-sig")
    except (OSError, UnicodeError):
        return None
    if not text.startswith("---"):
        return None
    end = text.find("\n---", 3)
    if end < 0:
        return None
    frontmatter = text[3:end].splitlines()
    values: dict[str, str] = {}
    index = 0
    while index < len(frontmatter):
        line = frontmatter[index]
        match = re.match(r"^(name|description):\s*(.*)$", line)
        if not match:
            index += 1
            continue
        key, value = match.groups()
        if re.fullmatch(r"[|>][+-]?", value):
            parts: list[str] = []
            index += 1
            while index < len(frontmatter) and (
                frontmatter[index].startswith(" ") or not frontmatter[index].strip()
            ):
                parts.append(frontmatter[index].strip())
                index += 1
            values[key] = " ".join(part for part in parts if part)
            continue
        values[key] = value.strip().strip('"').strip("'")
        index += 1
    name = values.get("name", "").strip()
    description = values.get("description", "").strip()
    if not name or not description:
        return None
    return Skill(name=name, description=description, path=str(path.parent.resolve()))


def default_roots(project_root: Path) -> list[Path]:
    user = Path(os.environ.get("USERPROFILE", str(Path.home())))
    roots = [
        project_root / ".agents" / "skills",
        project_root / ".claude" / "skills",
        project_root / "SKILLS",
        user / ".agents" / "skills",
        user / ".claude" / "skills",
        user / ".codex" / "skills",
        user / ".codex" / "skills" / ".system",
    ]
    plugin_cache = user / ".codex" / "plugins" / "cache"
    if plugin_cache.is_dir():
        roots.extend(sorted(plugin_cache.glob("*/*/*/skills")))
    return roots


def discover_skills(roots: Iterable[Path]) -> list[Skill]:
    found: dict[str, Skill] = {}
    for root in roots:
        if not root.is_dir():
            continue
        for directory in sorted((item for item in root.iterdir() if item.is_dir()), key=lambda p: p.name):
            skill = parse_frontmatter(directory / "SKILL.md")
            key = skill.name.lower() if skill else ""
            if skill and key not in found:
                found[key] = skill
    return list(found.values())


def rank_skills(query: str, skills: Iterable[Skill]) -> tuple[list[Candidate], list[str]]:
    normalized_query = normalize(query)
    query_terms = terms(query)
    candidates: list[Candidate] = []
    for skill in skills:
        score = 0
        reasons: list[str] = []
        name_phrase = normalize(skill.name.replace("-", " "))
        name_terms = terms(skill.name.replace("-", " "))
        description_normalized = normalize(skill.description)
        description_terms = terms(skill.description)

        explicit = f"${skill.name}" in query.lower() or bool(
            re.search(
                rf"\b(?:use|run|invoke|with)\s+(?:the\s+)?{re.escape(name_phrase)}(?:\s+skill)?\b|"
                rf"\bskill\s+{re.escape(name_phrase)}\b",
                normalized_query,
            )
        )
        if explicit:
            score += 100
            reasons.append("explicit-name")

        name_overlap = query_terms & name_terms
        if name_overlap:
            score += 8 * len(name_overlap)
            reasons.append("name:" + ",".join(sorted(name_overlap)))

        description_overlap = query_terms & description_terms
        if description_overlap:
            score += 3 * len(description_overlap)
            reasons.append("description:" + ",".join(sorted(description_overlap)[:5]))

        for phrase, preferred in ROUTE_HINTS.items():
            skill_key = skill.name.lower()
            if re.search(rf"\b{re.escape(phrase)}\b", normalized_query) and skill_key in preferred:
                boost = 16 - preferred.index(skill_key) * 3
                score += boost
                reasons.append("route:" + phrase)

        query_words = normalized_query.split()
        for left, right in zip(query_words, query_words[1:]):
            phrase = f"{left} {right}"
            if phrase in description_normalized:
                score += 4
                reasons.append("phrase:" + phrase)
                break

        if skill.name == "excel-live-control" and not re.search(
            r"\b(open|active|current|currently)\b.*\b(excel|workbook|spreadsheet)\b|"
            r"\b(excel|workbook|spreadsheet)\b.*\b(open|active|current|currently)\b",
            normalized_query,
        ):
            score -= 12
            reasons.append("penalty:not-live-workbook")

        if score > 0:
            candidates.append(
                Candidate(
                    name=skill.name,
                    score=score,
                    reason="; ".join(reasons),
                    description=skill.description,
                    path=skill.path,
                )
            )

    candidates.sort(key=lambda item: (-item.score, len(item.name), item.name))
    gates = [name for name, pattern in APPROVAL_PATTERNS.items() if re.search(pattern, normalized_query)]
    return candidates, gates


def confidence_for(candidates: list[Candidate]) -> str:
    if not candidates:
        return "none"
    top = candidates[0].score
    lead = top - (candidates[1].score if len(candidates) > 1 else 0)
    if top >= 100 or (top >= 18 and lead >= 5):
        return "high"
    if top >= 10 and lead >= 2:
        return "medium"
    return "low"


def build_result(query: str, candidates: list[Candidate], gates: list[str], limit: int) -> dict:
    confidence = confidence_for(candidates)
    shown = candidates[: max(1, limit)]
    if not shown:
        decision = "no_match"
        primary = None
    elif confidence in {"high", "medium"}:
        decision = "use"
        primary = shown[0].name
    else:
        decision = "inspect"
        primary = None
    return {
        "query": query,
        "decision": decision,
        "primary": primary,
        "confidence": confidence,
        "approval_gates": gates,
        "candidates": [asdict(candidate) for candidate in shown],
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--query", required=True, help="Exact user request")
    parser.add_argument("--project-root", default=".", help="Repository or workspace root")
    parser.add_argument("--root", action="append", help="Skill root; repeat to override defaults")
    parser.add_argument("--limit", type=int, default=5)
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    roots = [Path(item).expanduser() for item in args.root] if args.root else default_roots(Path(args.project_root).resolve())
    skills = discover_skills(roots)
    candidates, gates = rank_skills(args.query, skills)
    result = build_result(args.query, candidates, gates, args.limit)

    if args.json:
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print(f"decision={result['decision']}")
        print(f"primary={result['primary'] or ''}")
        print(f"confidence={result['confidence']}")
        print("approval_gates=" + ",".join(result["approval_gates"]))
        for candidate in result["candidates"]:
            print(f"candidate={candidate['name']} score={candidate['score']} reason={candidate['reason']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
