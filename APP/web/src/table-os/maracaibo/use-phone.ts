"use client";
import { useSyncExternalStore } from "react";
type Device = "checking" | "phone" | "desktop";
const server = (): Device => "checking";
const current = (): Device => window.matchMedia("(pointer: coarse)").matches && navigator.maxTouchPoints > 0 ? "phone" : "desktop";
function subscribe(change: () => void) {
  const query = window.matchMedia("(pointer: coarse)");
  query.addEventListener("change", change);
  return () => query.removeEventListener("change", change);
}
export const usePhone = () => useSyncExternalStore(subscribe, current, server);
