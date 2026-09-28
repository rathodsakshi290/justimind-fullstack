import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Scale, FileText, Search, BarChart3, Network, Sparkles,
  ArrowRight, ShieldCheck, Sun, Moon, Check, Quote,
  ChevronRight, Upload, Brain, FileSearch2
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  JustiMind — Landing Page                                          */
/*  Design tokens                                                     */
/*  bg #050505 / card #121212 / royal #2547F4 / purple #7B3FE4        */
/*  cyan #22D3EE / neon #4F8CFF                                       */
/*  Display: Fraunces (headline only) · Body: Manrope · Data: IBM     */
/*  Plex Mono                                                         */
/* ------------------------------------------------------------------ */

const ROTATING_WORDS = ["the verdict", "the settlement", "the ruling", "the outcome"];

const FEATURES = [
  {
    icon: Brain,
    title: "Prediction Engine",
    desc: "Feed in a case file and get a reasoned probability of how it resolves — win, loss, or settlement — with the chain of reasoning attached.",
    tag: "01 · Core",
  },
  {
    icon: FileText,
    title: "Case Summarizer",
    desc: "Facts, issues, evidence, and judgment distilled from a 300-page filing into something you can read before your next meeting.",
    tag: "02 · Core",
  },
  {
    icon: FileSearch2,
    title: "Document Analyzer",
    desc: "Surfaces missing clauses, contradictions, and compliance gaps against GDPR, DPDP, and HIPAA before they become your problem.",
    tag: "03 · Core",
  },
  {
    icon: Search,
    title: "Research Engine",
    desc: "Semantic search across statutes, sections, and precedent — retrieval-augmented, cited, and cross-referenced.",
    tag: "04 · Research",
  },
  {
    icon: Network,
    title: "Knowledge Graph",
    desc: "Cases, judges, acts, and evidence as a graph you can pull apart — trace precedent the way it actually connects.",
    tag: "05 · Research",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    desc: "Win rate by judge, court, and case category — the pattern behind the docket, not just the headline number.",
    tag: "06 · Insight",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Upload the file",
    desc: "PDF, DOCX, scanned images with OCR — drop in whatever you've got, structured or not.",
  },
  {
    n: "02",
    title: "JustiMind reads it",
    desc: "Facts, applicable law, evidence strength, and judge pattern get extracted and cross-checked against precedent.",
  },
  {
    n: "03",
    title: "You get a position",
    desc: "A probability, a reasoning chain, and a recommended strategy — exportable as a client-ready report.",
  },
];

const STATS = [
  { value: 2.4, suffix: "M", label: "cases indexed" },
  { value: 94, suffix: "%", label: "prediction accuracy" },
  { value: 40, suffix: "K+", label: "hours saved for counsel" },
  { value: 18, suffix: "", label: "jurisdictions supported" },
];

const TESTIMONIALS = [
  {
    quote: "I stopped treating the prediction as a novelty after the third case it called correctly — including the settlement figure, within eight percent.",
    name: "Senior Associate",
    org: "Litigation practice, mid-size firm",
  },
  {
    quote: "The summarizer reads a filing the way a very fast, very sober third-year associate would. It doesn't editorialize. It just tells you what's there.",
    name: "In-house Counsel",
    org: "Technology company",
  },
  {
    quote: "We use the risk analysis before we advise a client to settle. It's changed the tone of that conversation — less gut feeling, more grounded number.",
    name: "Partner",
    org: "Commercial disputes group",
  },
];

const PRICING = [
  {
    tier: "Associate",
    price: "$0",
    period: "forever",
    desc: "For individual practitioners exploring case intelligence.",
    features: ["5 case summaries / month", "1 prediction / month", "Basic research search", "Community support"],
    cta: "Start free",
    highlighted: false,
  },
  {
    tier: "Counsel",
    price: "$89",
    period: "per seat / month",
    desc: "For active litigators who need this in daily workflow.",
    features: [
      "Unlimited summaries",
      "50 predictions / month",
      "Full research + knowledge graph",
      "PDF & DOCX report export",
      "Priority support",
    ],
    cta: "Start 14-day trial",
    highlighted: true,
  },
  {
    tier: "Chambers",
    price: "Custom",
    period: "for firms",
    desc: "For firms and legal departments running this at scale.",
    features: [
      "Unlimited everything",
      "SSO, RBAC, audit logs",
      "Private knowledge base",
      "Dedicated onboarding",
      "SLA-backed support",
    ],
    cta: "Talk to sales",
    highlighted: false,
  },
];

const CITATIONS = [
  "State v. Ferreira, 2023",
  "Art. 21 · Constitution",
  "Sec. 138, NI Act",
  "Carlson v. Meridian Corp.",
  "GDPR Art. 17",
];

/* ------------------------------------------------------------------ */
/*  Hooks                                                              */
/* ------------------------------------------------------------------ */

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, visible];
}

function useCountUp(target, active, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = null;
    let raf;
    const step = (ts) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);
  return value;
}

function useTypingRotation(words, holdMs = 1800) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState("typing");

  useEffect(() => {
    const word = words[index];
    let timeout;
    if (phase === "typing") {
      if (text.length < word.length) {
        timeout = setTimeout(() => setText(word.slice(0, text.length + 1)), 45);
      } else {
        timeout = setTimeout(() => setPhase("deleting"), holdMs);
      }
    } else {
      if (text.length > 0) {
        timeout = setTimeout(() => setText(text.slice(0, -1)), 25);
      } else {
        setPhase("typing");
        setIndex((i) => (i + 1) % words.length);
      }
    }
    return () => clearTimeout(timeout);
  }, [text, phase, index, words, holdMs]);

  return text;
}

/* ------------------------------------------------------------------ */
/*  Signature visual: the tipping scale                                */
/* ------------------------------------------------------------------ */

function JusticeScale({ tilt }) {
  const clampedTilt = Math.max(-12, Math.min(12, tilt));
  return (
    <svg viewBox="0 0 480 360" className="jm-scale-svg" aria-hidden="true">
      <defs>
        <linearGradient id="beamGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="50%" stopColor="#4F8CFF" />
          <stop offset="100%" stopColor="#7B3FE4" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4F8CFF" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#4F8CFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="240" cy="180" r="170" fill="url(#glow)" />

      {/* post */}
      <line x1="240" y1="60" x2="240" y2="300" stroke="url(#beamGrad)" strokeWidth="3" opacity="0.8" />
      <circle cx="240" cy="300" r="6" fill="#4F8CFF" />
      <rect x="205" y="304" width="70" height="8" rx="4" fill="#4F8CFF" opacity="0.6" />

      {/* beam, rotating around fulcrum */}
      <g style={{ transform: `rotate(${clampedTilt}deg)`, transformOrigin: "240px 70px", transition: "transform 0.15s ease-out" }}>
        <line x1="90" y1="70" x2="390" y2="70" stroke="url(#beamGrad)" strokeWidth="3" />
        <circle cx="240" cy="70" r="7" fill="#22D3EE" />

        {/* left pan */}
        <line x1="90" y1="70" x2="90" y2={130 - clampedTilt * 2} stroke="#4F8CFF" strokeWidth="1.5" opacity="0.7" />
        <path d={`M60,${130 - clampedTilt * 2} Q90,${165 - clampedTilt * 2} 120,${130 - clampedTilt * 2}`} fill="none" stroke="url(#beamGrad)" strokeWidth="2.5" />
        <circle cx="90" cy={130 - clampedTilt * 2} r="3" fill="#22D3EE" />

        {/* right pan */}
        <line x1="390" y1="70" x2="390" y2={130 + clampedTilt * 2} stroke="#4F8CFF" strokeWidth="1.5" opacity="0.7" />
        <path d={`M360,${130 + clampedTilt * 2} Q390,${165 + clampedTilt * 2} 420,${130 + clampedTilt * 2}`} fill="none" stroke="url(#beamGrad)" strokeWidth="2.5" />
        <circle cx="390" cy={130 + clampedTilt * 2} r="3" fill="#7B3FE4" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Small building blocks                                              */
/* ------------------------------------------------------------------ */

function Reveal({ children, className = "", delay = 0 }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`jm-reveal ${visible ? "jm-reveal--visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function StatBlock({ stat, active }) {
  const val = useCountUp(stat.value, active);
  const display = stat.value % 1 !== 0 ? val.toFixed(1) : Math.round(val);
  return (
    <div className="jm-stat">
      <div className="jm-stat__value">
        {display}
        <span className="jm-stat__suffix">{stat.suffix}</span>
      </div>
      <div className="jm-stat__label">{stat.label}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function JustiMindLanding() {
  const [theme, setTheme] = useState("dark");
  const [tilt, setTilt] = useState(0);
  const heroRef = useRef(null);
  const [statsRef, statsVisible] = useReveal();
  const typedWord = useTypingRotation(ROTATING_WORDS);

  const handleMouseMove = useCallback((e) => {
    const el = heroRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    setTilt(relX * 20);
  }, []);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <div className={`jm-root jm-theme-${theme}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');

        .jm-root {
          --bg: #050505;
          --surface: #0a0a0d;
          --card: #121212;
          --card-border: rgba(255,255,255,0.08);
          --text: #f5f6fa;
          --text-muted: #9a9db3;
          --royal: #2547F4;
          --purple: #7B3FE4;
          --cyan: #22D3EE;
          --neon: #4F8CFF;
          --grad: linear-gradient(120deg, var(--royal), var(--purple) 55%, var(--cyan));
          font-family: 'Manrope', sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          overflow-x: hidden;
          transition: background 0.4s ease, color 0.4s ease;
        }
        .jm-root.jm-theme-light {
          --bg: #fbfbfd;
          --surface: #ffffff;
          --card: #ffffff;
          --card-border: rgba(10,10,25,0.08);
          --text: #0c0c14;
          --text-muted: #5b5f76;
        }
        .jm-root * { box-sizing: border-box; }
        .jm-mono { font-family: 'IBM Plex Mono', monospace; }
        .jm-display { font-family: 'Fraunces', serif; }

        .jm-wrap { max-width: 1180px; margin: 0 auto; padding: 0 28px; }

        /* ---------- Nav ---------- */
        .jm-nav {
          position: sticky; top: 0; z-index: 50;
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 28px;
          backdrop-filter: blur(16px);
          background: color-mix(in srgb, var(--bg) 70%, transparent);
          border-bottom: 1px solid var(--card-border);
        }
        .jm-logo { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 18px; letter-spacing: -0.02em; }
        .jm-logo-mark {
          width: 30px; height: 30px; border-radius: 8px;
          background: var(--grad);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 18px rgba(79,140,255,0.5);
        }
        .jm-nav-links { display: flex; gap: 30px; align-items: center; }
        .jm-nav-links a { color: var(--text-muted); text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.2s; }
        .jm-nav-links a:hover { color: var(--text); }
        .jm-nav-actions { display: flex; align-items: center; gap: 14px; }
        .jm-icon-btn {
          width: 38px; height: 38px; border-radius: 10px; border: 1px solid var(--card-border);
          background: var(--card); display: flex; align-items: center; justify-content: center;
          color: var(--text); cursor: pointer; transition: all 0.2s;
        }
        .jm-icon-btn:hover { border-color: var(--neon); }

        .jm-btn {
          font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 14px;
          padding: 11px 20px; border-radius: 10px; cursor: pointer;
          border: none; display: inline-flex; align-items: center; gap: 8px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .jm-btn:hover { transform: translateY(-1px); }
        .jm-btn--primary { background: var(--grad); color: white; box-shadow: 0 8px 24px rgba(79,140,255,0.35); }
        .jm-btn--ghost { background: transparent; color: var(--text); border: 1px solid var(--card-border); }
        .jm-btn--full { width: 100%; justify-content: center; }

        /* ---------- Hero ---------- */
        .jm-hero {
          position: relative;
          padding: 90px 28px 60px;
          display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 40px;
          align-items: center;
        }
        .jm-hero-bg-glow {
          position: absolute; inset: -10% -10% auto -10%; height: 600px;
          background: radial-gradient(circle at 30% 20%, rgba(37,71,244,0.18), transparent 60%),
                      radial-gradient(circle at 75% 10%, rgba(123,63,228,0.15), transparent 55%);
          pointer-events: none; z-index: 0;
        }
        .jm-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: 0.06em;
          color: var(--cyan); background: rgba(34,211,238,0.08); border: 1px solid rgba(34,211,238,0.25);
          padding: 6px 12px; border-radius: 100px; margin-bottom: 22px;
        }
        .jm-hero-title {
          font-size: clamp(40px, 5vw, 68px); line-height: 1.05; font-weight: 500;
          letter-spacing: -0.02em; margin: 0 0 22px;
        }
        .jm-hero-title .jm-italic { font-style: italic; background: var(--grad); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .jm-hero-sub { font-size: 18px; line-height: 1.6; color: var(--text-muted); max-width: 480px; margin-bottom: 32px; }
        .jm-hero-sub .jm-typed { color: var(--text); font-weight: 700; border-right: 2px solid var(--cyan); padding-right: 2px; }
        .jm-hero-cta { display: flex; gap: 14px; margin-bottom: 40px; }
        .jm-hero-note { font-size: 13px; color: var(--text-muted); display: flex; align-items: center; gap: 8px; }

        .jm-hero-visual { position: relative; z-index: 1; height: 420px; }
        .jm-scale-svg { width: 100%; height: 100%; }

        .jm-chip {
          position: absolute; padding: 8px 14px; border-radius: 10px;
          background: var(--card); border: 1px solid var(--card-border);
          font-family: 'IBM Plex Mono', monospace; font-size: 11.5px; color: var(--text-muted);
          box-shadow: 0 10px 30px rgba(0,0,0,0.25);
          animation: jm-float 6s ease-in-out infinite;
        }
        @keyframes jm-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
        }

        /* ---------- Stats ---------- */
        .jm-stats {
          border-top: 1px solid var(--card-border); border-bottom: 1px solid var(--card-border);
          display: grid; grid-template-columns: repeat(4, 1fr);
        }
        .jm-stat { padding: 36px 28px; text-align: center; border-right: 1px solid var(--card-border); }
        .jm-stat:last-child { border-right: none; }
        .jm-stat__value { font-family: 'IBM Plex Mono', monospace; font-size: 34px; font-weight: 500; color: var(--text); }
        .jm-stat__suffix { color: var(--cyan); }
        .jm-stat__label { font-size: 13px; color: var(--text-muted); margin-top: 6px; }

        /* ---------- Section shell ---------- */
        .jm-section { padding: 110px 28px; }
        .jm-section-head { max-width: 620px; margin-bottom: 56px; }
        .jm-kicker {
          font-family: 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--purple); margin-bottom: 14px; display: block;
        }
        .jm-h2 { font-size: clamp(28px, 3.4vw, 42px); font-weight: 500; letter-spacing: -0.01em; margin: 0 0 14px; }
        .jm-section-desc { color: var(--text-muted); font-size: 16px; line-height: 1.7; }

        /* ---------- Feature bento ---------- */
        .jm-bento { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
        .jm-card {
          background: var(--card); border: 1px solid var(--card-border); border-radius: 16px;
          padding: 28px; transition: border-color 0.25s, transform 0.25s;
        }
        .jm-card:hover { border-color: var(--neon); transform: translateY(-3px); }
        .jm-card-icon {
          width: 42px; height: 42px; border-radius: 11px; margin-bottom: 20px;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, rgba(37,71,244,0.18), rgba(123,63,228,0.18));
          color: var(--cyan);
        }
        .jm-card-tag { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: var(--text-muted); margin-bottom: 10px; display: block; }
        .jm-card h3 { font-size: 19px; margin: 0 0 10px; font-weight: 700; }
        .jm-card p { font-size: 14.5px; line-height: 1.65; color: var(--text-muted); margin: 0; }

        /* ---------- How it works ---------- */
        .jm-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .jm-step { position: relative; padding: 30px 26px; border-radius: 16px; border: 1px solid var(--card-border); background: var(--surface); }
        .jm-step__n {
          font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: var(--neon);
          margin-bottom: 18px; display: block;
        }
        .jm-step h3 { font-size: 18px; margin: 0 0 8px; }
        .jm-step p { font-size: 14.5px; color: var(--text-muted); line-height: 1.6; margin: 0; }
        .jm-step-arrow { position: absolute; right: -30px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }

        /* ---------- Demo preview ---------- */
        .jm-demo {
          border-radius: 20px; border: 1px solid var(--card-border); background: var(--card);
          padding: 8px; box-shadow: 0 30px 80px rgba(0,0,0,0.35);
        }
        .jm-demo-inner { border-radius: 14px; background: var(--surface); padding: 30px; display: grid; grid-template-columns: 1.3fr 1fr; gap: 26px; }
        .jm-demo-chatline { display: flex; gap: 12px; margin-bottom: 16px; align-items: flex-start; }
        .jm-demo-avatar { width: 28px; height: 28px; border-radius: 8px; background: var(--grad); flex-shrink: 0; }
        .jm-demo-bubble { background: var(--card); border: 1px solid var(--card-border); border-radius: 12px; padding: 12px 14px; font-size: 13.5px; color: var(--text-muted); line-height: 1.55; }
        .jm-gauge-wrap { text-align: center; }
        .jm-gauge-value { font-family: 'IBM Plex Mono', monospace; font-size: 40px; color: var(--cyan); font-weight: 500; }
        .jm-gauge-label { font-size: 12.5px; color: var(--text-muted); font-family: 'IBM Plex Mono', monospace; }
        .jm-bar-row { display: flex; align-items: center; gap: 10px; margin-top: 14px; font-size: 12px; }
        .jm-bar-track { flex: 1; height: 6px; border-radius: 4px; background: var(--card-border); overflow: hidden; }
        .jm-bar-fill { height: 100%; border-radius: 4px; background: var(--grad); }

        /* ---------- Testimonials ---------- */
        .jm-testimonials { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .jm-quote-card { background: var(--surface); border: 1px solid var(--card-border); border-radius: 16px; padding: 28px; }
        .jm-quote-card p { font-size: 15px; line-height: 1.65; color: var(--text); margin: 14px 0 20px; }
        .jm-quote-name { font-weight: 700; font-size: 13.5px; }
        .jm-quote-org { font-size: 12.5px; color: var(--text-muted); }

        /* ---------- Pricing ---------- */
        .jm-pricing { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; align-items: stretch; }
        .jm-price-card {
          border-radius: 18px; border: 1px solid var(--card-border); background: var(--card);
          padding: 32px 28px; display: flex; flex-direction: column;
        }
        .jm-price-card--hl { border: 1px solid transparent; background: linear-gradient(var(--card), var(--card)) padding-box, var(--grad) border-box; position: relative; }
        .jm-price-badge { position: absolute; top: -13px; right: 28px; background: var(--grad); font-size: 11px; font-weight: 700; padding: 5px 12px; border-radius: 100px; font-family: 'IBM Plex Mono', monospace; }
        .jm-price-tier { font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: var(--purple); margin-bottom: 10px; }
        .jm-price-value { font-size: 38px; font-weight: 700; display: flex; align-items: baseline; gap: 6px; }
        .jm-price-period { font-size: 13px; color: var(--text-muted); font-weight: 500; }
        .jm-price-desc { font-size: 13.5px; color: var(--text-muted); margin: 12px 0 22px; line-height: 1.55; }
        .jm-price-feat { list-style: none; padding: 0; margin: 0 0 26px; flex: 1; }
        .jm-price-feat li { display: flex; align-items: center; gap: 10px; font-size: 13.5px; padding: 7px 0; color: var(--text); }
        .jm-price-feat svg { color: var(--cyan); flex-shrink: 0; }

        /* ---------- Final CTA ---------- */
        .jm-final-cta {
          margin: 0 28px 100px; border-radius: 24px; padding: 70px 40px; text-align: center;
          background: linear-gradient(135deg, rgba(37,71,244,0.12), rgba(123,63,228,0.12));
          border: 1px solid var(--card-border);
        }

        /* ---------- Footer ---------- */
        .jm-footer { border-top: 1px solid var(--card-border); padding: 50px 28px; }
        .jm-footer-grid { display: grid; grid-template-columns: 1.4fr repeat(3, 1fr); gap: 30px; margin-bottom: 40px; }
        .jm-footer-col h4 { font-size: 13px; margin: 0 0 14px; color: var(--text-muted); font-family: 'IBM Plex Mono', monospace; }
        .jm-footer-col a { display: block; color: var(--text); text-decoration: none; font-size: 14px; margin-bottom: 10px; opacity: 0.85; }
        .jm-footer-col a:hover { opacity: 1; color: var(--cyan); }
        .jm-footer-bottom { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: var(--text-muted); padding-top: 24px; border-top: 1px solid var(--card-border); }

        /* ---------- Reveal animation ---------- */
        .jm-reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .jm-reveal--visible { opacity: 1; transform: translateY(0); }

        @media (prefers-reduced-motion: reduce) {
          .jm-chip, .jm-reveal { animation: none !important; transition: none !important; }
        }

        @media (max-width: 900px) {
          .jm-hero { grid-template-columns: 1fr; }
          .jm-bento, .jm-steps, .jm-testimonials, .jm-pricing { grid-template-columns: 1fr; }
          .jm-stats { grid-template-columns: repeat(2, 1fr); }
          .jm-stat:nth-child(2) { border-right: none; }
          .jm-demo-inner { grid-template-columns: 1fr; }
          .jm-nav-links { display: none; }
          .jm-footer-grid { grid-template-columns: 1fr 1fr; }
          .jm-hero-visual { height: 280px; }
        }
      `}</style>

      {/* ---------------- Nav ---------------- */}
      <nav className="jm-nav">
        <div className="jm-logo">
          <div className="jm-logo-mark"><Scale size={16} color="#fff" /></div>
          JustiMind
        </div>
        <div className="jm-nav-links">
          <a href="#features">Product</a>
          <a href="#how">How it works</a>
          <a href="#testimonials">Customers</a>
          <a href="#pricing">Pricing</a>
        </div>
        <div className="jm-nav-actions">
          <button className="jm-icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button className="jm-btn jm-btn--ghost">Sign in</button>
          <button className="jm-btn jm-btn--primary">Get started <ArrowRight size={14} /></button>
        </div>
      </nav>

      {/* ---------------- Hero ---------------- */}
      <header className="jm-hero" ref={heroRef} onMouseMove={handleMouseMove}>
        <div className="jm-hero-bg-glow" />
        <div style={{ position: "relative", zIndex: 1 }}>
          <span className="jm-eyebrow"><Sparkles size={12} /> AI-NATIVE LEGAL INTELLIGENCE</span>
          <h1 className="jm-hero-title jm-display">
            Judgment,<br />before <span className="jm-italic">the verdict</span>.
          </h1>
          <p className="jm-hero-sub">
            JustiMind reads the case file and tells you <span className="jm-typed jm-mono">{typedWord}</span> — with the reasoning, the precedent, and the confidence score attached.
          </p>
          <div className="jm-hero-cta">
            <button className="jm-btn jm-btn--primary">Start free <ArrowRight size={15} /></button>
            <button className="jm-btn jm-btn--ghost">Watch a case walkthrough</button>
          </div>
          <div className="jm-hero-note"><ShieldCheck size={14} /> AES-256 encrypted · No case data used for training</div>
        </div>

        <div className="jm-hero-visual">
          <JusticeScale tilt={tilt} />
          {CITATIONS.slice(0, 3).map((c, i) => (
            <div
              key={c}
              className="jm-chip"
              style={{
                top: `${14 + i * 30}%`,
                left: i % 2 === 0 ? "0%" : "auto",
                right: i % 2 === 1 ? "2%" : "auto",
                animationDelay: `${i * 0.7}s`,
              }}
            >
              {c}
            </div>
          ))}
        </div>
      </header>

      {/* ---------------- Stats ---------------- */}
      <div className="jm-stats" ref={statsRef}>
        {STATS.map((s) => (
          <StatBlock key={s.label} stat={s} active={statsVisible} />
        ))}
      </div>

      {/* ---------------- Features ---------------- */}
      <section className="jm-section" id="features">
        <Reveal className="jm-section-head">
          <span className="jm-kicker">The Workspace</span>
          <h2 className="jm-h2 jm-display">Six tools. One case file.</h2>
          <p className="jm-section-desc">Everything opens from the same upload — no re-keying facts between the summarizer, the predictor, and the research engine.</p>
        </Reveal>
        <div className="jm-bento">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 60}>
              <div className="jm-card">
                <div className="jm-card-icon"><f.icon size={20} /></div>
                <span className="jm-card-tag">{f.tag}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- How it works ---------------- */}
      <section className="jm-section" id="how" style={{ background: "var(--surface)" }}>
        <Reveal className="jm-section-head">
          <span className="jm-kicker">The Process</span>
          <h2 className="jm-h2 jm-display">From filing to position, in three steps.</h2>
        </Reveal>
        <div className="jm-steps">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 100}>
              <div className="jm-step">
                <span className="jm-step__n jm-mono">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                {i < STEPS.length - 1 && (
                  <span className="jm-step-arrow"><ChevronRight size={20} /></span>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- Demo preview ---------------- */}
      <section className="jm-section">
        <Reveal className="jm-section-head">
          <span className="jm-kicker">Inside the Workspace</span>
          <h2 className="jm-h2 jm-display">What counsel actually sees.</h2>
        </Reveal>
        <Reveal>
          <div className="jm-demo">
            <div className="jm-demo-inner">
              <div>
                <div className="jm-demo-chatline">
                  <div className="jm-demo-avatar" />
                  <div className="jm-demo-bubble">Summarize the Ferreira filing and flag any weak evidence sections.</div>
                </div>
                <div className="jm-demo-chatline">
                  <div className="jm-demo-avatar" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }} />
                  <div className="jm-demo-bubble">
                    Facts extracted across 4 exhibits. Section 3 (chain of custody) is contested and weakly supported — recommend requesting the original log before the hearing on the 14th.
                  </div>
                </div>
              </div>
              <div className="jm-gauge-wrap">
                <div className="jm-gauge-value jm-mono">78%</div>
                <div className="jm-gauge-label">WIN PROBABILITY</div>
                <div className="jm-bar-row">
                  <span className="jm-mono" style={{ width: 70, color: "var(--text-muted)" }}>Evidence</span>
                  <div className="jm-bar-track"><div className="jm-bar-fill" style={{ width: "82%" }} /></div>
                </div>
                <div className="jm-bar-row">
                  <span className="jm-mono" style={{ width: 70, color: "var(--text-muted)" }}>Precedent</span>
                  <div className="jm-bar-track"><div className="jm-bar-fill" style={{ width: "66%" }} /></div>
                </div>
                <div className="jm-bar-row">
                  <span className="jm-mono" style={{ width: 70, color: "var(--text-muted)" }}>Judge fit</span>
                  <div className="jm-bar-track"><div className="jm-bar-fill" style={{ width: "74%" }} /></div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------------- Testimonials ---------------- */}
      <section className="jm-section" id="testimonials" style={{ background: "var(--surface)" }}>
        <Reveal className="jm-section-head">
          <span className="jm-kicker">Who's using this</span>
          <h2 className="jm-h2 jm-display">Trusted in the room before the hearing.</h2>
        </Reveal>
        <div className="jm-testimonials">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 80}>
              <div className="jm-quote-card">
                <Quote size={20} color="var(--purple)" />
                <p>{t.quote}</p>
                <div className="jm-quote-name">{t.name}</div>
                <div className="jm-quote-org">{t.org}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- Pricing ---------------- */}
      <section className="jm-section" id="pricing">
        <Reveal className="jm-section-head">
          <span className="jm-kicker">Pricing</span>
          <h2 className="jm-h2 jm-display">Priced by the seat, not the case.</h2>
        </Reveal>
        <div className="jm-pricing">
          {PRICING.map((p, i) => (
            <Reveal key={p.tier} delay={i * 80}>
              <div className={`jm-price-card ${p.highlighted ? "jm-price-card--hl" : ""}`}>
                {p.highlighted && <span className="jm-price-badge">MOST USED</span>}
                <span className="jm-price-tier jm-mono">{p.tier.toUpperCase()}</span>
                <div className="jm-price-value">
                  {p.price}
                  <span className="jm-price-period">/ {p.period}</span>
                </div>
                <p className="jm-price-desc">{p.desc}</p>
                <ul className="jm-price-feat">
                  {p.features.map((f) => (
                    <li key={f}><Check size={15} /> {f}</li>
                  ))}
                </ul>
                <button className={`jm-btn jm-btn--full ${p.highlighted ? "jm-btn--primary" : "jm-btn--ghost"}`}>
                  {p.cta}
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- Final CTA ---------------- */}
      <Reveal>
        <div className="jm-final-cta">
          <h2 className="jm-h2 jm-display" style={{ marginBottom: 12 }}>Upload your first case file today.</h2>
          <p className="jm-section-desc" style={{ maxWidth: 480, margin: "0 auto 30px" }}>No credit card. Five free summaries and one free prediction on us.</p>
          <button className="jm-btn jm-btn--primary" style={{ padding: "14px 28px", fontSize: 15 }}>
            <Upload size={16} /> Get started free
          </button>
        </div>
      </Reveal>

      {/* ---------------- Footer ---------------- */}
      <footer className="jm-footer">
        <div className="jm-wrap">
          <div className="jm-footer-grid">
            <div className="jm-footer-col">
              <div className="jm-logo" style={{ marginBottom: 14 }}>
                <div className="jm-logo-mark"><Scale size={16} color="#fff" /></div>
                JustiMind
              </div>
              <p style={{ fontSize: 13.5, color: "var(--text-muted)", maxWidth: 260, lineHeight: 1.6 }}>
                Intelligent judgment prediction and case summarization for people who bill by the hour.
              </p>
            </div>
            <div className="jm-footer-col">
              <h4>PRODUCT</h4>
              <a href="#features">Prediction Engine</a>
              <a href="#features">Case Summarizer</a>
              <a href="#features">Document Analyzer</a>
              <a href="#pricing">Pricing</a>
            </div>
            <div className="jm-footer-col">
              <h4>COMPANY</h4>
              <a href="#">About</a>
              <a href="#">Documentation</a>
              <a href="#">Legal news</a>
              <a href="#">Contact</a>
            </div>
            <div className="jm-footer-col">
              <h4>LEGAL</h4>
              <a href="#">Privacy policy</a>
              <a href="#">Terms of service</a>
              <a href="#">Security</a>
            </div>
          </div>
          <div className="jm-footer-bottom">
            <span>© 2026 JustiMind. All rights reserved.</span>
            <span className="jm-mono">STATUS: ALL SYSTEMS OPERATIONAL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
