import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, AlertTriangle, CheckCircle, XCircle, Search, Globe, Shield, ChevronDown, Eye } from "lucide-react";
import VisualSimWrapper, { SimResults } from "../VisualSimWrapper";

// ── Clues hidden in the fake banking portal ──────────────────────────────────
const CLUES = [
  { id: "url",       zone: "url",     label: "Suspicious URL domain",          points: 25, explanation: "The domain is 'secure-bankofamerica-login.com' — NOT bankofamerica.com. Attackers register similar-sounding domains to deceive victims." },
  { id: "cert",      zone: "cert",    label: "Invalid/self-signed certificate", points: 20, explanation: "The certificate is issued by 'Unknown CA' and expires in 3 days. Real banks use trusted CAs with long-validity certs." },
  { id: "logo",      zone: "logo",    label: "Slightly distorted logo",         points: 15, explanation: "The Bank of America eagle logo has subtle distortions. Phishing kits often use compressed/rescaled images." },
  { id: "form",      zone: "form",    label: "Unusual login form fields",       points: 20, explanation: "Real banking logins don't ask for your full 16-digit card number AND CVV on the login page — this is credential harvesting." },
  { id: "footer",    zone: "footer",  label: "Incorrect copyright year",        points: 10, explanation: "Footer shows '© 2019 Bank of America' — phishing pages often copy old page versions with stale dates." },
  { id: "http",      zone: "url",     label: "Mixed content warning",           points: 10, explanation: "Despite HTTPS, images are loaded over HTTP (mixed content) — a sign of a poorly constructed phishing page." },
];

export default function FakeBankingPortal() {
  const [phase,   setPhase]  = useState("intro");
  const [found,   setFound]  = useState(new Set());
  const [tooltip, setTooltip]= useState(null);
  const [score,   setScore]  = useState(0);
  const [findings,setFindings]= useState([]);
  const [certOpen,setCertOpen]= useState(false);
  const [submitted,setSubmitted]=useState(false);
  const maxScore = CLUES.reduce((s, c) => s + c.points, 0);

  const handleClue = (clue) => {
    if (found.has(clue.id)) { setTooltip(tooltip === clue.id ? null : clue.id); return; }
    setFound((prev) => new Set([...prev, clue.id]));
    setScore((s) => s + clue.points);
    setTooltip(clue.id);
    setFindings((prev) => [...prev, { correct: true, text: `${clue.label}: ${clue.explanation}` }]);
    setTimeout(() => setTooltip(null), 4000);
  };

  const handleFinish = () => {
    const missed = CLUES.filter((c) => !found.has(c.id));
    setFindings((prev) => [...prev, ...missed.map((c) => ({ correct: false, text: `Missed: ${c.label} — ${c.explanation}` }))]);
    setSubmitted(true);
    setTimeout(() => setPhase("result"), 1200);
  };

  const handleRetry = () => {
    setPhase("intro"); setFound(new Set()); setTooltip(null); setScore(0); setFindings([]); setCertOpen(false); setSubmitted(false);
  };

  const clue = (id) => CLUES.find((c) => c.id === id);
  const isFound = (id) => found.has(id);

  if (phase === "result") return <SimResults score={score} maxScore={maxScore} timeTaken={200} totalTime={300} onRetry={handleRetry} findings={findings} />;

  return (
    <VisualSimWrapper
      title="Fake Banking Portal Detection" level="advanced" category="phishing"
      timeLimit={300} phase={phase} score={score} maxScore={maxScore}
      onStart={() => setPhase("playing")} onRetry={handleRetry}
      hints={[
        "A convincing fake banking site is in front of you.",
        "Click on EVERYTHING that looks suspicious — 6 clues hidden.",
        "Check: URL bar, certificate, logo, login form, footer.",
        "Remember: HTTPS doesn't mean the site is legitimate.",
      ]}
      findings={findings}
    >
      <div className="min-h-screen bg-gray-200 flex flex-col lg:flex-row">
        {/* Browser shell */}
        <div className="flex-1">
          {/* Browser chrome */}
          <div className="bg-gray-800 px-4 pt-3 pb-0 shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500"/><div className="w-3 h-3 rounded-full bg-yellow-500"/><div className="w-3 h-3 rounded-full bg-green-500"/></div>
              {/* Address bar */}
              <div
                className="flex-1 flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5 cursor-pointer hover:ring-2 hover:ring-red-500/50 transition-all relative"
                onClick={() => handleClue(clue("url"))}
              >
                <Lock className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                <span className="text-sm font-mono text-gray-700 flex-1">
                  https://secure-<span className="text-red-600 font-bold">bankofamerica-login</span>.com/signin
                </span>
                {/* Mixed content icon */}
                <div className="cursor-pointer" onClick={(e) => { e.stopPropagation(); handleClue(clue("http")); }}>
                  <AlertTriangle className={`w-4 h-4 ${isFound("http") ? "text-emerald-500" : "text-amber-500 animate-pulse"}`} />
                </div>
                {/* URL Tooltip */}
                <AnimatePresence>
                  {(tooltip === "url" || tooltip === "http") && (
                    <motion.div initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="absolute z-30 top-10 left-0 w-80 bg-red-900 text-red-100 text-xs rounded-xl shadow-2xl p-3">
                      🚨 {tooltip === "url" ? clue("url").explanation : clue("http").explanation}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {/* Certificate button */}
              <button
                onClick={() => setCertOpen(!certOpen)}
                className={`p-1.5 rounded-lg transition-colors ${isFound("cert") ? "text-emerald-400 bg-emerald-500/10" : "text-gray-400 hover:text-white hover:bg-gray-700"}`}
              >
                <Shield className="w-4 h-4" />
              </button>
            </div>

            {/* Certificate panel */}
            <AnimatePresence>
              {certOpen && (
                <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="bg-gray-900 border border-gray-700 rounded-xl p-4 mb-2 text-xs text-gray-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Certificate Information</span>
                    <button onClick={() => setCertOpen(false)} className="text-gray-500 hover:text-white">✕</button>
                  </div>
                  {[["Issued to", "secure-bankofamerica-login.com"], ["Issued by", "Unknown CA (Self-Signed)"], ["Valid from", "2024-04-01"], ["Valid until", "2024-04-04 ⚠️"]].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4">
                      <span className="text-gray-500">{k}</span>
                      <span className={v.includes("Unknown") || v.includes("⚠️") ? "text-red-400 font-semibold" : "text-gray-200"}>{v}</span>
                    </div>
                  ))}
                  <button
                    onClick={() => { handleClue(clue("cert")); setCertOpen(false); }}
                    className="w-full mt-2 bg-red-600 hover:bg-red-500 text-white font-bold py-1.5 rounded-lg text-xs transition-colors"
                  >
                    🚨 Flag Certificate as Suspicious
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tab bar */}
            <div className="flex gap-0 bg-gray-750 pt-1">
              <div className="bg-white px-4 py-1.5 rounded-t-lg text-xs text-gray-700 flex items-center gap-2">
                🏦 Bank of America — Sign In
              </div>
            </div>
          </div>

          {/* Fake banking page */}
          <div className="bg-white min-h-[calc(100vh-140px)]">
            {/* Nav bar */}
            <div className="bg-red-700 text-white px-6 py-3 flex items-center justify-between">
              {/* Logo — clickable suspicious clue */}
              <div
                className="flex items-center gap-2 cursor-pointer hover:ring-2 hover:ring-yellow-400 rounded-lg p-1 transition-all"
                onClick={() => handleClue(clue("logo"))}
              >
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center relative">
                  <span className="text-red-700 font-black text-sm" style={{ transform: "scaleX(1.3)" }}>🦅</span>
                  {isFound("logo") && <div className="absolute inset-0 ring-2 ring-emerald-400 rounded" />}
                </div>
                <span className="font-bold text-lg">Bank of America</span>
              </div>
              <div className="flex gap-6 text-sm">
                {["Personal", "Small Business", "Wealth Mgmt"].map((n) => (
                  <span key={n} className="hidden md:block hover:text-red-200 cursor-pointer">{n}</span>
                ))}
              </div>
            </div>

            {/* Login form */}
            <div className="flex items-start justify-center pt-12 px-4">
              <div className="w-full max-w-md">
                <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Sign In</h2>

                  <div
                    className="space-y-4 cursor-pointer"
                    onClick={() => handleClue(clue("form"))}
                  >
                    <div className={`p-3 rounded-xl ${isFound("form") ? "ring-2 ring-emerald-400" : "hover:ring-2 hover:ring-red-300"} transition-all`}>
                      <label className="block text-xs text-gray-500 mb-1">Online ID</label>
                      <input type="text" placeholder="Enter your online ID" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm pointer-events-none" readOnly />
                    </div>
                    <div className={`p-3 rounded-xl ${isFound("form") ? "ring-2 ring-emerald-400" : "hover:ring-2 hover:ring-red-300"} transition-all`}>
                      <label className="block text-xs text-gray-500 mb-1">Password</label>
                      <input type="password" placeholder="Password" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm pointer-events-none" readOnly />
                    </div>
                    {/* Suspicious extra fields */}
                    <div className={`p-3 rounded-xl border-2 border-dashed border-red-300 bg-red-50 ${isFound("form") ? "ring-2 ring-emerald-400" : "hover:ring-2 hover:ring-red-400"} transition-all`}>
                      <label className="block text-xs text-red-600 mb-1 font-semibold">Card Number (16 digits)</label>
                      <input type="text" placeholder="1234 5678 9012 3456" className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm pointer-events-none" readOnly />
                    </div>
                    <div className={`p-3 rounded-xl border-2 border-dashed border-red-300 bg-red-50 ${isFound("form") ? "ring-2 ring-emerald-400" : "hover:ring-2 hover:ring-red-400"} transition-all`}>
                      <label className="block text-xs text-red-600 mb-1 font-semibold">CVV</label>
                      <input type="text" placeholder="123" className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm pointer-events-none" readOnly />
                    </div>
                    <AnimatePresence>
                      {tooltip === "form" && (
                        <motion.div initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="bg-red-900 text-red-100 text-xs rounded-xl p-3">
                          🚨 {clue("form").explanation}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button className="w-full mt-4 bg-red-700 hover:bg-red-800 text-white font-bold py-3 rounded-xl">Sign In</button>
                </div>

                {/* Footer — suspicious year */}
                <div
                  className="text-center mt-4 py-3 cursor-pointer hover:bg-amber-50 rounded-lg transition-colors"
                  onClick={() => handleClue(clue("footer"))}
                >
                  <p className={`text-xs ${isFound("footer") ? "text-emerald-600 font-bold" : "text-gray-400"}`}>
                    © 2019 Bank of America Corporation. All rights reserved.
                  </p>
                  <AnimatePresence>
                    {tooltip === "footer" && (
                      <motion.div initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="mt-2 bg-red-900 text-red-100 text-xs rounded-xl p-3">
                        🚨 {clue("footer").explanation}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div className="w-72 bg-gray-950 border-l border-gray-800 p-4 space-y-3 hidden xl:block">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Clues Found ({found.size}/{CLUES.length})</p>
          {CLUES.map((c) => (
            <div key={c.id} className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 ${found.has(c.id) ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300" : "bg-gray-900 border-gray-800 text-gray-600"}`}>
              {found.has(c.id) ? <CheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> : <div className="w-3.5 h-3.5 border border-gray-600 rounded mt-0.5 flex-shrink-0"/>}
              {c.label}
            </div>
          ))}
          <button onClick={handleFinish} disabled={submitted} className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-colors mt-4">
            {submitted ? "Submitting…" : "Submit Report"}
          </button>
        </div>

        {/* Mobile submit */}
        <div className="xl:hidden fixed bottom-4 left-1/2 -translate-x-1/2">
          <button onClick={handleFinish} disabled={submitted} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-8 rounded-2xl shadow-xl text-sm">
            Submit ({found.size}/{CLUES.length} found)
          </button>
        </div>
      </div>
    </VisualSimWrapper>
  );
}
