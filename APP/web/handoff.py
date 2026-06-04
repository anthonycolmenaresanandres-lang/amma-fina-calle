from __future__ import annotations

import sys
from datetime import datetime
from pathlib import Path


HANDOFF = Path(__file__).with_name("HANDOFF.md")
SECTIONS = {
    "start": "STARTED",
    "done": "DONE",
    "next": "NEXT",
    "block": "BLOCKERS",
    "note": "NOTES",
}


def now() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def ensure_file() -> None:
    if not HANDOFF.exists():
        HANDOFF.write_text("# HANDOFF\n\n## STARTED\n\n## DONE\n\n## NEXT\n\n## BLOCKERS\n\n## NOTES\n", encoding="utf-8")


def append_to_section(section: str, text: str) -> None:
    ensure_file()
    content = HANDOFF.read_text(encoding="utf-8")
    marker = f"## {section}"
    line = f"- [{now()}] {text}\n"
    if marker not in content:
        content = content.rstrip() + f"\n\n{marker}\n{line}"
    else:
        start = content.index(marker) + len(marker)
        insert_at = content.find("\n## ", start)
        if insert_at == -1:
            insert_at = len(content)
        before = content[:start].rstrip() + "\n"
        body = content[start:insert_at].lstrip("\n")
        after = content[insert_at:]
        content = before + line + body + after
    HANDOFF.write_text(content, encoding="utf-8")


def main() -> int:
    ensure_file()
    command = sys.argv[1] if len(sys.argv) > 1 else "show"
    message = " ".join(sys.argv[2:]).strip()

    if command == "show":
        print(HANDOFF.read_text(encoding="utf-8"))
        return 0
    if command == "start":
        append_to_section("STARTED", message or "Session started")
        return 0
    if command in SECTIONS:
        if not message:
            print(f"Missing message for {command}", file=sys.stderr)
            return 2
        append_to_section(SECTIONS[command], message)
        return 0

    print(f"Unknown command: {command}", file=sys.stderr)
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
