import Link from "next/link";

export default function MobileMenu() {
  return (
    <details>
      <summary style={{ cursor: "pointer", fontSize: "20px" }}>☰</summary>
      <ul
        style={{
          listStyle: "none",
          padding: "8px 0",
          margin: 0,
          position: "absolute",
          right: "16px",
          background: "white",
          border: "1px solid #e5e5e5",
        }}
      >
        <li><Link href="/">Home</Link></li>
        <li><Link href="/novels">All Novels</Link></li>
        <li><Link href="/browse">Browse</Link></li>
        <li><Link href="/about">About NARRA</Link></li>
        <li><Link href="/notes">Translation Notes</Link></li>
        <li><Link href="/contact">Contact</Link></li>
      </ul>
    </details>
  );
}
