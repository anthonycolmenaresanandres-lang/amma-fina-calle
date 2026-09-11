"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { displayMenuValue, normalizedMenuValue, type MenuEdit, type MenuEditField } from "@/lib/owner/menu-control";
import { saveOwnerMenuEdit } from "@/lib/owner/menu-control-actions";
import type { MenuCategory, MenuItem } from "./OwnerDashboard";
import styles from "./menu-quick-edit.module.css";

type Props = {
  restaurantId: string;
  categories: MenuCategory[];
  previewOnly?: boolean;
  onDemoChange?: (change: MenuEdit) => void;
};

export default function MenuQuickEdit({ restaurantId, categories, previewOnly = false, onDemoChange }: Props) {
  const items = categories.flatMap(category => category.items.map(item => ({ ...item, category: category.name })));
  const [selected, setSelected] = useState("");
  const item = items.find(candidate => candidate.id === selected) ?? items[0];
  const [fieldKey, setFieldKey] = useState("price");
  const field: MenuEditField = fieldKey.startsWith("size:") ? "size_price" : fieldKey as MenuEditField;
  const sizeLabel = field === "size_price" ? fieldKey.slice(5) : undefined;
  const [draft, setDraft] = useState<string | null>(null);
  const [proposal, setProposal] = useState<MenuEdit | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null>(null);
  const router = useRouter();
  const prefix = useId();
  const original = item ? String(field === "size_price" ? item.sizes?.find(size => size.label === sizeLabel)?.price ?? "" : item[field as keyof MenuItem] ?? "") : "";
  const value = draft ?? original;
  const dirty = draft !== null && value !== original;

  useEffect(() => {
    if (!dirty) return;
    const protect = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", protect);
    return () => window.removeEventListener("beforeunload", protect);
  }, [dirty]);

  function resetDraft() { setDraft(null); setProposal(null); setError(""); setMessage(""); }
  function canSwitch() { return !dirty || window.confirm("Discard this unsaved menu change?"); }
  function review(event: React.FormEvent) {
    event.preventDefault();
    if (!item) return;
    setMessage("");
    try {
      const next = normalizedMenuValue(field, value);
      const current = normalizedMenuValue(field, original);
      if (next === current) throw new Error("Change the value before reviewing.");
      setProposal({ restaurantId, itemId: item.id, field, value: next, expectedValue: current, sizeLabel });
      setError("");
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Check the value."); inputRef.current?.focus(); }
  }
  function confirm() {
    if (!proposal) return;
    startTransition(async () => {
      if (previewOnly) {
        onDemoChange?.(proposal);
        setMessage("Local demo updated. Nothing was saved to a restaurant account.");
      } else {
        const result = await saveOwnerMenuEdit(proposal);
        if (!result.ok) { setError(result.message); return; }
        setMessage("Saved to your menu data. Open the connected guest menu and refresh to verify it.");
        router.refresh();
      }
      setDraft(null); setProposal(null); setError("");
    });
  }
  if (!item) return <p className={styles.empty}>No menu items are connected yet. Finish the approved menu import before editing.</p>;

  return <div className={styles.editor}>
    <p className={styles.intro}>Change a price, item name, description or availability. Review first; save when it looks right. Your printed QR stays the same.</p>
    {previewOnly ? <p className={styles.notice}>LOCAL DEMO · Sample changes only. This is not an active owner account.</p> : null}
    <form onSubmit={review} className={styles.form}>
      <fieldset disabled={pending}>
        <legend className="sr-only">Edit an existing menu item</legend>
        <label htmlFor={`${prefix}-item`}>Menu item</label>
        <select id={`${prefix}-item`} name="item" value={item.id} onChange={event => { if (canSwitch()) { setSelected(event.target.value); setFieldKey("price"); resetDraft(); } }}>
          {categories.map(category => <optgroup key={category.id} label={category.name}>{category.items.map(entry => <option key={entry.id} value={entry.id}>{entry.name}{entry.is_available ? "" : " — sold out"}</option>)}</optgroup>)}
        </select>
        <label htmlFor={`${prefix}-field`}>What do you want to change?</label>
        <select id={`${prefix}-field`} name="field" value={fieldKey} onChange={event => { if (canSwitch()) { setFieldKey(event.target.value); resetDraft(); } }}>
          <option value="price">Base price</option><option value="name">Item name</option><option value="description">Description</option><option value="is_available">Availability</option>
          {item.sizes?.map(size => <option key={size.label} value={`size:${size.label}`}>{size.label} price</option>)}
        </select>
        <label htmlFor={`${prefix}-value`}>New value</label>
        {field === "is_available" ? <select ref={node => { inputRef.current = node; }} id={`${prefix}-value`} name="value" value={value} onChange={event => { setDraft(event.target.value); setProposal(null); setMessage(""); }}>
          <option value="true">Available</option><option value="false">Sold out — hide from the menu</option>
        </select> : field === "description" ? <textarea ref={node => { inputRef.current = node; }} id={`${prefix}-value`} name="value" autoComplete="off" maxLength={1500} value={value} onChange={event => { setDraft(event.target.value); setProposal(null); setMessage(""); }} aria-describedby={`${prefix}-help ${prefix}-error`} /> :
          <input ref={node => { inputRef.current = node; }} id={`${prefix}-value`} name="value" type="text" autoComplete="off" inputMode={field === "name" ? "text" : "decimal"} maxLength={field === "name" ? 120 : 11} value={value} onChange={event => { setDraft(event.target.value); setProposal(null); setMessage(""); }} aria-describedby={`${prefix}-help ${prefix}-error`} aria-invalid={Boolean(error)} />}
        <p id={`${prefix}-help`} className={styles.hint}>{field === "price" || field === "size_price" ? "Use dollars and up to 2 decimal places. 0 means “Ask staff,” not a free item. Size prices are edited separately." : "Only this field on the selected item will change. New items and categories can still go through Request."}</p>
        <p id={`${prefix}-error`} className={styles.error} role="alert">{error}</p>
        {!proposal ? <button type="submit">Review change</button> : null}
      </fieldset>
    </form>
    {proposal ? <div className={styles.review} aria-label="Review menu change">
      <h3>{item.name}{sizeLabel ? ` · ${sizeLabel}` : ""}</h3>
      <dl><div><dt>Current</dt><dd>{displayMenuValue(proposal.field, proposal.expectedValue)}</dd></div><div><dt>After saving</dt><dd>{displayMenuValue(proposal.field, proposal.value)}</dd></div></dl>
      <div className={styles.actions}><button type="button" onClick={confirm} disabled={pending}>{pending ? "Saving…" : previewOnly ? "Apply to local demo" : "Save menu change"}</button><button type="button" className={styles.secondary} disabled={pending} onClick={() => setProposal(null)}>Keep editing</button></div>
    </div> : null}
    <p className={styles.status} role="status">{message}</p>
  </div>;
}
