import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, CheckCircle, XCircle, AlertTriangle, Info, Inbox, Paperclip, ChevronDown } from "lucide-react";
import VisualSimWrapper, { SimResults, calcGrade } from "../VisualSimWrapper";

// ── Suspicious elements embedded in the email ──────────────────────────────
const CLUES = [
  { id: "sender",      label: "Suspicious sender domain",    x: "12%",  y: "17%",  w: "42%", h: "5%",   explanation: "Domain 'paypa1.net' uses number '1' instead of letter 'l' — a classic lookalike attack.", points: 20 },
  { id: "urgency",     label: "Urgency/threat language",     x: "6%",   y: "30%",  w: "88%", h: "4%",   explanation: "Phrases like 'IMMEDIATELY' and '24 hours' pressure you into acting without thinking.", points: 15 },
  { id: "link",        label: "Malicious link URL",          x: "6%",   y: "52%",  w: "60%", h: "4.5%", explanation: "The URL 'paypa1-secure-verify.xyz' is NOT paypal.com — it's a credential-harvesting site.", points: 25 },
  { id: "generic",     label: "Generic greeting",            x: "6%",   y: "24%",  w: "55%", h: "4%",   explanation: "Legitimate companies personalize emails. 'Dear Customer' indicates mass phishing.", points: 15 },
  { id: "attachment",  label: "Unexpected executable attachment", x: "6%", y: "62%", w: "45%", h: "5%", explanation: ".exe attachments in emails are almost always malware.", points: 25 },
];

const EMAIL_HTML = {
  from:    "security-team@paypa1.net",
  to:      "you@gmail.com",
  subject: "⚠️ URGENT: Your PayPal account has been LIMITED",
  date:    "Today, 9:47 AM",
  body: [
    { type: "greeting", text: "Dear Valued Customer," },
    { type: "urgency",  text: "We have detected UNUSUAL SIGN-IN ACTIVITY on your account. Your account has been temporarily LIMITED. You must verify your identity IMMEDIATELY or your account will be permanently suspended within 24 hours." },
    { type: "normal",   text: "To restore full access, please verify your account details:" },
    { type: "link",     text: "👉 Click here to verify: http://paypa1-secure-verify.xyz/restore?ref=89347AB" },
    { type: "normal",   text: "If you do not verify within 24 hours, your account will be permanently closed and all funds will be frozen." },
    { type: "attachment", text: "📎 Account_Statement_Verify.exe (Required)" },
    { type: "sign",     text: "PayPal Security Team\nPayPal Inc." },
  ],
};

// Tooltip positions for each clue
const TOOLTIP_POSITIONS = {
  sender:     "bottom",
  urgency:    "bottom",
  link:       "top",
  generic:    "bottom",
  attachment: "top",
};

export default function PhishingEmailAnalyzer() {
  const [phase, setPhase]       = useState("intro");
  const [found, setFound]       = useState(new Set());
  const [wrong, setWrong]       = useState(new Set());
  const [tooltip, setTooltip]   = useState(null);
  const [score, setScore]       = useState(0);
  const [showInbox, setShowInbox] = useState(true);
  const [findings, setFindings] = useState([]);

  const maxScore = CLUES.reduce((s, c) => s + c.points, 0);

  const handleClueClick = useCallback((clue) => {
    if (found.has(clue.id)) { setTooltip(tooltip === clue.id ? null : clue.id); return; }
    setFound((prev) => new Set([...prev, clue.id]));
    setScore((s) => s + clue.points);
    setTooltip(clue.id);
    setFindings((prev) => [...prev, { correct: true, text: clue.explanation }]);
    setTimeout(() => setTooltip(null), 3500);
  }, [found, tooltip]);

  const handleFinish = () => {
    const missed = CLUES.filter((c) => !found.has(c.id));
    const missedFindings = missed.map((c) => ({ correct: false, text: `Missed: ${c.label} — ${c.explanation}` }));
    setFindings((prev) => [...prev, ...missedFindings]);
    setPhase("result");
  };

  const handleRetry = () => {
    setPhase("intro"); setFound(new Set()); setWrong(new Set());
    setTooltip(null); setScore(0); setShowInbox(true); setFindings([]);
  };

  const pct = Math.round((score / maxScore) * 100);

  if (phase === "result") {
    return <SimResults score={score} maxScore={maxScore} timeTaken={180} totalTime={300} onRetry={handleRetry} findings={findings} />;
  }

  return (
    <VisualSimWrapper
      title="Phishing Email Analyzer" level="beginner" category="phishing"
      timeLimit={300} phase={phase} score={score} maxScore={maxScore}
      onStart={() => setPhase("playing")} onRetry={handleRetry}
      hints={[
        "A realistic phishing email is open in your inbox.",
        "Click on every suspicious element you can find.",
        "Look for: fake domains, urgency, bad links, unexpected attachments.",
        "Find all 5 red flags to score 100%.",
      ]}
      findings={findings}
    >
      <div className="min-h-screen bg-gray-100 flex">
        {/* Sidebar – fake Gmail inbox */}
        <div className="w-56 bg-white border-r border-gray-200 flex-shrink-0 hidden lg:flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">G</div>
              Gmail
            </div>
          </div>
          {["📥 Inbox (3)", "⭐ Starred", "📤 Sent", "🗑️ Trash"].map((item, i) => (
            <div key={i} className={`px-4 py-2 text-sm cursor-pointer flex items-center gap-2 ${i === 0 ? "bg-blue-50 text-blue-700 font-semibold rounded-r-full" : "text-gray-600 hover:bg-gray-50"}`}>
              {item}
            </div>
          ))}
        </div>

        {/* Email Viewer */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Email header */}
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-1">⚠️ URGENT: Your PayPal account has been LIMITED</h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
              <span>From: <span className="text-gray-800 font-medium cursor-pointer hover:underline" onClick={() => handleClueClick(CLUES[0])} style={{ color: found.has("sender") ? "#10b981" : wrong.has("sender") ? "#ef4444" : undefined }}>security-team@paypa1.net</span></span>
              <span>To: you@gmail.com</span>
              <span>Today, 9:47 AM</span>
            </div>
          </div>

          {/* Instruction badge */}
          <div className="px-6 py-3 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <p className="text-amber-700 text-sm">
              <strong>Your mission:</strong> Click on every suspicious element you find in this email.
              <span className="ml-2 font-bold text-amber-600">{found.size}/{CLUES.length} found</span>
            </p>
          </div>

          {/* Email body – scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 font-sans text-gray-800 relative select-none">

            {/* Greeting line */}
            <div className="relative inline-block">
              <p
                onClick={() => handleClueClick(CLUES[3])}
                className={`cursor-pointer rounded px-1 transition-colors ${found.has("generic") ? "bg-emerald-100 text-emerald-700 line-through" : "hover:bg-amber-50 hover:text-amber-700"}`}
              >
                Dear Valued Customer,
              </p>
              {found.has("generic") && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="absolute z-20 top-7 left-0 w-72 bg-emerald-800 text-emerald-100 text-xs rounded-xl shadow-xl p-3">
                  ✅ <strong>Generic greeting!</strong> Real companies use your name.
                </motion.div>
              )}
            </div>

            {/* Urgency paragraph */}
            <div className="relative">
              <p
                onClick={() => handleClueClick(CLUES[1])}
                className={`cursor-pointer rounded px-1 leading-relaxed transition-colors ${found.has("urgency") ? "bg-emerald-100 text-emerald-700" : "hover:bg-amber-50 hover:text-amber-700"}`}
              >
                We have detected <strong>UNUSUAL SIGN-IN ACTIVITY</strong> on your account. Your account has been temporarily <strong>LIMITED</strong>. You must verify your identity <strong>IMMEDIATELY</strong> or your account will be permanently suspended within <strong>24 hours</strong>.
              </p>
            </div>

            <p className="text-gray-700">To restore full access, please verify your account details:</p>

            {/* Link */}
            <div className="relative">
              <p
                onClick={() => handleClueClick(CLUES[2])}
                className={`cursor-pointer rounded px-1 transition-colors ${found.has("link") ? "bg-emerald-100 text-emerald-700" : "hover:bg-amber-50"}`}
              >
                👉 Click here to verify:{" "}
                <span className={`underline ${found.has("link") ? "text-emerald-600 line-through" : "text-blue-600"}`}>
                  http://paypa1-secure-verify.xyz/restore?ref=89347AB
                </span>
              </p>
              {found.has("link") && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="absolute z-20 -top-16 left-0 w-80 bg-emerald-800 text-emerald-100 text-xs rounded-xl shadow-xl p-3">
                  ✅ <strong>Fake link!</strong> "paypa1-secure-verify.xyz" is NOT PayPal. Always check the real domain.
                </motion.div>
              )}
            </div>

            <p className="text-gray-600 text-sm italic">If you do not verify within 24 hours, your account will be permanently closed and all funds will be frozen.</p>

            {/* Attachment */}
            <div className="relative">
              <div
                onClick={() => handleClueClick(CLUES[4])}
                className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition-colors ${found.has("attachment") ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-amber-50 hover:border-amber-300"}`}
              >
                <Paperclip className="w-4 h-4" />
                <span className="text-sm font-medium">Account_Statement_Verify.exe</span>
                <span className="text-xs text-gray-400">(Required)</span>
              </div>
              {found.has("attachment") && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-2 inline-block bg-emerald-800 text-emerald-100 text-xs rounded-xl shadow-xl p-3 w-72">
                  ✅ <strong>.exe attachment!</strong> Banks & services NEVER send executables. This is malware.
                </motion.div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 text-sm text-gray-600">
              <p>Best regards,</p>
              <p className="font-semibold">PayPal Security Team</p>
              <p className="text-gray-400">PayPal Inc.</p>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <div className="flex gap-2">
              {CLUES.map((c) => (
                <div key={c.id} className={`w-3 h-3 rounded-full ${found.has(c.id) ? "bg-emerald-500" : "bg-gray-300"}`} title={c.label} />
              ))}
              <span className="text-sm text-gray-500 ml-2">{found.size}/{CLUES.length} suspicious elements found</span>
            </div>
            <button
              onClick={handleFinish}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors"
            >
              {found.size >= CLUES.length ? "✅ Submit Report" : "Submit (partial)"}
            </button>
          </div>
        </div>

        {/* Progress panel */}
        <div className="w-64 bg-gray-950 border-l border-gray-800 flex-col hidden xl:flex p-4 gap-3">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Red Flags Found</p>
          {CLUES.map((c) => (
            <div key={c.id} className={`flex items-start gap-2 p-2 rounded-lg text-xs transition-colors ${found.has(c.id) ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20" : "bg-gray-900 text-gray-600 border border-gray-800"}`}>
              {found.has(c.id) ? <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-gray-600 flex-shrink-0 mt-0.5" />}
              {c.label}
            </div>
          ))}
          <div className="mt-auto bg-gray-900 border border-gray-800 rounded-xl p-3">
            <div className="text-2xl font-black text-white text-center">{score}<span className="text-gray-600 text-sm">/{maxScore}</span></div>
            <div className="text-gray-500 text-xs text-center">points</div>
          </div>
        </div>
      </div>
    </VisualSimWrapper>
  );
}
