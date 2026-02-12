import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const base = process.env.NEXT_PUBLIC_STORAGE_BASE_URL;

  if (!base) {
    return NextResponse.json(
      { error: "STORAGE BASE URL NOT SET" },
      { status: 500 }
    );
  }

  // Forward auth token to Storage API (admin can see hidden novels)
  const headers: Record<string, string> = {};
  const auth = req.headers.get("authorization");
  if (auth) {
    headers["Authorization"] = auth;
  }

  const res = await fetch(`${base}/novels`, {
    cache: "no-store",
    headers,
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch novels" },
      { status: 500 }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
