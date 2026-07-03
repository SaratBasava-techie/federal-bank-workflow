import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";

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
// Particle system
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
  color: string;
}

const PARTICLE_COLORS = [
  "rgba(59,130,246,0.8)",
  "rgba(99,179,237,0.7)",
  "rgba(147,197,253,0.6)",
  "rgba(255,255,255,0.5)",
  "rgba(96,165,250,0.9)",
  "rgba(37,99,235,0.6)",
];

function useParticles(active: boolean, burstOnClick: boolean) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const counterRef = useRef(0);
  const animRef = useRef<number | null>(null);

  const spawnParticle = useCallback((x?: number, y?: number) => {
    const px = x ?? Math.random() * window.innerWidth;
    const py = y ?? Math.random() * window.innerHeight;
    const angle = Math.random() * Math.PI * 2;
    const speed = burstOnClick ? Math.random() * 8 + 3 : Math.random() * 1.2 + 0.3;
    return {
      id: counterRef.current++,
      x: px,
      y: py,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: burstOnClick ? Math.random() * 6 + 2 : Math.random() * 3 + 1,
      opacity: Math.random() * 0.7 + 0.3,
      life: 0,
      maxLife: burstOnClick ? Math.random() * 60 + 40 : Math.random() * 120 + 60,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
    };
  }, [burstOnClick]);

  useEffect(() => {
    if (!active) { setParticles([]); return; }
    let lastSpawn = 0;
    const tick = (t: number) => {
      if (t - lastSpawn > (burstOnClick ? 16 : 80)) {
        lastSpawn = t;
        setParticles(prev => {
          const next = prev
            .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.04, life: p.life + 1, opacity: p.opacity * (1 - p.life / p.maxLife) }))
            .filter(p => p.life < p.maxLife && p.opacity > 0.01);
          const toSpawn = burstOnClick ? 6 : 1;
          const fresh = Array.from({ length: toSpawn }, () => spawnParticle());
          return [...next, ...fresh].slice(-200);
        });
      }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [active, burstOnClick, spawnParticle]);

  const burst = useCallback((x: number, y: number, count = 80) => {
    setParticles(prev => [...prev, ...Array.from({ length: count }, () => spawnParticle(x, y))]);
  }, [spawnParticle]);

  return { particles, burst };
}

// ---------------------------------------------------------------------------
// Main landing page
// ---------------------------------------------------------------------------
function LandingPage() {
  const navigate = useNavigate();

  // mouse tilt
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [shimmerPos, setShimmerPos] = useState({ x: 50, y: 50 });
  const [phase, setPhase] = useState<"landing" | "zooming" | "done">("landing");

  const { particles, burst } = useParticles(isHovered || phase === "zooming", phase === "zooming");

  // 3D tilt tracking
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isClicked) return;
    const rect = cardRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    setTilt({ x: -dy * 12, y: dx * 12 });
    setShimmerPos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  }, [isClicked]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (isClicked) return;
    setIsClicked(true);
    setPhase("zooming");
    burst(e.clientX, e.clientY, 120);
    setTimeout(() => {
      setPhase("done");
      navigate({ to: "/" });
    }, 1400);
  }, [isClicked, burst, navigate]);

  // Floating orb breathe animation time
  const [time, setTime] = useState(0);
  useEffect(() => {
    let raf: number;
    const tick = () => { setTime(t => t + 0.005); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const orbX = Math.sin(time) * 30;
  const orbY = Math.cos(time * 0.7) * 20;

  return (
    <div
      className="landing-page"
      style={{
        position: "fixed", inset: 0, overflow: "hidden",
        background: "linear-gradient(135deg, #020818 0%, #041330 30%, #071d4a 60%, #020c20 100%)",
        fontFamily: "'Segoe UI', Inter, system-ui, sans-serif",
      }}
    >
      {/* ── Ambient grid ── */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `
          linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
        opacity: isHovered ? 0.8 : 0.4,
        transition: "opacity 0.6s ease",
      }} />

      {/* ── Radial glow blobs ── */}
      <div style={{
        position: "absolute",
        top: `calc(30% + ${orbY}px)`, left: `calc(20% + ${orbX}px)`,
        width: 600, height: 600,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)",
        transform: "translate(-50%,-50%)",
        filter: "blur(60px)",
        pointerEvents: "none",
        transition: "opacity 0.4s",
        opacity: isHovered ? 1 : 0.6,
      }} />
      <div style={{
        position: "absolute",
        top: `calc(70% + ${-orbY}px)`, left: `calc(80% + ${-orbX * 0.5}px)`,
        width: 500, height: 500,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(96,165,250,0.14) 0%, transparent 70%)",
        transform: "translate(-50%,-50%)",
        filter: "blur(80px)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute",
        top: "50%", left: "50%",
        width: 800, height: 800,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(30,64,175,0.1) 0%, transparent 65%)",
        transform: "translate(-50%,-50%)",
        filter: "blur(100px)",
        pointerEvents: "none",
        opacity: isHovered ? 1 : 0.5,
        transition: "opacity 0.6s ease",
      }} />

      {/* ── Particle canvas ── */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {particles.map(p => (
          <div key={p.id} style={{
            position: "absolute",
            left: p.x, top: p.y,
            width: p.size, height: p.size,
            borderRadius: "50%",
            background: p.color,
            opacity: p.opacity,
            transform: "translate(-50%, -50%)",
            willChange: "transform",
          }} />
        ))}
      </div>

      {/* ── Top bar ── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 40px",
        background: "linear-gradient(180deg, rgba(2,8,24,0.9) 0%, transparent 100%)",
        zIndex: 10,
        opacity: phase === "zooming" ? 0 : 1,
        transition: "opacity 0.5s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img src="/kpmg-logo.png" alt="KPMG" style={{ height: 32, filter: "brightness(0) invert(1)" }} />
          <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.2)" }} />
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Project Soulfire
          </span>
        </div>
        <div style={{
          padding: "6px 16px",
          borderRadius: 20,
          border: "1px solid rgba(59,130,246,0.3)",
          background: "rgba(59,130,246,0.08)",
          color: "rgba(147,197,253,0.9)",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}>
          Confidential · July 2026
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 48,
        padding: "80px 40px 40px",
      }}>

        {/* Hero text */}
        <div style={{
          textAlign: "center", zIndex: 2,
          opacity: phase === "zooming" ? 0 : 1,
          transform: phase === "zooming" ? "translateY(-30px)" : "translateY(0)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 18px",
            borderRadius: 20,
            border: "1px solid rgba(59,130,246,0.4)",
            background: "rgba(59,130,246,0.1)",
            marginBottom: 20,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6", boxShadow: "0 0 8px #3b82f6" }} />
            <span style={{ color: "#93c5fd", fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase" }}>
              Live Executive Dashboard
            </span>
          </div>

          <h1 style={{
            margin: 0,
            fontSize: "clamp(36px, 5vw, 64px)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            background: "linear-gradient(135deg, #ffffff 0%, #93c5fd 50%, #60a5fa 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            Welcome to KPMG
          </h1>
          <h2 style={{
            margin: "12px 0 0",
            fontSize: "clamp(14px, 2vw, 20px)",
            fontWeight: 400,
            color: "rgba(148,163,184,0.85)",
            letterSpacing: "0.02em",
          }}>
            Federal Bank · Credit Card Portfolio Migration
          </h2>
        </div>

        {/* Dashboard card */}
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          style={{
            position: "relative",
            zIndex: 3,
            cursor: isClicked ? "default" : "pointer",
            willChange: "transform",
            transition: phase === "zooming"
              ? "transform 1.2s cubic-bezier(0.16,1,0.3,1), opacity 0.4s ease, filter 0.4s ease"
              : "transform 0.15s ease-out, filter 0.4s ease",
            transform: phase === "zooming"
              ? "scale(4) translateZ(0)"
              : isHovered
                ? `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.07) translateZ(0)`
                : "perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1) translateZ(0)",
            opacity: phase === "zooming" ? 0 : 1,
            filter: isHovered
              ? "drop-shadow(0 0 40px rgba(59,130,246,0.6)) drop-shadow(0 0 80px rgba(37,99,235,0.3))"
              : "drop-shadow(0 8px 32px rgba(0,0,0,0.5))",
          }}
        >
          {/* Glow ring */}
          <div style={{
            position: "absolute", inset: -3,
            borderRadius: 18,
            background: "linear-gradient(135deg, rgba(59,130,246,0.8), rgba(96,165,250,0.4), rgba(37,99,235,0.8))",
            opacity: isHovered ? 1 : 0,
            transition: "opacity 0.4s ease",
            zIndex: -1,
            filter: "blur(2px)",
          }} />

          {/* Shimmer overlay */}
          <div style={{
            position: "absolute", inset: 0, borderRadius: 14, overflow: "hidden",
            zIndex: 10, pointerEvents: "none",
          }}>
            <div style={{
              position: "absolute", inset: 0,
              background: `radial-gradient(circle at ${shimmerPos.x}% ${shimmerPos.y}%, rgba(255,255,255,0.12) 0%, transparent 60%)`,
              opacity: isHovered ? 1 : 0,
              transition: "opacity 0.3s ease",
            }} />
            <div style={{
              position: "absolute", inset: 0,
              background: `linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) ${shimmerPos.x - 10}%, rgba(255,255,255,0.12) ${shimmerPos.x}%, rgba(255,255,255,0.06) ${shimmerPos.x + 10}%, transparent 60%)`,
              opacity: isHovered ? 1 : 0,
              transition: "background 0.1s ease, opacity 0.3s ease",
            }} />
          </div>

          {/* Dashboard screenshot */}
          <div style={{
            position: "relative",
            borderRadius: 14,
            overflow: "hidden",
            border: "1px solid rgba(59,130,246,0.25)",
            boxShadow: isHovered
              ? "0 0 0 1px rgba(59,130,246,0.4), 0 32px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)"
              : "0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
            transition: "box-shadow 0.4s ease",
            width: "min(860px, 88vw)",
          }}>
            {/* Fake dashboard UI built in-code (rich, animated) */}
            <DashboardPreview isHovered={isHovered} />
          </div>

          {/* "Click to Enter" label */}
          <div style={{
            position: "absolute",
            bottom: -52,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 24px",
            borderRadius: 24,
            background: isHovered
              ? "linear-gradient(135deg, rgba(37,99,235,0.9), rgba(59,130,246,0.8))"
              : "rgba(255,255,255,0.06)",
            border: "1px solid rgba(59,130,246,0.4)",
            backdropFilter: "blur(12px)",
            color: isHovered ? "white" : "rgba(147,197,253,0.8)",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.06em",
            whiteSpace: "nowrap",
            opacity: phase === "zooming" ? 0 : 1,
            boxShadow: isHovered ? "0 8px 32px rgba(37,99,235,0.4)" : "none",
            transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 8 16 12 12 16" /><line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            Click to Enter the KPMG Dashboard
          </div>
        </div>

        {/* Bottom stats row */}
        <div style={{
          display: "flex", gap: 24, zIndex: 2, marginTop: 16,
          opacity: phase === "zooming" ? 0 : 1,
          transition: "opacity 0.4s ease",
        }}>
          {[
            { value: "219", label: "Total Activities" },
            { value: "13", label: "Workstreams" },
            { value: "Oct '26", label: "Target Go-Live" },
          ].map(s => (
            <div key={s.label} style={{
              textAlign: "center",
              padding: "12px 24px",
              borderRadius: 10,
              border: "1px solid rgba(59,130,246,0.2)",
              background: "rgba(59,130,246,0.05)",
              backdropFilter: "blur(8px)",
            }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#93c5fd", letterSpacing: "-0.02em" }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "rgba(148,163,184,0.7)", marginTop: 2, letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Zoom-in overlay flash ── */}
      {phase === "zooming" && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "radial-gradient(circle at center, rgba(37,99,235,0.3) 0%, rgba(2,8,24,0) 70%)",
          animation: "fadeInOut 1.4s ease forwards",
          pointerEvents: "none",
        }} />
      )}

      <style>{`
        @keyframes fadeInOut {
          0%   { opacity: 0; }
          40%  { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes pulse-bar {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.6; }
        }
        @keyframes chart-rise {
          from { transform: scaleY(0.85); opacity: 0.7; }
          to   { transform: scaleY(1);    opacity: 1; }
        }
        @keyframes shimmer-sweep {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Rich dashboard preview rendered fully in code (no external image needed)
// ---------------------------------------------------------------------------
function DashboardPreview({ isHovered }: { isHovered: boolean }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1800);
    return () => clearInterval(id);
  }, []);

  const bars = [62, 78, 45, 91, 53, 84, 37, 69, 88, 55];
  const phaseData = [
    { label: "Initiation", pct: 100, color: "#22c55e" },
    { label: "Discovery", pct: 100, color: "#22c55e" },
    { label: "Env Setup", pct: 75, color: "#3b82f6" },
    { label: "Build & Integ.", pct: 18, color: "#f59e0b" },
    { label: "Testing", pct: 0, color: "#475569" },
    { label: "Go-Live", pct: 0, color: "#475569" },
  ];

  return (
    <div style={{
      background: "#0f172a",
      color: "white",
      width: "100%",
    }}>
      {/* Header bar */}
      <div style={{
        background: "linear-gradient(135deg, #0b1d3a, #172554)",
        padding: "14px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid rgba(59,130,246,0.2)",
      }}>
        <div>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 2 }}>
            Federal Bank · Credit Card Portfolio Migration
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em" }}>Project Soulfire — Executive Dashboard</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src="/kpmg-logo.png" alt="KPMG" style={{ height: 18, filter: "brightness(0) invert(1)", opacity: 0.9 }} />
        </div>
      </div>

      {/* Nav tabs */}
      <div style={{ display: "flex", gap: 2, padding: "8px 16px 0", background: "linear-gradient(135deg, #0b1d3a, #172554)" }}>
        {["RAG Summary", "Program Overview", "Joint Checklist", "Risk Log", "Decision Log"].map((t, i) => (
          <div key={t} style={{
            padding: "6px 12px",
            borderRadius: "6px 6px 0 0",
            fontSize: 9,
            fontWeight: i === 1 ? 700 : 400,
            background: i === 1 ? "#0f172a" : "transparent",
            color: i === 1 ? "white" : "rgba(255,255,255,0.55)",
            border: i === 1 ? "1px solid rgba(59,130,246,0.3)" : "none",
            borderBottom: i === 1 ? "1px solid #0f172a" : "none",
          }}>{t}</div>
        ))}
      </div>

      {/* Main content area */}
      <div style={{ padding: "16px", background: "#0f172a" }}>

        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 14 }}>
          {[
            { label: "Total Activities", value: "219", sub: "Across 13 workstreams", color: "#172554" },
            { label: "Completed", value: "17", sub: "8% overall", color: "#14532d" },
            { label: "WIP", value: "35", sub: "Work in progress", color: "#0c2c4d" },
            { label: "Yet to Start", value: "167", sub: "Planned Jul–Nov", color: "#1e293b" },
          ].map(k => (
            <div key={k.label} style={{
              background: k.color,
              borderRadius: 8,
              padding: "10px 12px",
              border: "1px solid rgba(255,255,255,0.07)",
              animation: isHovered ? `pulse-bar ${1.5 + Math.random()}s ease-in-out infinite` : "none",
            }}>
              <div style={{ fontSize: 7.5, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{k.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, marginTop: 2, color: "white" }}>{k.value}</div>
              <div style={{ fontSize: 7, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>

          {/* Donut */}
          <div style={{ background: "#1e293b", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 9, fontWeight: 600, marginBottom: 10, color: "rgba(255,255,255,0.7)" }}>Activity Status</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="70" height="70" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e40af" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#22c55e" strokeWidth="3"
                  strokeDasharray={`${(17/219)*100} ${100-(17/219)*100}`} strokeDashoffset="25" strokeLinecap="round" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6" strokeWidth="3"
                  strokeDasharray={`${(35/219)*100} ${100-(35/219)*100}`} strokeDashoffset={`${25-(17/219)*100}`} strokeLinecap="round" />
                <text x="18" y="20" textAnchor="middle" fill="white" fontSize="5.5" fontWeight="bold">8%</text>
              </svg>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {[["#22c55e", "Done", "17"], ["#3b82f6", "WIP", "35"], ["#475569", "Pending", "167"]].map(([c, l, v]) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 8 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: c, flexShrink: 0 }} />
                    <span style={{ color: "rgba(255,255,255,0.6)" }}>{l}</span>
                    <span style={{ color: "white", fontWeight: 600, marginLeft: "auto" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Phase completion bar chart */}
          <div style={{ background: "#1e293b", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 9, fontWeight: 600, marginBottom: 10, color: "rgba(255,255,255,0.7)" }}>% Completion by Phase</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {phaseData.map(p => (
                <div key={p.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ fontSize: 7, color: "rgba(255,255,255,0.5)", width: 52, flexShrink: 0, textAlign: "right" }}>{p.label}</div>
                  <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 3,
                      background: p.color,
                      width: `${p.pct}%`,
                      transition: "width 0.6s ease",
                      animation: isHovered && p.pct > 0 ? "chart-rise 0.8s ease" : "none",
                    }} />
                  </div>
                  <div style={{ fontSize: 7, color: "rgba(255,255,255,0.4)", width: 18, textAlign: "right" }}>{p.pct}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Dept bar chart */}
          <div style={{ background: "#1e293b", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 9, fontWeight: 600, marginBottom: 10, color: "rgba(255,255,255,0.7)" }}>Activities by Department</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 60 }}>
              {bars.map((h, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, height: "100%", justifyContent: "flex-end" }}>
                  <div style={{
                    width: "100%",
                    height: `${isHovered ? h : h * 0.7}%`,
                    background: `hsl(${210 + i * 8}, 70%, ${40 + (tick % 2 === i % 2 ? 8 : 0)}%)`,
                    borderRadius: "2px 2px 0 0",
                    transition: "height 0.6s ease, background 0.5s ease",
                    animation: isHovered ? `pulse-bar ${1.2 + i * 0.15}s ease-in-out infinite` : "none",
                  }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Table preview */}
        <div style={{ marginTop: 10, background: "#1e293b", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <div style={{ padding: "8px 12px", background: "#172554", fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.8)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            Activities by Workstream
          </div>
          {[
            ["Business", "Approach notes to be finalized and signed off", "Kishore", "15-Jul", "warning"],
            ["Platform/Infra", "Production environment setup and service testing", "Dinu", "15-Jul", "critical"],
            ["App Build & Support", "MB/IB/Web card APIs (onboarding & servicing)", "Dinu, Dinesh", "31-Jul", "WIP"],
            ["Data Migration", "Data Migration Scope agreement", "Nitin, Libu", "03-Jul", "WIP"],
          ].map(([ws, act, own, date, status], i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "100px 1fr 80px 50px 60px",
              padding: "6px 12px", fontSize: 8,
              borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
              background: isHovered && i % 2 === tick % 2 ? "rgba(59,130,246,0.05)" : "transparent",
              transition: "background 0.8s ease",
              alignItems: "center", gap: 8,
            }}>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 7.5 }}>{ws}</span>
              <span style={{ color: "rgba(255,255,255,0.8)" }}>{act}</span>
              <span style={{ color: "rgba(255,255,255,0.4)" }}>{own}</span>
              <span style={{ color: "rgba(255,255,255,0.4)" }}>{date}</span>
              <span style={{
                padding: "2px 6px", borderRadius: 4, fontSize: 7, fontWeight: 600, textAlign: "center",
                background: status === "critical" ? "rgba(239,68,68,0.2)" : status === "warning" ? "rgba(245,158,11,0.2)" : "rgba(59,130,246,0.2)",
                color: status === "critical" ? "#f87171" : status === "warning" ? "#fbbf24" : "#93c5fd",
              }}>
                {status === "critical" ? "High" : status === "warning" ? "Medium" : "WIP"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
