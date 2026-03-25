export const runtime = "nodejs";

import { NextResponse, NextRequest } from "next/server";

/**
 * Gumroad 상품 slug 매핑 (3 plans × 2 cycles = 6)
 * URL: https://soejin.gumroad.com/l/{slug}
 */
const GUMROAD_SLUGS: Record<string, string> = {
    reader_premium_monthly: "ReaderPlusMonthly",
    reader_premium_annual: "ReaderPlusAnnual",
    author_starter_monthly: "AuthorStarterMonthly",
    author_starter_annual: "AuthorStarterAnnual",
    author_pro_monthly: "AuthorProMonthly",
    author_pro_annual: "AuthorProAnnual",
};

const ALLOWED_PLANS = new Set(Object.keys(GUMROAD_SLUGS));

/**
 * POST /api/ls/checkout
 * Gumroad Checkout URL 생성 (기존 LS 엔드포인트 호환)
 * body: { user_id, plan: "reader_premium_monthly" | ..., email?: string }
 */
export async function POST(req: NextRequest) {
    const body = await req.json();
    const userId = body.user_id;
    const plan = body.plan;
    const email = body.email || "";

    if (!userId) {
        return NextResponse.json({ error: "MISSING_USER_ID" }, { status: 400 });
    }

    if (!plan || !ALLOWED_PLANS.has(plan)) {
        return NextResponse.json(
            { error: "INVALID_PLAN", allowed: Array.from(ALLOWED_PLANS) },
            { status: 400 }
        );
    }

    const slug = GUMROAD_SLUGS[plan];
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://narra.kr";

    // Gumroad checkout URL 조립
    // custom_fields[user_id]로 webhook에서 유저 식별
    // wanted=true → 바로 결제 화면 진입
    const params = new URLSearchParams();
    params.set("wanted", "true");
    params.set("custom_fields[user_id]", userId);
    if (email) {
        params.set("email", email);
    }
    // Gumroad은 success redirect를 상품 설정에서 하거나, receipt에서 자동 처리됨
    // 우리는 상품 설정의 redirect URL을 사용하되, fallback으로 query에도 넣음

    const checkoutUrl = `https://soejin.gumroad.com/l/${slug}?${params.toString()}`;

    return NextResponse.json({ url: checkoutUrl });
}
