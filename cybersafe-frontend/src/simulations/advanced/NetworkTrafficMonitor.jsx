import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Shield, ShieldOff, AlertTriangle, CheckCircle, XCircle, Wifi, Server, Globe, Lock, Unlock } from "lucide-react";
import VisualSimWrapper, { SimResults } from "../VisualSimWrapper";

// ── Packet data with anomalies ───────────────────────────────────────────────
const ALL_PACKETS = [
  { id: 1,  time:"09:14:32", src:"192.168.1.101", dst:"142.250.185.14",  proto:"HTTPS", port:443, size:"2.1KB",  flag:"",      suspicious:false, reason:"" },
  { id: 2,  time:"09:14:33", src:"192.168.1.104", dst:"192.168.1.1",     proto:"DNS",   port:53,  size:"0.3KB",  flag:"",      suspicious:false, reason:"" },
  { id: 3,  time:"09:14:35", src:"192.168.1.101", dst:"185.220.101.47",  proto:"TCP",   port:4444,size:"0.8KB",  flag:"ALERT", suspicious:true,  reason:"Port 4444 is the default Metasploit reverse shell port. This is likely C2 communication." },
  { id: 4,  time:"09:14:36", src:"192.168.1.105", dst:"google.com",      proto:"HTTPS", port:443, size:"4.2KB",  flag:"",      suspicious:false, reason:"" },
  { id: 5,  time:"09:14:38", src:"192.168.1.101", dst:"192.168.1.0/24",  proto:"ICMP",  port:0,   size:"0.1KB",  flag:"SCAN",  suspicious:true,  reason:"ICMP sweep (ping scan) against the entire /24 subnet — classic network reconnaissance after compromise." },
  { id: 6,  time:"09:14:39", src:"192.168.1.102", dst:"8.8.8.8",         proto:"DNS",   port:53,  size:"0.2KB",  flag:"",      suspicious:false, reason:"" },
  { id: 7,  time:"09:14:41", src:"192.168.1.101", dst:"10.0.0.5",        proto:"SMB",   port:445, size:"1.2KB",  flag:"MOVE",  suspicious:true,  reason:"SMB connection to internal server — potential lateral movement or data exfiltration via file share." },
  { id: 8,  time:"09:14:43", src:"192.168.1.106", dst:"netflix.com",     proto:"HTTPS", port:443, size:"89KB",   flag:"",      suspicious:false, reason:"" },
  { id: 9,  time:"09:14:45", src:"192.168.1.101", dst:"185.220.101.47",  proto:"TCP",   port:443, size:"48.3KB", flag:"EXFIL", suspicious:true,  reason:"Large HTTPS upload to the same external IP as the C2 connection. Staged data exfiltration detected." },
  { id: 10, time:"09:14:47", src:"192.168.1.107", dst:"192.168.1.1",     proto:"DHCP",  port:68,  size:"0.4KB",  flag:"",      suspicious:false, reason:"" },
  { id: 11, time:"09:14:49", src:"192.168.1.101", dst:"192.168.1.1",     proto:"TCP",   port:22,  size:"0.5KB",  flag:"",      suspicious:false, reason:"" },
  { id: 12, time:"09:14:51", src:"10.0.0.5",      dst:"192.168.1.101",   proto:"SMB",   port:445, size:"124KB",  flag:"EXFIL", suspicious:true,  reason:"Large file transfer FROM the internal file server TO the compromised host — data staging before exfiltration." },
];

const FLAG_COLORS = {
  ALERT: "bg-red-500/20 text-red-400 border-red-500/30",
  SCAN:  "bg-orange-500/20 text-orange-400 border-orange-500/30",
  MOVE:  "bg-purple-500/20 text-purple-400 border-purple-500/30",
  EXFIL: "bg-red-600/20 text-red-500 border-red-600/30",
  "":    "bg-gray-800 text-gray-500 border-gray-700",
};

const ANOMALY_COUNT = ALL_PACKETS.filter((p) => p.suspicious).length;

export default function NetworkTrafficMonitor() {
  const [phase,    setPhase]   = useState("intro");
  const [packets,  setPackets] = useState([]);
  const [flagged,  setFlagged] = useState(new Set());
  const [score,    setScore]   = useState(0);
  const [selected, setSelected]= useState(null);
  const [findings, setFindings]= useState([]);
  const [filter,   setFilter]  = useState("all");
  const tableRef = useRef(null);
  const maxScore = ANOMALY_COUNT * 15 + (4 * 5); // 15 per true positive, -5 per false positive handled differently
  const REAL_MAX = 100;

  useEffect(() => {
    if (phase !== "playing") return;
    let i = 0;
    const interval = setInterval(() => {
      if (i < ALL_PACKETS.length) {
        setPackets((prev) => [...prev, ALL_PACKETS[i]]);
        i++;
        tableRef.current?.scrollTo({ top: 99999, behavior: "smooth" });
      } else clearInterval(interval);
    }, 400);
    return () => clearInterval(interval);
  }, [phase]);

  const handleFlag = (pkt) => {
    if (flagged.has(pkt.id)) return;
    setFlagged((prev) => new Set([...prev, pkt.id]));
    setSelected(pkt);
    if (pkt.suspicious) {
      setScore((s) => Math.min(REAL_MAX, s + 20));
      setFindings((prev) => [...prev, { correct: true, text: `Correctly flagged: ${pkt.src} → ${pkt.dst}:${pkt.port} — ${pkt.reason}` }]);
    } else {
      setScore((s) => Math.max(0, s - 5));
      setFindings((prev) => [...prev, { correct: false, text: `False positive: ${pkt.src} → ${pkt.dst} is normal traffic (−5 pts)` }]);
    }
  };

  const handleFinish = () => {
    // Penalize missed anomalies
    const missed = ALL_PACKETS.filter((p) => p.suspicious && !flagged.has(p.id));
    const missedFindings = missed.map((p) => ({ correct: false, text: `Missed: ${p.flag} — ${p.src} → ${p.dst}:${p.port}. ${p.reason}` }));
    setFindings((prev) => [...prev, ...missedFindings]);
    setPhase("result");
  };

  const handleRetry = () => {
    setPhase("intro"); setPackets([]); setFlagged(new Set()); setScore(0); setSelected(null); setFindings([]);
  };

  const filteredPackets = filter === "all" ? packets : filter === "flagged" ? packets.filter((p) => flagged.has(p.id)) : packets.filter((p) => p.suspicious);

  if (phase === "result") return <SimResults score={score} maxScore={REAL_MAX} timeTaken={240} totalTime={300} onRetry={handleRetry} findings={findings} />;

  return (
    <VisualSimWrapper
      title="Network Traffic Monitor" level="advanced" category="network"
      timeLimit={300} phase={phase} score={score} maxScore={REAL_MAX}
      onStart={() => setPhase("playing")} onRetry={handleRetry}
      hints={[
        "Network packets are streaming in live — monitor for anomalies.",
        "Click 🚨 Flag on any suspicious packet to investigate.",
        "Look for: unusual ports (4444), internal scans, large uploads to external IPs.",
        "False positives cost points — only flag what's truly suspicious.",
      ]}
      findings={findings}
    >
      <div className="min-h-screen bg-gray-950 p-4 flex flex-col gap-4">
        {/* Header panels */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total Packets",   value: packets.length,         color: "text-cyan-400",   icon: <Activity className="w-4 h-4" /> },
            { label: "Flagged",         value: flagged.size,           color: "text-amber-400",  icon: <AlertTriangle className="w-4 h-4" /> },
            { label: "True Positives",  value: [...flagged].filter((id) => ALL_PACKETS.find((p) => p.id === id)?.suspicious).length, color: "text-emerald-400", icon: <CheckCircle className="w-4 h-4" /> },
            { label: "Score",           value: `${score}/100`,         color: "text-purple-400", icon: <Shield className="w-4 h-4" /> },
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

        <div className="grid lg:grid-cols-3 gap-4 flex-1">
          {/* Packet table */}
          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="text-white font-semibold text-sm">Live Packet Capture</span>
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </div>
              <div className="flex gap-1">
                {["all", "flagged"].map((f) => (
                  <button key={f} onClick={() => setFilter(f)} className={`text-xs px-2 py-1 rounded-lg capitalize ${filter === f ? "bg-cyan-500/20 text-cyan-400" : "text-gray-500 hover:text-white"}`}>{f}</button>
                ))}
              </div>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-12 gap-1 px-3 py-2 bg-gray-800/50 text-xs text-gray-500 font-semibold uppercase">
              <div className="col-span-2">Time</div>
              <div className="col-span-3">Source</div>
              <div className="col-span-3">Destination</div>
              <div className="col-span-1">Port</div>
              <div className="col-span-1">Size</div>
              <div className="col-span-2 text-center">Action</div>
            </div>

            <div ref={tableRef} className="flex-1 overflow-y-auto max-h-80">
              <AnimatePresence>
                {filteredPackets.map((pkt) => {
                  const isFlagged = flagged.has(pkt.id);
                  const isSelected = selected?.id === pkt.id;
                  return (
                    <motion.div
                      key={pkt.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`grid grid-cols-12 gap-1 px-3 py-2 text-xs border-b border-gray-800/50 cursor-pointer transition-colors ${
                        isSelected ? "bg-cyan-500/10" :
                        isFlagged && pkt.suspicious ? "bg-red-500/10" :
                        isFlagged ? "bg-amber-500/5" :
                        pkt.suspicious ? "bg-red-900/10 hover:bg-red-900/20" :
                        "hover:bg-gray-800/50"
                      }`}
                      onClick={() => setSelected(pkt)}
                    >
                      <div className="col-span-2 text-gray-500 font-mono">{pkt.time.split(" ")[0]?.slice(3)}</div>
                      <div className="col-span-3 text-gray-300 font-mono truncate">{pkt.src}</div>
                      <div className="col-span-3 text-gray-300 font-mono truncate">{pkt.dst}</div>
                      <div className="col-span-1 text-gray-400">{pkt.port || "—"}</div>
                      <div className="col-span-1 text-gray-400">{pkt.size}</div>
                      <div className="col-span-2 flex justify-center">
                        {isFlagged ? (
                          <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${pkt.suspicious ? "text-red-400 bg-red-500/20" : "text-amber-400 bg-amber-500/10"}`}>
                            {pkt.suspicious ? "🚨 Hit" : "⚠️ FP"}
                          </span>
                        ) : (
                          <button onClick={(e) => { e.stopPropagation(); handleFlag(pkt); }} className="text-xs px-2 py-0.5 bg-gray-800 hover:bg-red-500/20 hover:text-red-400 text-gray-500 rounded transition-colors">
                            Flag
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Detail panel */}
          <div className="space-y-3">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex-1">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Packet Inspector</p>
              {selected ? (
                <div className="space-y-2 text-sm">
                  {[
                    ["Time",     selected.time],
                    ["Source",   selected.src],
                    ["Destination", selected.dst],
                    ["Protocol", selected.proto],
                    ["Port",     selected.port || "—"],
                    ["Size",     selected.size],
                    ["Flag",     selected.flag || "None"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-2">
                      <span className="text-gray-500">{k}</span>
                      <span className={`text-right font-mono text-xs ${k === "Flag" && selected.flag ? "text-red-400 font-bold" : "text-gray-200"}`}>{String(v)}</span>
                    </div>
                  ))}
                  {selected.suspicious && (
                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-300">
                      🚨 <strong>Anomaly detected:</strong> {selected.reason}
                    </div>
                  )}
                  {!selected.suspicious && (
                    <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-300">
                      ✅ This appears to be normal traffic.
                    </div>
                  )}
                  {!flagged.has(selected.id) && (
                    <button onClick={() => handleFlag(selected)} className="w-full mt-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2 rounded-lg transition-colors">
                      🚨 Flag as Suspicious
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-gray-600 text-sm text-center py-4">Click any packet to inspect</p>
              )}
            </div>

            <button
              onClick={handleFinish}
              disabled={packets.length < ALL_PACKETS.length}
              className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-bold py-3 rounded-xl transition-colors text-sm"
            >
              {packets.length < ALL_PACKETS.length ? `Capturing… ${packets.length}/${ALL_PACKETS.length}` : "Submit Analysis →"}
            </button>
          </div>
        </div>
      </div>
    </VisualSimWrapper>
  );
}
