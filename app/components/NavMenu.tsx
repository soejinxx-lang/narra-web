import Link from "next/link";

export default function NavMenu() {
  return (
    <ul
      style={{
        display: "flex",
        listStyle: "none",
        gap: "16px",
        margin: 0,
        padding: 0,
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
