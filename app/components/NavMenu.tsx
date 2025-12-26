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
      <li><Link href="/about">About NARRA</Link></li>
      <li><Link href="/notes">Translation Notes</Link></li>
      <li><Link href="/contact">Contact</Link></li>
    </ul>
  );
}
