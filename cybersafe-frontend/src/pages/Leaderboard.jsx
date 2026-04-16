import { useState, useEffect } from "react";
import { leaderboardAPI } from "../services/api";
import useStore from "../store/useStore";
import LoadingSpinner from "../components/LoadingSpinner";
import { Trophy, Flame, Medal, Crown, Shield } from "lucide-react";

const LEVEL_COLORS = {
  beginner: "text-emerald-400 bg-emerald-400/10",
  intermediate: "text-blue-400 bg-blue-400/10",
  advanced: "text-purple-400 bg-purple-400/10",
  pro: "text-amber-400 bg-amber-400/10",
};

const RANK_ICONS = {
  1: <Crown className="w-5 h-5 text-amber-400" />,
  2: <Medal className="w-5 h-5 text-gray-400" />,
  3: <Medal className="w-5 h-5 text-amber-600" />,
};

export default function Leaderboard() {
  const { user } = useStore();
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await leaderboardAPI.get({ limit: 50 });
        setLeaderboard(data.leaderboard || []);
        setUserRank(data.userRank);
        setTotal(data.total || 0);
      } catch (err) {
        console.error("Leaderboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) return <LoadingSpinner message="Loading leaderboard..." />;

  const podium = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="min-h-screen bg-gray-950 pt-20 pb-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Trophy className="w-8 h-8 text-amber-400" />
            <h1 className="text-3xl font-black text-white">Global <span className="text-amber-400">Leaderboard</span></h1>
          </div>
          <p className="text-gray-400">{total.toLocaleString()} guardians competing worldwide</p>

          {/* Your Rank */}
          {userRank && (
            <div className="inline-flex items-center gap-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl px-6 py-3 mt-4">
              <span className="text-cyan-400 font-bold">Your Rank: #{userRank}</span>
              <span className="text-gray-500">•</span>
              <span className="text-yellow-400">⚡ {user?.totalXp?.toLocaleString()} XP</span>
            </div>
          )}
        </div>

        {/* Podium */}
        {podium.length >= 3 && (
          <div className="flex items-end justify-center gap-4 mb-10">
            {/* 2nd Place */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-400/20 to-gray-500/10 border border-gray-400/30 rounded-full flex items-center justify-center text-2xl font-black text-gray-300 mb-2">
                {podium[1]?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="text-center mb-2">
                <p className="text-white font-bold text-sm">{podium[1]?.username}</p>
                <p className="text-yellow-400 text-xs">⚡ {podium[1]?.totalXp?.toLocaleString()}</p>
              </div>
              <div className="w-20 h-24 bg-gradient-to-t from-gray-400/20 to-gray-400/10 border border-gray-400/20 rounded-t-lg flex items-center justify-center">
                <span className="text-3xl font-black text-gray-400">2</span>
              </div>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center">
              <Crown className="w-6 h-6 text-amber-400 mb-1" />
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400/30 to-yellow-500/10 border-2 border-amber-400/50 rounded-full flex items-center justify-center text-3xl font-black text-amber-300 mb-2">
                {podium[0]?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="text-center mb-2">
                <p className="text-white font-bold">{podium[0]?.username}</p>
                <p className="text-yellow-400 text-sm">⚡ {podium[0]?.totalXp?.toLocaleString()}</p>
              </div>
              <div className="w-24 h-36 bg-gradient-to-t from-amber-400/20 to-amber-400/10 border border-amber-400/30 rounded-t-lg flex items-center justify-center">
                <span className="text-4xl font-black text-amber-400">1</span>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-700/20 to-amber-800/10 border border-amber-700/30 rounded-full flex items-center justify-center text-2xl font-black text-amber-700 mb-2">
                {podium[2]?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="text-center mb-2">
                <p className="text-white font-bold text-sm">{podium[2]?.username}</p>
                <p className="text-yellow-400 text-xs">⚡ {podium[2]?.totalXp?.toLocaleString()}</p>
              </div>
              <div className="w-20 h-16 bg-gradient-to-t from-amber-700/20 to-amber-700/10 border border-amber-700/20 rounded-t-lg flex items-center justify-center">
                <span className="text-3xl font-black text-amber-700">3</span>
              </div>
            </div>
          </div>
        )}

        {/* Full Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-800 text-xs text-gray-500 font-semibold uppercase tracking-wider">
            <div className="col-span-1">Rank</div>
            <div className="col-span-4">Guardian</div>
            <div className="col-span-2 text-center">Level</div>
            <div className="col-span-2 text-center hidden sm:block">Simulations</div>
            <div className="col-span-2 text-center hidden sm:block">Badges</div>
            <div className="col-span-3 sm:col-span-1 text-right">XP</div>
          </div>

          {leaderboard.map((entry, index) => {
            const isCurrentUser = entry.username === user?.username;
            const rankNum = index + 1;

            return (
              <div
                key={entry.username}
                className={`grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-800/50 last:border-0 transition-colors ${
                  isCurrentUser
                    ? "bg-cyan-500/10 border-cyan-500/20"
                    : "hover:bg-gray-800/30"
                }`}
              >
                {/* Rank */}
                <div className="col-span-1 flex items-center">
                  {RANK_ICONS[rankNum] || (
                    <span className="text-gray-500 font-mono text-sm">{rankNum}</span>
                  )}
                </div>

                {/* User */}
                <div className="col-span-4 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                    isCurrentUser
                      ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white"
                      : "bg-gray-800 text-gray-300"
                  }`}>
                    {entry.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className={`font-semibold truncate text-sm ${isCurrentUser ? "text-cyan-400" : "text-white"}`}>
                      {entry.username} {isCurrentUser && <span className="text-xs text-gray-500">(you)</span>}
                    </p>
                    {entry.streak > 0 && (
                      <span className="text-xs text-orange-400 flex items-center gap-0.5">
                        <Flame className="w-3 h-3" /> {entry.streak}d
                      </span>
                    )}
                  </div>
                </div>

                {/* Level */}
                <div className="col-span-2 flex items-center justify-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${LEVEL_COLORS[entry.level] || ""}`}>
                    {entry.level}
                  </span>
                </div>

                {/* Simulations */}
                <div className="col-span-2 items-center justify-center text-gray-400 text-sm hidden sm:flex">
                  {entry.completedCount}
                </div>

                {/* Badges */}
                <div className="col-span-2 items-center justify-center text-gray-400 text-sm hidden sm:flex">
                  🏅 {entry.badgeCount}
                </div>

                {/* XP */}
                <div className="col-span-3 sm:col-span-1 flex items-center justify-end">
                  <span className="text-yellow-400 font-bold text-sm">
                    ⚡{entry.totalXp?.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}

          {leaderboard.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No guardians yet. Be the first!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
