"use client";

import { useState, useEffect } from "react";
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

export default function DailyCheckInPage() {
  const [checkIns, setCheckIns] = useState<Set<string>>(new Set());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [streak, setStreak] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [todayChecked, setTodayChecked] = useState(false);
  const [missionProgress, setMissionProgress] = useState<{ [key: string]: number }>({});
  const [completedMissions, setCompletedMissions] = useState<Set<string>>(new Set());

  useEffect(() => {
    const today = formatDate(new Date());
    
    // Load check-ins
    const saved = localStorage.getItem("dailyCheckIns");
    if (saved) {
      const savedCheckIns = JSON.parse(saved);
      setCheckIns(new Set(savedCheckIns));
      
      // Calculate streak
      let currentStreak = 0;
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      
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
      
      const todayStr = formatDate(todayDate);
      setTodayChecked(savedCheckIns.includes(todayStr));
    }

    // Load mission progress for today
    const missionKey = `dailyMissions_${today}`;
    const savedMissions = localStorage.getItem(missionKey);
    if (savedMissions) {
      const data = JSON.parse(savedMissions);
      setMissionProgress(data.progress || {});
      setCompletedMissions(new Set(data.completed || []));
    }

    // Check mission progress from other sources
    updateMissionProgress();
    
    // Set up interval to check mission progress
    const interval = setInterval(updateMissionProgress, 2000);
    return () => clearInterval(interval);
  }, []);

  const updateMissionProgress = () => {
    const today = formatDate(new Date());
    const progress: { [key: string]: number } = {};
    const completed = new Set<string>();

    // Check share missions
    const shareKey = `novelShares_${today}`;
    const shares = parseInt(localStorage.getItem(shareKey) || "0", 10);
    progress.share = shares;
    if (shares >= dailyMissions.find(m => m.id === "share")!.target) {
      completed.add("share");
    }

    // Check read missions
    const readKey = `episodesRead_${today}`;
    const reads = parseInt(localStorage.getItem(readKey) || "0", 10);
    progress.read5 = reads;
    if (reads >= dailyMissions.find(m => m.id === "read5")!.target) {
      completed.add("read5");
    }

    // Check check-in mission
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const todayStr = formatDate(todayDate);
    if (checkIns.has(todayStr)) {
      progress.checkin = 1;
      completed.add("checkin");
    }

    setMissionProgress(progress);
    setCompletedMissions(completed);

    // Save mission progress
    const missionKey = `dailyMissions_${today}`;
    localStorage.setItem(missionKey, JSON.stringify({
      progress,
      completed: Array.from(completed),
    }));
  };

  const formatDate = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const handleCheckIn = () => {
    const today = new Date();
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
    localStorage.setItem("dailyCheckIns", JSON.stringify(checkInsArray));
    
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
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
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
      <h1
        style={{
          fontSize: "32px",
          fontWeight: 600,
          marginBottom: "32px",
          color: "#243A6E",
          fontFamily: '"KoPub Batang", serif',
        }}
      >
        Daily Check-in
      </h1>

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
            
            return (
              <div
                key={index}
                style={{
                  aspectRatio: "1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "8px",
                  background: checked ? "#e8ecf5" : today ? "#fff3cd" : "#faf9f6",
                  border: today ? "2px solid #243A6E" : checked ? "2px solid #243A6E" : "1px solid #e5e5e5",
                  position: "relative",
                  cursor: date ? "pointer" : "default",
                }}
              >
                {date && (
                  <>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: today ? 600 : checked ? 500 : 400,
                        color: today ? "#243A6E" : checked ? "#243A6E" : "#666",
                      }}
                    >
                      {date.getDate()}
                    </div>
                    {checked && (
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
