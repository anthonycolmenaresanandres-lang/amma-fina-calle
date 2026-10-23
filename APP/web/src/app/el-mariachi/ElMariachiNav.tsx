import Link from "next/link";
import { BookOpen, Gamepad2, ArrowUpRight } from "lucide-react";
import { jacksonville } from "./data";
import styles from "./menu.module.css";

export function ElMariachiNav({
  active,
  orderUrl = jacksonville.orderUrl,
  menuHref = "/el-mariachi#menu",
  playHref = "/el-mariachi/play",
  locationName = "Jacksonville",
}: {
  active: "menu" | "play";
  orderUrl?: string;
  menuHref?: string;
  playHref?: string;
  locationName?: string;
}) {
  return (
    <nav className={styles.primaryNav} aria-label="El Mariachi">
      <Link href={menuHref} aria-current={active === "menu" ? "page" : undefined} className={active === "menu" ? styles.navActive : undefined}>
        <BookOpen size={18} aria-hidden="true" /><span>Menu</span>
      </Link>
      <Link href={playHref} aria-current={active === "play" ? "page" : undefined} className={active === "play" ? styles.navActive : undefined}>
        <Gamepad2 size={19} aria-hidden="true" /><span>Play</span>
      </Link>
      <a href={orderUrl} target="_blank" rel="noopener noreferrer" className={styles.navOrder} aria-label={`Order from ${locationName} (opens restaurant ordering in a new tab)`}>
        <span>Order</span><ArrowUpRight size={18} aria-hidden="true" />
      </a>
    </nav>
  );
}
