import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useState, useEffect, useRef } from "react";

export const Route = createFileRoute("/landing")({
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
  component: LandingPage,
});

// ---------------------------------------------------------------------------
// Floating particle node
// ---------------------------------------------------------------------------
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
  type: "dot" | "line-h" | "line-v" | "diamond";
}

function useAmbientParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const counter = useRef(0);
  const raf = useRef<number | null>(null);

  const spawn = useCallback((): Particle => {
    const types: Particle["type"][] = ["dot", "dot", "dot", "diamond", "line-h", "line-v"];
    return {
      id: counter.current++,
      x: Math.random() * 100, // percent
      y: 100 + Math.random() * 10, // start below viewport
      vx: (Math.random() - 0.5) * 0.02,
      vy: -(Math.random() * 0.06 + 0.02),
      size: Math.random() * 4 + 1,
      opacity: Math.random() * 0.35 + 0.05,
      life: 0,
      maxLife: Math.random() * 300 + 200,
      type: types[Math.floor(Math.random() * types.length)],
    };
  }, []);

  useEffect(() => {
    // Seed initial particles
    setParticles(Array.from({ length: 28 }, spawn));

    let lastSpawn = 0;
    const tick = (t: number) => {
      if (t - lastSpawn > 400) {
        lastSpawn = t;
        setParticles((prev) => {
          const alive = prev
            .map((p) => ({
              ...p,
              x: p.x + p.vx,
              y: p.y + p.vy,
              life: p.life + 1,
            }))
            .filter((p) => p.life < p.maxLife && p.y > -10);
          return [...alive, spawn()].slice(-60);
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
// Data-flow line SVG overlay
// ---------------------------------------------------------------------------
function DataFlowLines() {
  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        opacity: 0.06,
      }}
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="flowA" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#003087" stopOpacity="0" />
          <stop offset="50%" stopColor="#0099a8" stopOpacity="1" />
          <stop offset="100%" stopColor="#003087" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="flowB" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0099a8" stopOpacity="0" />
          <stop offset="50%" stopColor="#003087" stopOpacity="1" />
          <stop offset="100%" stopColor="#0099a8" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Diagonal migration flow lines */}
      {[0, 80, 160, 240, 320, 400, 480].map((offset, i) => (
        <path
          key={i}
          d={`M ${-200 + offset} 900 Q ${360 + offset} 450 ${900 + offset} 0`}
          fill="none"
          stroke={i % 2 === 0 ? "url(#flowA)" : "url(#flowB)"}
          strokeWidth="1.5"
          style={{
            animation: `flowAnim ${5 + i * 0.7}s linear infinite`,
            animationDelay: `${i * 0.8}s`,
          }}
        />
      ))}
      {/* Horizontal subtle grid lines */}
      {[180, 360, 540, 720].map((y, i) => (
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
  );
}

// ---------------------------------------------------------------------------
// Countdown ring constants
// ---------------------------------------------------------------------------
const COUNTDOWN_SECONDS = 5;
const RING_RADIUS = 45;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

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
      <div style={{ position: "relative", width: 108, height: 108 }}>
        <svg width="108" height="108" viewBox="0 0 108 108" style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx="54"
            cy="54"
            r={RING_RADIUS}
            fill="none"
            stroke="rgba(0,153,168,0.15)"
            strokeWidth="3"
          />
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
              textTransform: "uppercase" as const,
              color: "rgba(0,153,168,0.6)",
              marginTop: 2,
            }}
          >
            sec
          </span>
        </div>
      </div>

      <button
        onMouseEnter={() => setSkipHover(true)}
        onMouseLeave={() => setSkipHover(false)}
        onClick={onSkip}
        style={{
          border: "1px solid rgba(0,153,168,0.35)",
          background: skipHover ? "rgba(0,153,168,0.14)" : "rgba(0,153,168,0.06)",
          color: skipHover ? "rgba(0,200,220,0.95)" : "rgba(0,153,168,0.7)",
          borderRadius: 100,
          padding: "5px 16px",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase" as const,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 6,
          transition: "all 0.22s cubic-bezier(0.16,1,0.3,1)",
          transform: skipHover ? "scale(1.05)" : "scale(1)",
        }}
      >
        Skip
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Landing Page
// ---------------------------------------------------------------------------
function LandingPage() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<"idle" | "hover" | "zooming" | "done">("idle");
  const [ctaHover, setCtaHover] = useState(false);
  const [logoHover, setLogoHover] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [skipVisible, setSkipVisible] = useState(false);
  const particles = useAmbientParticles();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const t = setTimeout(() => setSkipVisible(true), 1000);
    return () => clearTimeout(t);
  }, [mounted]);

  const handleEnter = useCallback(() => {
    if (phase === "zooming") return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPhase("zooming");
    setTimeout(() => navigate({ to: "/", search: { entered: true } }), 1100);
  }, [phase, navigate]);

  // Auto-countdown
  useEffect(() => {
    if (!mounted || phase === "zooming") return;
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setTimeout(handleEnter, 200);
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

  const fadeIn = mounted && phase !== "zooming";
  // Cast to string so TS control-flow narrowing doesn't eliminate "zooming"
  // inside the transform ternary (which is evaluated even when fadeIn is true
  // during the transition animation).
  const currentPhase: string = phase;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        background: "linear-gradient(160deg, #00071a 0%, #000d2e 40%, #001847 70%, #002058 100%)",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Geometric grid background ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage: `
          linear-gradient(rgba(0,48,135,0.18) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,48,135,0.18) 1px, transparent 1px)
        `,
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)",
        }}
      />

      {/* ── Ambient radial glows ── */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "70vw",
          height: "55vh",
          background: "radial-gradient(circle, rgba(0,153,168,0.12) 0%, transparent 70%)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "0%",
          left: "20%",
          width: "40vw",
          height: "30vh",
          background: "radial-gradient(circle, rgba(0,48,135,0.18) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "5%",
          right: "15%",
          width: "30vw",
          height: "25vh",
          background: "radial-gradient(circle, rgba(0,99,168,0.14) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      {/* ── Animated data-flow lines ── */}
      <DataFlowLines />

      {/* ── Floating ambient particles ── */}
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
          const baseOpacity = p.opacity * fade;
          if (p.type === "dot") {
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
                  background: p.size > 3 ? "rgba(0,153,168,0.6)" : "rgba(147,197,253,0.5)",
                  opacity: baseOpacity,
                  transform: "translate(-50%,-50%)",
                  boxShadow: p.size > 3 ? `0 0 ${p.size * 3}px rgba(0,153,168,0.4)` : "none",
                }}
              />
            );
          }
          if (p.type === "diamond") {
            return (
              <div
                key={p.id}
                style={{
                  position: "absolute",
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: p.size * 2,
                  height: p.size * 2,
                  background: "rgba(0,48,135,0.5)",
                  opacity: baseOpacity * 0.7,
                  transform: "translate(-50%,-50%) rotate(45deg)",
                  border: "1px solid rgba(0,153,168,0.4)",
                }}
              />
            );
          }
          if (p.type === "line-h") {
            return (
              <div
                key={p.id}
                style={{
                  position: "absolute",
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: p.size * 12,
                  height: 1,
                  background:
                    "linear-gradient(90deg, transparent, rgba(0,153,168,0.5), transparent)",
                  opacity: baseOpacity,
                  transform: "translate(-50%,-50%)",
                }}
              />
            );
          }
          return (
            <div
              key={p.id}
              style={{
                position: "absolute",
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: 1,
                height: p.size * 12,
                background: "linear-gradient(180deg, transparent, rgba(0,48,135,0.5), transparent)",
                opacity: baseOpacity,
                transform: "translate(-50%,-50%)",
              }}
            />
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          TOP NAV BAR
      ══════════════════════════════════════════════════════════════ */}
      <nav
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 40px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(0,7,26,0.4)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          opacity: fadeIn ? 1 : 0,
          transform: fadeIn ? "translateY(0)" : "translateY(-16px)",
          transition:
            "opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* Left: Logo + Divider + Label */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img
            src="/kpmg-logo-transparent.png"
            alt="KPMG"
            style={{ height: 28, width: "auto", objectFit: "contain" }}
          />
          <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.15)" }} />
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.12em",
              color: "rgba(255,255,255,0.5)",
              textTransform: "uppercase",
            }}
          >
            Federal Bank
          </span>
        </div>

        {/* Right: Confidential badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "5px 14px",
            borderRadius: 4,
            border: "1px solid rgba(255,200,0,0.25)",
            background: "rgba(255,200,0,0.06)",
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
              color: "rgba(245,158,11,0.85)",
              textTransform: "uppercase",
            }}
          >
            Confidential
          </span>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════════
          HERO CONTENT
      ══════════════════════════════════════════════════════════════ */}
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
        {/* ── KPMG Logo Hero ── */}
        <div
          onMouseEnter={() => setLogoHover(true)}
          onMouseLeave={() => setLogoHover(false)}
          style={{
            position: "relative",
            opacity: fadeIn ? 1 : 0,
            transform: fadeIn
              ? currentPhase === "zooming"
                ? "scale(1.15) translateY(-20px)"
                : "translateY(0) scale(1)"
              : "translateY(32px) scale(0.9)",
            transition:
              "opacity 1s cubic-bezier(0.16,1,0.3,1), transform 1.1s cubic-bezier(0.16,1,0.3,1)",
            marginBottom: "clamp(28px, 4vh, 48px)",
            cursor: "default",
          }}
        >
          {/* Outer glow ring */}
          <div
            style={{
              position: "absolute",
              inset: -24,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(0,153,168,0.15) 0%, transparent 70%)",
              filter: "blur(20px)",
              transform: logoHover ? "scale(1.18)" : "scale(1)",
              transition: "transform 0.6s cubic-bezier(0.16,1,0.3,1)",
              pointerEvents: "none",
            }}
          />

          {/* Spinning accent ring */}
          <div
            style={{
              position: "absolute",
              inset: -16,
              borderRadius: "50%",
              border: "1px solid rgba(0,153,168,0.25)",
              boxShadow: logoHover
                ? "0 0 30px rgba(0,153,168,0.3), inset 0 0 30px rgba(0,48,135,0.1)"
                : "0 0 16px rgba(0,153,168,0.12)",
              transition: "box-shadow 0.5s cubic-bezier(0.16,1,0.3,1)",
              animation: "spinRing 18s linear infinite",
              pointerEvents: "none",
            }}
          />

          {/* Inner accent ring */}
          <div
            style={{
              position: "absolute",
              inset: -8,
              borderRadius: "50%",
              border: "1px solid rgba(0,48,135,0.4)",
              pointerEvents: "none",
              animation: "spinRingReverse 12s linear infinite",
            }}
          />

          {/* The logo itself */}
          <div
            style={{
              width: "clamp(120px, 14vw, 200px)",
              height: "clamp(120px, 14vw, 200px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 40% 35%, rgba(0,48,135,0.6) 0%, rgba(0,7,26,0.95) 100%)",
              border: "1px solid rgba(0,153,168,0.3)",
              boxShadow: logoHover
                ? "0 0 60px rgba(0,153,168,0.25), 0 24px 48px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.08)"
                : "0 0 30px rgba(0,153,168,0.1), 0 20px 40px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.05)",
              transform: logoHover ? "scale(1.06) translateY(-2px)" : "scale(1)",
              transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
              padding: "22px",
              backdropFilter: "blur(8px)",
            }}
          >
            <img
              src="/kpmg-logo-transparent.png"
              alt="KPMG"
              style={{
                width: "100%",
                height: "auto",
                objectFit: "contain",
                filter: "brightness(1.05)",
              }}
            />
          </div>
        </div>

        {/* ── Eyebrow label ── */}
        <div
          style={{
            opacity: fadeIn ? 1 : 0,
            transform: fadeIn ? "translateY(0)" : "translateY(20px)",
            transition:
              "opacity 0.9s cubic-bezier(0.16,1,0.3,1) 0.15s, transform 0.9s cubic-bezier(0.16,1,0.3,1) 0.15s",
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: "clamp(12px, 2vh, 20px)",
          }}
        >
          <div
            style={{
              width: 40,
              height: 1,
              background: "linear-gradient(90deg, transparent, rgba(0,153,168,0.7))",
            }}
          />
          <span
            style={{
              fontSize: "clamp(10px, 1vw, 13px)",
              fontWeight: 600,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(0,153,168,0.85)",
            }}
          >
            Executive Dashboard
          </span>
          <div
            style={{
              width: 40,
              height: 1,
              background: "linear-gradient(90deg, rgba(0,153,168,0.7), transparent)",
            }}
          />
        </div>

        {/* ── Main Title ── */}
        <h1
          style={{
            margin: 0,
            marginBottom: "clamp(10px, 1.5vh, 16px)",
            fontSize: "clamp(36px, 6vw, 88px)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            textAlign: "center",
            opacity: fadeIn ? 1 : 0,
            transform: fadeIn ? "translateY(0)" : "translateY(28px)",
            transition:
              "opacity 0.9s cubic-bezier(0.16,1,0.3,1) 0.28s, transform 0.9s cubic-bezier(0.16,1,0.3,1) 0.28s",
            background: "linear-gradient(135deg, #ffffff 0%, #b0d0ff 50%, #7ebfff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Project Soulfire
        </h1>

        {/* ── Subtitle ── */}
        <p
          style={{
            margin: 0,
            marginBottom: "clamp(32px, 5vh, 56px)",
            fontSize: "clamp(13px, 1.4vw, 20px)",
            fontWeight: 400,
            letterSpacing: "0.02em",
            color: "rgba(176,208,255,0.6)",
            textAlign: "center",
            opacity: fadeIn ? 1 : 0,
            transform: fadeIn ? "translateY(0)" : "translateY(20px)",
            transition:
              "opacity 0.9s cubic-bezier(0.16,1,0.3,1) 0.4s, transform 0.9s cubic-bezier(0.16,1,0.3,1) 0.4s",
          }}
        >
          Federal Bank&nbsp;&nbsp;·&nbsp;&nbsp;Credit Card Portfolio Migration
        </p>

        {/* ── CTA Button ── */}
        <button
          id="enter-dashboard-btn"
          onMouseEnter={() => setCtaHover(true)}
          onMouseLeave={() => setCtaHover(false)}
          onClick={handleEnter}
          style={{
            position: "relative",
            cursor: currentPhase === "zooming" ? "default" : "pointer",
            border: "none",
            outline: "none",
            borderRadius: 100,
            padding: "clamp(14px, 1.5vw, 18px) clamp(36px, 4vw, 60px)",
            fontSize: "clamp(13px, 1.1vw, 16px)",
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            fontFamily: "'Inter', system-ui, sans-serif",
            color: "#ffffff",
            background: ctaHover
              ? "linear-gradient(135deg, #0047b3 0%, #0099a8 100%)"
              : "linear-gradient(135deg, #003087 0%, #00547a 100%)",
            boxShadow: ctaHover
              ? "0 0 40px rgba(0,153,168,0.45), 0 0 80px rgba(0,48,135,0.3), 0 16px 32px rgba(0,0,0,0.4)"
              : "0 0 20px rgba(0,48,135,0.3), 0 8px 24px rgba(0,0,0,0.35)",
            transform: ctaHover ? "scale(1.06) translateY(-2px)" : "scale(1) translateY(0)",
            transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
            opacity: fadeIn ? 1 : 0,
            display: "flex",
            alignItems: "center",
            gap: 12,
            overflow: "hidden",
          }}
        >
          {/* Continuous shimmer */}
          <div
            className="soulfire-shimmer"
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 100,
              pointerEvents: "none",
            }}
          />

          <span style={{ position: "relative", zIndex: 1 }}>Click to Enter Dashboard</span>

          {/* Arrow icon */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              position: "relative",
              zIndex: 1,
              transform: ctaHover ? "translateX(4px)" : "translateX(0)",
              transition: "transform 0.3s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>

        {/* ── Auto-redirect countdown ring ── */}
        <div style={{ marginTop: "clamp(20px, 2.8vh, 36px)" }}>
          <CountdownRing
            total={COUNTDOWN_SECONDS}
            remaining={countdown}
            onSkip={handleEnter}
            visible={skipVisible && fadeIn}
          />
        </div>

        {/* ── Subtle keyline below ── */}
        <div
          style={{
            marginTop: "clamp(16px, 2.5vh, 32px)",
            display: "flex",
            alignItems: "center",
            gap: 20,
            opacity: fadeIn ? 0.45 : 0,
            transition: "opacity 1s cubic-bezier(0.16,1,0.3,1) 0.7s",
          }}
        >
          <div style={{ width: 24, height: 1, background: "rgba(0,153,168,0.5)" }} />
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(0,153,168,0.7)",
            }}
          >
            Powered by KPMG
          </span>
          <div style={{ width: 24, height: 1, background: "rgba(0,153,168,0.5)" }} />
        </div>
      </main>

      {/* ══════════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════════ */}
      <footer
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 40px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(0,7,26,0.35)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          opacity: fadeIn ? 1 : 0,
          transition: "opacity 1s cubic-bezier(0.16,1,0.3,1) 0.5s",
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: "0.15em",
            color: "rgba(255,255,255,0.22)",
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
            color: "rgba(255,255,255,0.28)",
            textTransform: "uppercase",
          }}
        >
          Confidential&nbsp;&nbsp;·&nbsp;&nbsp;July 2026
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: "0.1em",
            color: "rgba(255,255,255,0.22)",
          }}
        >
          For internal use only
        </span>
      </footer>

      {/* ══════════════════════════════════════════════════════════════
          TRANSITION OVERLAY
      ══════════════════════════════════════════════════════════════ */}
      {phase === "zooming" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "radial-gradient(circle at center, #001847 0%, #00071a 100%)",
            animation: "pageWipe 1.1s cubic-bezier(0.7,0,0.1,1) forwards",
            pointerEvents: "none",
          }}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════
          GLOBAL KEYFRAMES
      ══════════════════════════════════════════════════════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        @keyframes flowAnim {
          0%   { stroke-dashoffset: 1200; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 0; }
        }

        @keyframes spinRing {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        @keyframes spinRingReverse {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }

        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.8); }
        }

        @keyframes pageWipe {
          0%   { opacity: 0; }
          20%  { opacity: 1; }
          100% { opacity: 1; }
        }

        @keyframes soulfireDigitIn {
          from { opacity: 0; transform: translateY(12px) scale(0.8); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        * { box-sizing: border-box; }
        body { margin: 0; }

        #enter-dashboard-btn:focus-visible {
          outline: 2px solid rgba(0,153,168,0.7);
          outline-offset: 4px;
        }
      `}</style>
    </div>
  );
}
