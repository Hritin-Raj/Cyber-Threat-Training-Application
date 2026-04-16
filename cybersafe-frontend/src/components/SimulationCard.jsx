import { Link } from "react-router-dom";
import { Clock, Star, Lock, CheckCircle2, ChevronRight, Zap } from "lucide-react";

const CATEGORY_CONFIG = {
  phishing: { label: "Phishing", color: "text-red-400 bg-red-400/10 border-red-400/20", icon: "🎣" },
  malware: { label: "Malware", color: "text-orange-400 bg-orange-400/10 border-orange-400/20", icon: "🦠" },
  password: { label: "Password", color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: "🔑" },
  socialEngineering: { label: "Social Eng.", color: "text-purple-400 bg-purple-400/10 border-purple-400/20", icon: "🎭" },
  network: { label: "Network", color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20", icon: "🌐" },
  privacy: { label: "Privacy", color: "text-green-400 bg-green-400/10 border-green-400/20", icon: "👁️" },
};

const LEVEL_CONFIG = {
  beginner: { color: "text-emerald-400", bg: "bg-emerald-400/10" },
  intermediate: { color: "text-blue-400", bg: "bg-blue-400/10" },
  advanced: { color: "text-purple-400", bg: "bg-purple-400/10" },
  pro: { color: "text-amber-400", bg: "bg-amber-400/10" },
};

const GRADE_COLORS = {
  excellent: "text-emerald-400",
  good: "text-blue-400",
  poor: "text-red-400",
};

export default function SimulationCard({ simulation, locked = false }) {
  const cat = CATEGORY_CONFIG[simulation.category] || CATEGORY_CONFIG.network;
  const lvl = LEVEL_CONFIG[simulation.level] || LEVEL_CONFIG.beginner;

  const content = (
    <div
      className={`relative bg-gray-900 border rounded-xl p-5 transition-all duration-200 group ${
        locked
          ? "border-gray-800 opacity-60 cursor-not-allowed"
          : simulation.completed
          ? "border-emerald-500/30 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5 cursor-pointer"
          : "border-gray-800 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/5 cursor-pointer"
      }`}
    >
      {/* Completion indicator */}
      {simulation.completed && (
        <div className="absolute top-3 right-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        </div>
      )}
      {locked && (
        <div className="absolute top-3 right-3">
          <Lock className="w-5 h-5 text-gray-600" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`text-2xl w-10 h-10 rounded-lg border ${cat.color} flex items-center justify-center flex-shrink-0`}>
          {cat.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm leading-tight group-hover:text-cyan-300 transition-colors">
            {simulation.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full border ${cat.color}`}>
              {cat.label}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${lvl.color} ${lvl.bg}`}>
              {simulation.level}
            </span>
          </div>
        </div>
      </div>

      <p className="text-gray-400 text-xs leading-relaxed mb-4 line-clamp-2">
        {simulation.description}
      </p>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {simulation.estimatedTime}min
          </span>
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-yellow-400">+{simulation.xpReward} XP</span>
          </span>
        </div>

        {/* Difficulty stars */}
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-3 h-3 ${star <= simulation.difficulty ? "text-amber-400 fill-amber-400" : "text-gray-700"}`}
            />
          ))}
        </div>
      </div>

      {/* User score if completed */}
      {simulation.completed && simulation.userScore !== null && (
        <div className="mt-3 pt-3 border-t border-gray-800 flex items-center justify-between">
          <span className="text-xs text-gray-500">Best score</span>
          <span className={`text-sm font-bold ${GRADE_COLORS[simulation.grade] || "text-gray-400"}`}>
            {simulation.userScore}%
          </span>
        </div>
      )}

      {!locked && (
        <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="w-4 h-4 text-cyan-400" />
        </div>
      )}
    </div>
  );

  if (locked) return content;

  return <Link to={`/simulations/${simulation.id}`}>{content}</Link>;
}
