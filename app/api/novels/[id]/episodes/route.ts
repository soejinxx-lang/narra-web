import { NextResponse, NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  const { id } = await params;
  const base = process.env.NEXT_PUBLIC_STORAGE_BASE_URL;

  if (!base) {
    return NextResponse.json(
      { error: "STORAGE BASE URL NOT SET" },
      { status: 500 }
    );
  }

  const res = await fetch(`${base}/novels/${id}/episodes`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch episodes" },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
