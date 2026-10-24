import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND_URL } from "./data";
import { visualAssets } from "./visual-assets";
import styles from "./menu.module.css";

const title = "El Mariachi Jacksonville | Fina Calle concept";
const description = "An independent Fina Calle menu and play concept for El Mariachi Mex & Grill in Jacksonville, North Carolina. Not commissioned, approved, or operated by the restaurant.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/el-mariachi" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  openGraph: {
    title,
    description,
    url: "/el-mariachi",
    siteName: "Fina Calle concepts",
    type: "website",
    images: [{ url: "/assets/el-mariachi/official-grill.jpg", width: 1047, height: 785, alt: "El Mariachi official food photography" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/assets/el-mariachi/official-grill.jpg"],
  },
};

export default function ElMariachiLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.site}>
      {children}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <Link href="/" className={styles.finaBrand} aria-label="Fina Calle — visit the studio">
            <Image src="/assets/fina-calle-os-logo.png" alt="Fina Calle" width={58} height={58} sizes="58px" />
            <span>A Fina Calle concept<span>Digital experiences for local businesses.</span></span>
          </Link>
          <div className={styles.footerNote}>
            <p>Independent concept. Not commissioned or approved by El Mariachi.</p>
            <p>Logo and original food photos from <a href={BRAND_URL} target="_blank" rel="noopener noreferrer">the official website<span className={styles.srOnly}> (opens in a new tab)</span></a> and <a href="https://www.doordash.com/store/el-mariachi-jacksonville-27536538/96700975/?pickup=true&amp;src=yp" target="_blank" rel="noopener noreferrer">El Mariachi&apos;s DoorDash menu<span className={styles.srOnly}> (opens in a new tab)</span></a>. Restaurant ordering opens on its existing service.</p>
            {(visualAssets.grill.generated || visualAssets.courtyard) && <p>AI-styled food photography and an imagined courtyard illustrate this concept; the setting is not a photograph of an El Mariachi location.</p>}
          </div>
        </div>
      </footer>
    </div>
  );
}
