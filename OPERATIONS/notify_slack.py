from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import urllib.request
from datetime import datetime, timezone
from pathlib import Path


PROJECT = "amma-fina-calle"
ROOT = Path(__file__).resolve().parents[1]
HANDOFF_LOG = ROOT / "OPERATIONS" / "HANDOFF_LOG.md"


def git_sha() -> str:
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--short", "HEAD"],
            cwd=ROOT,
            text=True,
            capture_output=True,
            check=False,
            timeout=3,
        )
    except Exception:
        return "unknown"
    return result.stdout.strip() or "unknown"


def split_headers(lines: list[str]) -> list[tuple[int, str, str]]:
    headers: list[tuple[int, str, str]] = []
    for index, line in enumerate(lines):
        match = re.match(r"^### \[([^\]]+)\]\s+(.+?)\s*$", line)
        if match:
            headers.append((index, match.group(1), match.group(2)))
    return headers


def parse_header(body: str) -> tuple[str, str, str]:
    normalized = body.replace(" — ", " - ")
    parts = normalized.split(" - ", 2)
    agent = parts[0].strip() if parts else ""
    date_text = parts[1].strip() if len(parts) > 1 else ""
    task = parts[2].strip() if len(parts) > 2 else ""
    return agent, date_text, task


def field_value(block: str, label: str) -> str:
    pattern = re.compile(rf"^{re.escape(label)}:\s*(.*)$", re.MULTILINE)
    match = pattern.search(block)
    if not match:
        return ""
    value = match.group(1).strip()
    if value:
        return value
    lines = block[match.end() :].splitlines()
    collected: list[str] = []
    for line in lines:
        if re.match(r"^[A-Z][A-Za-z /-]+:", line) or line.startswith("### "):
            break
        clean = line.strip().lstrip("-").strip()
        if clean:
            collected.append(clean)
    return "; ".join(collected)


def latest_entry() -> dict[str, str]:
    if not HANDOFF_LOG.exists():
        return {"task": "HANDOFF_LOG.md missing", "status": "UNKNOWN", "flags": "missing handoff log"}

    lines = HANDOFF_LOG.read_text(encoding="utf-8").splitlines()
    try:
        start = next(i for i, line in enumerate(lines) if line.strip() == "---") + 1
    except StopIteration:
        start = 0
    body_lines = lines[start:]
    headers = split_headers(body_lines)
    if not headers:
        return {"task": "no handoff entries found", "status": "UNKNOWN", "flags": "no parseable entries"}

    first_index, first_label, first_body = headers[0]
    block_start = first_index
    header_for_message = (first_label, first_body)
    if "CHECK-IN" in first_label and len(headers) > 1 and "CHECK-OUT" in headers[1][1]:
        block_end = headers[2][0] if len(headers) > 2 else len(body_lines)
        header_for_message = (headers[1][1], headers[1][2])
    else:
        block_end = headers[1][0] if len(headers) > 1 else len(body_lines)

    block = "\n".join(body_lines[block_start:block_end])
    _, _, task = parse_header(header_for_message[1])
    blocked = field_value(block, "Blocked on Anthony")
    did = field_value(block, "Did")
    state = field_value(block, "State now") or field_value(block, "State I see")
    next_step = field_value(block, "Next / handoff to") or field_value(block, "Next")

    blocked_clean = blocked.strip().rstrip(".")
    blocked_meaningful = blocked_clean and blocked_clean.lower() != "none"
    if blocked_meaningful:
        status = "FAIL"
    elif "CHECK-OUT" in header_for_message[0] or "CHECK-IN/OUT" in header_for_message[0]:
        status = "PASS"
    else:
        status = header_for_message[0]

    flags = []
    if blocked_meaningful:
        flags.append(f"blocked={blocked_clean}")
    if next_step:
        flags.append(f"next={next_step}")
    if not flags and state:
        flags.append(f"state={state}")

    return {"task": task or did or "latest handoff entry", "status": status, "flags": " | ".join(flags) if flags else "none"}


def post_message(text: str) -> None:
    webhook = os.environ.get("SLACK_WEBHOOK_URL", "").strip()
    if not webhook:
        print("warning: SLACK_WEBHOOK_URL is not set; skipping Slack notify")
        return

    payload = json.dumps({"text": text}).encode("utf-8")
    request = urllib.request.Request(webhook, data=payload, headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            response.read()
    except Exception as exc:
        print(f"warning: Slack notify failed: {type(exc).__name__}")


def build_message() -> str:
    entry = latest_entry()
    timestamp = datetime.now(timezone.utc).isoformat(timespec="seconds")
    return "\n".join(
        [
            f"{PROJECT}: {entry['status']}",
            f"what ran: {entry['task']}",
            f"flags: {entry['flags']}",
            f"timestamp: {timestamp}",
            f"git: {git_sha()}",
        ]
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--test", action="store_true")
    args = parser.parse_args()

    try:
        post_message("ops feed online" if args.test else build_message())
    except Exception as exc:
        print(f"warning: Slack notifier suppressed error: {type(exc).__name__}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
