import { NextResponse } from "next/server";

export async function GET() {
  const base = process.env.NEXT_PUBLIC_STORAGE_BASE_URL;

  if (!base) {
    return NextResponse.json(
      { error: "STORAGE BASE URL NOT SET" },
      { status: 500 }
    );
  }

  const res = await fetch(`${base}/novels`, {
    cache: "no-store",
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
