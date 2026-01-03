"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Mission {
  id: string;
  title: string;
  description: string;
  target: number;
  type: "share" | "read" | "checkin";
}

const dailyMissions: Mission[] = [
  { id: "share", title: "Share a Novel", description: "Share a novel with someone", target: 1, type: "share" },
  { id: "read5", title: "Read 5 Episodes", description: "Read 5 episodes today", target: 5, type: "read" },
  { id: "checkin", title: "Daily Check-in", description: "Check in today", target: 1, type: "checkin" },
];

// 미국 동부 시간(EST/EDT) 기준 날짜 가져오기 (컴포넌트 외부에서 정의)
const getUSEasternDate = (): Date => {
  const now = new Date();
  // 미국 동부 시간대는 UTC-5 (EST) 또는 UTC-4 (EDT)
  // Intl API를 사용하여 정확한 시간대 변환
  const usEasternTimeString = now.toLocaleString("en-US", { timeZone: "America/New_York" });
  // 문자열을 파싱하여 Date 객체 생성
  const usEasternTime = new Date(usEasternTimeString);
  return usEasternTime;
};

export default function DailyCheckInPage() {
  const router = useRouter();
  const [checkIns, setCheckIns] = useState<Set<string>>(new Set());
  const [currentMonth, setCurrentMonth] = useState(() => getUSEasternDate());
  const [streak, setStreak] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [todayChecked, setTodayChecked] = useState(false);
  const [missionProgress, setMissionProgress] = useState<{ [key: string]: number }>({});
  const [completedMissions, setCompletedMissions] = useState<Set<string>>(new Set());
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string; name?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 로그인 확인
    const userData = localStorage.getItem("currentUser");
    if (!userData) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(userData);
    setCurrentUser(user);
    setIsLoading(false);

    // 미국 동부 시간 기준 오늘 날짜
    const today = getUSEasternDateString();
    const todayDate = getUSEasternDate();
    todayDate.setHours(0, 0, 0, 0);
    const todayStr = formatDate(todayDate);
    
    // 사용자별 체크인 데이터 키
    const checkInKey = `dailyCheckIns_${user.id}`;
    
    // Load check-ins
    const saved = localStorage.getItem(checkInKey);
    let savedCheckIns: string[] = [];
    if (saved) {
      savedCheckIns = JSON.parse(saved);
    }
    
    // 오늘 체크인이 안 되어 있으면 자동으로 체크인
    if (!savedCheckIns.includes(todayStr)) {
      const newCheckIns = [...savedCheckIns, todayStr];
      localStorage.setItem(checkInKey, JSON.stringify(newCheckIns));
      savedCheckIns = newCheckIns;
    }
    
    setCheckIns(new Set(savedCheckIns));
    setTodayChecked(true);
    
    // Calculate streak
    let currentStreak = 0;
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(todayDate);
      checkDate.setDate(todayDate.getDate() - i);
      const dateStr = formatDate(checkDate);
      
      if (savedCheckIns.includes(dateStr)) {
        currentStreak++;
      } else {
        break;
      }
    }
    setStreak(currentStreak);
    setTotalDays(savedCheckIns.length);

    // 사용자별 미션 진행도 키
    const missionKey = `dailyMissions_${user.id}_${today}`;
    const savedMissions = localStorage.getItem(missionKey);
    if (savedMissions) {
      const data = JSON.parse(savedMissions);
      setMissionProgress(data.progress || {});
      setCompletedMissions(new Set(data.completed || []));
    }

    // Check mission progress from other sources (user 객체 직접 사용)
    const progress: { [key: string]: number } = {};
    const completed = new Set<string>();

    // Check share missions
    const shareKey = `novelShares_${user.id}_${today}`;
    const shares = parseInt(localStorage.getItem(shareKey) || "0", 10);
    progress.share = shares;
    if (shares >= dailyMissions.find(m => m.id === "share")!.target) {
      completed.add("share");
    }

    // Check read missions
    const readKey = `episodesRead_${user.id}_${today}`;
    const reads = parseInt(localStorage.getItem(readKey) || "0", 10);
    progress.read5 = reads;
    if (reads >= dailyMissions.find(m => m.id === "read5")!.target) {
      completed.add("read5");
    }

    // Check check-in mission (접속 시 자동 체크인되므로 항상 완료)
    progress.checkin = 1;
    completed.add("checkin");

    setMissionProgress(progress);
    setCompletedMissions(completed);

    // Save mission progress
    localStorage.setItem(missionKey, JSON.stringify({
      progress,
      completed: Array.from(completed),
    }));

    // 3개 미션 모두 완료되었는지 확인하고 저장
    if (completed.has("checkin") && completed.has("share") && completed.has("read5")) {
      const allCompletedKey = `allMissionsCompleted_${user.id}`;
      const completedDates = JSON.parse(localStorage.getItem(allCompletedKey) || "[]");
      if (!completedDates.includes(today)) {
        completedDates.push(today);
        localStorage.setItem(allCompletedKey, JSON.stringify(completedDates));
      }
    }
    
    // Set up interval to check mission progress
    const interval = setInterval(() => {
      if (user) {
        updateMissionProgress();
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [router]);

  const updateMissionProgress = () => {
    if (!currentUser) return;

    // 미국 동부 시간 기준 오늘 날짜
    const today = getUSEasternDateString();
    const progress: { [key: string]: number } = {};
    const completed = new Set<string>();

    // 사용자별 미션 진행도 키
    const userId = currentUser.id;

    // Check share missions
    const shareKey = `novelShares_${userId}_${today}`;
    const shares = parseInt(localStorage.getItem(shareKey) || "0", 10);
    progress.share = shares;
    if (shares >= dailyMissions.find(m => m.id === "share")!.target) {
      completed.add("share");
    }

    // Check read missions
    const readKey = `episodesRead_${userId}_${today}`;
    const reads = parseInt(localStorage.getItem(readKey) || "0", 10);
    progress.read5 = reads;
    if (reads >= dailyMissions.find(m => m.id === "read5")!.target) {
      completed.add("read5");
    }

    // Check check-in mission (접속 시 자동 체크인되므로 항상 완료)
    progress.checkin = 1;
    completed.add("checkin");

    setMissionProgress(progress);
    setCompletedMissions(completed);

    // Save mission progress
    const missionKey = `dailyMissions_${userId}_${today}`;
    localStorage.setItem(missionKey, JSON.stringify({
      progress,
      completed: Array.from(completed),
    }));

    // 3개 미션 모두 완료되었는지 확인하고 저장
    if (completed.has("checkin") && completed.has("share") && completed.has("read5")) {
      const allCompletedKey = `allMissionsCompleted_${userId}`;
      const completedDates = JSON.parse(localStorage.getItem(allCompletedKey) || "[]");
      if (!completedDates.includes(today)) {
        completedDates.push(today);
        localStorage.setItem(allCompletedKey, JSON.stringify(completedDates));
      }
    }
  };

  // 미국 동부 시간 기준 오늘 날짜 문자열 반환
  const getUSEasternDateString = (): string => {
    const usDate = getUSEasternDate();
    return formatDate(usDate);
  };

  const formatDate = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const handleCheckIn = () => {
    if (!currentUser) return;

    // 미국 동부 시간 기준 오늘 날짜
    const today = getUSEasternDate();
    today.setHours(0, 0, 0, 0);
    const todayStr = formatDate(today);
    
    if (checkIns.has(todayStr)) {
      return;
    }

    const newCheckIns = new Set(checkIns);
    newCheckIns.add(todayStr);
    setCheckIns(newCheckIns);
    setTodayChecked(true);
    
    const checkInsArray = Array.from(newCheckIns);
    const checkInKey = `dailyCheckIns_${currentUser.id}`;
    localStorage.setItem(checkInKey, JSON.stringify(checkInsArray));
    
    // Update streak
    let currentStreak = 1;
    for (let i = 1; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = formatDate(checkDate);
      
      if (newCheckIns.has(dateStr)) {
        currentStreak++;
      } else {
        break;
      }
    }
    setStreak(currentStreak);
    setTotalDays(checkInsArray.length);

    // Update check-in mission
    updateMissionProgress();
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    router.push("/login");
  };

  if (isLoading) {
    return (
      <main style={{ padding: "32px 24px", maxWidth: "1000px", margin: "0 auto", textAlign: "center" }}>
        <div style={{ color: "#666" }}>Loading...</div>
      </main>
    );
  }

  if (!currentUser) {
    return null;
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isChecked = (date: Date | null): boolean => {
    if (!date) return false;
    return checkIns.has(formatDate(date));
  };

  const isToday = (date: Date | null): boolean => {
    if (!date) return false;
    const today = getUSEasternDate();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // 해당 날짜에 3개 미션을 모두 완료했는지 확인
  const areAllMissionsCompleted = (date: Date | null): boolean => {
    if (!date || !currentUser) return false;
    const dateStr = formatDate(date);
    const missionKey = `dailyMissions_${currentUser.id}_${dateStr}`;
    const savedMissions = localStorage.getItem(missionKey);
    
    if (!savedMissions) return false;
    
    try {
      const data = JSON.parse(savedMissions);
      const completed = new Set(data.completed || []);
      // 3개 미션 모두 완료되었는지 확인
      return completed.has("checkin") && completed.has("share") && completed.has("read5");
    } catch (e) {
      return false;
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const days = getDaysInMonth(currentMonth);

  const getMissionProgress = (missionId: string): number => {
    return missionProgress[missionId] || 0;
  };

  const isMissionCompleted = (missionId: string): boolean => {
    return completedMissions.has(missionId);
  };

  return (
    <main style={{ padding: "32px 24px", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <h1
          style={{
            fontSize: "32px",
            fontWeight: 600,
            color: "#243A6E",
            fontFamily: '"KoPub Batang", serif',
            margin: 0,
          }}
        >
          Daily Check-in
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ color: "#666", fontSize: "14px" }}>
            Welcome, {currentUser.name || currentUser.username}!
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 16px",
              background: "transparent",
              border: "1px solid #e5e5e5",
              borderRadius: "8px",
              fontSize: "14px",
              color: "#666",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f0f0f0";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "32px" }}>
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "24px",
            border: "1px solid #e5e5e5",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "32px", fontWeight: 600, color: "#243A6E", marginBottom: "8px" }}>{streak}</div>
          <div style={{ fontSize: "14px", color: "#666" }}>Day Streak</div>
        </div>
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "24px",
            border: "1px solid #e5e5e5",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "32px", fontWeight: 600, color: "#243A6E", marginBottom: "8px" }}>{totalDays}</div>
          <div style={{ fontSize: "14px", color: "#666" }}>Total Check-ins</div>
        </div>
      </div>

      {/* Daily Missions */}
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "24px",
          border: "1px solid #e5e5e5",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          marginBottom: "32px",
        }}
      >
        <h2
          style={{
            fontSize: "20px",
            fontWeight: 600,
            marginBottom: "20px",
            color: "#243A6E",
            fontFamily: '"KoPub Batang", serif',
          }}
        >
          Daily Missions
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {dailyMissions.map((mission) => {
            const progress = getMissionProgress(mission.id);
            const completed = isMissionCompleted(mission.id);
            const progressPercent = Math.min((progress / mission.target) * 100, 100);

            return (
              <div
                key={mission.id}
                style={{
                  padding: "16px",
                  background: completed ? "#e8ecf5" : "#faf9f6",
                  borderRadius: "8px",
                  border: completed ? "2px solid #243A6E" : "1px solid #e5e5e5",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#243A6E", margin: 0 }}>
                        {mission.title}
                      </h3>
                      {completed && (
                        <span style={{ color: "#4CAF50", fontSize: "18px" }}>✓</span>
                      )}
                    </div>
                    <p style={{ fontSize: "13px", color: "#666", margin: 0 }}>{mission.description}</p>
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 500, color: "#243A6E", marginLeft: "12px" }}>
                    {progress} / {mission.target}
                  </div>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "8px",
                    background: "#e5e5e5",
                    borderRadius: "4px",
                    overflow: "hidden",
                    marginTop: "8px",
                  }}
                >
                  <div
                    style={{
                      width: `${progressPercent}%`,
                      height: "100%",
                      background: completed ? "#4CAF50" : "#243A6E",
                      borderRadius: "4px",
                      transition: "width 0.3s",
                    }}
                  />
                </div>
                {mission.id === "share" && !completed && (
                  <div style={{ marginTop: "8px" }}>
                    <Link
                      href="/novels"
                      style={{
                        fontSize: "13px",
                        color: "#243A6E",
                        textDecoration: "underline",
                      }}
                    >
                      Go to novels →
                    </Link>
                  </div>
                )}
                {mission.id === "read5" && !completed && (
                  <div style={{ marginTop: "8px" }}>
                    <Link
                      href="/novels"
                      style={{
                        fontSize: "13px",
                        color: "#243A6E",
                        textDecoration: "underline",
                      }}
                    >
                      Start reading →
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Check-in Button */}
      {!todayChecked && (
        <div style={{ marginBottom: "32px", textAlign: "center" }}>
          <button
            onClick={handleCheckIn}
            style={{
              padding: "16px 32px",
              background: "#243A6E",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              fontSize: "18px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.2s",
              fontFamily: '"KoPub Batang", serif',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#1e2f56";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#243A6E";
            }}
          >
            ✓ Check In Today
          </button>
        </div>
      )}

      {todayChecked && (
        <div
          style={{
            marginBottom: "32px",
            padding: "16px",
            background: "#e8ecf5",
            borderRadius: "12px",
            textAlign: "center",
            color: "#243A6E",
            fontWeight: 500,
          }}
        >
          ✓ You've already checked in today!
        </div>
      )}

      {/* Calendar */}
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "32px",
          border: "1px solid #e5e5e5",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        {/* Calendar Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <button
            onClick={goToPreviousMonth}
            style={{
              background: "none",
              border: "1px solid #e5e5e5",
              borderRadius: "8px",
              padding: "8px 16px",
              cursor: "pointer",
              color: "#243A6E",
              fontSize: "14px",
            }}
          >
            ← Previous
          </button>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: 600,
              color: "#243A6E",
              fontFamily: '"KoPub Batang", serif',
            }}
          >
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          <button
            onClick={goToNextMonth}
            style={{
              background: "none",
              border: "1px solid #e5e5e5",
              borderRadius: "8px",
              padding: "8px 16px",
              cursor: "pointer",
              color: "#243A6E",
              fontSize: "14px",
            }}
          >
            Next →
          </button>
        </div>

        {/* Week Days Header */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px", marginBottom: "12px" }}>
          {weekDays.map((day) => (
            <div
              key={day}
              style={{
                textAlign: "center",
                fontWeight: 600,
                color: "#243A6E",
                fontSize: "12px",
                padding: "8px",
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px" }}>
          {days.map((date, index) => {
            const checked = isChecked(date);
            const today = isToday(date);
            const allMissionsCompleted = areAllMissionsCompleted(date);
            
            return (
              <div
                key={index}
                style={{
                  aspectRatio: "1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "8px",
                  background: allMissionsCompleted ? "#d4edda" : checked ? "#e8ecf5" : today ? "#fff3cd" : "#faf9f6",
                  border: allMissionsCompleted ? "2px solid #28a745" : today ? "2px solid #243A6E" : checked ? "2px solid #243A6E" : "1px solid #e5e5e5",
                  position: "relative",
                  cursor: date ? "pointer" : "default",
                }}
              >
                {date && (
                  <>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: today ? 600 : checked || allMissionsCompleted ? 500 : 400,
                        color: allMissionsCompleted ? "#28a745" : today ? "#243A6E" : checked ? "#243A6E" : "#666",
                        zIndex: allMissionsCompleted ? 1 : "auto",
                        position: "relative",
                      }}
                    >
                      {date.getDate()}
                    </div>
                    {allMissionsCompleted && (
                      <div
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          fontSize: "48px",
                          color: "#28a745",
                          fontWeight: "bold",
                          lineHeight: "1",
                          zIndex: 2,
                          opacity: 0.8,
                        }}
                        title="All missions completed!"
                      >
                        ✓
                      </div>
                    )}
                    {checked && !allMissionsCompleted && (
                      <div
                        style={{
                          position: "absolute",
                          top: "4px",
                          right: "4px",
                          fontSize: "16px",
                        }}
                      >
                        ✓
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          marginTop: "24px",
          padding: "16px",
          background: "#faf9f6",
          borderRadius: "8px",
          display: "flex",
          gap: "24px",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "6px",
              background: "#e8ecf5",
              border: "2px solid #243A6E",
            }}
          />
          <span style={{ fontSize: "12px", color: "#666" }}>Checked In</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "6px",
              background: "#fff3cd",
              border: "2px solid #243A6E",
            }}
          />
          <span style={{ fontSize: "12px", color: "#666" }}>Today</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "6px",
              background: "#faf9f6",
              border: "1px solid #e5e5e5",
            }}
          />
          <span style={{ fontSize: "12px", color: "#666" }}>Not Checked</span>
        </div>
      </div>
    </main>
  );
}
