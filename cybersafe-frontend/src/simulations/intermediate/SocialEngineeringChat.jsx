import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ShieldAlert, Phone, Video, MoreVertical, CheckCheck } from "lucide-react";
import VisualSimWrapper, { SimResults } from "../VisualSimWrapper";

// ── Branching conversation tree ──────────────────────────────────────────────
const CONVERSATION = {
  start: {
    attacker: [
      { text: "Hey! Is this Alex from TechCorp's IT department?", delay: 800 },
      { text: "This is David from our cloud vendor support. We've detected suspicious login attempts on your company's Microsoft 365 tenant. I need to verify your account details urgently.", delay: 1800 },
    ],
    choices: [
      { id: "verify_first", text: "Which vendor are you exactly, and what's your employee ID?", score: 20, tag: "good", next: "verify_response" },
      { id: "comply",       text: "Oh! Yes, I'm Alex. What details do you need?",              score: 0,  tag: "bad",  next: "comply_response" },
      { id: "suspicious",   text: "I'm going to need to verify this through our official vendor portal before sharing anything.", score: 25, tag: "best", next: "suspicious_response" },
    ],
  },
  verify_response: {
    attacker: [
      { text: "I'm David Chen, employee #4821 from CloudSecure Solutions. We have a partnership with TechCorp.", delay: 900 },
      { text: "The threat is active RIGHT NOW — every minute counts. I need your Azure AD admin credentials to run an emergency security scan.", delay: 1600 },
    ],
    choices: [
      { id: "demand_official", text: "I'll need to contact your company through the official number on our vendor contract, not this chat.", score: 25, tag: "best", next: "demand_official_response" },
      { id: "partial",         text: "I can give you read-only access temporarily while we verify.",                                   score: 5,  tag: "ok",   next: "partial_response" },
      { id: "give_creds",      text: "Okay, let me get those for you now.",                                                           score: 0,  tag: "bad",  next: "give_creds_response" },
    ],
  },
  comply_response: {
    attacker: [
      { text: "Great! I'll need your Microsoft 365 admin username and password, plus your MFA backup code to bypass the security block.", delay: 1000 },
      { text: "Don't worry — we're a trusted partner. This is completely standard emergency procedure.", delay: 1400 },
    ],
    choices: [
      { id: "refuse",     text: "Wait — legitimate support NEVER asks for passwords. I'm ending this call.",       score: 20, tag: "good", next: "refuse_response" },
      { id: "give_mfa",   text: "Okay, here are my credentials and MFA code: admin@techcorp.com / P@ssw0rd1 / 847293", score: 0, tag: "bad",  next: "disaster_response" },
      { id: "escalate",   text: "Let me loop in my manager before sharing any credentials.",                        score: 15, tag: "good", next: "escalate_response" },
    ],
  },
  suspicious_response: {
    attacker: [
      { text: "There's no time for that! Every second the hackers have access they're exfiltrating data!", delay: 900 },
      { text: "Your manager will be furious when he learns you let a breach happen because you were too slow.", delay: 1500 },
    ],
    choices: [
      { id: "stay_firm",      text: "I understand the urgency you're claiming, but security protocols exist for exactly this reason. I'm calling our actual IT security team now.", score: 25, tag: "best", next: "victory_response" },
      { id: "get_pressured",  text: "Fine, but just this once — what's the least sensitive thing I can share?",                                                                score: 5,  tag: "ok",   next: "pressured_response" },
    ],
  },
  demand_official_response: {
    attacker: [
      { text: "That will take too long! The breach is happening NOW!", delay: 800 },
      { text: "Look, I'll get in trouble if this breach expands. Can't you just give me temporary access?", delay: 1400 },
    ],
    choices: [
      { id: "firm_no",      text: "No. Security verification is non-negotiable. If this is real, you can wait for proper channels.", score: 25, tag: "best", next: "victory_response" },
      { id: "feel_sorry",   text: "I guess I could provide view-only access just to help...", score: 5, tag: "ok", next: "pressured_response" },
    ],
  },
  partial_response: {
    attacker: [
      { text: "Perfect! Send me the temporary access token. Oh, and include the MFA bypass code too.", delay: 1000 },
      { text: "We'll need full admin read/write to properly diagnose the threat.", delay: 1400 },
    ],
    choices: [
      { id: "stop_now",  text: "I'm stopping this. Legitimate vendors don't escalate access demands like this. I'm reporting this to security.", score: 20, tag: "good", next: "victory_response" },
      { id: "give_full", text: "Okay, I'll provide full temporary access.", score: 0, tag: "bad", next: "disaster_response" },
    ],
  },
  give_creds_response: {
    attacker: [
      { text: "Excellent! And the MFA code? We need to bypass the security block temporarily.", delay: 800 },
    ],
    choices: [
      { id: "wake_up",   text: "Wait — I should NEVER share my MFA code. This is a social engineering attack!", score: 15, tag: "good", next: "late_realization" },
      { id: "give_mfa2", text: "The code is 847293.", score: 0, tag: "bad", next: "disaster_response" },
    ],
  },
  refuse_response: {
    attacker: [{ text: "...call ended.", delay: 500 }],
    choices: [],
    outcome: "good",
    summary: "Well done. You correctly identified that legitimate support never asks for passwords or MFA codes, and ended the call.",
    finalScore: 35,
  },
  escalate_response: {
    attacker: [{ text: "No time for that! Are you seriously going to let your company get breached?", delay: 900 }],
    choices: [
      { id: "firm",   text: "Yes, I am. Because this is what prevents breaches. Goodbye.", score: 20, tag: "best", next: "victory_response" },
      { id: "waver",  text: "Okay, just the username then.", score: 0, tag: "bad", next: "disaster_response" },
    ],
  },
  victory_response: {
    attacker: [{ text: "...connection lost.", delay: 500 }],
    choices: [],
    outcome: "victory",
    summary: "🏆 Excellent! You used proper verification protocols and resisted all pressure tactics. Your company's credentials are safe.",
    finalScore: 100,
  },
  pressured_response: {
    attacker: [{ text: "Great! Send me the admin panel link and your session token to get started.", delay: 1000 }],
    choices: [
      { id: "last_chance", text: "Stop — I'm not sending any access tokens. This conversation is over. Reporting now.", score: 10, tag: "good", next: "partial_victory" },
      { id: "give_token",  text: "Here's the session token: eyJhbGc...", score: 0, tag: "bad", next: "disaster_response" },
    ],
  },
  disaster_response: {
    attacker: [
      { text: "Perfect. We're in.", delay: 600 },
      { text: "❌ Simulation Ended: BREACH DETECTED", delay: 1200 },
    ],
    choices: [],
    outcome: "disaster",
    summary: "❌ Your credentials were compromised. A real attacker would now have full access to your company's Microsoft 365, email, and SharePoint. Never share passwords, MFA codes, or session tokens.",
    finalScore: 0,
  },
  late_realization: {
    attacker: [{ text: "...attacker disconnects.", delay: 600 }],
    choices: [],
    outcome: "late",
    summary: "⚠️ You shared your password but stopped before the MFA code. The damage is partial — attacker can't login without MFA. Change your password immediately and report the incident.",
    finalScore: 30,
  },
  partial_victory: {
    attacker: [{ text: "...connection terminated.", delay: 500 }],
    choices: [],
    outcome: "partial",
    summary: "⚠️ You eventually stopped, but provided some access. Always verify through official channels first — never give in to urgency pressure.",
    finalScore: 50,
  },
};

const TAG_COLORS = { best: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", good: "bg-blue-500/20 text-blue-300 border-blue-500/30", ok: "bg-amber-500/20 text-amber-300 border-amber-500/30", bad: "bg-red-500/20 text-red-300 border-red-500/30" };
const TAG_LABELS = { best: "✅ Best", good: "👍 Good", ok: "⚠️ Risky", bad: "🚨 Dangerous" };

export default function SocialEngineeringChat() {
  const [phase,      setPhase]    = useState("intro");
  const [nodeKey,    setNodeKey]  = useState("start");
  const [messages,   setMessages] = useState([]);
  const [score,      setScore]    = useState(0);
  const [typing,     setTyping]   = useState(false);
  const [waiting,    setWaiting]  = useState(false);
  const [outcome,    setOutcome]  = useState(null);
  const [findings,   setFindings] = useState([]);
  const bottomRef = useRef(null);
  const maxScore = 100;

  const currentNode = CONVERSATION[nodeKey];

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const loadAttackerMessages = (msgs) => {
    setTyping(true);
    let delay = 0;
    msgs.forEach((msg, i) => {
      delay += msg.delay;
      setTimeout(() => {
        setMessages((prev) => [...prev, { from: "attacker", text: msg.text, time: new Date().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }) }]);
        if (i === msgs.length - 1) { setTyping(false); setWaiting(false); }
      }, delay);
    });
  };

  const handleStart = () => {
    setPhase("playing");
    setTimeout(() => loadAttackerMessages(CONVERSATION.start.attacker), 500);
    setWaiting(true);
  };

  const handleChoice = (choice) => {
    if (waiting) return;
    setMessages((prev) => [...prev, { from: "user", text: choice.text, tag: choice.tag, time: new Date().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }) }]);
    setScore((s) => Math.min(100, s + choice.score));
    setFindings((prev) => [...prev, { correct: choice.tag === "best" || choice.tag === "good", text: choice.text }]);
    setWaiting(true);

    const nextNode = CONVERSATION[choice.next];
    if (!nextNode) return;

    if (nextNode.choices?.length === 0) {
      // Terminal node
      setTimeout(() => {
        if (nextNode.attacker) loadAttackerMessages(nextNode.attacker);
        setOutcome(nextNode);
        const finalPct = nextNode.finalScore ?? score + choice.score;
        setTimeout(() => { setScore(Math.min(100, finalPct)); setPhase("result"); }, nextNode.attacker ? nextNode.attacker.reduce((s, m) => s + m.delay, 0) + 1500 : 1500);
      }, 500);
    } else {
      setNodeKey(choice.next);
      setTimeout(() => loadAttackerMessages(nextNode.attacker), 600);
    }
  };

  const handleRetry = () => {
    setPhase("intro"); setNodeKey("start"); setMessages([]); setScore(0); setTyping(false); setWaiting(true); setOutcome(null); setFindings([]);
  };

  if (phase === "result") return <SimResults score={score} maxScore={maxScore} timeTaken={180} totalTime={300} onRetry={handleRetry} findings={findings} />;

  return (
    <VisualSimWrapper
      title="Social Engineering Chat" level="intermediate" category="socialEngineering"
      timeLimit={300} phase={phase} score={score} maxScore={maxScore}
      onStart={handleStart} onRetry={handleRetry}
      hints={[
        "A caller claims to be from IT support requiring urgent credential access.",
        "Each response you choose affects the outcome — branching story.",
        "Look for: urgency, authority claims, credential requests.",
        "Tip: Legitimate IT never asks for passwords or MFA codes.",
      ]}
      findings={findings}
    >
      <div className="min-h-screen bg-gray-900 flex flex-col max-w-2xl mx-auto">
        {/* Chat header */}
        <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">DC</div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">David Chen — Cloud Support</p>
            <p className="text-gray-400 text-xs">🔴 URGENT: Active security incident</p>
          </div>
          <div className="ml-auto flex gap-2 text-gray-500">
            <Phone className="w-5 h-5" /><Video className="w-5 h-5" /><MoreVertical className="w-5 h-5" />
          </div>
        </div>

        {/* Attacker label */}
        <div className="bg-red-900/30 border-b border-red-800/30 px-4 py-2 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <p className="text-red-400 text-xs font-semibold">⚠️ SECURITY TRAINING: Identify and resist social engineering tactics</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-64 max-h-96">
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs lg:max-w-sm`}>
                <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.from === "user" ? "bg-blue-600 text-white rounded-br-sm" : "bg-gray-700 text-gray-200 rounded-bl-sm"}`}>
                  {msg.text}
                </div>
                <div className={`flex items-center gap-1 mt-0.5 ${msg.from === "user" ? "justify-end" : ""}`}>
                  <span className="text-gray-600 text-xs">{msg.time}</span>
                  {msg.from === "user" && <CheckCheck className="w-3 h-3 text-blue-400" />}
                  {msg.tag && <span className={`text-xs px-1.5 py-0.5 rounded-full border ${TAG_COLORS[msg.tag]}`}>{TAG_LABELS[msg.tag]}</span>}
                </div>
              </div>
            </motion.div>
          ))}
          {typing && (
            <div className="flex justify-start">
              <div className="bg-gray-700 rounded-2xl px-4 py-3 flex gap-1">
                {[0, 1, 2].map((i) => <div key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Response choices */}
        {!typing && !waiting && !outcome && currentNode?.choices?.length > 0 && (
          <div className="border-t border-gray-700 p-4 space-y-2 bg-gray-850">
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Choose your response:</p>
            {currentNode.choices.map((choice) => (
              <motion.button
                key={choice.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => handleChoice(choice)}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all hover:scale-[1.01] ${TAG_COLORS[choice.tag]}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span>{choice.text}</span>
                  <span className="text-xs flex-shrink-0 opacity-60">+{choice.score}pts</span>
                </div>
              </motion.button>
            ))}
          </div>
        )}

        {waiting && !typing && !outcome && (
          <div className="border-t border-gray-700 p-4 text-center text-gray-500 text-sm animate-pulse">Waiting for response…</div>
        )}
      </div>
    </VisualSimWrapper>
  );
}
