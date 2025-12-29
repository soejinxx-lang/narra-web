import Link from "next/link";

export default function NavMenu() {
  return (
    <ul
      style={{
        listStyle: "none",
        margin: 0,
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <li><Link href="/novels">All Novels</Link></li>
      <li><Link href="/browse">Browse</Link></li>
      <li><Link href="/guide">Guide</Link></li>
      <li><Link href="/notes">Notes</Link></li>
      <li><Link href="/support">Support</Link></li>
    </ul>
  );
}
