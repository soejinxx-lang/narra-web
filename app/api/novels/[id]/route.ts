import { NextResponse, NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // params는 Promise로 처리해야 제대로 작동
  const { id } = await context.params;

  const base = process.env.NEXT_PUBLIC_STORAGE_BASE_URL;
  if (!base) {
    return NextResponse.json(
      { error: "STORAGE_BASE_URL_NOT_SET" },
      { status: 500 }
    );
  }

  // URL이 제대로 만들어지는지 확인해보기 위해 콘솔 로그 추가
  console.log("Fetch URL:", `${base}/novels/${encodeURIComponent(id)}`);

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
