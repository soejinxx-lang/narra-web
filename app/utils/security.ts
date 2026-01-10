// 보안 유틸리티 함수들 (사용자에게 투명하게 작동)

// XSS 방지: HTML 태그 제거 및 특수 문자 이스케이프
export function sanitizeInput(input: string): string {
  if (!input) return "";
  
  // HTML 태그 제거
  let sanitized = input.replace(/<[^>]*>/g, "");
  
  // 특수 문자 이스케이프
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };
  
  sanitized = sanitized.replace(/[&<>"'/]/g, (char) => map[char] || char);
  
  // 길이 제한 (너무 긴 입력 방지)
  if (sanitized.length > 10000) {
    sanitized = sanitized.substring(0, 10000);
  }
  
  return sanitized.trim();
}

// 입력 검증: 안전한 문자열인지 확인
export function isValidInput(input: string, maxLength: number = 1000): boolean {
  if (!input || input.length === 0) return false;
  if (input.length > maxLength) return false;
  
  // 위험한 패턴 감지
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick, onerror 등
    /data:text\/html/i,
    /vbscript:/i,
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(input)) {
      return false;
    }
  }
  
  return true;
}

// 로그인 시도 제한 (Rate Limiting)
export function checkLoginAttempts(username: string): { allowed: boolean; remainingTime?: number } {
  if (typeof window === "undefined") return { allowed: true };
  
  const key = `loginAttempts_${username}`;
  const lockKey = `loginLock_${username}`;
  
  // 잠금 상태 확인
  const lockData = localStorage.getItem(lockKey);
  if (lockData) {
    try {
      const lock = JSON.parse(lockData);
      const now = Date.now();
      if (now < lock.until) {
        return { allowed: false, remainingTime: lock.until - now };
      } else {
        // 잠금 시간이 지났으면 해제
        localStorage.removeItem(lockKey);
        localStorage.removeItem(key);
      }
    } catch (error) {
      // 파싱 에러 시 잠금 해제
      localStorage.removeItem(lockKey);
      localStorage.removeItem(key);
    }
  }
  
  return { allowed: true };
}

// 로그인 시도 기록 (성공/실패)
export function recordLoginAttempt(username: string, success: boolean): void {
  if (typeof window === "undefined") return;
  
  if (success) {
    // 성공 시 기록 초기화
    clearLoginAttempts(username);
    return;
  }
  
  // 실패 시 기록
  const key = `loginAttempts_${username}`;
  const attempts = JSON.parse(localStorage.getItem(key) || "[]");
  
  const now = Date.now();
  // 최근 15분 이내의 시도만 유지
  const recentAttempts = attempts.filter((time: number) => now - time < 15 * 60 * 1000);
  recentAttempts.push(now);
  
  localStorage.setItem(key, JSON.stringify(recentAttempts));
  
  // 5번 이상 실패하면 15분간 잠금
  if (recentAttempts.length >= 5) {
    const lockKey = `loginLock_${username}`;
    localStorage.setItem(
      lockKey,
      JSON.stringify({
        until: now + 15 * 60 * 1000, // 15분 후
      })
    );
  }
}

// 로그인 실패 기록 (하위 호환성)
export function recordLoginFailure(username: string): void {
  recordLoginAttempt(username, false);
}

// 로그인 성공 시 시도 기록 초기화
export function clearLoginAttempts(username: string): void {
  if (typeof window === "undefined") return;
  
  localStorage.removeItem(`loginAttempts_${username}`);
  localStorage.removeItem(`loginLock_${username}`);
}

// 비밀번호 강도 검증 (일반적인 사이트 수준)
export function validatePasswordStrength(password: string): { valid: boolean; reason?: string } {
  // 최소 길이 8자
  if (!password || password.length < 8) {
    return { valid: false, reason: "Password must be at least 8 characters" };
  }
  
  if (password.length > 128) {
    return { valid: false, reason: "Password is too long" };
  }
  
  // 영문과 숫자 포함 필수 (일반적인 사이트 수준)
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  if (!hasLetter || !hasNumber) {
    return { valid: false, reason: "Password must contain both letters and numbers" };
  }
  
  // 너무 단순한 비밀번호 방지 (예: 11111111, aaaaaaaa)
  if (/^(.)\1+$/.test(password)) {
    return { valid: false, reason: "Password is too simple" };
  }
  
  // 일반적인 약한 비밀번호 패턴
  const weakPatterns = [
    /^password/i,
    /^12345678/,
    /^qwerty/i,
    /^abc123/i,
  ];
  
  for (const pattern of weakPatterns) {
    if (pattern.test(password)) {
      return { valid: false, reason: "Password is too common" };
    }
  }
  
  return { valid: true };
}

// 사용자명 검증
export function validateUsername(username: string): { valid: boolean; reason?: string } {
  if (!username || username.length < 3) {
    return { valid: false, reason: "Username must be at least 3 characters" };
  }
  
  if (username.length > 20) {
    return { valid: false, reason: "Username is too long (max 20 characters)" };
  }
  
  // 특수 문자 제한 (알파벳, 숫자, 언더스코어, 하이픈만 허용)
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { valid: false, reason: "Username can only contain letters, numbers, underscore, and hyphen" };
  }
  
  return { valid: true };
}

