import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useState, useEffect } from "react";

export const Route = createFileRoute("/landing")({
  head: () => ({
    meta: [
      { title: "Welcome · Project Soulfire — KPMG" },
      { name: "description", content: "Project Soulfire Executive Dashboard — Federal Bank Credit Card Portfolio Migration" },
    ],
  }),
  component: LandingPage,
});

// ---------------------------------------------------------------------------
// Main landing page — clean white design with KPMG logo in a frame
// ---------------------------------------------------------------------------
function LandingPage() {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [phase, setPhase] = useState<"idle" | "exiting" | "done">("idle");
  const [mounted, setMounted] = useState(false);

  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = useCallback(() => {
    if (phase !== "idle") return;
    setPhase("exiting");
    setTimeout(() => {
      setPhase("done");
      navigate({ to: "/" });
    }, 800);
  }, [phase, navigate]);

  return (
    <div
      onClick={handleClick}
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        background: "#ffffff",
        fontFamily: "'Segoe UI', Inter, system-ui, sans-serif",
        cursor: phase === "idle" ? "pointer" : "default",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transition: "opacity 0.6s ease",
        opacity: phase === "exiting" ? 0 : 1,
      }}
    >
      {/* Subtle background pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(0, 51, 141, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(0, 145, 218, 0.03) 0%, transparent 50%)
          `,
          pointerEvents: "none",
        }}
      />

      {/* Decorative top accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: "linear-gradient(90deg, #00338D 0%, #0091DA 50%, #00338D 100%)",
        }}
      />

      {/* Main content container */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.8s ease, transform 0.8s ease",
        }}
      >
        {/* Logo Frame */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            position: "relative",
            padding: 32,
            borderRadius: 16,
            border: `2px solid ${isHovered ? "rgba(0, 51, 141, 0.3)" : "rgba(0, 51, 141, 0.12)"}`,
            background: isHovered
              ? "linear-gradient(135deg, rgba(0, 51, 141, 0.02) 0%, rgba(0, 145, 218, 0.02) 100%)"
              : "rgba(255, 255, 255, 1)",
            boxShadow: isHovered
              ? "0 20px 60px rgba(0, 51, 141, 0.12), 0 8px 24px rgba(0, 51, 141, 0.08), inset 0 0 0 1px rgba(0, 51, 141, 0.05)"
              : "0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 4px rgba(0, 0, 0, 0.04)",
            transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            transform: isHovered ? "scale(1.02)" : "scale(1)",
          }}
        >
          {/* Corner accents */}
          <div style={{ position: "absolute", top: -1, left: -1, width: 24, height: 24, borderTop: "3px solid #00338D", borderLeft: "3px solid #00338D", borderRadius: "16px 0 0 0" }} />
          <div style={{ position: "absolute", top: -1, right: -1, width: 24, height: 24, borderTop: "3px solid #00338D", borderRight: "3px solid #00338D", borderRadius: "0 16px 0 0" }} />
          <div style={{ position: "absolute", bottom: -1, left: -1, width: 24, height: 24, borderBottom: "3px solid #00338D", borderLeft: "3px solid #00338D", borderRadius: "0 0 0 16px" }} />
          <div style={{ position: "absolute", bottom: -1, right: -1, width: 24, height: 24, borderBottom: "3px solid #00338D", borderRight: "3px solid #00338D", borderRadius: "0 0 16px 0" }} />

          {/* KPMG Logo */}
          <img
            src="/kpmg-landing-logo.png"
            alt="KPMG"
            style={{
              display: "block",
              width: "min(420px, 70vw)",
              height: "auto",
              objectFit: "contain",
              transition: "transform 0.4s ease",
              transform: isHovered ? "scale(1.01)" : "scale(1)",
            }}
          />
        </div>

        {/* Project title */}
        <div
          style={{
            textAlign: "center",
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 1s ease 0.3s, transform 1s ease 0.3s",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(22px, 3.5vw, 32px)",
              fontWeight: 700,
              color: "#00338D",
              letterSpacing: "-0.01em",
              lineHeight: 1.2,
            }}
          >
            Project Soulfire
          </h1>
          <p
            style={{
              margin: "8px 0 0",
              fontSize: "clamp(13px, 1.8vw, 16px)",
              fontWeight: 400,
              color: "#5A6B7F",
              letterSpacing: "0.02em",
            }}
          >
            Federal Bank · Credit Card Portfolio Migration
          </p>
        </div>

        {/* Click to enter indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 28px",
            borderRadius: 40,
            background: isHovered
              ? "linear-gradient(135deg, #00338D, #0091DA)"
              : "transparent",
            border: `1.5px solid ${isHovered ? "transparent" : "rgba(0, 51, 141, 0.25)"}`,
            color: isHovered ? "#ffffff" : "#00338D",
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: "0.04em",
            transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            boxShadow: isHovered
              ? "0 8px 24px rgba(0, 51, 141, 0.25)"
              : "none",
            opacity: mounted ? 1 : 0,
            transform: mounted
              ? isHovered ? "translateY(-2px)" : "translateY(0)"
              : "translateY(10px)",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transition: "transform 0.3s ease",
              transform: isHovered ? "translateX(3px)" : "translateX(0)",
            }}
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 8 16 12 12 16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          Click to Enter Dashboard
        </div>
      </div>

      {/* Bottom accent */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          background: "linear-gradient(90deg, #0091DA 0%, #00338D 50%, #0091DA 100%)",
        }}
      />

      {/* Bottom confidential tag */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 11,
          fontWeight: 500,
          color: "rgba(0, 51, 141, 0.35)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        Confidential · July 2026
      </div>
    </div>
  );
}
