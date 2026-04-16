import { useState, useEffect } from "react";
import { simAPI } from "../services/api";
import SimulationCard from "../components/SimulationCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { Search, Filter, Lock, ChevronDown } from "lucide-react";
import useStore from "../store/useStore";

const LEVELS = ["all", "beginner", "intermediate", "advanced", "pro"];
const CATEGORIES = ["all", "phishing", "malware", "password", "socialEngineering", "network", "privacy"];

const CATEGORY_LABELS = {
  all: "All Categories",
  phishing: "🎣 Phishing",
  malware: "🦠 Malware",
  password: "🔑 Password",
  socialEngineering: "🎭 Social Engineering",
  network: "🌐 Network",
  privacy: "👁️ Privacy",
};

const LEVEL_INFO = {
  beginner: { icon: "🛡️", color: "emerald", xpRequired: 0, desc: "Perfect for newcomers" },
  intermediate: { icon: "⚔️", color: "blue", xpRequired: 500, desc: "For those who know the basics" },
  advanced: { icon: "🔥", color: "purple", xpRequired: 2000, desc: "Complex multi-step scenarios" },
  pro: { icon: "💀", color: "amber", xpRequired: 5000, desc: "Elite-level challenges" },
};

export default function Simulations() {
  const { user } = useStore();
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [levelProgress, setLevelProgress] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = {};
        if (levelFilter !== "all") params.level = levelFilter;
        if (categoryFilter !== "all") params.category = categoryFilter;

        const [simsRes, progressRes] = await Promise.all([
          simAPI.getAll({ ...params, limit: 100 }),
          simAPI.getLevelProgress(),
        ]);
        setSimulations(simsRes.data.simulations || []);
        setLevelProgress(progressRes.data.levelProgress || {});
      } catch (err) {
        console.error("Failed to load simulations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [levelFilter, categoryFilter]);

  const filteredSims = simulations.filter((sim) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return sim.title.toLowerCase().includes(q) || sim.description.toLowerCase().includes(q);
  });

  const isLevelLocked = (level) => {
    const lvlOrder = ["beginner", "intermediate", "advanced", "pro"];
    const userLvlIdx = lvlOrder.indexOf(user?.level || "beginner");
    const simLvlIdx = lvlOrder.indexOf(level);
    if (simLvlIdx <= userLvlIdx) return false;
    // Check if previous level is 10+ completed
    const prevLevel = lvlOrder[simLvlIdx - 1];
    return (levelProgress[prevLevel]?.completed || 0) < 10;
  };

  const groupedByLevel = LEVELS.filter((l) => l !== "all").reduce((acc, level) => {
    acc[level] = filteredSims.filter((s) => s.level === level);
    return acc;
  }, {});

  if (loading) return <LoadingSpinner message="Loading simulations..." />;

  return (
    <div className="min-h-screen bg-gray-950 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-2">
            Simulation <span className="text-cyan-400">Training Center</span>
          </h1>
          <p className="text-gray-400">40+ interactive cybersecurity scenarios across 4 difficulty levels</p>
        </div>

        {/* Level Progress Bars */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {LEVELS.filter((l) => l !== "all").map((level) => {
            const info = LEVEL_INFO[level];
            const progress = levelProgress[level] || { completed: 0, total: 0 };
            const locked = isLevelLocked(level);
            const colorMap = { emerald: "bg-emerald-500", blue: "bg-blue-500", purple: "bg-purple-500", amber: "bg-amber-500" };

            return (
              <div
                key={level}
                className={`bg-gray-900 border rounded-xl p-4 cursor-pointer transition-all ${
                  levelFilter === level ? "border-cyan-500/50 bg-gray-800" : "border-gray-800 hover:border-gray-700"
                } ${locked ? "opacity-60" : ""}`}
                onClick={() => setLevelFilter(levelFilter === level ? "all" : level)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span>{info.icon}</span>
                    <span className="text-white font-semibold text-sm capitalize">{level}</span>
                  </div>
                  {locked && <Lock className="w-3.5 h-3.5 text-gray-600" />}
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full ${colorMap[info.color]} rounded-full transition-all duration-500`}
                    style={{ width: `${progress.total ? (progress.completed / progress.total) * 100 : 0}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">{progress.completed}/{progress.total} completed</p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search simulations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-cyan-500 placeholder-gray-600 text-sm"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  categoryFilter === cat
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    : "bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-700"
                }`}
              >
                {CATEGORY_LABELS[cat] || cat}
              </button>
            ))}
          </div>
        </div>

        {/* Simulations by Level */}
        {levelFilter !== "all"
          ? (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSims.map((sim) => (
                  <SimulationCard
                    key={sim.id}
                    simulation={sim}
                    locked={isLevelLocked(sim.level)}
                  />
                ))}
              </div>
              {filteredSims.length === 0 && (
                <div className="text-center py-12 text-gray-500">No simulations match your filters</div>
              )}
            </div>
          )
          : (
            <div className="space-y-10">
              {LEVELS.filter((l) => l !== "all").map((level) => {
                const sims = groupedByLevel[level] || [];
                if (sims.length === 0 && searchQuery) return null;
                const locked = isLevelLocked(level);
                const info = LEVEL_INFO[level];
                const progress = levelProgress[level] || { completed: 0, total: 10 };

                return (
                  <div key={level}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{info.icon}</span>
                        <div>
                          <h2 className="text-white font-bold capitalize">{level} Level</h2>
                          <p className="text-gray-500 text-xs">{info.desc}</p>
                        </div>
                        {locked && (
                          <span className="flex items-center gap-1 bg-gray-800 text-gray-500 text-xs px-2 py-1 rounded-lg">
                            <Lock className="w-3 h-3" /> Complete previous level
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-gray-400 text-sm">{progress.completed}/{progress.total}</span>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {sims.map((sim) => (
                        <SimulationCard key={sim.id} simulation={sim} locked={locked} />
                      ))}
                      {sims.length === 0 && !searchQuery && (
                        <div className="col-span-full text-gray-600 text-sm py-4">
                          No simulations found for this level/category combination
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        }
      </div>
    </div>
  );
}
