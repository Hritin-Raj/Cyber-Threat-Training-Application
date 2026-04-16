import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Search, Filter, CheckCircle, XCircle, AlertTriangle, BarChart2, Crosshair, ChevronRight } from "lucide-react";
import VisualSimWrapper, { SimResults } from "../VisualSimWrapper";

const EMAILS = [
  {
    id: 1, from: "hr@yourcompany.com", to: "alex@yourcompany.com",
    subject: "Q4 Performance Review — Action Required",
    snippet: "Please complete your self-assessment by Friday.",
    body: "Hi Alex, complete your annual performance review via the internal HR portal. Link: https://hr.yourcompany.com/review/2024",
    headers: { spf: "PASS", dkim: "PASS", dmarc: "PASS", replyTo: "hr@yourcompany.com", serverIP: "10.0.1.50 (internal)" },
    isPhishing: false,
    indicators: [],
    explanation: "✅ LEGITIMATE — Internal IP, SPF/DKIM/DMARC all pass, reply-to matches sender, HR subdomain on company domain.",
    points: 10,
  },
  {
    id: 2, from: "security@microsofft.com", to: "alex@yourcompany.com",
    subject: "Urgent: Unusual sign-in activity on your account",
    snippet: "Your Microsoft account requires immediate verification.",
    body: "We detected unusual sign-in activity. Verify immediately: http://microsoift-security-update.xyz/verify",
    headers: { spf: "FAIL", dkim: "FAIL", dmarc: "FAIL (quarantine)", replyTo: "noreply@microsofft.com", serverIP: "185.220.101.47 (Tor exit node)" },
    isPhishing: true,
    indicators: ["Typo: 'microsofft'", "SPF/DKIM/DMARC all FAIL", "Tor exit node server IP", "Non-microsoft URL"],
    explanation: "🚨 PHISHING — Domain typo 'microsofft', auth headers all fail, Tor exit node, malicious URL.",
    points: 20,
  },
  {
    id: 3, from: "devops@yourcompany.com", to: "all-staff@yourcompany.com",
    subject: "Scheduled maintenance tonight 22:00–02:00",
    snippet: "Services will be briefly unavailable for system upgrades.",
    body: "Maintenance window tonight. No user action required. Contact IT at ext. 4847 with questions.",
    headers: { spf: "PASS", dkim: "PASS", dmarc: "PASS", replyTo: "devops@yourcompany.com", serverIP: "10.0.1.52 (internal)" },
    isPhishing: false,
    indicators: [],
    explanation: "✅ LEGITIMATE — Internal sender, all headers pass, no URLs, no credential requests.",
    points: 10,
  },
  {
    id: 4, from: "payroll@your-company-payroll.net", to: "cfo@yourcompany.com",
    subject: "URGENT: Wire transfer required — CEO approval needed",
    snippet: "Executive wire transfer of $87,500 to vendor account.",
    body: "Hi, I'm traveling and need you to process a confidential wire transfer immediately. Do not discuss with other staff. Account: CH89 3704 1044 0323 4500 1",
    headers: { spf: "FAIL", dkim: "NONE", dmarc: "FAIL (none)", replyTo: "ceo.external@gmail.com", serverIP: "45.33.32.156 (Linode VPS)" },
    isPhishing: true,
    indicators: ["BEC/CEO fraud pattern", "Domain lookalike", "Gmail reply-to", "VPS server", "Urgency + secrecy", "Wire transfer request"],
    explanation: "🚨 BEC PHISHING — Classic Business Email Compromise. Fake CEO/payroll domain, Gmail reply-to, VPS server. This is a wire fraud attack.",
    points: 25,
  },
  {
    id: 5, from: "newsletter@linkedin.com", to: "alex@yourcompany.com",
    subject: "5 people viewed your profile this week",
    snippet: "See who's been looking at your LinkedIn profile.",
    body: "5 professionals viewed your profile. Click to see who: https://linkedin.com/me/views",
    headers: { spf: "PASS", dkim: "PASS", dmarc: "PASS", replyTo: "newsletter@linkedin.com", serverIP: "108.174.10.10 (LinkedIn)" },
    isPhishing: false,
    indicators: [],
    explanation: "✅ LEGITIMATE — Authentic LinkedIn IP range, all auth headers pass, link goes to linkedin.com.",
    points: 10,
  },
  {
    id: 6, from: "it-support@yourcompany.co", to: "alex@yourcompany.com",
    subject: "Password expiring — Reset in next 24h or lose access",
    snippet: "Your corporate password expires soon. Reset it now.",
    body: "Your Active Directory password expires in 24 hours. Reset here: https://yourcompany.co/ad/reset?token=ZXJhb2",
    headers: { spf: "NONE", dkim: "FAIL", dmarc: "NONE", replyTo: "it-support@yourcompany.co", serverIP: "91.108.56.14 (external hosting)" },
    isPhishing: true,
    indicators: ["yourcompany.co ≠ yourcompany.com", "SPF/DKIM fail", "External hosting", "Password urgency"],
    explanation: "🚨 PHISHING — Domain is .co (not .com), auth fails, external hosting. Classic credential harvesting under IT guise.",
    points: 20,
  },
  {
    id: 7, from: "notifications@github.com", to: "alex@yourcompany.com",
    subject: "Review requested: PR #847 — security/auth module",
    snippet: "jsmith requested your review on the authentication module PR.",
    body: "jsmith has requested your review. View PR: https://github.com/yourcompany/repo/pull/847",
    headers: { spf: "PASS", dkim: "PASS", dmarc: "PASS", replyTo: "noreply@github.com", serverIP: "192.30.252.0 (GitHub)" },
    isPhishing: false,
    indicators: [],
    explanation: "✅ LEGITIMATE — GitHub IP, all headers pass, genuine GitHub notification URL.",
    points: 10,
  },
  {
    id: 8, from: "aws-billing@amazonaws-invoices.com", to: "cto@yourcompany.com",
    subject: "⚠️ Your AWS bill is overdue — account suspension in 48h",
    snippet: "Critical: $12,847 AWS invoice requires immediate payment.",
    body: "Your AWS account will be suspended. Pay now: https://amazonaws-invoices.com/pay?acct=7491",
    headers: { spf: "FAIL", dkim: "NONE", dmarc: "FAIL (reject)", replyTo: "billing@amazonaws-invoices.com", serverIP: "185.159.128.50 (Romania)" },
    isPhishing: true,
    indicators: ["amazonaws-invoices.com ≠ aws.amazon.com", "All auth headers fail", "Romanian IP", "Payment urgency"],
    explanation: "🚨 PHISHING — AWS bills come from aws.amazon.com not 'amazonaws-invoices.com'. Auth headers fail, overseas IP.",
    points: 25,
  },
];

export default function PhishingCampaignAnalysis() {
  const [phase,     setPhase]  = useState("intro");
  const [answers,   setAnswers]= useState({});
  const [selected,  setSelected]=useState(null);
  const [findings,  setFindings]=useState([]);
  const [score,     setScore]  = useState(0);
  const [filter,    setFilter] = useState("all");
  const maxScore = EMAILS.reduce((s, e) => s + e.points, 0);
  const allAnswered = EMAILS.every((e) => answers[e.id]);

  const handleVerdict = (email, verdict) => {
    if (answers[email.id]) return;
    const correct = (verdict === "phishing") === email.isPhishing;
    const pts = correct ? email.points : 0;
    setAnswers((prev) => ({ ...prev, [email.id]: { verdict, correct } }));
    setScore((s) => s + pts);
    setFindings((prev) => [...prev, { correct, text: email.explanation }]);
  };

  const handleRetry = () => { setPhase("intro"); setAnswers({}); setSelected(null); setFindings([]); setScore(0); };

  const filteredEmails = filter === "all" ? EMAILS : filter === "phishing" ? EMAILS.filter((e) => e.isPhishing) : EMAILS.filter((e) => !e.isPhishing);

  if (phase === "result") return <SimResults score={score} maxScore={maxScore} timeTaken={260} totalTime={300} onRetry={handleRetry} findings={findings} />;

  return (
    <VisualSimWrapper
      title="Phishing Campaign Analysis" level="pro" category="phishing"
      timeLimit={300} phase={phase} score={score} maxScore={maxScore}
      onStart={() => setPhase("playing")} onRetry={handleRetry}
      hints={[
        "8 emails from a corporate inbox — classify each as Phishing or Legitimate.",
        "Inspect headers carefully: SPF, DKIM, DMARC, Reply-To, Server IP.",
        "Look for domain lookalikes, suspicious IPs, and social engineering.",
        "This is Pro level — no hints. Trust your analysis.",
      ]}
      findings={findings}
    >
      <div className="min-h-screen bg-gray-950 flex">
        {/* Email list */}
        <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col flex-shrink-0">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
            <Mail className="w-4 h-4 text-cyan-400" />
            <span className="text-white font-semibold text-sm">Inbox ({EMAILS.length})</span>
            <span className="ml-auto text-xs text-gray-500">{Object.keys(answers).length}/{EMAILS.length}</span>
          </div>
          {/* Filter tabs */}
          <div className="flex border-b border-gray-800">
            {["all", "unreviewed"].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`flex-1 py-2 text-xs capitalize ${filter === f ? "text-cyan-400 border-b-2 border-cyan-400" : "text-gray-500"}`}>{f}</button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto">
            {EMAILS.filter((e) => filter === "all" || !answers[e.id]).map((email) => {
              const ans = answers[email.id];
              return (
                <div
                  key={email.id}
                  onClick={() => setSelected(email)}
                  className={`px-4 py-3 border-b border-gray-800 cursor-pointer transition-colors ${selected?.id === email.id ? "bg-gray-800" : "hover:bg-gray-800/50"} ${ans ? (ans.correct ? "border-l-2 border-l-emerald-500" : "border-l-2 border-l-red-500") : email.isPhishing ? "border-l-2 border-l-transparent" : ""}`}
                >
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <p className="text-gray-300 text-xs font-medium truncate">{email.from}</p>
                    {ans && (ans.correct ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />)}
                  </div>
                  <p className="text-white text-sm font-semibold truncate">{email.subject}</p>
                  <p className="text-gray-500 text-xs truncate mt-0.5">{email.snippet}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Email detail + action */}
        {selected ? (
          <div className="flex-1 flex flex-col">
            {/* Email header */}
            <div className="px-6 py-4 border-b border-gray-800 bg-gray-900">
              <h3 className="text-white text-lg font-bold mb-2">{selected.subject}</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400">
                <span>From: <span className="text-gray-200">{selected.from}</span></span>
                <span>To: <span className="text-gray-200">{selected.to}</span></span>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-4 bg-white flex-1 text-gray-800 text-sm leading-relaxed max-h-40 overflow-y-auto">
              <p>{selected.body}</p>
            </div>

            {/* Header analysis */}
            <div className="px-6 py-4 border-t border-gray-800 bg-gray-900/50">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Email Header Analysis</p>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 text-xs mb-4">
                {Object.entries(selected.headers).map(([k, v]) => {
                  const isBad = v.includes("FAIL") || v.includes("NONE") || v.includes("Tor") || v.includes("VPS") || v.includes("external") || v.includes("Romania");
                  return (
                    <div key={k} className={`p-2 rounded-lg border ${isBad ? "bg-red-500/10 border-red-500/20 text-red-300" : "bg-gray-800 border-gray-700 text-gray-300"}`}>
                      <span className="text-gray-500 capitalize">{k}: </span>
                      <span className="font-semibold">{v}</span>
                    </div>
                  );
                })}
              </div>

              {selected.indicators.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
                  <p className="text-red-400 text-xs font-semibold mb-1">🚨 Suspicious Indicators:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.indicators.map((ind) => (
                      <span key={ind} className="bg-red-500/20 text-red-300 text-xs px-2 py-0.5 rounded-full">{ind}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Verdict buttons */}
              {!answers[selected.id] ? (
                <div className="flex gap-3">
                  <button onClick={() => handleVerdict(selected, "legitimate")} className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-colors">
                    <CheckCircle className="w-4 h-4" /> ✅ LEGITIMATE
                  </button>
                  <button onClick={() => handleVerdict(selected, "phishing")} className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-colors">
                    <AlertTriangle className="w-4 h-4" /> 🚨 PHISHING
                  </button>
                </div>
              ) : (
                <div className={`p-3 rounded-xl border text-sm ${answers[selected.id].correct ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-red-500/10 border-red-500/30 text-red-300"}`}>
                  {answers[selected.id].correct ? "✅ Correct!" : "❌ Incorrect!"} — {selected.explanation}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-600">
            <div className="text-center">
              <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Select an email to analyze</p>
            </div>
          </div>
        )}

        {/* Right panel — stats */}
        <div className="w-56 bg-gray-900 border-l border-gray-800 p-4 flex-col gap-3 hidden xl:flex">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Campaign Stats</p>
          <div className="bg-gray-800 rounded-xl p-3 space-y-2 text-xs">
            {["phishing", "legitimate"].map((type) => {
              const total = EMAILS.filter((e) => e.isPhishing === (type === "phishing")).length;
              const found = EMAILS.filter((e) => e.isPhishing === (type === "phishing") && answers[e.id]?.correct).length;
              return (
                <div key={type}>
                  <div className="flex justify-between text-gray-400 mb-1 capitalize">
                    <span>{type}</span><span>{found}/{total}</span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${type === "phishing" ? "bg-red-500" : "bg-emerald-500"}`} style={{ width: `${total ? (found / total) * 100 : 0}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-gray-800 rounded-xl p-3 text-center mt-2">
            <div className="text-2xl font-black text-white">{score}</div>
            <div className="text-xs text-gray-500">/{maxScore} pts</div>
          </div>

          {allAnswered && (
            <button onClick={() => setPhase("result")} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 rounded-xl text-sm transition-colors mt-auto">
              View Report →
            </button>
          )}
        </div>
      </div>
    </VisualSimWrapper>
  );
}
