import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import styles from "./FinaCalleFooter.module.css";

/** Original company emblem, matching the Colattao menu's closing signature. */
export default function FinaCalleFooter() {
  return (
    <footer className={styles.footer} aria-label="Made by Fina Calle">
      <p>Powered by</p>
      <a href="https://finacalleos.com" aria-label="Visit Fina Calle — finacalleos.com">
        <Image src="/assets/fina-calle/emblem-colattao.webp" alt="Fina Calle OS" width={160} height={160} sizes="120px" />
        <span>finacalleos.com <ArrowUpRight aria-hidden="true" /></span>
      </a>
    </footer>
  );
}
