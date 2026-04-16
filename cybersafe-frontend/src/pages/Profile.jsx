import { useState, useEffect } from "react";
import { progressAPI, authAPI } from "../services/api";
import useStore from "../store/useStore";
import XPBar from "../components/XPBar";
import { BadgeGrid } from "../components/BadgeCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { User, Edit3, Save, X, Flame, Calendar, Target, BarChart3 } from "lucide-react";

const LEVEL_COLORS = {
  beginner: "text-emerald-400",
  intermediate: "text-blue-400",
  advanced: "text-purple-400",
  pro: "text-amber-400",
};

const RANK_BY_LEVEL = {
  beginner: "Recruit",
  intermediate: "Security Trainee",
  advanced: "Security Analyst",
  pro: "Cyber Guardian",
};

const CATEGORY_LABELS = {
  phishing: "Phishing",
  malware: "Malware",
  password: "Passwords",
  socialEngineering: "Social Engineering",
  network: "Network",
  privacy: "Privacy",
};

export default function Profile() {
  const { user, updateUser } = useStore();
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const { data } = await progressAPI.getUserProgress();
        setProgressData(data.progress);
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  const handleSaveProfile = async () => {
    if (!newUsername.trim() || newUsername === user?.username) {
      setEditing(false);
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      const { data } = await authAPI.updateProfile({ username: newUsername });
      if (data.success) {
        updateUser({ username: newUsername });
        setEditing(false);
      }
    } catch (err) {
      setSaveError(err.response?.data?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading profile..." />;

  const lvlColor = LEVEL_COLORS[user?.level] || LEVEL_COLORS.beginner;
  const rank = RANK_BY_LEVEL[user?.level] || "Recruit";
  const stats = progressData?.stats || {};
  const joinDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" }) : "Recently";

  return (
    <div className="min-h-screen bg-gray-950 pt-20 pb-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">

        {/* Profile Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-cyan-500/20">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className={`absolute -bottom-1 -right-1 text-xl`}>
                {user?.level === "pro" ? "💀" : user?.level === "advanced" ? "🔥" : user?.level === "intermediate" ? "⚔️" : "🛡️"}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              {editing ? (
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-1.5 text-lg font-bold focus:outline-none focus:border-cyan-500"
                    maxLength={20}
                    minLength={3}
                  />
                  <button onClick={handleSaveProfile} disabled={saving} className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30">
                    <Save className="w-4 h-4" />
                  </button>
                  <button onClick={() => { setEditing(false); setNewUsername(user?.username || ""); }} className="p-1.5 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700">
                    <X className="w-4 h-4" />
                  </button>
                  {saveError && <p className="text-red-400 text-xs">{saveError}</p>}
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-black text-white">{user?.username}</h1>
                  <button onClick={() => setEditing(true)} className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-3 flex-wrap">
                <span className={`font-semibold capitalize text-lg ${lvlColor}`}>{user?.level}</span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-400">{rank}</span>
                {user?.streak > 0 && (
                  <>
                    <span className="text-gray-600">•</span>
                    <span className="flex items-center gap-1 text-orange-400">
                      <Flame className="w-4 h-4" /> {user.streak} day streak
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> Joined {joinDate}
                </span>
                <span className="text-yellow-400 font-bold">⚡ {user?.totalXp?.toLocaleString()} XP</span>
              </div>
            </div>
          </div>

          {/* XP Bar */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <p className="text-gray-400 text-sm mb-3">Progress to next level</p>
            <XPBar totalXp={user?.totalXp || 0} level={user?.level || "beginner"} />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: "🎯", label: "Completed", value: stats.totalCompleted || 0, color: "text-cyan-400" },
            { icon: "📊", label: "Avg Score", value: `${stats.averageScore || 0}%`, color: "text-emerald-400" },
            { icon: "🏆", label: "Excellent", value: stats.excellentCount || 0, color: "text-amber-400" },
            { icon: "🏅", label: "Badges", value: user?.badges?.length || 0, color: "text-purple-400" },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-gray-500 text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Badges */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-white font-bold mb-6 flex items-center gap-2">
              🏅 Badges Earned ({user?.badges?.length || 0})
            </h2>
            <BadgeGrid badges={user?.badges || []} />
          </div>

          {/* Category Stats */}
          {progressData?.categoryStats && Object.keys(progressData.categoryStats).length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-bold mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" /> Category Performance
              </h2>
              <div className="space-y-4">
                {Object.entries(progressData.categoryStats).map(([cat, catStats]) => (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">{CATEGORY_LABELS[cat] || cat}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-xs">{catStats.count} attempts</span>
                        <span className={`font-bold ${catStats.avgScore >= 80 ? "text-emerald-400" : catStats.avgScore >= 60 ? "text-blue-400" : "text-red-400"}`}>
                          {catStats.avgScore}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          catStats.avgScore >= 80 ? "bg-gradient-to-r from-emerald-500 to-teal-400" :
                          catStats.avgScore >= 60 ? "bg-gradient-to-r from-blue-500 to-cyan-400" :
                          "bg-gradient-to-r from-red-500 to-orange-400"
                        }`}
                        style={{ width: `${catStats.avgScore}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent Simulations */}
        {progressData?.recentSimulations && progressData.recentSimulations.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-white font-bold mb-4">Recent Simulations</h2>
            <div className="space-y-3">
              {progressData.recentSimulations.map((sim, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
                  <div>
                    <p className="text-white font-medium text-sm">{sim.title}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      <span className="capitalize">{sim.level}</span>
                      <span>•</span>
                      <span>{sim.attempts} attempt{sim.attempts !== 1 ? "s" : ""}</span>
                      <span>•</span>
                      <span>{new Date(sim.completedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className={`font-bold text-sm ${
                    sim.grade === "excellent" ? "text-emerald-400" :
                    sim.grade === "good" ? "text-blue-400" : "text-red-400"
                  }`}>
                    {sim.score}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
