import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, CheckCircle, XCircle, AlertTriangle, ChevronRight, ToggleLeft, ToggleRight } from "lucide-react";
import VisualSimWrapper, { SimResults } from "../VisualSimWrapper";

const APPS = [
  {
    id: "flashlight",
    name: "Quick Flashlight",
    icon: "🔦",
    category: "Utilities",
    description: "A simple flashlight app that turns on your phone's LED flash.",
    permissions: [
      { id: "camera",    label: "Camera",          icon: "📷", necessary: true,  reason: "Needed to access the flash LED" },
      { id: "location",  label: "Precise Location", icon: "📍", necessary: false, reason: "A flashlight has zero reason to know your GPS location — data harvesting" },
      { id: "contacts",  label: "Contacts",         icon: "👥", necessary: false, reason: "No reason for a flashlight to access your contact list" },
      { id: "mic",       label: "Microphone",       icon: "🎤", necessary: false, reason: "Stalkerware feature — no flashlight needs your microphone" },
      { id: "storage",   label: "Storage (photos)", icon: "🗂️", necessary: false, reason: "Unnecessary — this app doesn't create or manage files" },
    ],
    points: 20,
  },
  {
    id: "weather",
    name: "WeatherNow Pro",
    icon: "🌤️",
    category: "Weather",
    description: "Get real-time weather forecasts and alerts for your location.",
    permissions: [
      { id: "location",  label: "Approximate Location", icon: "📍", necessary: true,  reason: "Needed to show weather for your area" },
      { id: "notifs",    label: "Notifications",        icon: "🔔", necessary: true,  reason: "Needed for storm alerts" },
      { id: "camera",    label: "Camera",               icon: "📷", necessary: false, reason: "A weather app has no business using your camera" },
      { id: "contacts",  label: "Contacts",             icon: "👥", necessary: false, reason: "Weather apps don't need your contact list" },
      { id: "sms",       label: "Send SMS",             icon: "💬", necessary: false, reason: "Weather app sending SMS is a premium SMS fraud risk" },
    ],
    points: 20,
  },
  {
    id: "calculator",
    name: "SuperCalc",
    icon: "🧮",
    category: "Productivity",
    description: "Advanced scientific calculator with history sync.",
    permissions: [
      { id: "storage",   label: "Storage",              icon: "🗂️", necessary: true,  reason: "Needed to save calculation history locally" },
      { id: "location",  label: "Precise GPS",          icon: "📍", necessary: false, reason: "Calculators don't need your location — ever" },
      { id: "camera",    label: "Camera",               icon: "📷", necessary: false, reason: "No camera functionality in a calculator" },
      { id: "mic",       label: "Microphone",           icon: "🎤", necessary: false, reason: "Voice input could be legitimate — but suspicious without documentation" },
      { id: "calls",     label: "Read Call Logs",       icon: "📞", necessary: false, reason: "Extremely suspicious — no calculator needs call logs. Data theft risk." },
    ],
    points: 20,
  },
  {
    id: "game",
    name: "Candy Crush Clone",
    icon: "🍬",
    category: "Games",
    description: "Fun match-3 puzzle game. Play offline!",
    permissions: [
      { id: "storage",   label: "Storage",              icon: "🗂️", necessary: true,  reason: "Game needs to save progress" },
      { id: "internet",  label: "Internet",             icon: "🌐", necessary: true,  reason: "Leaderboards and cloud save" },
      { id: "location",  label: "Precise GPS",          icon: "📍", necessary: false, reason: "Games rarely need GPS unless they're location-based" },
      { id: "contacts",  label: "Contacts",             icon: "👥", necessary: false, reason: "'Find Friends' feature — opt-in only, not mandatory" },
      { id: "calls",     label: "Read Call Logs",       icon: "📞", necessary: false, reason: "No game needs call logs — this is aggressive data harvesting" },
    ],
    points: 20,
  },
];

export default function PermissionAbuseDetector() {
  const [phase,    setPhase]   = useState("intro");
  const [appIdx,   setAppIdx]  = useState(0);
  const [granted,  setGranted] = useState({});  // { permId: bool }
  const [submitted,setSubmitted]= useState(false);
  const [score,    setScore]   = useState(0);
  const [findings, setFindings]= useState([]);
  const maxScore = APPS.reduce((s, a) => s + a.points, 0);

  const app = APPS[appIdx];
  const appGranted = granted[app.id] || {};

  const toggle = (permId) => {
    if (submitted) return;
    setGranted((prev) => ({
      ...prev,
      [app.id]: { ...(prev[app.id] || {}), [permId]: !(prev[app.id]?.[permId] ?? false) },
    }));
  };

  const calcAppScore = (appObj, appGrant) => {
    let correct = 0;
    appObj.permissions.forEach((perm) => {
      const userGranted = appGrant?.[perm.id] ?? false;
      if (perm.necessary === userGranted) correct++;
    });
    return Math.round((correct / appObj.permissions.length) * appObj.points);
  };

  const handleSubmitApp = () => {
    const pts = calcAppScore(app, appGranted);
    const appFindings = app.permissions.map((p) => {
      const userGranted = appGranted[p.id] ?? false;
      const correct = p.necessary === userGranted;
      return { correct, text: `${app.name} — ${p.label}: ${correct ? "✓ Correct" : `✗ ${p.necessary ? "Should be GRANTED (required)" : "Should be DENIED — " + p.reason}`}` };
    });
    setScore((s) => s + pts);
    setFindings((prev) => [...prev, ...appFindings]);
    setSubmitted(true);
  };

  const handleNext = () => {
    setSubmitted(false);
    if (appIdx + 1 >= APPS.length) setPhase("result");
    else setAppIdx((i) => i + 1);
  };

  const handleRetry = () => {
    setPhase("intro"); setAppIdx(0); setGranted({}); setSubmitted(false); setScore(0); setFindings([]);
  };

  if (phase === "result") return <SimResults score={score} maxScore={maxScore} timeTaken={200} totalTime={300} onRetry={handleRetry} findings={findings} />;

  return (
    <VisualSimWrapper
      title="Permission Abuse Detector" level="intermediate" category="privacy"
      timeLimit={300} phase={phase} score={score} maxScore={maxScore}
      onStart={() => setPhase("playing")} onRetry={handleRetry}
      hints={[
        "4 mobile apps want various permissions — review each carefully.",
        "Toggle each permission: GRANT (green) or DENY (red).",
        "Only grant permissions the app genuinely needs for its function.",
        "Over-permissioned apps harvest data — protect your privacy.",
      ]}
      findings={findings}
    >
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-md mx-auto">

          {/* Progress */}
          <div className="flex gap-2 mb-6">
            {APPS.map((a, i) => (
              <div key={a.id} className={`flex-1 h-1.5 rounded-full ${i < appIdx ? "bg-emerald-500" : i === appIdx ? "bg-blue-500" : "bg-gray-300"}`} />
            ))}
          </div>

          {/* Phone mockup */}
          <div className="bg-gray-900 rounded-[3rem] p-4 shadow-2xl border-4 border-gray-800 mx-auto" style={{ maxWidth: 360 }}>
            {/* Status bar */}
            <div className="flex justify-between items-center px-2 pb-2 text-white text-xs">
              <span>9:41</span>
              <span>📶 🔋</span>
            </div>

            {/* Screen */}
            <div className="bg-white rounded-[2.2rem] overflow-hidden min-h-[540px] flex flex-col">
              {/* App header */}
              <div className="bg-blue-600 px-5 py-4 text-white">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-3xl">{app.icon}</span>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">{app.name}</h3>
                    <p className="text-blue-200 text-xs">{app.category}</p>
                  </div>
                </div>
                <p className="text-blue-100 text-xs mt-2 leading-relaxed">{app.description}</p>
              </div>

              {/* Permissions list */}
              <div className="flex-1 px-4 py-4">
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">
                  Permissions Requested
                </p>
                <div className="space-y-2">
                  {app.permissions.map((perm) => {
                    const isGranted = appGranted[perm.id] ?? false;
                    const isCorrect = submitted ? perm.necessary === isGranted : null;
                    return (
                      <motion.div
                        key={perm.id}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                          submitted
                            ? isCorrect ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
                            : isGranted ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{perm.icon}</span>
                          <div>
                            <p className={`text-sm font-medium ${submitted && !isCorrect ? "text-red-700" : "text-gray-800"}`}>{perm.label}</p>
                            {submitted && (
                              <p className="text-xs text-gray-500 mt-0.5 max-w-44 leading-tight">{perm.reason}</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => toggle(perm.id)}
                          disabled={submitted}
                          className={`relative transition-all ${submitted ? "opacity-70 cursor-default" : ""}`}
                        >
                          {isGranted
                            ? <ToggleRight className={`w-9 h-9 ${isGranted ? "text-blue-500" : "text-gray-400"}`} />
                            : <ToggleLeft className="w-9 h-9 text-gray-400" />
                          }
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom action */}
              <div className="px-4 pb-6">
                {!submitted ? (
                  <button
                    onClick={handleSubmitApp}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-2xl transition-colors shadow-lg"
                  >
                    Install App →
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className={`text-center font-bold text-sm p-2 rounded-xl ${calcAppScore(app, appGranted) >= app.points * 0.7 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {calcAppScore(app, appGranted)}/{app.points} points for this app
                    </div>
                    <button
                      onClick={handleNext}
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-2xl transition-colors flex items-center justify-center gap-2"
                    >
                      {appIdx + 1 >= APPS.length ? "See Final Results" : "Next App"} <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex gap-3 justify-center mt-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">🟦 Toggle ON = Grant</span>
            <span className="flex items-center gap-1">⬜ Toggle OFF = Deny</span>
          </div>
        </div>
      </div>
    </VisualSimWrapper>
  );
}
