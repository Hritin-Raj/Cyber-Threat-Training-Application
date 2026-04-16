import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Clock, Shield, Star, Zap, ArrowLeft, RotateCcw, Trophy,
  CheckCircle, XCircle, AlertTriangle, ChevronRight, Target
} from "lucide-react";

// ─────────────────────────────────────────────
// Score utilities
// ─────────────────────────────────────────────
export const calcGrade = (pct) =>
  pct >= 85 ? "excellent" : pct >= 60 ? "good" : "poor";

export const GRADE = {
  excellent: { label: "Excellent!", color: "text-emerald-400", bg: "from-emerald-500/20 to-teal-500/10", border: "border-emerald-500/30", stars: 3, emoji: "🏆" },
  good:      { label: "Good Job!",  color: "text-blue-400",    bg: "from-blue-500/20 to-cyan-500/10",   border: "border-blue-500/30",    stars: 2, emoji: "🥈" },
  poor:      { label: "Keep Practicing", color: "text-red-400", bg: "from-red-500/20 to-orange-500/10", border: "border-red-500/30",    stars: 1, emoji: "📚" },
};

// ─────────────────────────────────────────────
// Timer hook
// ─────────────────────────────────────────────
export function useSimTimer(initialSeconds, onTimeUp) {
  const [remaining, setRemaining] = useState(initialSeconds);
  const [running, setRunning]     = useState(false);
  const ref = useRef(null);

  const start = useCallback(() => setRunning(true), []);
  const stop  = useCallback(() => setRunning(false), []);
  const reset = useCallback(() => { setRunning(false); setRemaining(initialSeconds); }, [initialSeconds]);

  useEffect(() => {
    if (!running) return;
    ref.current = setInterval(() => {
      setRemaining((t) => {
        if (t <= 1) { clearInterval(ref.current); onTimeUp?.(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, [running, onTimeUp]);

  const pct = Math.round((remaining / initialSeconds) * 100);
  const elapsed = initialSeconds - remaining;
  return { remaining, elapsed, pct, running, start, stop, reset };
}

// ─────────────────────────────────────────────
// Timer display
// ─────────────────────────────────────────────
export function TimerBar({ remaining, total, danger = 30 }) {
  const pct = Math.round((remaining / total) * 100);
  const isDanger = remaining <= danger;
  return (
    <div className="flex items-center gap-3">
      <Clock className={`w-4 h-4 flex-shrink-0 ${isDanger ? "text-red-400 animate-pulse" : "text-gray-400"}`} />
      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full transition-colors duration-300 ${isDanger ? "bg-red-500" : "bg-cyan-500"}`}
          style={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <span className={`text-sm font-mono font-bold w-10 text-right ${isDanger ? "text-red-400" : "text-gray-300"}`}>
        {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Results screen (reusable)
// ─────────────────────────────────────────────
export function SimResults({ score, maxScore, timeTaken, totalTime, onRetry, backTo = "/visual-simulations", findings = [] }) {
  const pct   = Math.round((score / maxScore) * 100);
  const grade = calcGrade(pct);
  const g     = GRADE[grade];
  const xp    = grade === "excellent" ? 150 : grade === "good" ? 100 : 50;
  // Speed bonus
  const speedBonus = timeTaken < totalTime * 0.5 ? 20 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen bg-gray-950 flex items-center justify-center p-6"
    >
      <div className={`w-full max-w-lg bg-gradient-to-br ${g.bg} border ${g.border} rounded-2xl p-8 text-center shadow-2xl`}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} className="text-6xl mb-4">
          {g.emoji}
        </motion.div>

        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3].map((s) => (
            <motion.div key={s} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + s * 0.1 }}>
              <Star className={`w-8 h-8 ${s <= g.stars ? "text-amber-400 fill-amber-400" : "text-gray-700"}`} />
            </motion.div>
          ))}
        </div>

        <h2 className={`text-3xl font-black mb-1 ${g.color}`}>{g.label}</h2>
        <p className="text-gray-400 mb-6">Simulation Complete</p>

        <div className="bg-gray-900/80 rounded-xl p-6 mb-6 grid grid-cols-3 gap-4">
          <div>
            <div className="text-3xl font-black text-white">{pct}%</div>
            <div className="text-gray-500 text-xs">Score</div>
          </div>
          <div>
            <div className="text-3xl font-black text-yellow-400">+{xp + speedBonus}</div>
            <div className="text-gray-500 text-xs">XP Earned</div>
          </div>
          <div>
            <div className="text-3xl font-black text-cyan-400">
              {Math.floor(timeTaken / 60)}:{String(timeTaken % 60).padStart(2, "0")}
            </div>
            <div className="text-gray-500 text-xs">Time</div>
          </div>
        </div>

        {speedBonus > 0 && (
          <div className="flex items-center justify-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 mb-4 text-amber-400 text-sm">
            <Zap className="w-4 h-4" /> Speed Bonus: +{speedBonus} XP
          </div>
        )}

        {findings.length > 0 && (
          <div className="text-left mb-6 space-y-2">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Key Findings</p>
            {findings.map((f, i) => (
              <div key={i} className={`flex items-start gap-2 text-sm p-2 rounded-lg ${f.correct ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"}`}>
                {f.correct ? <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> : <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                {f.text}
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onRetry} className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-colors">
            <RotateCcw className="w-4 h-4" /> Retry
          </button>
          <Link to={backTo} className="flex-1 flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold py-3 rounded-xl transition-colors">
            Next <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Main Wrapper (layout shell)
// ─────────────────────────────────────────────
export default function VisualSimWrapper({
  title, level, category, timeLimit = 300,
  children, score, maxScore, phase, onStart, onRetry,
  backTo = "/visual-simulations",
  hints = [],
  findings = [],
}) {
  const timeTakenRef = useRef(0);
  const [startTime] = useState(Date.now());

  const { remaining, pct: timerPct, start, stop, elapsed } = useSimTimer(timeLimit, () => {
    timeTakenRef.current = timeLimit;
  });

  useEffect(() => {
    if (phase === "playing") start();
    if (phase === "result") { stop(); timeTakenRef.current = elapsed; }
  }, [phase]);

  const LEVEL_COLORS = {
    beginner: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    intermediate: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    advanced: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    pro: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  };

  if (phase === "result") {
    return (
      <SimResults
        score={score} maxScore={maxScore}
        timeTaken={timeTakenRef.current || elapsed}
        totalTime={timeLimit}
        onRetry={onRetry}
        backTo={backTo}
        findings={findings}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link to={backTo} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg">
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Shield className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span className="text-white font-semibold text-sm truncate">{title}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ml-1 flex-shrink-0 ${LEVEL_COLORS[level] || LEVEL_COLORS.beginner}`}>
              {level}
            </span>
          </div>

          {phase === "playing" && (
            <div className="w-48 hidden sm:block">
              <TimerBar remaining={remaining} total={timeLimit} />
            </div>
          )}

          {phase === "playing" && (
            <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-1.5">
              <Target className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 font-bold text-sm">{score}<span className="text-gray-600">/{maxScore}</span></span>
            </div>
          )}
        </div>
        {/* Timer bar on mobile */}
        {phase === "playing" && (
          <div className="sm:hidden px-4 pb-2">
            <TimerBar remaining={remaining} total={timeLimit} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pt-16">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="min-h-screen flex items-center justify-center p-6"
            >
              <div className="max-w-xl w-full text-center">
                <div className="text-6xl mb-6">
                  {category === "phishing" ? "🎣" : category === "malware" ? "🦠" : category === "network" ? "🌐" : category === "password" ? "🔐" : "🛡️"}
                </div>
                <h1 className="text-3xl font-black text-white mb-3">{title}</h1>
                <div className="flex items-center justify-center gap-3 mb-6">
                  <span className={`text-sm px-3 py-1 rounded-full border capitalize ${LEVEL_COLORS[level] || ""}`}>{level}</span>
                  <span className="text-gray-500 text-sm flex items-center gap-1"><Clock className="w-4 h-4" />{Math.floor(timeLimit / 60)} minutes</span>
                </div>
                {hints.length > 0 && (
                  <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 mb-6 text-left space-y-2">
                    <p className="text-cyan-400 text-xs font-semibold uppercase tracking-wider">Mission Briefing</p>
                    {hints.map((h, i) => (
                      <p key={i} className="text-gray-300 text-sm flex items-start gap-2">
                        <span className="text-cyan-400 mt-0.5">›</span>{h}
                      </p>
                    ))}
                  </div>
                )}
                <button
                  onClick={onStart}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-lg px-10 py-4 rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2 mx-auto"
                >
                  Begin Simulation <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {phase === "playing" && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
