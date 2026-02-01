import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

export async function POST(
    request: NextRequest,
    context: RouteContext
): Promise<NextResponse> {
    try {
        const { id } = await context.params;

        // Storage API 호출
        const storageUrl = process.env.NEXT_PUBLIC_STORAGE_API_URL || "http://localhost:3001";

        const response = await fetch(`${storageUrl}/api/episodes/${id}/view`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            console.error(`Failed to increment view for episode ${id}`, await response.text());
            return NextResponse.json(
                { error: "Failed to increment view" },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error incrementing view:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
