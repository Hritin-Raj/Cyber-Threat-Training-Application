const LEVEL_THRESHOLDS = {
  beginner: { min: 0, max: 500, next: "intermediate", color: "from-emerald-500 to-teal-400" },
  intermediate: { min: 500, max: 2000, next: "advanced", color: "from-blue-500 to-cyan-400" },
  advanced: { min: 2000, max: 5000, next: "pro", color: "from-purple-500 to-pink-400" },
  pro: { min: 5000, max: 10000, next: null, color: "from-amber-500 to-yellow-400" },
};

export default function XPBar({ totalXp, level, compact = false }) {
  const threshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS.beginner;
  const xpInLevel = Math.max(0, totalXp - threshold.min);
  const xpNeeded = threshold.max - threshold.min;
  const percentage = Math.min(Math.round((xpInLevel / xpNeeded) * 100), 100);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${threshold.color} rounded-full transition-all duration-700`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs text-gray-400">{percentage}%</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-400">
          {xpInLevel.toLocaleString()} / {xpNeeded.toLocaleString()} XP
        </span>
        {threshold.next && (
          <span className="text-gray-500">Next: <span className="capitalize text-gray-300">{threshold.next}</span></span>
        )}
        {!threshold.next && (
          <span className="text-amber-400 font-bold">MAX LEVEL</span>
        )}
      </div>
      <div className="h-3 bg-gray-700/50 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${threshold.color} rounded-full transition-all duration-700 relative`}
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 animate-pulse opacity-40 bg-white rounded-full" />
        </div>
      </div>
      <div className="text-center text-xs text-gray-500">{percentage}% to next level</div>
    </div>
  );
}
