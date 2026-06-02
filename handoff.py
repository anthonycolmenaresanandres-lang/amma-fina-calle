from __future__ import annotations

import sys
from datetime import datetime
from pathlib import Path


HANDOFF = Path("HANDOFF.md")


def timestamp() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def append_log(kind: str, text: str) -> None:
    with HANDOFF.open("a", encoding="utf-8") as handle:
        handle.write(f"\n- [{timestamp()}] {kind}: {text}\n")


def show() -> None:
    print(HANDOFF.read_text(encoding="utf-8"))


def main() -> int:
    if not HANDOFF.exists():
        print("HANDOFF.md is missing.", file=sys.stderr)
        return 1

    command = sys.argv[1] if len(sys.argv) > 1 else "show"
    message = " ".join(sys.argv[2:]).strip()

    if command == "start":
        append_log("START", message or "Handoff session started")
    elif command == "done":
        append_log("DONE", message)
    elif command == "next":
        append_log("NEXT", message)
    elif command == "block":
        append_log("BLOCK", message)
    elif command == "note":
        append_log("NOTE", message)
    elif command == "show":
        show()
    else:
        print(f"Unknown command: {command}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
