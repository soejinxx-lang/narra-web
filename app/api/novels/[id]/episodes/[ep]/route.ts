import { NextResponse, NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string; ep: string }>;
  }
) {
  const { id, ep } = await params;
  const base = process.env.NEXT_PUBLIC_STORAGE_BASE_URL;

  if (!base) {
    return NextResponse.json(
      { error: "STORAGE BASE URL NOT SET" },
      { status: 500 }
    );
  }

  // lang 쿼리 파라미터 가져오기
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get("lang") || "ko";

  // Storage API 엔드포인트 구성
  // 다른 API route들과 동일한 패턴 사용: /novels/{id}/episodes/{ep}
  // base URL에 이미 /api가 포함되어 있을 수 있으니 확인 필요
  const fetchUrl = `${base}/novels/${encodeURIComponent(id)}/episodes/${encodeURIComponent(ep)}?lang=${lang}`;
  
  console.log("[Episode Translation API] Fetching:", fetchUrl);
  console.log("[Episode Translation API] Base URL:", base);

  try {
    const res = await fetch(fetchUrl, { 
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Storage API error (${res.status}):`, errorText);
      return NextResponse.json(
        { error: "Failed to fetch episode", status: res.status, details: errorText },
        { status: res.status }
      );
    }

    const data = await res.json();
    
    // 잘못된 응답 체크 (챗봇 응답 등)
    if (typeof data === "string" && data.includes("Hello! How can I assist")) {
      console.error("Received chatbot response instead of episode data");
      return NextResponse.json(
        { error: "Invalid API response - received chatbot response" },
        { status: 500 }
      );
    }
    
    // 응답이 객체이고 예상된 필드가 있는지 확인
    if (!data || typeof data !== "object") {
      console.error("Invalid response format:", data);
      return NextResponse.json(
        { error: "Invalid response format from Storage API" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching episode translation:", error);
    return NextResponse.json(
      { error: "Network error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

