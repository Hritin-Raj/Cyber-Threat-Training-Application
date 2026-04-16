import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { progressAPI, simAPI } from "../services/api";
import useStore from "../store/useStore";
import XPBar from "../components/XPBar";
import StatCard from "../components/StatCard";
import { BadgeGrid } from "../components/BadgeCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { ChevronRight, Flame, Target, BarChart3, AlertTriangle } from "lucide-react";

const LEVEL_CONFIG = {
  beginner: { color: "from-emerald-500/20 to-teal-500/10", border: "border-emerald-500/30", text: "text-emerald-400", icon: "🛡️" },
  intermediate: { color: "from-blue-500/20 to-cyan-500/10", border: "border-blue-500/30", text: "text-blue-400", icon: "⚔️" },
  advanced: { color: "from-purple-500/20 to-pink-500/10", border: "border-purple-500/30", text: "text-purple-400", icon: "🔥" },
  pro: { color: "from-amber-500/20 to-yellow-500/10", border: "border-amber-500/30", text: "text-amber-400", icon: "💀" },
};

const CATEGORY_LABELS = {
  phishing: "Phishing",
  malware: "Malware",
  password: "Passwords",
  socialEngineering: "Social Eng.",
  network: "Network",
  privacy: "Privacy",
};

export default function Dashboard() {
  const { user } = useStore();
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const progressRes = await progressAPI.getUserProgress();
        setProgressData(progressRes.data.progress);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner message="Loading your dashboard..." />;

  const lvlConfig = LEVEL_CONFIG[user?.level] || LEVEL_CONFIG.beginner;
  const stats = progressData?.stats || {};
  const weeklyStreak = user?.streak || 0;

  return (
    <div className="min-h-screen bg-gray-950 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Hero Banner */}
        <div className={`bg-gradient-to-r ${lvlConfig.color} border ${lvlConfig.border} rounded-2xl p-6 sm:p-8`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{lvlConfig.icon}</span>
                <div>
                  <h1 className="text-2xl font-black text-white">
                    Welcome back, <span className={lvlConfig.text}>{user?.username}</span>!
                  </h1>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`capitalize text-sm font-semibold ${lvlConfig.text}`}>{user?.level} Level</span>
                    {weeklyStreak > 0 && (
                      <span className="flex items-center gap-1 text-orange-400 text-sm">
                        <Flame className="w-4 h-4" /> {weeklyStreak} day streak
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4 max-w-sm">
                <p className="text-sm text-gray-400 mb-2">Level Progress</p>
                <XPBar totalXp={user?.totalXp || 0} level={user?.level || "beginner"} />
              </div>
            </div>
            <div className="text-center bg-gray-900/50 rounded-xl p-4 min-w-[140px]">
              <div className="text-4xl font-black text-yellow-400">⚡ {user?.totalXp?.toLocaleString() || 0}</div>
              <div className="text-gray-400 text-sm mt-1">Total XP Earned</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="🎯" label="Completed" value={stats.totalCompleted || 0} sub="simulations" color="cyan" />
          <StatCard icon="📊" label="Avg Score" value={`${stats.averageScore || 0}%`} sub="across all sims" color="emerald" />
          <StatCard icon="🏆" label="Excellent" value={stats.excellentCount || 0} sub="85%+ scores" color="amber" />
          <StatCard icon="🏅" label="Badges" value={user?.badges?.length || 0} sub="earned" color="purple" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Weak Areas */}
            {progressData?.weakAreas?.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <h2 className="text-white font-bold">Areas Needing Improvement</h2>
                </div>
                <div className="space-y-3">
                  {progressData.weakAreas.map((area) => (
                    <div key={area.category} className="flex items-center gap-3">
                      <span className="text-gray-400 text-sm w-28 capitalize">
                        {CATEGORY_LABELS[area.category] || area.category}
                      </span>
                      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-500"
                          style={{ width: `${area.avgScore}%` }}
                        />
                      </div>
                      <span className="text-orange-400 text-sm font-medium w-10 text-right">{area.avgScore}%</span>
                    </div>
                  ))}
                </div>
                <Link to="/simulations" className="inline-flex items-center gap-1 text-cyan-400 text-sm font-medium mt-4 hover:text-cyan-300">
                  Practice these areas <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* Category Accuracy */}
            {progressData?.categoryStats && Object.keys(progressData.categoryStats).length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-white font-bold">Accuracy by Category</h2>
                </div>
                <div className="space-y-3">
                  {Object.entries(progressData.categoryStats).map(([cat, catStats]) => (
                    <div key={cat} className="flex items-center gap-3">
                      <span className="text-gray-400 text-sm w-28">{CATEGORY_LABELS[cat] || cat}</span>
                      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            catStats.avgScore >= 80 ? "bg-gradient-to-r from-emerald-500 to-teal-400" :
                            catStats.avgScore >= 60 ? "bg-gradient-to-r from-blue-500 to-cyan-400" :
                            "bg-gradient-to-r from-red-500 to-orange-400"
                          }`}
                          style={{ width: `${catStats.avgScore}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-1 w-20 justify-end">
                        <span className="text-white text-sm font-medium">{catStats.avgScore}%</span>
                        <span className="text-gray-500 text-xs">({catStats.count})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            {progressData?.recentActivity?.length > 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h2 className="text-white font-bold mb-4">Recent Activity</h2>
                <div className="space-y-3">
                  {progressData.recentActivity.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                      <div>
                        <p className="text-white text-sm font-medium">{item.title}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{new Date(item.completedAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-sm font-bold ${
                        item.grade === "excellent" ? "text-emerald-400" :
                        item.grade === "good" ? "text-blue-400" : "text-red-400"
                      }`}>{item.score}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
                <div className="text-5xl mb-4">🎮</div>
                <h3 className="text-white font-bold mb-2">Start Your First Simulation</h3>
                <p className="text-gray-400 text-sm mb-4">Complete simulations to track your progress and earn XP!</p>
                <Link to="/simulations" className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold px-6 py-2.5 rounded-xl transition-colors text-sm">
                  Browse Simulations <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold">Badges</h2>
                <Link to="/profile" className="text-cyan-400 text-xs hover:text-cyan-300">View all</Link>
              </div>
              <BadgeGrid badges={user?.badges || []} limit={6} />
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-white font-bold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                {[
                  { to: "/simulations",        emoji: "🎮", label: "Continue Training" },
                  { to: "/visual-simulations", emoji: "🧪", label: "Visual Sim Lab (New)" },
                  { to: "/learn",              emoji: "📚", label: "Read Latest Threats" },
                  { to: "/leaderboard",        emoji: "🏆", label: "View Leaderboard" },
                ].map(({ to, emoji, label }) => (
                  <Link key={to} to={to} className="flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-750 rounded-lg transition-colors group">
                    <div className="flex items-center gap-2">
                      <span>{emoji}</span>
                      <span className="text-sm text-gray-300 group-hover:text-white">{label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-cyan-400" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Daily Goal */}
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/20 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-cyan-400" />
                <h2 className="text-white font-bold">Daily Goal</h2>
              </div>
              <p className="text-gray-400 text-sm mb-3">Complete 3 simulations today</p>
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`flex-1 h-2 rounded-full ${i <= Math.min(progressData?.recentActivity?.length || 0, 3) ? "bg-cyan-400" : "bg-gray-700"}`} />
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">{Math.min(progressData?.recentActivity?.length || 0, 3)}/3 today</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
