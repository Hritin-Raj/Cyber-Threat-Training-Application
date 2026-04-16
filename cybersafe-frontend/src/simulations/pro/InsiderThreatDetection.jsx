import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, AlertTriangle, CheckCircle, XCircle, Flag,
  ChevronRight, ShieldAlert, Eye, EyeOff
} from "lucide-react";
import VisualSimWrapper, { SimResults } from "../VisualSimWrapper";

// ── Employee activity data ────────────────────────────────────────────────────
const EMPLOYEES = [
  {
    id: "E001", name: "Sarah Kim", dept: "Engineering", role: "Senior Dev",
    avatar: "SK", isThreat: false,
    activities: [
      { time: "08:45", action: "Git push — feature/auth-module",       type: "git",   normal: true,  detail: "8 files, 342 lines" },
      { time: "10:12", action: "JIRA ticket update",                    type: "app",   normal: true,  detail: "Ticket #4821 moved to Done" },
      { time: "13:30", action: "Code review — PR #893",                 type: "git",   normal: true,  detail: "2 approvals given" },
      { time: "15:55", action: "Slack messages — engineering channel",  type: "chat",  normal: true,  detail: "12 messages" },
      { time: "17:02", action: "Git push — bugfix/login-validation",    type: "git",   normal: true,  detail: "3 files changed" },
    ],
    redFlags: [],
    explanation: "✅ LEGITIMATE — Regular developer activity. Commits, code reviews, and communication align with expected sprint patterns.",
  },
  {
    id: "E002", name: "Marcus Webb", dept: "Finance", role: "Accountant",
    avatar: "MW", isThreat: true,
    activities: [
      { time: "09:00", action: "Logged in — Finance portal",             type: "login",  normal: true,  detail: "From office IP" },
      { time: "22:47", action: "Login from unknown IP address",          type: "login",  normal: false, detail: "IP: 91.108.56.14 (overseas VPN)" },
      { time: "22:51", action: "Downloaded: salary_all_2024.xlsx",       type: "file",   normal: false, detail: "All 847 employee records — 48 MB" },
      { time: "22:53", action: "Downloaded: vendor_contracts_2024.zip",  type: "file",   normal: false, detail: "All vendor contracts — 124 MB" },
      { time: "22:57", action: "External upload to personal cloud",      type: "upload", normal: false, detail: "172 MB transferred to Dropbox (personal)" },
    ],
    redFlags: [
      "After-hours login from overseas VPN",
      "Mass download of sensitive HR salary records",
      "Downloaded all vendor contracts",
      "Transferred 172 MB to personal cloud storage",
    ],
    explanation: "🚨 INSIDER THREAT — After-hours data exfiltration via overseas VPN. Downloaded full employee salary data and vendor contracts then uploaded to personal Dropbox. Classic pre-resignation data theft.",
  },
  {
    id: "E003", name: "Priya Patel", dept: "HR", role: "HR Manager",
    avatar: "PP", isThreat: false,
    activities: [
      { time: "09:15", action: "Reviewed 12 candidate applications",       type: "app",   normal: true, detail: "ATS system access" },
      { time: "11:00", action: "Exported: new_hire_onboarding_list.xlsx",  type: "file",  normal: true, detail: "12 records — authorized export" },
      { time: "14:30", action: "Benefits portal data access",              type: "app",   normal: true, detail: "Q4 open enrollment period" },
      { time: "16:15", action: "Email to legal@company.com",               type: "email", normal: true, detail: "NDA documents for new hire" },
    ],
    redFlags: [],
    explanation: "✅ LEGITIMATE — Normal HR manager activity. Candidate processing and enrollment access during active hiring season is fully expected.",
  },
  {
    id: "E004", name: "Derek Sousa", dept: "IT", role: "Sysadmin",
    avatar: "DS", isThreat: true,
    activities: [
      { time: "07:30", action: "Server maintenance — patch deployment",         type: "app",     normal: true,  detail: "Patch applied to WEB-01" },
      { time: "11:22", action: "Created new local admin account: 'backup_svc'", type: "admin",   normal: false, detail: "No change ticket, no manager approval" },
      { time: "11:25", action: "Opened CEO email mailbox",                      type: "email",   normal: false, detail: "Admin-level delegated mailbox access" },
      { time: "13:40", action: "ICMP sweep — internal subnet 10.0.1.0/24",      type: "network", normal: false, detail: "Nmap scan — all 256 hosts enumerated" },
      { time: "14:02", action: "Downloaded: AD_users_export.csv",               type: "file",    normal: false, detail: "Active Directory — 2,341 user accounts" },
      { time: "17:50", action: "Firewall rule modified — TCP :3389 allowed",    type: "admin",   normal: false, detail: "RDP exposed externally, no change request filed" },
    ],
    redFlags: [
      "Created rogue admin account without ticket",
      "Accessed CEO email mailbox — unauthorized",
      "Internal network reconnaissance (Nmap scan)",
      "Full AD user export without authorization",
      "Opened external RDP without change management",
    ],
    explanation: "🚨 INSIDER THREAT — Rogue admin account creation, executive email snooping, network recon, AD data exfiltration, and firewall tampering. This is a malicious or compromised sysadmin.",
  },
  {
    id: "E005", name: "Lisa Torres", dept: "Sales", role: "Account Exec",
    avatar: "LT", isThreat: false,
    activities: [
      { time: "08:30", action: "CRM — updated 15 accounts",         type: "app",   normal: true, detail: "Q4 pipeline update" },
      { time: "10:45", action: "Exported: Q4_prospects_myteam.csv", type: "file",  normal: true, detail: "15 records — own accounts only" },
      { time: "12:00", action: "Salesforce proposal generator",     type: "app",   normal: true, detail: "3 proposals created" },
      { time: "16:30", action: "Email campaign to client list",     type: "email", normal: true, detail: "28 contacts — quarterly newsletter" },
    ],
    redFlags: [],
    explanation: "✅ LEGITIMATE — Normal sales activity. Q4 CRM exports and prospect data are standard at end-of-quarter and match role permissions.",
  },
  {
    id: "E006", name: "Tom Nguyen", dept: "Engineering", role: "DevOps",
    avatar: "TN", isThreat: true,
    activities: [
      { time: "09:00", action: "CI/CD pipeline run — main branch",        type: "git",    normal: true,  detail: "All tests passed, deployed to staging" },
      { time: "13:15", action: "Accessed restricted M&A research files",  type: "file",   normal: false, detail: "Competitor intelligence docs — outside role scope" },
      { time: "14:00", action: "Sent 47 documents to printer",            type: "print",  normal: false, detail: "43 classified docs, 4 normal — unusual bulk volume" },
      { time: "15:30", action: "USB storage device inserted",             type: "usb",    normal: false, detail: "1 TB external drive — not company-issued" },
      { time: "15:32", action: "File transfer to USB device",             type: "upload", normal: false, detail: "1.2 GB transferred: source code + design docs" },
    ],
    redFlags: [
      "Accessed M&A competitor intelligence outside role scope",
      "Bulk printed 43 classified documents",
      "Inserted unauthorized personal USB drive",
      "Exfiltrated 1.2 GB of source code to USB",
    ],
    explanation: "🚨 INSIDER THREAT — Accessed restricted competitive intelligence, printed classified docs in bulk, then copied 1.2 GB of source code to a personal USB drive. Textbook IP theft before departure.",
  },
];

const TYPE_ICONS = {
  git: "💻", app: "📱", file: "📁", login: "🔐",
  upload: "☁️", email: "📧", chat: "💬", admin: "⚙️",
  network: "🌐", print: "🖨️", usb: "💾",
};

const THREATS_COUNT = EMPLOYEES.filter((e) => e.isThreat).length;   // 3
const NORMALS_COUNT = EMPLOYEES.filter((e) => !e.isThreat).length;  // 3
// Per correct flag: floor(80/3)=26 pts × 3 = 78; per correct clear: floor(20/3)=6 pts × 3 = 18; total reachable = 96 → clamped to 100
const PTS_PER_FLAG  = Math.floor(80 / THREATS_COUNT);   // 26
const PTS_PER_CLEAR = Math.floor(20 / NORMALS_COUNT);   // 6

export default function InsiderThreatDetection() {
  const [phase,    setPhase]   = useState("intro");
  const [selected, setSelected]= useState(null);
  const [decisions,setDecisions]= useState({});   // { empId: "flagged" | "cleared" }
  const [score,    setScore]   = useState(0);
  const [findings, setFindings]= useState([]);
  const [feedback, setFeedback]= useState(null);  // { empId, correct }

  const allReviewed = EMPLOYEES.every((e) => decisions[e.id]);

  const handleFlag = (emp) => {
    if (decisions[emp.id]) return;
    const correct = emp.isThreat;
    const pts = correct ? PTS_PER_FLAG : -10;
    setDecisions((prev) => ({ ...prev, [emp.id]: "flagged" }));
    setScore((s) => Math.max(0, Math.min(100, s + pts)));
    setFindings((prev) => [...prev, { correct, text: emp.explanation }]);
    setFeedback({ empId: emp.id, correct, action: "flagged" });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleClear = (emp) => {
    if (decisions[emp.id]) return;
    const correct = !emp.isThreat;
    const pts = correct ? PTS_PER_CLEAR : -10;
    setDecisions((prev) => ({ ...prev, [emp.id]: "cleared" }));
    setScore((s) => Math.max(0, Math.min(100, s + pts)));
    setFindings((prev) => [...prev, { correct, text: emp.explanation }]);
    setFeedback({ empId: emp.id, correct, action: "cleared" });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleRetry = () => {
    setPhase("intro"); setSelected(null); setDecisions({});
    setScore(0); setFindings([]); setFeedback(null);
  };

  if (phase === "result") {
    return (
      <SimResults
        score={score} maxScore={100}
        timeTaken={270} totalTime={300}
        onRetry={handleRetry}
        findings={findings}
      />
    );
  }

  const decisionOf = (emp) => decisions[emp.id];   // "flagged" | "cleared" | undefined

  return (
    <VisualSimWrapper
      title="Insider Threat Detection" level="pro" category="network"
      timeLimit={300} phase={phase} score={score} maxScore={100}
      onStart={() => setPhase("playing")} onRetry={handleRetry}
      hints={[
        "Review the activity logs of 6 employees from today.",
        "Click an employee → inspect their log → Flag or Clear them.",
        "3 employees are insider threats — identify all 3.",
        "No automated hints at Pro level. Trust your analysis.",
      ]}
      findings={findings}
    >
      {/* Full-height layout below the fixed 64px navbar */}
      <div className="flex" style={{ height: "calc(100vh - 64px)" }}>

        {/* ── LEFT SIDEBAR — employee list ───────────────────────────── */}
        <div className="w-64 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-800 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span className="text-white font-semibold text-sm">Employee Monitor</span>
            </div>
            <div className="flex gap-4 mt-2 text-xs">
              <span className="text-red-400">🚨 Flagged: {Object.values(decisions).filter((d) => d === "flagged").length}</span>
              <span className="text-emerald-400">✅ Cleared: {Object.values(decisions).filter((d) => d === "cleared").length}</span>
            </div>
          </div>

          {/* Employee list */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-800/50">
            {EMPLOYEES.map((emp) => {
              const dec = decisionOf(emp);
              const isSel = selected?.id === emp.id;
              return (
                <div
                  key={emp.id}
                  onClick={() => setSelected(emp)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors
                    ${isSel ? "bg-gray-800" : "hover:bg-gray-800/50"}
                    ${dec === "flagged" ? "border-l-2 border-l-red-500" : dec === "cleared" ? "border-l-2 border-l-emerald-500" : "border-l-2 border-l-transparent"}`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                    ${dec === "flagged" ? "bg-red-500/30 text-red-300" : dec === "cleared" ? "bg-emerald-500/30 text-emerald-300" : "bg-gray-700 text-gray-300"}`}>
                    {emp.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{emp.name}</p>
                    <p className="text-gray-500 text-xs">{emp.dept} · {emp.role}</p>
                  </div>
                  {dec === "flagged" && <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                  {dec === "cleared" && <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                  {!dec && <ChevronRight className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />}
                </div>
              );
            })}
          </div>

          {/* Score + submit */}
          <div className="flex-shrink-0 p-4 border-t border-gray-800 space-y-3">
            <div className="bg-gray-800 rounded-xl p-3 text-center">
              <div className="text-2xl font-black text-white">{score}<span className="text-gray-600 text-sm">/100</span></div>
              <div className="text-xs text-gray-500">{Object.keys(decisions).length}/{EMPLOYEES.length} reviewed</div>
            </div>
            {allReviewed && (
              <motion.button
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setPhase("result")}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20"
              >
                File Report →
              </motion.button>
            )}
          </div>
        </div>

        {/* ── MAIN PANEL — activity detail ───────────────────────────── */}
        {selected ? (
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Employee header */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-gray-800 bg-gray-900 flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {selected.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-lg leading-tight">{selected.name}</h3>
                <p className="text-gray-400 text-sm">{selected.dept} · {selected.role} · ID: {selected.id}</p>
              </div>
              {/* Only show anomaly count AFTER a decision is made */}
              {decisionOf(selected) && (
                <div className={`text-right flex-shrink-0 px-3 py-1 rounded-lg text-xs font-bold
                  ${selected.isThreat ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                  {selected.activities.filter((a) => !a.normal).length} anomalies
                </div>
              )}
              {!decisionOf(selected) && (
                <div className="text-right flex-shrink-0 text-gray-600 text-xs flex items-center gap-1">
                  <EyeOff className="w-3.5 h-3.5" /> Unreviewed
                </div>
              )}
            </div>

            {/* Scrollable activity log */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                Today's Activity Log — {selected.activities.length} events
              </h4>

              <div className="space-y-2">
                {selected.activities.map((act, i) => {
                  // Only colour-code anomalies after the user has decided
                  const decided = !!decisionOf(selected);
                  const isAnomaly = !act.normal;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-all
                        ${decided && isAnomaly
                          ? "bg-red-900/20 border-red-500/30"
                          : "bg-gray-900 border-gray-800"}`}
                    >
                      <span className="text-lg flex-shrink-0 mt-0.5">{TYPE_ICONS[act.type] || "📌"}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-gray-500 text-xs font-mono">{act.time}</span>
                          {decided && isAnomaly && (
                            <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded border border-red-500/20 font-semibold">
                              ANOMALY
                            </span>
                          )}
                        </div>
                        <p className={`text-sm mt-0.5 ${decided && isAnomaly ? "text-red-300 font-medium" : "text-gray-300"}`}>
                          {act.action}
                        </p>
                        <p className="text-gray-600 text-xs mt-0.5">{act.detail}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Red flags — only revealed AFTER decision */}
              <AnimatePresence>
                {decisionOf(selected) && selected.redFlags.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/20 rounded-xl p-4"
                  >
                    <p className="text-red-400 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" /> Confirmed Behavioral Red Flags
                    </p>
                    <ul className="space-y-1.5">
                      {selected.redFlags.map((flag, i) => (
                        <li key={i} className="text-red-300 text-sm flex items-start gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-red-500" />
                          {flag}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Verdict revealed after decision */}
              <AnimatePresence>
                {decisionOf(selected) && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl border text-sm
                      ${decisions[selected.id] === "flagged" && selected.isThreat   ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" :
                        decisions[selected.id] === "cleared" && !selected.isThreat  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" :
                        "bg-red-500/10 border-red-500/30 text-red-300"}`}
                  >
                    {(decisions[selected.id] === "flagged" && selected.isThreat) ||
                     (decisions[selected.id] === "cleared" && !selected.isThreat)
                      ? "✅ Correct call! " : "❌ Wrong call. "}
                    {selected.explanation}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action bar */}
            {!decisionOf(selected) ? (
              <div className="flex-shrink-0 px-6 py-4 border-t border-gray-800 bg-gray-900 flex gap-3">
                <button
                  onClick={() => handleFlag(selected)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  <Flag className="w-4 h-4" /> 🚨 Flag as Insider Threat
                </button>
                <button
                  onClick={() => handleClear(selected)}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  <CheckCircle className="w-4 h-4" /> ✅ Clear — Normal Activity
                </button>
              </div>
            ) : (
              <div className={`flex-shrink-0 px-6 py-3 border-t border-gray-800
                ${decisionOf(selected) === "flagged" ? "bg-red-900/20" : "bg-emerald-900/20"}`}>
                <p className={`text-center font-semibold text-sm
                  ${decisionOf(selected) === "flagged" ? "text-red-400" : "text-emerald-400"}`}>
                  {decisionOf(selected) === "flagged" ? "🚨 Flagged for investigation" : "✅ Cleared — normal activity"}
                  {" · "}
                  <span className="text-gray-500 font-normal text-xs">
                    {!allReviewed && "Select next employee →"}
                    {allReviewed && "All reviewed — submit your report"}
                  </span>
                </p>
              </div>
            )}
          </div>
        ) : (
          /* No employee selected yet */
          <div className="flex-1 flex items-center justify-center text-gray-600">
            <div className="text-center">
              <Users className="w-14 h-14 mx-auto mb-3 opacity-20" />
              <p className="text-lg font-semibold text-gray-500">Select an employee</p>
              <p className="text-sm mt-1">Review their activity log, then Flag or Clear them</p>
            </div>
          </div>
        )}
      </div>
    </VisualSimWrapper>
  );
}
