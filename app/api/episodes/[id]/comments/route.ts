import { NextResponse, NextRequest } from "next/server";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const base = process.env.NEXT_PUBLIC_STORAGE_BASE_URL;

    if (!base) {
        return NextResponse.json(
            { error: "STORAGE BASE URL NOT SET" },
            { status: 500 }
        );
    }

    try {
        const res = await fetch(`${base}/episodes/${id}/comments`, {
            cache: "no-store",
        });

        if (!res.ok) {
            return NextResponse.json(
                { error: "Failed to fetch comments" },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Comments fetch error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const base = process.env.NEXT_PUBLIC_STORAGE_BASE_URL;

    if (!base) {
        return NextResponse.json(
            { error: "STORAGE BASE URL NOT SET" },
            { status: 500 }
        );
    }

    try {
        const body = await req.json();
        const auth = req.headers.get("authorization");

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        if (auth) {
            headers["Authorization"] = auth;
        }

        const res = await fetch(`${base}/episodes/${id}/comments`, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            return NextResponse.json(
                { error: "Failed to post comment" },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Comment post error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
