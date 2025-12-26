import Link from "next/link";
import NavMenu from "./NavMenu";
import MobileMenu from "./MobileMenu";

export default function Header() {
  return (
    <header
      style={{
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        borderBottom: "1px solid #e5e5e5",
      }}
    >
      <Link href="/" style={{ fontWeight: "bold", fontSize: "18px" }}>
        NARRA
      </Link>

      <nav style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <NavMenu />
        <MobileMenu />
      </nav>
    </header>
  );
}