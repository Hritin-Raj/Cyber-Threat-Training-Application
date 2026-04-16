import Progress from "../models/Progress.js";
import User from "../models/User.js";
import Simulation from "../models/Simulation.js";

export const getUserProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const progressRecords = await Progress.find({ userId: req.user.id }).sort({ completedAt: -1 });

    const simIds = progressRecords.map((p) => p.simulationId);
    const simulations = await Simulation.find({ id: { $in: simIds } }).select("id title category level xpReward");
    const simMap = {};
    simulations.forEach((s) => (simMap[s.id] = s));

    // Category accuracy
    const categoryStats = {};
    const categories = ["phishing", "malware", "password", "socialEngineering", "network", "privacy"];
    categories.forEach((cat) => {
      const catRecords = progressRecords.filter((p) => simMap[p.simulationId]?.category === cat);
      if (catRecords.length > 0) {
        const avgScore = catRecords.reduce((sum, p) => sum + p.percentage, 0) / catRecords.length;
        categoryStats[cat] = {
          count: catRecords.length,
          avgScore: Math.round(avgScore),
          bestScore: Math.max(...catRecords.map((p) => p.percentage)),
        };
      }
    });

    // Weak areas (categories with avg score < 70)
    const weakAreas = Object.entries(categoryStats)
      .filter(([_, stats]) => stats.avgScore < 70)
      .map(([cat, stats]) => ({ category: cat, avgScore: stats.avgScore }))
      .sort((a, b) => a.avgScore - b.avgScore);

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentActivity = progressRecords
      .filter((p) => p.completedAt > sevenDaysAgo)
      .map((p) => ({
        simulationId: p.simulationId,
        title: simMap[p.simulationId]?.title || "Unknown",
        score: p.percentage,
        grade: p.grade,
        completedAt: p.completedAt,
      }));

    // XP level thresholds
    const xpThresholds = {
      beginner: { min: 0, max: 500 },
      intermediate: { min: 500, max: 2000 },
      advanced: { min: 2000, max: 5000 },
      pro: { min: 5000, max: 10000 },
    };
    const currentThreshold = xpThresholds[user.level];
    const xpInLevel = user.totalXp - currentThreshold.min;
    const xpNeeded = currentThreshold.max - currentThreshold.min;
    const levelProgress = Math.min(Math.round((xpInLevel / xpNeeded) * 100), 100);

    res.json({
      success: true,
      progress: {
        user: {
          username: user.username,
          level: user.level,
          xp: user.xp,
          totalXp: user.totalXp,
          streak: user.streak,
          badges: user.badges,
        },
        stats: {
          totalCompleted: user.completedSimulations.length,
          totalAttempts: progressRecords.reduce((sum, p) => sum + p.attempts, 0),
          averageScore: progressRecords.length
            ? Math.round(progressRecords.reduce((sum, p) => sum + p.percentage, 0) / progressRecords.length)
            : 0,
          excellentCount: progressRecords.filter((p) => p.grade === "excellent").length,
          xpInLevel,
          xpNeeded,
          levelProgress,
        },
        categoryStats,
        weakAreas,
        recentActivity,
        recentSimulations: progressRecords.slice(0, 10).map((p) => ({
          simulationId: p.simulationId,
          title: simMap[p.simulationId]?.title || "Unknown",
          category: simMap[p.simulationId]?.category,
          level: simMap[p.simulationId]?.level,
          score: p.percentage,
          grade: p.grade,
          attempts: p.attempts,
          completedAt: p.completedAt,
        })),
      },
    });
  } catch (error) {
    console.error("Progress error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getSimulationProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({
      userId: req.user.id,
      simulationId: req.params.simulationId,
    });

    if (!progress) {
      return res.json({ success: true, progress: null });
    }

    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
