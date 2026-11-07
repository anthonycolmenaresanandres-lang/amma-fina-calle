"use client";
import { Analytics } from "@vercel/analytics/next";

/** QA/internal navigation must not pollute native Analytics either. */
export default function TrafficAnalytics() {
  return <Analytics beforeSend={event => {
    try {
      const query = new URL(event.url).searchParams;
      if (query.get("traffic_qa") === "1") sessionStorage.setItem("traffic-qa", "1");
      if (sessionStorage.getItem("traffic-qa") === "1" || sessionStorage.getItem("traffic-internal") === "1" ||
        ["traffic_test", "internal_test", "qa", "e2e"].some(key => query.has(key)) || /(?:^|;\s*)traffic_internal=1(?:;|$)/.test(document.cookie)) return null;
      return event;
    } catch { return null; }
  }} />;
}
