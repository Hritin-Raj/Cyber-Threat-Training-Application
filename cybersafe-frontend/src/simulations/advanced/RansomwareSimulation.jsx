import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff, HardDrive, AlertTriangle, ShieldAlert, Terminal, Lock, XCircle, CheckCircle, Zap } from "lucide-react";
import VisualSimWrapper, { SimResults } from "../VisualSimWrapper";

const FILES = [
  { name: "Q4_Report.xlsx",    icon: "📊", type: "Finance" },
  { name: "ClientData.csv",    icon: "📋", type: "CRM" },
  { name: "Backup_2024.zip",   icon: "🗜️", type: "Backup" },
  { name: "Designs_Final.psd", icon: "🎨", type: "Design" },
  { name: "Contracts.docx",    icon: "📝", type: "Legal" },
  { name: "SSH_Keys.pem",      icon: "🔑", type: "Security" },
  { name: "Photos_Team.jpg",   icon: "📷", type: "Media" },
  { name: "DB_dump.sql",       icon: "🗄️", type: "Database" },
  { name: "source_code.zip",   icon: "💻", type: "Dev" },
];

const CORRECT_STEPS = ["disconnect", "isolate", "report", "nopay"];
const STEP_PENALTY = { "pay_ransom": -30, "keepworking": -20, "restart": -10 };

const ACTIONS = [
  { id: "disconnect",  label: "Disconnect from network",        icon: WifiOff,     correct: true,  points: 30, feedback: "✅ CRITICAL first step — disconnecting network prevents ransomware from spreading to other machines or completing C2 comms." },
  { id: "isolate",     label: "Isolate affected machine",       icon: HardDrive,   correct: true,  points: 25, feedback: "✅ Physical isolation (USB, Wi-Fi, Ethernet off) stops lateral spread. Do this IMMEDIATELY." },
  { id: "report",      label: "Report to IT Security team",     icon: Terminal,    correct: true,  points: 25, feedback: "✅ Report immediately — incident response teams can investigate source, restore from backups, and notify authorities." },
  { id: "nopay",       label: "Do NOT pay the ransom",          icon: XCircle,     correct: true,  points: 20, feedback: "✅ Paying ransoms funds criminals, doesn't guarantee recovery, and marks you as a 'payer' for future attacks." },
  { id: "pay_ransom",  label: "Pay the $50,000 ransom",         icon: AlertTriangle, correct: false, points: -30, feedback: "❌ WRONG — paying ransom encourages more attacks, often doesn't recover data, and funds criminal organizations." },
  { id: "keepworking", label: "Continue working on another PC", icon: HardDrive,   correct: false, points: -20, feedback: "❌ WRONG — ransomware spreads via network shares. Working elsewhere may cause further infection." },
  { id: "restart",     label: "Restart the computer",           icon: Zap,         correct: false, points: -10, feedback: "❌ WRONG — restarting can destroy forensic evidence and some ransomware strains trigger additional encryption on boot." },
];

export default function RansomwareSimulation() {
  const [phase,       setPhase]     = useState("intro");
  const [encrypted,   setEncrypted] = useState(new Set());
  const [actions,     setActions]   = useState([]);    // taken action ids
  const [score,       setScore]     = useState(0);
  const [feedback,    setFeedback]  = useState(null);
  const [networkUp,   setNetworkUp] = useState(true);
  const [gameOver,    setGameOver]  = useState(false);
  const [findings,    setFindings]  = useState([]);
  const [countDown,   setCountDown] = useState(null);
  const intervalRef = useRef(null);
  const maxScore = 100;

  // Encrypt files progressively
  useEffect(() => {
    if (phase !== "playing" || gameOver) return;
    let i = 0;
    intervalRef.current = setInterval(() => {
      setEncrypted((prev) => {
        if (i < FILES.length) { const next = new Set(prev); next.add(i); i++; return next; }
        clearInterval(intervalRef.current);
        return prev;
      });
      i++;
      if (i > FILES.length) clearInterval(intervalRef.current);
    }, 1800);
    return () => clearInterval(intervalRef.current);
  }, [phase, gameOver]);

  const handleAction = (action) => {
    if (actions.includes(action.id)) return;
    if (gameOver) return;
    setActions((prev) => [...prev, action.id]);
    const pts = Math.max(0, action.points);
    if (action.correct) setScore((s) => Math.min(100, s + action.points));
    else setScore((s) => Math.max(0, s + action.points));
    setFeedback({ id: action.id, text: action.feedback, correct: action.correct });
    setFindings((prev) => [...prev, { correct: action.correct, text: action.feedback }]);

    if (action.id === "disconnect") { setNetworkUp(false); clearInterval(intervalRef.current); }
    if (action.id === "nopay" && actions.filter((a) => CORRECT_STEPS.includes(a)).length >= 3) {
      setTimeout(() => { setGameOver(true); setPhase("result"); }, 1500);
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleRetry = () => {
    setPhase("intro"); setEncrypted(new Set()); setActions([]); setScore(0); setFeedback(null);
    setNetworkUp(true); setGameOver(false); setFindings([]); clearInterval(intervalRef.current);
  };

  const correctTaken = actions.filter((a) => CORRECT_STEPS.includes(a)).length;
  const canFinish = correctTaken >= 3 || actions.length >= 4;

  if (phase === "result") return <SimResults score={score} maxScore={maxScore} timeTaken={240} totalTime={300} onRetry={handleRetry} findings={findings} />;

  return (
    <VisualSimWrapper
      title="Ransomware Attack Simulation" level="advanced" category="malware"
      timeLimit={300} phase={phase} score={score} maxScore={maxScore}
      onStart={() => setPhase("playing")} onRetry={handleRetry}
      hints={[
        "Ransomware is actively encrypting your files — act fast!",
        "Choose the CORRECT emergency response actions.",
        "Priority: Stop spread first, then isolate, then report.",
        "Paying the ransom is NEVER the right answer.",
      ]}
      findings={findings}
    >
      <div className="min-h-screen bg-gray-900 p-4 lg:p-6">
        {/* Ransomware banner */}
        <AnimatePresence>
          {encrypted.size >= 5 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-950 border border-red-700 rounded-xl p-4 mb-4 text-center"
            >
              <Lock className="w-8 h-8 text-red-400 mx-auto mb-2 animate-pulse" />
              <h2 className="text-red-300 font-black text-xl mb-1">⚠️ YOUR FILES ARE BEING ENCRYPTED</h2>
              <p className="text-red-400 text-sm">CryptLocker 5.0 | Send 1.2 BTC to: <span className="font-mono">1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf</span></p>
              <p className="text-red-500 text-xs mt-1">Do NOT restart | Do NOT contact law enforcement (or files will be deleted)</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* File system panel */}
          <div className="space-y-4">
            <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gray-750">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-gray-400" />
                  <span className="text-white text-sm font-semibold">C:\Users\alex\Documents</span>
                </div>
                <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${networkUp ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                  {networkUp ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  {networkUp ? "Network: ONLINE" : "Network: DISCONNECTED"}
                </div>
              </div>

              <div className="p-4 grid grid-cols-3 gap-3">
                {FILES.map((file, i) => {
                  const enc = encrypted.has(i);
                  return (
                    <motion.div
                      key={file.name}
                      animate={enc ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 0.3 }}
                      className={`p-3 rounded-xl border text-center transition-all ${enc ? "bg-red-900/40 border-red-600/30" : "bg-gray-700 border-gray-600"}`}
                    >
                      <div className="text-2xl mb-1">{enc ? "🔒" : file.icon}</div>
                      <div className={`text-xs font-mono truncate ${enc ? "text-red-400 line-through" : "text-gray-300"}`}>{enc ? file.name + ".enc" : file.name}</div>
                      <div className={`text-xs mt-0.5 ${enc ? "text-red-500" : "text-gray-500"}`}>{enc ? "ENCRYPTED" : file.type}</div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="px-4 pb-4">
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-red-500 rounded-full"
                    animate={{ width: `${(encrypted.size / FILES.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-red-400 text-xs mt-1 text-right">{encrypted.size}/{FILES.length} files encrypted</p>
              </div>
            </div>

            {/* Terminal log */}
            <div className="bg-black border border-gray-800 rounded-xl p-4 font-mono text-xs text-green-400 h-36 overflow-y-auto">
              <p className="text-gray-600">C:\WINDOWS\System32\cmd.exe</p>
              {encrypted.size > 0 && <p className="text-red-400 mt-1">CryptLocker: Initializing encryption engine...</p>}
              {[...encrypted].map((i) => (
                <p key={i} className="text-red-300">Encrypting {FILES[i]?.name}... [DONE] → {FILES[i]?.name}.enc</p>
              ))}
              {!networkUp && <p className="text-amber-400 mt-1">NETWORK: Interface disconnected by user.</p>}
              {encrypted.size >= FILES.length && <p className="text-red-500 mt-1 font-bold">All files encrypted. Ransom note deployed.</p>}
            </div>
          </div>

          {/* Response Actions panel */}
          <div className="space-y-4">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <h3 className="text-white font-bold">Incident Response Console</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">Select the correct response actions. Wrong choices cost points.</p>
              <div className="space-y-2">
                {ACTIONS.map((action) => {
                  const taken = actions.includes(action.id);
                  const ActionIcon = action.icon;
                  return (
                    <motion.button
                      key={action.id}
                      onClick={() => handleAction(action)}
                      disabled={taken}
                      whileHover={!taken ? { scale: 1.01 } : {}}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left ${
                        taken
                          ? action.correct
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 opacity-70"
                            : "bg-red-500/10 border-red-500/30 text-red-400 opacity-70"
                          : action.correct
                            ? "bg-gray-700 border-gray-600 text-gray-200 hover:border-emerald-500/50 hover:bg-gray-600"
                            : "bg-gray-700 border-gray-600 text-gray-200 hover:border-red-500/30 hover:bg-gray-600"
                      }`}
                    >
                      <ActionIcon className={`w-5 h-5 flex-shrink-0 ${taken ? (action.correct ? "text-emerald-400" : "text-red-400") : "text-gray-400"}`} />
                      <span className="flex-1">{action.label}</span>
                      {taken && (
                        <span className={`text-xs font-bold ${action.correct ? "text-emerald-400" : "text-red-400"}`}>
                          {action.correct ? `+${action.points}` : `${action.points}`}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`p-4 rounded-xl border text-sm ${feedback.correct ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-red-500/10 border-red-500/30 text-red-300"}`}
                >
                  {feedback.text}
                </motion.div>
              )}
            </AnimatePresence>

            {canFinish && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setPhase("result")}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 rounded-xl text-sm shadow-lg shadow-cyan-500/20"
              >
                Submit Response Report →
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </VisualSimWrapper>
  );
}
