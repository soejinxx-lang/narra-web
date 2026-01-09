// localStorage 보안 유틸리티 (사용자에게 투명하게 작동)

// localStorage 데이터 검증 및 안전하게 저장
export function secureSetItem(key: string, value: any): void {
  if (typeof window === "undefined") return;
  
  try {
    // 값이 문자열이 아닌 경우 JSON으로 변환
    const stringValue = typeof value === "string" ? value : JSON.stringify(value);
    
    // 데이터 크기 제한 (5MB)
    if (stringValue.length > 5 * 1024 * 1024) {
      console.error(`Storage quota exceeded for key: ${key}`);
      return;
    }
    
    // 키 검증 (안전한 키만 허용)
    if (!/^[a-zA-Z0-9_-]+$/.test(key)) {
      console.error(`Invalid storage key: ${key}`);
      return;
    }
    
    localStorage.setItem(key, stringValue);
  } catch (error) {
    // QuotaExceededError 등의 에러 처리
    console.error(`Failed to save to localStorage: ${error}`);
  }
}

// localStorage 데이터 안전하게 가져오기
export function secureGetItem(key: string): string | null {
  if (typeof window === "undefined") return null;
  
  // 키 검증
  if (!/^[a-zA-Z0-9_-]+$/.test(key)) {
    return null;
  }
  
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Failed to read from localStorage: ${error}`);
    return null;
  }
}

// localStorage 데이터 안전하게 제거
export function secureRemoveItem(key: string): void {
  if (typeof window === "undefined") return;
  
  // 키 검증
  if (!/^[a-zA-Z0-9_-]+$/.test(key)) {
    return;
  }
  
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove from localStorage: ${error}`);
  }
}

// JSON 데이터 안전하게 파싱
export function secureParseJSON<T>(jsonString: string | null, fallback: T): T {
  if (!jsonString) return fallback;
  
  try {
    const parsed = JSON.parse(jsonString);
    
    // 재귀적으로 순환 참조 체크 (깊이 제한)
    const checkDepth = (obj: any, depth: number = 0): boolean => {
      if (depth > 10) return false; // 최대 깊이 제한
      if (typeof obj !== "object" || obj === null) return true;
      
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (!checkDepth(obj[key], depth + 1)) return false;
        }
      }
      return true;
    };
    
    if (!checkDepth(parsed)) {
      return fallback;
    }
    
    return parsed as T;
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    return fallback;
  }
}

