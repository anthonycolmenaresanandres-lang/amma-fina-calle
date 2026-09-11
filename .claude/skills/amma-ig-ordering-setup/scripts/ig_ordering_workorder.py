#!/usr/bin/env python3
"""Deterministic work-order generator for the Instagram ordering activation add-on.

Decides WHICH partner rail to wire, WHICH Instagram surfaces to use, and WHAT must be
disclosed to the owner -- then prints a per-client work order and the exact message to
send the owner. No network calls, no credentials, no client data written to the repo.

    python ig_ordering_workorder.py --client "Las Palmas" --has square_online
    python ig_ordering_workorder.py --client "AJ Gators" --slot opentable --json
    python ig_ordering_workorder.py --client "Bodega" --menu-url https://finacalleos.com/m/bodega
"""
from __future__ import annotations

import argparse
import json
import pathlib
import sys

DATA = pathlib.Path(__file__).resolve().parent.parent / "references" / "partners.json"


def load() -> dict:
    with DATA.open(encoding="utf-8") as fh:
        return json.load(fh)


def decide(db: dict, has: list[str], slot: str | None, prefer: str | None) -> dict:
    partners = db["partners"]
    unknown = [p for p in has + ([prefer] if prefer else []) if p and p not in partners]
    has_aligned = [p for p in has if partners.get(p, {}).get("alignment") == "aligned"
                   and partners[p]["ordering"]]
    has_conflict = [p for p in has if partners.get(p, {}).get("alignment") == "conflicts"]

    if prefer and prefer in partners:
        rail, basis = prefer, "owner explicitly chose this rail"
    elif has_aligned:
        rail, basis = has_aligned[0], "client already pays for it and it takes no commission"
    elif has_conflict:
        rail, basis = has_conflict[0], "the only rail the client already has (commission model)"
    else:
        rail, basis = "chownow", "no existing rail; commission-free flat fee is the aligned default"

    p = partners[rail]
    new_cost = rail not in has
    slot_holder = partners.get(slot) if slot else None
    slot_is_reservations = bool(slot_holder and slot_holder["alignment"] == "slot_competitor")

    surfaces = ["bio_link", "stories_food_orders_sticker"]
    if not slot_is_reservations:
        surfaces.insert(0, "profile_action_button")

    flags: list[str] = []
    if p["alignment"] == "conflicts":
        pct = p["commission_pct"]
        rate = f"{pct[0]}-{pct[1]}%" if isinstance(pct, list) else (f"{pct}%" if pct else "a per-order rate")
        flags.append(
            f"DISCLOSURE REQUIRED: {p['label']} charges per-order commission ({rate}). "
            "Get the owner's choice in writing and never call this setup 'commission-free'."
        )
    if new_cost and p["kind"] != "processing_fees":
        fee = p.get("flat_fee_usd_per_month")
        cost = f"about ${fee[0]}-{fee[1]}/month" if fee and fee[1] else "a fee on their own plan"
        flags.append(
            f"NEW COST: the client does not have {p['label']} yet ({cost}). "
            "The owner must agree to that cost before signup. Never sign them up silently."
        )
    if slot_is_reservations:
        flags.append(
            f"SLOT CONTESTED: the one action-button slot currently holds {slot_holder['label']} "
            "(reservations). Do NOT displace it. Wire the Stories sticker and bio link instead, "
            "and put the swap to the owner as their decision."
        )
    if unknown:
        flags.append(f"UNKNOWN RAIL(S) {unknown} not in partners.json -- verify in the client's app.")
    flags.append(
        "VERIFY IN APP: the partner picker inside the client's own Instagram app is the only "
        "authoritative list. Availability varies by country and changes without notice."
    )
    flags.append(
        "NEVER take the owner's Instagram password. Screen-share while they tap, or ask them "
        "to add you as a user in their Meta Business Suite."
    )

    return {
        "rail": rail,
        "rail_label": p["label"],
        "basis": basis,
        "alignment": p["alignment"],
        "confidence": p["confidence"],
        "new_cost_to_client": new_cost,
        "surfaces": surfaces,
        "slot_holder": slot_holder["label"] if slot_holder else None,
        "flags": flags,
    }


def render(client: str, d: dict, db: dict, menu_url: str) -> str:
    s = db["surfaces"]
    out = [
        f"# Instagram Ordering Activation — {client}",
        "",
        f"**Rail to wire:** {d['rail_label']}  ({d['basis']})",
        f"**Alignment:** {d['alignment']}   **Data confidence:** {d['confidence']}",
        f"**New cost to client:** {'YES — needs written agreement first' if d['new_cost_to_client'] else 'no, they already pay for it'}",
        "",
        "## Surfaces to wire",
    ]
    for name in d["surfaces"]:
        info = s[name]
        out.append(f"- **{name}** — {info['note']}")
        if info.get("path"):
            out.append(f"  - Path: `{info['path']}`")
    if "profile_action_button" not in d["surfaces"]:
        out.append(f"- _profile_action_button SKIPPED — slot holds {d['slot_holder']}_")
    out += ["", f"- **bio_link destination:** {menu_url}", "", "## Flags — read before acting"]
    out += [f"{i}. {f}" for i, f in enumerate(d["flags"], 1)]
    out += [
        "",
        "## Message to send the owner",
        "",
        "```text",
        f"Hi — quick win for {client}. Instagram lets a restaurant profile take food orders",
        "in two places: a button on your profile and a sticker in your Stories. Yours aren't",
        "switched on yet.",
        "",
        f"I can set it up on a 15-minute screen-share using your {d['rail_label']} account —",
        "you tap, I talk you through it, and I never need your password.",
        "",
        "Two things I need from you:",
        "  1. A time that works this week.",
        "  2. Confirmation you want orders (not reservations) on the profile button — you",
        "     only get one button slot, so it's a real choice.",
        "",
        "The Stories sticker is separate and doesn't use up that slot, so we can do that",
        "either way.",
        "```",
        "",
        "## Record",
        "Copy the completed run into the private client record.",
        "Blank template: `OPERATIONS/templates/INSTAGRAM_ORDERING_WORK_ORDER.md`",
        "Never commit client PII, credentials, or account screenshots to this repo.",
    ]
    return "\n".join(out)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--client", help="Client / location name. Required unless --list-partners.")
    ap.add_argument("--has", action="append", default=[],
                    help="A rail the client ALREADY pays for. Repeatable.")
    ap.add_argument("--slot", help="Partner currently holding the action-button slot, if any.")
    ap.add_argument("--prefer", help="Rail the owner explicitly chose; overrides the default rule.")
    ap.add_argument("--menu-url", default="(Fina Calle menu URL for this client)",
                    help="Bio-link destination.")
    ap.add_argument("--json", action="store_true", help="Emit the decision as JSON.")
    ap.add_argument("--list-partners", action="store_true", help="List known rails and exit.")
    a = ap.parse_args()

    db = load()
    if not a.client and not a.list_partners:
        ap.error("--client is required (or use --list-partners)")
    if a.list_partners:
        for k, v in sorted(db["partners"].items(), key=lambda kv: kv[1]["alignment"]):
            print(f"{k:16} {v['alignment']:16} {v['label']}")
        return 0

    d = decide(db, a.has, a.slot, a.prefer)
    if a.json:
        print(json.dumps({"client": a.client, **d}, indent=2))
    else:
        print(render(a.client, d, db, a.menu_url))
    return 0


if __name__ == "__main__":
    sys.exit(main())
