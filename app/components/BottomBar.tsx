"use client";

export default function BottomBar() {
  return (
    <div
      style={{
        width: "100%",
        padding: "78px 24px 40px 24px", // 상단 패딩을 40px에서 78px로 증가 (약 1cm 추가)
        background: "#3a3a3a",
        color: "#fff",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        position: "relative",
      }}
    >
      <div
        style={{
          fontSize: "14px",
          fontWeight: 400,
          color: "rgba(255, 255, 255, 0.4)", // 보일듯 안 보일듯한 투명도
          marginRight: "24px",
        }}
      >
        narrastudio901@gmail.com
      </div>
    </div>
  );
}

