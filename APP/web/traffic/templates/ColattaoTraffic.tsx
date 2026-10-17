// Integration template for the SEPARATE Colattao app. Not imported here and not
// deployed. Keep its printed https://colattao-cafe-rush.vercel.app/menu URL.
// After explicit approval, copy public/traffic-collector.js to that app's public/
// and mount this in its root layout. No URL, navigation, or game changes.
import Script from "next/script";
export function ColattaoTraffic() {
  const active = process.env.VERCEL_ENV === "production" && process.env.TRAFFIC_INGESTION_SOURCE === "first-party";
  return active ? <>
    <meta name="fc-traffic-collector" content="first-party-v1" />
    <Script src="/traffic-collector.js" strategy="afterInteractive" data-enabled="true"
      data-endpoint="https://finacalleos.com/api/traffic/pageview" />
  </> : null;
}
