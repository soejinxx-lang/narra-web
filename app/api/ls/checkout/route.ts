export const runtime = "nodejs";

import { NextResponse, NextRequest } from "next/server";

const LS_API_KEY = process.env.LEMONSQUEEZY_API_KEY || "";
const LS_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID || "";

// Product → Variant 매핑 (3 plans × 2 cycles = 6 variants)
const VARIANTS: Record<string, string> = {
    reader_premium_monthly: process.env.LEMONSQUEEZY_VARIANT_READER_MONTHLY || "",
    reader_premium_annual: process.env.LEMONSQUEEZY_VARIANT_READER_ANNUAL || "",
    author_starter_monthly: process.env.LEMONSQUEEZY_VARIANT_STARTER_MONTHLY || "",
    author_starter_annual: process.env.LEMONSQUEEZY_VARIANT_STARTER_ANNUAL || "",
    author_pro_monthly: process.env.LEMONSQUEEZY_VARIANT_PRO_MONTHLY || "",
    author_pro_annual: process.env.LEMONSQUEEZY_VARIANT_PRO_ANNUAL || "",
};

const ALLOWED_PLANS = new Set(Object.keys(VARIANTS));

/**
 * POST /api/ls/checkout
 * Lemon Squeezy Checkout URL 생성
 * body: { user_id, plan: "reader_premium_monthly" | ... }
 */
export async function POST(req: NextRequest) {
    const body = await req.json();
    const userId = body.user_id;
    const plan = body.plan;

    if (!userId) {
        return NextResponse.json({ error: "MISSING_USER_ID" }, { status: 400 });
    }

    if (!plan || !ALLOWED_PLANS.has(plan)) {
        return NextResponse.json({ error: "INVALID_PLAN", allowed: Array.from(ALLOWED_PLANS) }, { status: 400 });
    }

    const variantId = VARIANTS[plan];
    if (!variantId || !LS_API_KEY || !LS_STORE_ID) {
        console.error("LS config missing", { plan, variantId: !!variantId, apiKey: !!LS_API_KEY });
        return NextResponse.json({ error: "SERVER_CONFIG_ERROR" }, { status: 500 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://narra.kr";

    const res = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
        method: "POST",
        headers: {
            "Accept": "application/vnd.api+json",
            "Content-Type": "application/vnd.api+json",
            "Authorization": `Bearer ${LS_API_KEY}`,
        },
        body: JSON.stringify({
            data: {
                type: "checkouts",
                attributes: {
                    checkout_data: {
                        custom: {
                            user_id: userId,
                        },
                    },
                    product_options: {
                        redirect_url: `${siteUrl}/pricing?success=true`,
                    },
                },
                relationships: {
                    store: { data: { type: "stores", id: LS_STORE_ID } },
                    variant: { data: { type: "variants", id: variantId } },
                },
            },
        }),
    });

    if (!res.ok) {
        const error = await res.text();
        console.error("LS Checkout creation failed:", error);
        return NextResponse.json({ error: "CHECKOUT_FAILED" }, { status: 500 });
    }

    const data = await res.json();
    const checkoutUrl = data.data?.attributes?.url;

    if (!checkoutUrl) {
        return NextResponse.json({ error: "NO_CHECKOUT_URL" }, { status: 500 });
    }

    return NextResponse.json({ url: checkoutUrl });
}
