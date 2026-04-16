export default function StatCard({ icon, label, value, sub, color = "cyan", trend }) {
  const colors = {
    cyan: "from-cyan-500/20 to-cyan-600/5 border-cyan-500/20 text-cyan-400",
    emerald: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400",
    purple: "from-purple-500/20 to-purple-600/5 border-purple-500/20 text-purple-400",
    amber: "from-amber-500/20 to-amber-600/5 border-amber-500/20 text-amber-400",
    blue: "from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400",
    red: "from-red-500/20 to-red-600/5 border-red-500/20 text-red-400",
  };
  const colorClass = colors[color] || colors.cyan;

  return (
    <div className={`bg-gradient-to-br ${colorClass} border rounded-xl p-5`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{label}</p>
          <p className="text-white text-2xl font-bold">{value}</p>
          {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
      {trend !== undefined && (
        <div className={`mt-2 text-xs flex items-center gap-1 ${trend >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          <span>{trend >= 0 ? "↑" : "↓"}</span>
          <span>{Math.abs(trend)}% from last week</span>
        </div>
      )}
    </div>
  );
}
