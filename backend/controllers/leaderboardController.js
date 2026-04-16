import User from "../models/User.js";

export const getLeaderboard = async (req, res) => {
  try {
    const { timeframe = "all", limit = 50 } = req.query;

    const users = await User.find({})
      .select("username totalXp level badges completedSimulations streak createdAt")
      .sort({ totalXp: -1 })
      .limit(Number(limit));

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      totalXp: user.totalXp,
      level: user.level,
      badgeCount: user.badges.length,
      completedCount: user.completedSimulations.length,
      streak: user.streak,
      joinedAt: user.createdAt,
    }));

    // Find current user's rank
    let userRank = null;
    if (req.user) {
      const userIdx = leaderboard.findIndex(
        (u) => u.username === req.user.username
      );
      if (userIdx >= 0) {
        userRank = userIdx + 1;
      } else {
        // User not in top N, find their actual rank
        const betterCount = await User.countDocuments({
          totalXp: { $gt: req.user.totalXp },
        });
        userRank = betterCount + 1;
      }
    }

    res.json({
      success: true,
      leaderboard,
      userRank,
      total: await User.countDocuments(),
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
