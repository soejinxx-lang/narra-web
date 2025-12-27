import { NextResponse, NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  {
    params,
  }: {
    params: { id: string };
  }
) {
  const { id } = params;

  const base = process.env.NEXT_PUBLIC_STORAGE_BASE_URL;

  if (!base) {
    return NextResponse.json(
      { error: "STORAGE BASE URL NOT SET" },
      { status: 500 }
    );
  }

  const res = await fetch(
    `${base}/novels/${encodeURIComponent(id)}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch novel" },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
