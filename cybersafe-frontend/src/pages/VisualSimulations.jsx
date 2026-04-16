import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Clock, Star, ChevronRight, Search, Filter, Shield, Lock } from "lucide-react";
import { VISUAL_SIMULATIONS, LEVELS_ORDER, LEVEL_META } from "../simulations/index";
import { useRequireAuth } from "../hooks/useAuth";

const CATEGORY_FILTERS = ["All", "Phishing", "Malware", "Network Security", "Social Engineering", "Privacy", "Password Security", "Incident Response", "Web Security", "Threat Intelligence"];

export default function VisualSimulations() {
  useRequireAuth();
  const [search,     setSearch]    = useState("");
  const [levelFilter,setLevel]     = useState("all");
  const [catFilter,  setCat]       = useState("All");

  const filtered = VISUAL_SIMULATIONS.filter((sim) => {
    const matchSearch = search === "" || sim.title.toLowerCase().includes(search.toLowerCase()) || sim.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchLevel  = levelFilter === "all" || sim.level === levelFilter;
    const matchCat    = catFilter === "All" || sim.category === catFilter;
    return matchSearch && matchLevel && matchCat;
  });

  const grouped = LEVELS_ORDER.reduce((acc, level) => {
    const sims = filtered.filter((s) => s.level === level);
    if (sims.length > 0) acc[level] = sims;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Hero header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <Zap className="w-3.5 h-3.5" /> Visual Simulation Lab
          </div>
          <h1 className="text-4xl font-black text-white mb-3">
            Interactive{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Threat Simulations
            </span>
          </h1>
          <p className="text-gray-400 text-lg">
            12 hyper-realistic cyber environments. Interact with real-world attack scenarios — no multiple choice.
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total Simulations", value: "12",   icon: "🧪", color: "text-cyan-400" },
            { label: "Levels",            value: "4",    icon: "🎯", color: "text-purple-400" },
            { label: "Max XP Available",  value: "1,540",icon: "⚡", color: "text-amber-400" },
            { label: "Avg Duration",      value: "5 min",icon: "⏱️", color: "text-emerald-400" },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{stat.icon}</span>
                <div>
                  <div className={`text-xl font-black ${stat.color}`}>{stat.value}</div>
                  <div className="text-gray-500 text-xs">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search simulations or tags…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-cyan-500 placeholder-gray-600"
            />
          </div>

          {/* Level tabs */}
          <div className="flex flex-wrap gap-2">
            {["all", ...LEVELS_ORDER].map((l) => {
              const meta = l === "all" ? { label: "All Levels", color: "text-gray-300", bg: "bg-gray-800", border: "border-gray-700", icon: "🔷" } : LEVEL_META[l];
              const active = levelFilter === l;
              return (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-all ${active ? `${meta.bg} ${meta.border} ${meta.color} font-semibold` : "bg-gray-800/50 border-gray-700/50 text-gray-500 hover:text-gray-300"}`}
                >
                  <span>{meta.icon}</span> {meta.label}
                </button>
              );
            })}
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap gap-1.5">
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat}
                onClick={() => setCat(cat)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${catFilter === cat ? "bg-cyan-500/20 border-cyan-500/30 text-cyan-400 font-semibold" : "bg-gray-800 border-gray-700 text-gray-500 hover:text-gray-300"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Simulation grid grouped by level */}
        {Object.entries(grouped).length === 0 ? (
          <div className="text-center py-16 text-gray-600">
            <Shield className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No simulations match your filters.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([level, sims]) => {
            const meta = LEVEL_META[level];
            return (
              <section key={level}>
                {/* Level heading */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xl">{meta.icon}</span>
                  <h2 className={`text-lg font-bold ${meta.color}`}>{meta.label}</h2>
                  <div className={`flex-1 h-px ${meta.bg} border-t ${meta.border}`} />
                  <span className="text-gray-600 text-sm">{sims.length} simulations</span>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sims.map((sim, i) => (
                    <motion.div
                      key={sim.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        to={`/visual-simulations/${sim.id}`}
                        className={`group block bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 hover:shadow-xl hover:shadow-black/30 transition-all duration-200`}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${meta.bg} border ${meta.border} flex-shrink-0`}>
                            {sim.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`text-xs font-semibold ${meta.color}`}>{sim.category}</span>
                            <h3 className="text-white font-bold text-sm leading-tight group-hover:text-cyan-300 transition-colors mt-0.5">{sim.title}</h3>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                        </div>

                        <p className="text-gray-500 text-xs leading-relaxed mb-4 line-clamp-2">{sim.description}</p>

                        {/* Footer */}
                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-1 text-amber-400">
                            <Zap className="w-3 h-3" /> {sim.xp} XP
                          </div>
                          <div className="flex items-center gap-1 text-gray-500">
                            <Clock className="w-3 h-3" /> {Math.floor(sim.timeLimit / 60)}m
                          </div>
                          <div className="flex gap-1 ml-auto flex-wrap justify-end">
                            {sim.tags.slice(0, 2).map((tag) => (
                              <span key={tag} className="bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded text-xs">{tag}</span>
                            ))}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </section>
            );
          })
        )}

        {/* Bottom CTA */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-8 text-center">
          <h3 className="text-white font-bold text-xl mb-2">Ready for standard simulations?</h3>
          <p className="text-gray-400 text-sm mb-4">Complete the structured curriculum with 40+ guided simulations</p>
          <Link to="/simulations" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors border border-gray-700">
            Standard Simulations <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
