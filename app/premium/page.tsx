import { permanentRedirect } from "next/navigation";

// /premium → /pricing 통합 (SEO 308 리다이렉트)
export default function PremiumPage() {
    permanentRedirect("/pricing");
}
