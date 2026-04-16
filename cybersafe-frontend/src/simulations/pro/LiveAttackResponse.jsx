import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Shield, Activity, Server, Wifi, Lock, Terminal, CheckCircle, XCircle, Zap, Eye, Ban } from "lucide-react";
import VisualSimWrapper, { SimResults } from "../VisualSimWrapper";

// ── Incident Events (time-ordered) ──────────────────────────────────────────
const EVENTS = [
  { id: 1,  time: "08:23:11", level: "low",    host: "WEB-01",       msg: "Failed SSH login attempt from 203.0.113.47",              requiresAction: false },
  { id: 2,  time: "08:23:45", level: "low",    host: "WEB-01",       msg: "5 failed SSH login attempts from 203.0.113.47",            requiresAction: false },
  { id: 3,  time: "08:24:02", level: "medium", host: "WEB-01",       msg: "15 failed SSH attempts in 60s — brute force detected",    requiresAction: true, correctAction: "block_ip", incident: "Brute Force Attack" },
  { id: 4,  time: "08:24:18", level: "high",   host: "WEB-01",       msg: "Successful SSH login from 203.0.113.47 as root",          requiresAction: true, correctAction: "isolate_host", incident: "Unauthorized Root Access" },
  { id: 5,  time: "08:24:35", level: "low",    host: "DB-SERVER",    msg: "WEB-01 connected to database port 5432",                  requiresAction: false },
  { id: 6,  time: "08:24:52", level: "critical",host: "DB-SERVER",   msg: "Anomalous SQL queries: SELECT * FROM users — 847 rows", requiresAction: true, correctAction: "block_db_access", incident: "Data Exfiltration Attempt" },
  { id: 7,  time: "08:25:10", level: "medium", host: "CORP-LAN",     msg: "ARP spoofing detected on subnet 10.0.1.0/24",             requiresAction: true, correctAction: "segment_network", incident: "MITM Network Attack" },
  { id: 8,  time: "08:25:28", level: "high",   host: "WEB-01",       msg: "Outbound connection to C2 server: 185.220.101.47:4444",  requiresAction: true, correctAction: "block_egress", incident: "C2 Beaconing" },
  { id: 9,  time: "08:25:45", level: "critical",host: "ALL-SYSTEMS", msg: "Ransomware binary detected in /tmp/update.sh — NOT EXECUTED", requiresAction: true, correctAction: "quarantine_file", incident: "Ransomware Staging" },
  { id: 10, time: "08:26:02", level: "low",    host: "SIEM",         msg: "Automated backup initiated (scheduled)",                  requiresAction: false },
];

const ACTIONS = {
  block_ip:        { label: "Block IP 203.0.113.47",     icon: Ban,      desc: "Add to firewall blocklist", points: 20 },
  isolate_host:    { label: "Isolate WEB-01",            icon: Server,   desc: "Network quarantine", points: 20 },
  block_db_access: { label: "Block DB access from WEB-01",icon: Lock,    desc: "Revoke DB privileges", points: 20 },
  segment_network: { label: "Segment CORP-LAN",          icon: Wifi,     desc: "VLAN isolation", points: 15 },
  block_egress:    { label: "Block outbound to :4444",   icon: Shield,   desc: "Firewall egress rule", points: 15 },
  quarantine_file: { label: "Quarantine update.sh",      icon: Terminal, desc: "Move to sandbox", points: 20 },
  ignore:          { label: "Mark as false positive",    icon: Eye,      desc: "No action needed", points: -10 },
};

const LEVEL_COLORS = {
  low:      { bg: "bg-blue-500/10",    border: "border-blue-500/20",    text: "text-blue-400",    dot: "bg-blue-500"    },
  medium:   { bg: "bg-amber-500/10",   border: "border-amber-500/20",   text: "text-amber-400",   dot: "bg-amber-500"   },
  high:     { bg: "bg-orange-500/10",  border: "border-orange-500/20",  text: "text-orange-400",  dot: "bg-orange-500"  },
  critical: { bg: "bg-red-500/10",     border: "border-red-500/20",     text: "text-red-400",     dot: "bg-red-500 animate-pulse"     },
};

export default function LiveAttackResponse() {
  const [phase,       setPhase]    = useState("intro");
  const [visibleEvts, setVisible]  = useState([]);
  const [pendingEvt,  setPending]  = useState(null);
  const [responses,   setResponses]= useState({});
  const [score,       setScore]    = useState(0);
  const [feedback,    setFeedback] = useState(null);
  const [findings,    setFindings] = useState([]);
  const [done,        setDone]     = useState(false);
  const evtRef = useRef(null);
  const logRef = useRef(null);
  const maxScore = 100;
  let evtIdx = useRef(0);

  useEffect(() => {
    if (phase !== "playing") return;
    const fire = () => {
      if (evtIdx.current >= EVENTS.length) { clearInterval(evtRef.current); setDone(true); return; }
      const evt = EVENTS[evtIdx.current];
      setVisible((prev) => [...prev, evt]);
      if (evt.requiresAction) setPending(evt);
      evtIdx.current++;
      logRef.current?.scrollTo({ top: 99999, behavior: "smooth" });
    };
    fire();
    evtRef.current = setInterval(fire, 1500);
    return () => clearInterval(evtRef.current);
  }, [phase]);

  const handleAction = (actionKey) => {
    if (!pendingEvt) return;
    const isCorrect = actionKey === pendingEvt.correctAction;
    const action = ACTIONS[actionKey];
    const pts = isCorrect ? action.points : -10;
    setScore((s) => Math.max(0, Math.min(100, s + pts)));
    setResponses((prev) => ({ ...prev, [pendingEvt.id]: { actionKey, correct: isCorrect } }));
    setFeedback({ correct: isCorrect, text: isCorrect ? `✅ Correct! ${action.desc} applied to ${pendingEvt.host}.` : `❌ Wrong action for "${pendingEvt.incident}". Should have: ${ACTIONS[pendingEvt.correctAction]?.label}.` });
    setFindings((prev) => [...prev, { correct: isCorrect, text: `${pendingEvt.incident}: ${isCorrect ? "Correct response — " + action.label : "Wrong — should " + ACTIONS[pendingEvt.correctAction]?.label}` }]);
    setPending(null);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleRetry = () => {
    setPhase("intro"); setVisible([]); setPending(null); setResponses({}); setScore(0); setFeedback(null); setFindings([]); setDone(false); evtIdx.current = 0;
  };

  if (phase === "result") return <SimResults score={score} maxScore={maxScore} timeTaken={270} totalTime={300} onRetry={handleRetry} findings={findings} />;

  const critical = visibleEvts.filter((e) => e.level === "critical").length;
  const responded = Object.keys(responses).length;
  const actionable = EVENTS.filter((e) => e.requiresAction).length;

  return (
    <VisualSimWrapper
      title="Live Attack Response — SOC Dashboard" level="pro" category="network"
      timeLimit={300} phase={phase} score={score} maxScore={maxScore}
      onStart={() => setPhase("playing")} onRetry={handleRetry}
      hints={[
        "You are a Tier-2 SOC analyst — an attack is unfolding in real-time.",
        "Alerts will appear — respond with the correct containment action.",
        "Wrong actions or misclassifications cost points.",
        "Pro tip: read the event context before acting. Speed + accuracy.",
      ]}
      findings={findings}
    >
      <div className="min-h-screen bg-gray-950 p-4 space-y-4">
        {/* SOC stat bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Alerts",        value: visibleEvts.length,          color: "text-white",         icon: <Activity className="w-4 h-4" /> },
            { label: "Critical",      value: critical,                     color: "text-red-400",       icon: <AlertTriangle className="w-4 h-4" /> },
            { label: "Responded",     value: `${responded}/${actionable}`, color: "text-emerald-400",   icon: <CheckCircle className="w-4 h-4" /> },
            { label: "Score",         value: score,                        color: "text-cyan-400",      icon: <Zap className="w-4 h-4" /> },
          ].map((s) => (
            <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex items-center gap-3">
              <span className={s.color}>{s.icon}</span>
              <div>
                <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-gray-500 text-xs">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Event log */}
          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="text-white font-semibold text-sm">SIEM Event Stream</span>
              {phase === "playing" && !done && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-auto" />}
              {done && <span className="text-emerald-400 text-xs ml-auto">Stream complete</span>}
            </div>
            <div ref={logRef} className="overflow-y-auto max-h-96 divide-y divide-gray-800/50">
              <AnimatePresence>
                {visibleEvts.map((evt) => {
                  const colors = LEVEL_COLORS[evt.level];
                  const resp = responses[evt.id];
                  return (
                    <motion.div
                      key={evt.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex gap-3 px-4 py-3 ${evt.requiresAction && !resp ? colors.bg : ""} ${pendingEvt?.id === evt.id ? "ring-1 ring-inset ring-amber-500/30" : ""}`}
                    >
                      <div className="flex-shrink-0 pt-0.5">
                        <div className={`w-2 h-2 rounded-full mt-1.5 ${colors.dot}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-gray-500 text-xs font-mono">{evt.time}</span>
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded uppercase ${colors.text} ${colors.bg} border ${colors.border}`}>{evt.level}</span>
                          <span className="text-gray-400 text-xs font-mono">[{evt.host}]</span>
                        </div>
                        <p className="text-gray-200 text-sm mt-0.5">{evt.msg}</p>
                        {resp && (
                          <div className={`text-xs mt-1 ${resp.correct ? "text-emerald-400" : "text-red-400"}`}>
                            → {resp.correct ? "✓ Correct response" : "✗ Incorrect"}: {ACTIONS[resp.actionKey]?.label}
                          </div>
                        )}
                      </div>
                      {evt.requiresAction && !resp && pendingEvt?.id !== evt.id && (
                        <div className="text-amber-400 text-xs animate-pulse flex-shrink-0">⏳ Pending</div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Action panel */}
          <div className="space-y-3">
            {pendingEvt ? (
              <div className="bg-gray-900 border border-amber-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-400 font-bold text-sm">Action Required</span>
                </div>
                <div className={`p-3 rounded-lg mb-3 ${LEVEL_COLORS[pendingEvt.level].bg} border ${LEVEL_COLORS[pendingEvt.level].border}`}>
                  <p className={`text-xs font-bold ${LEVEL_COLORS[pendingEvt.level].text} uppercase`}>{pendingEvt.incident}</p>
                  <p className="text-gray-300 text-sm mt-1">{pendingEvt.msg}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{pendingEvt.host} • {pendingEvt.time}</p>
                </div>
                <p className="text-gray-400 text-xs mb-2 font-semibold">Select containment action:</p>
                <div className="space-y-2">
                  {Object.entries(ACTIONS).map(([key, action]) => {
                    const ActionIcon = action.icon;
                    return (
                      <motion.button
                        key={key}
                        whileHover={{ scale: 1.01 }}
                        onClick={() => handleAction(key)}
                        className="w-full flex items-center gap-2 px-3 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-cyan-500/30 text-gray-200 text-sm rounded-xl transition-all text-left"
                      >
                        <ActionIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div>
                          <div className="font-medium">{action.label}</div>
                          <div className="text-gray-500 text-xs">{action.desc}</div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                <Shield className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Monitoring for threats…</p>
                <p className="text-gray-600 text-xs mt-1">{done ? "All events processed" : "Next event incoming"}</p>
              </div>
            )}

            {/* Feedback */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`p-3 rounded-xl border text-sm ${feedback.correct ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-red-500/10 border-red-500/30 text-red-300"}`}
                >
                  {feedback.text}
                </motion.div>
              )}
            </AnimatePresence>

            {done && !pendingEvt && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setPhase("result")}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 rounded-xl text-sm shadow-lg"
              >
                Generate Incident Report →
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </VisualSimWrapper>
  );
}
