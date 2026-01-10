import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // 워크스페이스 루트 명시적 설정 (Next.js 16에서 experimental에서 이동)
  outputFileTracingRoot: path.join(__dirname),
  
  // Turbopack 설정 (Next.js 16에서 기본 활성화, webpack 사용 시 빈 설정 필요)
  turbopack: {},
  
  // 파일 감시 설정 (OneDrive 및 Windows 경로 지원)
  // --webpack 플래그를 사용하므로 webpack 설정이 적용됩니다
  webpack: (config, { dev }) => {
    if (dev) {
      // 파일 감시 옵션 개선 (OneDrive 동기화 대응)
      config.watchOptions = {
        poll: 1000, // 1초마다 파일 변경 확인
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
    }
    return config;
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;",
          },
          {
            key: "Permissions-Policy",
            value: "geolocation=(), microphone=(), camera=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
