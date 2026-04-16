import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, ChevronLeft, ChevronRight, RefreshCw, AlertTriangle, CheckCircle, XCircle, Globe, Star } from "lucide-react";
import VisualSimWrapper, { SimResults } from "../VisualSimWrapper";

const SITES = [
  {
    id: "amz_real",
    url: "https://www.amazon.com/cart",
    displayUrl: "amazon.com",
    isHTTPS: true, isLegit: true,
    verdict: "safe",
    favicon: "🛒",
    clues: [
      { id: "https",  label: "HTTPS padlock present",         correct: true  },
      { id: "domain", label: "Domain is amazon.com",          correct: true  },
      { id: "tld",    label: ".com TLD (trusted)",            correct: true  },
    ],
    bodyPreview: {
      title: "Amazon — Shopping Cart",
      content: "Your cart (2 items) — Powered by Amazon",
      professional: true,
    },
    explanation: "✅ SAFE: HTTPS, legitimate domain (amazon.com), and professional UI all confirm this is real.",
    points: 15,
  },
  {
    id: "amz_fake",
    url: "http://amaz0n-deals.net/signin?redirect=cart",
    displayUrl: "amaz0n-deals.net",
    isHTTPS: false, isLegit: false,
    verdict: "danger",
    favicon: "🛒",
    clues: [
      { id: "nohttp",   label: "No HTTPS — connection unencrypted", correct: false },
      { id: "typo",     label: "Typosquat domain: amaz0n (zero)",   correct: false },
      { id: "tld",      label: "Suspicious .net TLD",               correct: false },
      { id: "redirect", label: "Redirect parameter in URL",         correct: false },
    ],
    bodyPreview: {
      title: "Amaz0n — Sign in",
      content: "Enter your email and password to access your special deal!",
      professional: false,
    },
    explanation: "🚨 DANGER: HTTP, typosquatted domain (amaz0n vs amazon), suspicious redirect — this is a phishing site!",
    points: 20,
  },
  {
    id: "bank_real",
    url: "https://secure.chase.com/web/auth/dashboard",
    displayUrl: "secure.chase.com",
    isHTTPS: true, isLegit: true,
    verdict: "safe",
    favicon: "🏦",
    clues: [
      { id: "https",     label: "HTTPS with valid certificate",     correct: true },
      { id: "subdomain", label: "Subdomain: secure.chase.com",      correct: true },
      { id: "domain",    label: "Root domain: chase.com",           correct: true },
    ],
    bodyPreview: {
      title: "Chase Online Banking",
      content: "Secure access to your accounts. © 2024 JPMorgan Chase.",
      professional: true,
    },
    explanation: "✅ SAFE: The root domain is chase.com, uses HTTPS, and the 'secure' subdomain is expected for banking.",
    points: 15,
  },
  {
    id: "bank_fake",
    url: "https://chase-secure-login.xyz/auth?verify=true",
    displayUrl: "chase-secure-login.xyz",
    isHTTPS: true, isLegit: false,
    verdict: "danger",
    favicon: "🏦",
    clues: [
      { id: "https",    label: "HTTPS present (but doesn't mean safe!)", correct: true },
      { id: "domain",   label: "Root domain is .xyz (NOT chase.com)",    correct: false },
      { id: "name",     label: "Uses 'chase' as keyword, not as domain", correct: false },
      { id: "query",    label: "Suspicious ?verify=true parameter",      correct: false },
    ],
    bodyPreview: {
      title: "Chase — Verify Your Account",
      content: "We need to verify your information to continue. Enter your credentials below.",
      professional: false,
    },
    explanation: "🚨 DANGER: Even with HTTPS, the root domain is .xyz — NOT chase.com. HTTPS only encrypts transit; it doesn't validate identity.",
    points: 25,
  },
  {
    id: "paypal_real",
    url: "https://www.paypal.com/checkoutnow",
    displayUrl: "paypal.com",
    isHTTPS: true, isLegit: true,
    verdict: "safe",
    favicon: "💳",
    clues: [
      { id: "https",    label: "Padlock + HTTPS",                correct: true },
      { id: "domain",   label: "paypal.com — exact match",       correct: true },
    ],
    bodyPreview: {
      title: "PayPal Checkout",
      content: "You're paying securely with PayPal. Complete your purchase.",
      professional: true,
    },
    explanation: "✅ SAFE: Exact match on paypal.com domain with HTTPS — this is the legitimate PayPal checkout.",
    points: 10,
  },
];

const VERDICT_COLORS = { safe: "text-emerald-400", danger: "text-red-400", warning: "text-amber-400" };

export default function SafeWebsiteDetector() {
  const [phase,    setPhase]   = useState("intro");
  const [idx,      setIdx]     = useState(0);
  const [score,    setScore]   = useState(0);
  const [answers,  setAnswers] = useState({});
  const [showExp,  setShowExp] = useState(false);
  const [finished, setFinished]= useState(false);
  const [findings, setFindings]= useState([]);
  const maxScore = SITES.reduce((s, c) => s + c.points, 0);

  const site = SITES[idx];
  const answered = !!answers[site.id];

  const handleVerdict = (v) => {
    if (answered) return;
    const correct = v === site.verdict;
    const pts = correct ? site.points : 0;
    setAnswers((prev) => ({ ...prev, [site.id]: { choice: v, correct } }));
    setScore((s) => s + pts);
    setFindings((prev) => [...prev, { correct, text: site.explanation }]);
    setShowExp(true);
  };

  const handleNext = () => {
    setShowExp(false);
    if (idx + 1 >= SITES.length) { setFinished(true); setTimeout(() => setPhase("result"), 1000); }
    else setIdx((i) => i + 1);
  };

  const handleRetry = () => {
    setPhase("intro"); setIdx(0); setScore(0); setAnswers({}); setShowExp(false); setFinished(false); setFindings([]);
  };

  if (phase === "result") return <SimResults score={score} maxScore={maxScore} timeTaken={150} totalTime={300} onRetry={handleRetry} findings={findings} />;

  return (
    <VisualSimWrapper
      title="Safe vs Unsafe Website Detector" level="beginner" category="privacy"
      timeLimit={300} phase={phase} score={score} maxScore={maxScore}
      onStart={() => setPhase("playing")} onRetry={handleRetry}
      hints={[
        "A browser mockup shows you 5 different website URLs.",
        "Examine the address bar, padlock, domain, and page content.",
        "Decide: is this site SAFE or DANGEROUS?",
        "Remember: HTTPS alone does NOT mean a site is trustworthy!",
      ]}
      findings={findings}
    >
      <div className="min-h-screen bg-gray-200 flex items-start justify-center py-10 px-4">
        <div className="w-full max-w-3xl space-y-4">

          {/* Progress */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Site {idx + 1} of {SITES.length}</span>
            <span className="font-bold text-gray-800">Score: {score}/{maxScore}</span>
          </div>
          <div className="h-1.5 bg-gray-300 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${((idx) / SITES.length) * 100}%` }} />
          </div>

          {/* Browser Chrome */}
          <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-2xl">
            {/* Title bar */}
            <div className="bg-gray-700 flex items-center gap-2 px-4 py-2.5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="flex gap-1.5 ml-2">
                <button className="p-1 text-gray-400 hover:text-white"><ChevronLeft className="w-4 h-4" /></button>
                <button className="p-1 text-gray-400 hover:text-white"><ChevronRight className="w-4 h-4" /></button>
                <button className="p-1 text-gray-400 hover:text-white"><RefreshCw className="w-4 h-4" /></button>
              </div>
              {/* Address bar */}
              <div className={`flex-1 flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-mono ${site.isHTTPS ? "bg-gray-900 text-gray-200" : "bg-red-950 border border-red-700 text-red-300"}`}>
                {site.isHTTPS
                  ? <Lock className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  : <Unlock className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                }
                <span className={`truncate ${!site.isHTTPS ? "text-red-300" : ""}`}>{site.url}</span>
              </div>
            </div>

            {/* Tab */}
            <div className="bg-gray-750 border-b border-gray-600 px-4 py-1 flex items-center gap-2 text-xs text-gray-300 bg-gray-700">
              <span className="text-base">{site.favicon}</span>
              <span className="truncate">{site.bodyPreview.title}</span>
            </div>

            {/* Page Content */}
            <div className={`p-8 min-h-48 ${site.bodyPreview.professional ? "bg-white" : "bg-gray-50"}`}>
              <div className={`flex items-center gap-3 mb-4 pb-4 border-b ${site.bodyPreview.professional ? "border-gray-200" : "border-red-200"}`}>
                <span className="text-3xl">{site.favicon}</span>
                <h2 className={`text-xl font-bold ${site.bodyPreview.professional ? "text-gray-800" : "text-gray-700"}`}>{site.bodyPreview.title}</h2>
              </div>
              <p className="text-gray-600 text-sm mb-4">{site.bodyPreview.content}</p>
              {!site.bodyPreview.professional && (
                <div className="space-y-3">
                  <input type="text" placeholder="Email address" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" readOnly />
                  <input type="password" placeholder="Password" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" readOnly />
                  <button className="w-full bg-yellow-400 text-gray-900 font-bold py-2 rounded text-sm">Sign In Now</button>
                </div>
              )}
              {site.bodyPreview.professional && (
                <div className="flex gap-2">
                  <div className="flex-1 h-8 bg-gray-100 rounded" />
                  <div className="w-24 h-8 bg-blue-600 rounded" />
                </div>
              )}
            </div>
          </div>

          {/* Clue Analysis panel */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-gray-500 text-xs font-semibold uppercase mb-3">🔍 URL Analysis</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {site.clues.map((clue) => (
                <div key={clue.id} className={`flex items-center gap-2 text-sm p-2 rounded-lg ${clue.correct ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                  {clue.correct ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <XCircle className="w-4 h-4 flex-shrink-0" />}
                  {clue.label}
                </div>
              ))}
            </div>
          </div>

          {/* Verdict buttons */}
          {!answered && (
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => handleVerdict("safe")} className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-xl transition-colors text-lg shadow-lg shadow-emerald-500/20">
                <CheckCircle className="w-5 h-5" /> ✅ SAFE
              </button>
              <button onClick={() => handleVerdict("danger")} className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-400 text-white font-bold py-4 rounded-xl transition-colors text-lg shadow-lg shadow-red-500/20">
                <XCircle className="w-5 h-5" /> 🚨 DANGEROUS
              </button>
            </div>
          )}

          {/* Feedback */}
          <AnimatePresence>
            {showExp && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`rounded-xl p-4 border text-sm ${answers[site.id]?.correct ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"}`}
              >
                <p className="font-semibold mb-1">{answers[site.id]?.correct ? "✅ Correct!" : "❌ Incorrect!"}</p>
                <p>{site.explanation}</p>
                <button onClick={handleNext} className="mt-3 bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                  {idx + 1 >= SITES.length ? "See Results →" : "Next Site →"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {finished && <div className="text-center text-gray-600 animate-pulse">Calculating results…</div>}
        </div>
      </div>
    </VisualSimWrapper>
  );
}
