import { NextResponse, NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  context: {
    params: { id: string };
  }
) {
  const { id } = context.params;

  const base = process.env.NEXT_PUBLIC_STORAGE_BASE_URL;

  if (!base) {
    return NextResponse.json(
      { error: "STORAGE_BASE_URL_NOT_SET" },
      { status: 500 }
    );
  }

  const res = await fetch(
    `${base}/novels/${encodeURIComponent(id)}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: "FAILED_TO_FETCH_NOVEL", status: res.status },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
