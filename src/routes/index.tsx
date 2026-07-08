import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { useDashboardData, type RagItem } from "@/hooks/useDashboardData";
import { useCountUp } from "@/hooks/useCountUp";
import {
  ragSummary as staticRag,
  pendingFromTsys as staticPending,
  type RagStatus,
} from "@/lib/dashboard-data";

// ---------------------------------------------------------------------------
// Route definition — single URL handles both landing and dashboard
// via ?entered=true search parameter
// ---------------------------------------------------------------------------

type IndexSearch = { entered: boolean };

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): IndexSearch => ({
    entered:
      search.entered === "true" ||
      search.entered === true ||
      search.entered === "1",
  }),
  head: () => ({
    meta: [
      { title: "Project Soulfire · KPMG" },
      {
        name: "description",
        content:
          "Project Soulfire — Federal Bank Credit Card Portfolio Migration Executive Dashboard",
      },
    ],
  }),
  component: RootPage,
});

// ---------------------------------------------------------------------------
// Root Page — decides Landing vs Dashboard based on ?entered=true
// ---------------------------------------------------------------------------
function RootPage() {
  const search = Route.useSearch() as IndexSearch;
  const entered = search?.entered ?? false;

  if (!entered) return <LandingPage />;
  return <DashboardPage />;
}

// ============================================================
//  LANDING PAGE — Clean, premium enterprise design
//  + Auto-redirect countdown (5 s) with animated ring + Skip
// ============================================================

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
  type: "dot" | "diamond" | "line";
}

function useParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const counter = useRef(0);
  const raf = useRef<number | null>(null);

  const spawn = useCallback((): Particle => {
    const types: Particle["type"][] = ["dot", "dot", "dot", "diamond", "line"];
    return {
      id: counter.current++,
      x: Math.random() * 100,
      y: 102 + Math.random() * 8,
      vx: (Math.random() - 0.5) * 0.018,
      vy: -(Math.random() * 0.055 + 0.02),
      size: Math.random() * 3.5 + 1,
      opacity: Math.random() * 0.3 + 0.06,
      life: 0,
      maxLife: Math.random() * 280 + 180,
      type: types[Math.floor(Math.random() * types.length)],
    };
  }, []);

  useEffect(() => {
    setParticles(Array.from({ length: 24 }, spawn));
    let last = 0;
    const tick = (t: number) => {
      if (t - last > 380) {
        last = t;
        setParticles((prev) => {
          const alive = prev
            .map((p) => ({
              ...p,
              x: p.x + p.vx,
              y: p.y + p.vy,
              life: p.life + 1,
            }))
            .filter((p) => p.life < p.maxLife && p.y > -5);
          return [...alive, spawn()].slice(-55);
        });
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [spawn]);

  return particles;
}

// ---------------------------------------------------------------------------
// Animated countdown ring (SVG)
// ---------------------------------------------------------------------------
const COUNTDOWN_SECONDS = 5;
const RING_RADIUS = 45;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS; // ≈ 283

function CountdownRing({
  total,
  remaining,
  onSkip,
  visible,
}: {
  total: number;
  remaining: number;
  onSkip: () => void;
  visible: boolean;
}) {
  const dashOffset = ((total - remaining) / total) * RING_CIRCUMFERENCE;
  const [skipHover, setSkipHover] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.6s ease 1s, transform 0.6s ease 1s",
      }}
    >
      {/* SVG countdown ring */}
      <div style={{ position: "relative", width: 108, height: 108 }}>
        <svg
          width="108"
          height="108"
          viewBox="0 0 108 108"
          style={{ transform: "rotate(-90deg)" }}
        >
          {/* Track */}
          <circle
            cx="54"
            cy="54"
            r={RING_RADIUS}
            fill="none"
            stroke="rgba(0,153,168,0.15)"
            strokeWidth="3"
          />
          {/* Progress arc */}
          <circle
            cx="54"
            cy="54"
            r={RING_RADIUS}
            fill="none"
            stroke="rgba(0,153,168,0.7)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 0.95s linear" }}
          />
        </svg>
        {/* Countdown number */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            key={remaining}
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: "rgba(0,200,220,0.9)",
              lineHeight: 1,
              animation: "soulfireDigitIn 0.3s cubic-bezier(0.16,1,0.3,1) both",
            }}
          >
            {remaining}
          </span>
          <span
            style={{
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(0,153,168,0.6)",
              marginTop: 2,
            }}
          >
            sec
          </span>
        </div>
      </div>

      {/* Skip button */}
      <button
        onMouseEnter={() => setSkipHover(true)}
        onMouseLeave={() => setSkipHover(false)}
        onClick={onSkip}
        style={{
          border: "1px solid rgba(0,153,168,0.35)",
          background: skipHover
            ? "rgba(0,153,168,0.14)"
            : "rgba(0,153,168,0.06)",
          color: skipHover ? "rgba(0,200,220,0.95)" : "rgba(0,153,168,0.7)",
          borderRadius: 100,
          padding: "5px 16px",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 6,
          transition: "all 0.22s cubic-bezier(0.16,1,0.3,1)",
          transform: skipHover ? "scale(1.05)" : "scale(1)",
        }}
      >
        Skip
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Landing Page component
// ---------------------------------------------------------------------------
function LandingPage() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [ctaHover, setCtaHover] = useState(false);
  const [zooming, setZooming] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [skipVisible, setSkipVisible] = useState(false);
  const particles = useParticles();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Show the skip/countdown UI after a 1-second delay
  useEffect(() => {
    if (!mounted) return;
    const t = setTimeout(() => setSkipVisible(true), 1000);
    return () => clearTimeout(t);
  }, [mounted]);

  const doEnter = useCallback(() => {
    if (zooming) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setZooming(true);
    setTimeout(
      () => navigate({ to: "/", search: { entered: true } }),
      950,
    );
  }, [zooming, navigate]);

  // Auto-countdown interval
  useEffect(() => {
    if (!mounted || zooming) return;
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          // Small delay so user sees "0" before the wipe
          setTimeout(doEnter, 200);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  const show = mounted && !zooming;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        background:
          "linear-gradient(158deg, #00071c 0%, #000d30 38%, #001a4f 68%, #00205e 100%)",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage:
            "linear-gradient(rgba(0,48,135,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(0,48,135,0.16) 1px, transparent 1px)",
          backgroundSize: "70px 70px",
          maskImage:
            "radial-gradient(ellipse 78% 78% at 50% 50%, black 25%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 78% 78% at 50% 50%, black 25%, transparent 100%)",
        }}
      />

      {/* Ambient glows */}
      <div
        style={{
          position: "absolute",
          top: "5%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "65vw",
          height: "50vh",
          background:
            "radial-gradient(circle, rgba(0,140,180,0.11) 0%, transparent 70%)",
          filter: "blur(70px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "0",
          left: "15%",
          width: "38vw",
          height: "28vh",
          background:
            "radial-gradient(circle, rgba(0,48,135,0.15) 0%, transparent 70%)",
          filter: "blur(55px)",
          pointerEvents: "none",
        }}
      />

      {/* Data-flow SVG lines */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          opacity: 0.055,
        }}
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="fl1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#003087" stopOpacity="0" />
            <stop offset="50%" stopColor="#0099a8" stopOpacity="1" />
            <stop offset="100%" stopColor="#003087" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 90, 180, 270, 360, 450].map((o, i) => (
          <path
            key={i}
            d={`M${-180 + o} 900 Q${380 + o} 450 ${920 + o} 0`}
            fill="none"
            stroke="url(#fl1)"
            strokeWidth="1.4"
            style={{
              animation: `flowLine ${5.5 + i * 0.6}s linear infinite`,
              animationDelay: `${i * 0.9}s`,
            }}
          />
        ))}
        {[200, 400, 600, 750].map((y, i) => (
          <line
            key={`h${i}`}
            x1="0"
            y1={y}
            x2="1440"
            y2={y}
            stroke="#003087"
            strokeWidth="0.5"
            strokeOpacity="0.4"
          />
        ))}
      </svg>

      {/* Floating particles */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          overflow: "hidden",
          zIndex: 1,
        }}
      >
        {particles.map((p) => {
          const fade = 1 - p.life / p.maxLife;
          const op = p.opacity * fade;
          if (p.type === "dot")
            return (
              <div
                key={p.id}
                style={{
                  position: "absolute",
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: p.size,
                  height: p.size,
                  borderRadius: "50%",
                  background:
                    p.size > 2.5
                      ? "rgba(0,153,168,0.55)"
                      : "rgba(147,197,253,0.45)",
                  opacity: op,
                  transform: "translate(-50%,-50%)",
                }}
              />
            );
          if (p.type === "diamond")
            return (
              <div
                key={p.id}
                style={{
                  position: "absolute",
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: p.size * 2,
                  height: p.size * 2,
                  background: "rgba(0,48,135,0.45)",
                  opacity: op * 0.7,
                  transform: "translate(-50%,-50%) rotate(45deg)",
                  border: "1px solid rgba(0,153,168,0.35)",
                }}
              />
            );
          return (
            <div
              key={p.id}
              style={{
                position: "absolute",
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size * 10,
                height: 1,
                background:
                  "linear-gradient(90deg,transparent,rgba(0,153,168,0.45),transparent)",
                opacity: op,
                transform: "translate(-50%,-50%)",
              }}
            />
          );
        })}
      </div>

      {/* ── TOP NAV ── */}
      <nav
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 40px",
          borderBottom: "1px solid rgba(255,255,255,0.055)",
          background: "rgba(0,7,26,0.38)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          opacity: show ? 1 : 0,
          transform: show ? "translateY(0)" : "translateY(-16px)",
          transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img
            src="/kpmg-logo-transparent.png"
            alt="KPMG"
            style={{ height: 26, width: "auto", objectFit: "contain" }}
          />
          <div
            style={{
              width: 1,
              height: 22,
              background: "rgba(255,255,255,0.14)",
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.13em",
              color: "rgba(255,255,255,0.45)",
              textTransform: "uppercase",
            }}
          >
            Federal Bank
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "5px 13px",
            borderRadius: 4,
            border: "1px solid rgba(255,200,0,0.22)",
            background: "rgba(255,200,0,0.055)",
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#f59e0b",
              animation: "pulseDot 2s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.15em",
              color: "rgba(245,158,11,0.82)",
              textTransform: "uppercase",
            }}
          >
            Confidential
          </span>
        </div>
      </nav>

      {/* ── HERO ── */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 5,
          padding: "0 24px",
          gap: 0,
        }}
      >
        {/* KPMG Logo — clean, no border, subtle glow */}
        <div
          style={{
            position: "relative",
            opacity: show ? 1 : 0,
            transform: show
              ? zooming
                ? "scale(1.2) translateY(-28px)"
                : "scale(1) translateY(0)"
              : "scale(0.88) translateY(36px)",
            transition:
              "opacity 1s cubic-bezier(0.16,1,0.3,1), transform 1.1s cubic-bezier(0.16,1,0.3,1)",
            marginBottom: "clamp(24px, 3.5vh, 44px)",
          }}
        >
          {/* Ambient glow — no circle, no border */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "140%",
              height: "140%",
              background:
                "radial-gradient(ellipse at center, rgba(0,120,200,0.12) 0%, rgba(0,80,160,0.06) 40%, transparent 70%)",
              filter: "blur(30px)",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
          <img
            src="/kpmg-logo-transparent.png"
            alt="KPMG"
            style={{
              position: "relative",
              zIndex: 1,
              height: "clamp(80px, 11vw, 160px)",
              width: "auto",
              objectFit: "contain",
              filter:
                "drop-shadow(0 4px 24px rgba(0,80,200,0.18)) drop-shadow(0 2px 8px rgba(0,0,0,0.3))",
              display: "block",
            }}
          />
        </div>

        {/* Eyebrow — stagger delay 1 */}
        <div
          style={{
            opacity: show ? 1 : 0,
            transform: show ? "translateY(0)" : "translateY(20px)",
            transition:
              "opacity 0.9s cubic-bezier(0.16,1,0.3,1) 0.15s, transform 0.9s cubic-bezier(0.16,1,0.3,1) 0.15s",
            display: "flex",
            alignItems: "center",
            gap: 13,
            marginBottom: "clamp(10px,1.8vh,18px)",
          }}
        >
          <div
            style={{
              width: 36,
              height: 1,
              background:
                "linear-gradient(90deg,transparent,rgba(0,153,168,0.7))",
            }}
          />
          <span
            style={{
              fontSize: "clamp(9px,0.9vw,12px)",
              fontWeight: 600,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(0,180,200,0.82)",
            }}
          >
            Executive Dashboard
          </span>
          <div
            style={{
              width: 36,
              height: 1,
              background:
                "linear-gradient(90deg,rgba(0,153,168,0.7),transparent)",
            }}
          />
        </div>

        {/* Title — stagger delay 2 */}
        <h1
          style={{
            margin: 0,
            marginBottom: "clamp(8px,1.2vh,14px)",
            fontSize: "clamp(34px,6vw,86px)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            textAlign: "center",
            opacity: show ? 1 : 0,
            transform: show ? "translateY(0)" : "translateY(28px)",
            transition:
              "opacity 0.9s cubic-bezier(0.16,1,0.3,1) 0.28s, transform 0.9s cubic-bezier(0.16,1,0.3,1) 0.28s",
            background:
              "linear-gradient(135deg,#ffffff 0%,#a8d0ff 48%,#76bcff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Project Soulfire
        </h1>

        {/* Subtitle — stagger delay 3 */}
        <p
          style={{
            margin: 0,
            marginBottom: "clamp(30px,4.5vh,54px)",
            fontSize: "clamp(13px,1.35vw,19px)",
            fontWeight: 400,
            letterSpacing: "0.025em",
            color: "rgba(172,210,255,0.58)",
            textAlign: "center",
            opacity: show ? 1 : 0,
            transform: show ? "translateY(0)" : "translateY(20px)",
            transition:
              "opacity 0.9s cubic-bezier(0.16,1,0.3,1) 0.4s, transform 0.9s cubic-bezier(0.16,1,0.3,1) 0.4s",
          }}
        >
          Federal Bank&nbsp;&nbsp;·&nbsp;&nbsp;Credit Card Portfolio Migration
        </p>

        {/* CTA Button — stagger delay 4 */}
        <button
          id="enter-dashboard-btn"
          onMouseEnter={() => setCtaHover(true)}
          onMouseLeave={() => setCtaHover(false)}
          onClick={doEnter}
          style={{
            position: "relative",
            cursor: zooming ? "default" : "pointer",
            border: "none",
            outline: "none",
            borderRadius: 100,
            padding: "clamp(13px,1.4vw,17px) clamp(34px,3.8vw,58px)",
            fontSize: "clamp(12px,1.05vw,15px)",
            fontWeight: 700,
            letterSpacing: "0.07em",
            textTransform: "uppercase" as const,
            fontFamily: "'Inter',system-ui,sans-serif",
            color: "#ffffff",
            background: ctaHover
              ? "linear-gradient(135deg,#0050cc 0%,#00a0b4 100%)"
              : "linear-gradient(135deg,#003087 0%,#006080 100%)",
            boxShadow: ctaHover
              ? "0 0 44px rgba(0,153,168,0.42),0 0 90px rgba(0,48,135,0.25),0 14px 30px rgba(0,0,0,0.45)"
              : "0 0 22px rgba(0,48,135,0.28),0 8px 22px rgba(0,0,0,0.35)",
            transform: ctaHover
              ? "scale(1.065) translateY(-2px)"
              : "scale(1) translateY(0)",
            transition: "all 0.32s cubic-bezier(0.16,1,0.3,1)",
            opacity: show ? 1 : 0,
            display: "flex",
            alignItems: "center",
            gap: 11,
            overflow: "hidden",
          }}
        >
          {/* Continuous shimmer on button */}
          <div className="soulfire-shimmer" style={{
            position: "absolute",
            inset: 0,
            borderRadius: 100,
            pointerEvents: "none",
          }} />
          <span style={{ position: "relative", zIndex: 1 }}>Click to Enter Dashboard</span>
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              position: "relative",
              zIndex: 1,
              transform: ctaHover ? "translateX(4px)" : "translateX(0)",
              transition: "transform 0.28s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>

        {/* Auto-redirect countdown ring — stagger delay 5 */}
        <div style={{ marginTop: "clamp(20px,2.8vh,36px)" }}>
          <CountdownRing
            total={COUNTDOWN_SECONDS}
            remaining={countdown}
            onSkip={doEnter}
            visible={skipVisible && show}
          />
        </div>

        {/* Powered by line */}
        <div
          style={{
            marginTop: "clamp(16px,2vh,28px)",
            display: "flex",
            alignItems: "center",
            gap: 18,
            opacity: show ? 0.42 : 0,
            transition: "opacity 1s cubic-bezier(0.16,1,0.3,1) 0.7s",
          }}
        >
          <div
            style={{
              width: 22,
              height: 1,
              background: "rgba(0,153,168,0.5)",
            }}
          />
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(0,153,168,0.72)",
            }}
          >
            Powered by KPMG
          </span>
          <div
            style={{
              width: 22,
              height: 1,
              background: "rgba(0,153,168,0.5)",
            }}
          />
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "13px 40px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(0,7,26,0.32)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          opacity: show ? 1 : 0,
          transition: "opacity 1s cubic-bezier(0.16,1,0.3,1) 0.5s",
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: "0.14em",
            color: "rgba(255,255,255,0.2)",
            textTransform: "uppercase",
          }}
        >
          © 2026 KPMG. All rights reserved.
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.2em",
            color: "rgba(255,255,255,0.26)",
            textTransform: "uppercase",
          }}
        >
          Confidential · July 2026
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: "0.1em",
            color: "rgba(255,255,255,0.2)",
          }}
        >
          For internal use only
        </span>
      </footer>

      {/* Zoom-in wipe overlay */}
      {zooming && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background:
              "radial-gradient(circle at center,#001847 0%,#00071c 100%)",
            animation:
              "pageWipe 0.95s cubic-bezier(0.7,0,0.1,1) forwards",
            pointerEvents: "none",
          }}
        />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes flowLine { 0%{stroke-dashoffset:1200;opacity:0}10%{opacity:1}90%{opacity:1}100%{stroke-dashoffset:0;opacity:0} }
        @keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.45;transform:scale(0.78)} }
        @keyframes pageWipe { 0%{opacity:0}18%{opacity:1}100%{opacity:1} }
        @keyframes soulfireDigitIn { from{opacity:0;transform:translateY(12px) scale(0.8)} to{opacity:1;transform:translateY(0) scale(1)} }
        *{box-sizing:border-box} body{margin:0}
        #enter-dashboard-btn:focus-visible{outline:2px solid rgba(0,153,168,0.7);outline-offset:4px}
      `}</style>
    </div>
  );
}

// ============================================================
//  DASHBOARD PAGE (RAG Summary)
// ============================================================

function DashboardPage() {
  const { data: response } = useDashboardData();
  const dashboardData = response?.data;
  const ragSummary = (dashboardData?.ragSummary ?? staticRag) as RagItem[];
  const pendingFromTsys = dashboardData?.pendingFromTsys ?? staticPending;

  const counts = ragSummary.reduce(
    (acc, r) => ((acc[r.rag] = (acc[r.rag] ?? 0) + 1), acc),
    {} as Record<RagStatus, number>,
  );

  return (
    <DashboardShell>
      <section className="mb-6 flex flex-wrap items-end justify-between gap-3 soulfire-entrance soulfire-delay-0">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            RAG Summary Dashboard for June&apos;26
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Open risks, blockers and dependencies tracked across workstreams.
          </p>
        </div>
        <Legend />
      </section>

      {/* Stat tiles — staggered card entrance */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Open items" value={ragSummary.length} tone="info" delay={0} />
        <StatTile label="High"    value={counts.critical ?? 0} tone="critical" delay={1} />
        <StatTile label="Medium"  value={counts.warning ?? 0}  tone="warning"  delay={2} />
        <StatTile label="Low"     value={counts.ontrack ?? 0}  tone="ontrack"  delay={3} />
      </div>

      <div className="soulfire-entrance soulfire-delay-4">
        <Card>
          <CardHeader title="Open RAG items" />
          <Table
            headers={[
              "SN",
              "Workstream",
              "Activity",
              "Owner",
              "Leads",
              "Target Date",
              "RAG",
            ]}
          >
            {ragSummary.map((r, idx) => (
              <tr
                key={r.sn}
                className="border-t border-border/70 hover:bg-muted/40"
                style={{
                  animation: `soulfireRowIn 420ms cubic-bezier(0.16,1,0.3,1) both`,
                  animationDelay: `${200 + idx * 28}ms`,
                }}
              >
                <Td>{r.sn}</Td>
                <Td className="font-medium text-foreground">
                  {r.workstream}
                </Td>
                <Td className="max-w-[420px] text-foreground/80">
                  {r.activity}
                </Td>
                <Td>{r.owner}</Td>
                <Td className="text-center whitespace-nowrap">{r.leads}</Td>
                <Td className="tabular-nums">{r.targetDate}</Td>
                <Td>
                  <RagPill status={r.rag} />
                </Td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>

      <div className="mt-6 soulfire-entrance soulfire-delay-5">
        <Card>
          <CardHeader title="Activities pending from TSYS" accent />
          <Table
            headers={[
              "SN",
              "Workstream",
              "Activity",
              "Leads",
              "Date Raised",
            ]}
          >
            {pendingFromTsys.map((r, idx) => (
              <tr
                key={r.sn}
                className="border-t border-border/70 hover:bg-muted/40"
                style={{
                  animation: `soulfireRowIn 420ms cubic-bezier(0.16,1,0.3,1) both`,
                  animationDelay: `${300 + idx * 28}ms`,
                }}
              >
                <Td>{r.sn}</Td>
                <Td className="font-medium text-foreground">
                  {r.workstream}
                </Td>
                <Td className="max-w-[520px] text-foreground/80">
                  {r.activity}
                </Td>
                <Td className="text-center whitespace-nowrap">
                  {r.leads}
                </Td>
                <Td className="tabular-nums">{r.dateRaised}</Td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>

      {/* Keyframe for row animation — referenced inline */}
      <style>{`
        @keyframes soulfireRowIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </DashboardShell>
  );
}

// ── Shared UI primitives ──────────────────────────────────────

function Legend() {
  const items: { label: string; status: RagStatus }[] = [
    { label: "High", status: "critical" },
    { label: "Medium", status: "warning" },
    { label: "Low", status: "ontrack" },
  ];
  return (
    <div className="flex items-center gap-2 rounded-md border border-dashed border-border bg-card px-3 py-2 text-xs">
      <span className="font-semibold uppercase tracking-wider text-muted-foreground">
        Legend
      </span>
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: ragColor(i.status) }}
          />
          <span className="text-foreground">{i.label}</span>
        </span>
      ))}
    </div>
  );
}

function ragColor(s: RagStatus) {
  return s === "critical"
    ? "var(--rag-critical)"
    : s === "warning"
      ? "var(--rag-warning)"
      : "var(--rag-ontrack)";
}

function RagPill({ status }: { status: RagStatus }) {
  const label =
    status === "critical"
      ? "High"
      : status === "warning"
        ? "Medium"
        : "On track";
  return (
    <span
      className="inline-flex min-w-[88px] items-center justify-center rounded-sm px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white"
      style={{
        background: ragColor(status),
        animation: "soulfireScaleIn 0.35s cubic-bezier(0.16,1,0.3,1) both",
      }}
    >
      {label}
    </span>
  );
}

function StatTile({
  label,
  value,
  tone,
  delay = 0,
}: {
  label: string;
  value: number;
  tone: "info" | "critical" | "warning" | "ontrack";
  delay?: number;
}) {
  const bar =
    tone === "info"
      ? "var(--rag-info)"
      : tone === "critical"
        ? "var(--rag-critical)"
        : tone === "warning"
          ? "var(--rag-warning)"
          : "var(--rag-ontrack)";

  // Animated count-up with stagger delay
  const displayValue = useCountUp(value, 900, 150 + delay * 120);

  return (
    <div
      className="relative overflow-hidden rounded-lg border border-border bg-card p-4 soulfire-hover-lift"
      style={{
        boxShadow: "var(--shadow-card)",
        animation: `soulfireCardIn 680ms cubic-bezier(0.16,1,0.3,1) both`,
        animationDelay: `${delay * 90}ms`,
      }}
    >
      {/* Animated accent bar */}
      <div
        className="absolute inset-y-0 left-0 w-1"
        style={{
          background: bar,
          animation: "soulfireFadeIn 0.6s ease both",
          animationDelay: `${150 + delay * 90}ms`,
        }}
      />
      <div className="pl-2">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
          {displayValue}
        </div>
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="soulfire-hover-lift overflow-hidden rounded-lg border border-border bg-card"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {children}
    </div>
  );
}

function CardHeader({
  title,
  accent,
}: {
  title: string;
  accent?: boolean;
}) {
  return (
    <div
      className="px-4 py-2.5 text-sm font-semibold text-white"
      style={{
        background: accent
          ? "var(--fed-navy-deep)"
          : "var(--fed-navy)",
      }}
    >
      {title}
    </div>
  );
}

function Table({
  headers,
  children,
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/60 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {headers.map((h) => (
              <th
                key={h}
                className={`px-4 py-2.5 ${h === "Leads" ? "text-center whitespace-nowrap" : ""}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`px-4 py-3 align-top text-foreground/80 ${className}`}>
      {children}
    </td>
  );
}
