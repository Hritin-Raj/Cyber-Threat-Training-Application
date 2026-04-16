import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Check, X, Zap, ShieldCheck, Copy, RefreshCw } from "lucide-react";
import VisualSimWrapper, { SimResults } from "../VisualSimWrapper";

// ─── helpers ────────────────────────────────────────────────────────────────
const CHECKS = [
  { id: "len8",    label: "At least 8 characters",           test: (p) => p.length >= 8,                          points: 10 },
  { id: "len14",   label: "At least 14 characters",          test: (p) => p.length >= 14,                         points: 15 },
  { id: "upper",   label: "Contains uppercase letter",       test: (p) => /[A-Z]/.test(p),                        points: 15 },
  { id: "lower",   label: "Contains lowercase letter",       test: (p) => /[a-z]/.test(p),                        points: 10 },
  { id: "number",  label: "Contains a number",               test: (p) => /\d/.test(p),                           points: 15 },
  { id: "symbol",  label: "Contains a special character",    test: (p) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p), points: 20 },
  { id: "nodict",  label: "No common dictionary words",      test: (p) => !/(password|qwerty|admin|login|welcome|abc|123|monkey|dragon)/i.test(p), points: 15 },
];

const CRACK_TIMES = [
  { maxScore: 10,  time: "Instantly",      color: "text-red-400",    bg: "from-red-600 to-red-800" },
  { maxScore: 25,  time: "Seconds",        color: "text-red-400",    bg: "from-red-500 to-orange-700" },
  { maxScore: 40,  time: "Minutes",        color: "text-orange-400", bg: "from-orange-500 to-yellow-700" },
  { maxScore: 55,  time: "Hours",          color: "text-yellow-400", bg: "from-yellow-500 to-amber-600" },
  { maxScore: 70,  time: "Days",           color: "text-blue-400",   bg: "from-blue-500 to-cyan-600" },
  { maxScore: 85,  time: "Years",          color: "text-cyan-400",   bg: "from-cyan-500 to-teal-600" },
  { maxScore: 100, time: "Centuries+",     color: "text-emerald-400",bg: "from-emerald-500 to-teal-500" },
];

const STRENGTH_LABELS = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Very Strong", "Unbreakable"];

const WEAK_EXAMPLES = ["password", "123456", "admin123", "qwerty", "iloveyou"];
const STRONG_SUGGESTIONS = [
  "Try a passphrase: 4 random words joined by symbols",
  "Mix cases: 'cyBer$AcAd3mY!'",
  "Use abbreviation: 'I love CyberSec 2024!' → 'IlCS2024!'",
];

const generateStrongPassword = () => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  return Array.from({ length: 18 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

export default function PasswordStrengthBuilder() {
  const [phase,       setPhase]      = useState("intro");
  const [password,    setPassword]   = useState("");
  const [show,        setShow]       = useState(false);
  const [submitted,   setSubmitted]  = useState(false);
  const [copied,      setCopied]     = useState(false);
  const [score,       setScore]      = useState(0);
  const [findings,    setFindings]   = useState([]);
  const maxScore = CHECKS.reduce((s, c) => s + c.points, 0);

  const passed  = CHECKS.filter((c) => c.test(password));
  const failed  = CHECKS.filter((c) => !c.test(password));
  const rawScore = passed.reduce((s, c) => s + c.points, 0);
  const pct     = Math.round((rawScore / maxScore) * 100);

  const crackInfo = CRACK_TIMES.find((c) => pct <= c.maxScore) || CRACK_TIMES[CRACK_TIMES.length - 1];
  const strengthIdx = Math.min(Math.floor(pct / 15), 6);

  const handleSubmit = () => {
    if (!password) return;
    setScore(rawScore);
    const myFindings = [
      ...passed.map((c) => ({ correct: true,  text: c.label })),
      ...failed.map((c) => ({ correct: false, text: `Missing: ${c.label}` })),
    ];
    setFindings(myFindings);
    setSubmitted(true);
    setTimeout(() => setPhase("result"), 1500);
  };

  const handleSuggest = () => {
    setPassword(generateStrongPassword());
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(password).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRetry = () => { setPhase("intro"); setPassword(""); setSubmitted(false); setScore(0); setFindings([]); };

  if (phase === "result") return <SimResults score={score} maxScore={maxScore} timeTaken={120} totalTime={300} onRetry={handleRetry} findings={findings} />;

  return (
    <VisualSimWrapper
      title="Password Strength Builder" level="beginner" category="password"
      timeLimit={300} phase={phase} score={rawScore} maxScore={maxScore}
      onStart={() => setPhase("playing")} onRetry={handleRetry}
      hints={[
        "Type a password and see its strength evaluated in real time.",
        "Try to satisfy all 7 criteria for maximum score.",
        "A great password uses length, variety, and no dictionary words.",
        "Use the generator if you're stuck — then study why it's strong.",
      ]}
      findings={findings}
    >
      <div className="min-h-screen bg-gray-950 py-10 px-4">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Header */}
          <div className="text-center">
            <h2 className="text-2xl font-black text-white mb-1">Password Strength Builder</h2>
            <p className="text-gray-400 text-sm">Design the strongest password you can — criteria update live</p>
          </div>

          {/* Password input card */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
            <label className="text-gray-300 text-sm font-semibold">Your Password</label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Start typing…"
                maxLength={64}
                className="w-full bg-gray-800 border border-gray-700 text-white text-xl font-mono rounded-xl px-4 py-4 pr-24 focus:outline-none focus:border-cyan-500 placeholder-gray-600 tracking-widest"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                <button onClick={handleCopy} className="p-2 text-gray-500 hover:text-cyan-400 rounded-lg" title="Copy">
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <button onClick={() => setShow((s) => !s)} className="p-2 text-gray-500 hover:text-white rounded-lg">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Strength meter */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span className="font-semibold">{STRENGTH_LABELS[strengthIdx]}</span>
                <span>{pct}%</span>
              </div>
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${crackInfo.bg}`}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>

            {/* Crack time estimate */}
            <div className={`flex items-center gap-3 bg-gray-800 rounded-xl px-4 py-3`}>
              <ShieldCheck className={`w-5 h-5 ${crackInfo.color}`} />
              <div>
                <div className="text-white text-sm font-semibold">Estimated crack time</div>
                <div className={`text-xl font-black ${crackInfo.color}`}>{crackInfo.time}</div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-gray-400 text-xs">Length</div>
                <div className="text-white font-bold">{password.length} chars</div>
              </div>
            </div>
          </div>

          {/* Requirements checklist */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">Requirements Checklist</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CHECKS.map((c) => {
                const ok = c.test(password);
                return (
                  <motion.div
                    key={c.id}
                    animate={{ opacity: 1 }}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-sm transition-all ${ok ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300" : "bg-gray-800/50 border-gray-700/50 text-gray-500"}`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${ok ? "bg-emerald-500" : "border border-gray-600"}`}>
                      {ok && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span>{c.label}</span>
                    <span className={`ml-auto text-xs font-bold ${ok ? "text-emerald-400" : "text-gray-600"}`}>+{c.points}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Examples of weak passwords */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">❌ Common Weak Passwords (Never Use)</p>
            <div className="flex flex-wrap gap-2">
              {WEAK_EXAMPLES.map((pw) => (
                <span key={pw} className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-2 py-1 rounded-lg font-mono line-through">{pw}</span>
              ))}
            </div>
          </div>

          {/* Tips + actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSuggest}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-semibold py-3 rounded-xl border border-gray-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Generate Strong Password
            </button>
            <button
              onClick={handleSubmit}
              disabled={!password || submitted}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/20"
            >
              <Zap className="w-4 h-4" /> {submitted ? "Analyzing…" : `Submit (${pct}% strength)`}
            </button>
          </div>

          {/* Suggestions */}
          {pct < 60 && password.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
              <p className="text-amber-400 text-xs font-semibold mb-2">💡 Tips to Improve</p>
              {STRONG_SUGGESTIONS.map((s, i) => (
                <p key={i} className="text-gray-300 text-xs mb-1">• {s}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </VisualSimWrapper>
  );
}
