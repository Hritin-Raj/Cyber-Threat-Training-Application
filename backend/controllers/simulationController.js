import Simulation from "../models/Simulation.js";
import Progress from "../models/Progress.js";
import User from "../models/User.js";

const BADGES = {
  phishing: { id: "phishing_expert", name: "Phishing Expert", icon: "🎣", description: "Completed all phishing simulations" },
  password: { id: "password_master", name: "Secure Password Master", icon: "🔐", description: "Completed all password simulations" },
  malware: { id: "malware_hunter", name: "Malware Hunter", icon: "🦠", description: "Completed all malware simulations" },
  socialEngineering: { id: "social_defender", name: "Social Defender", icon: "🛡️", description: "Completed all social engineering simulations" },
  network: { id: "network_guardian", name: "Network Guardian", icon: "🌐", description: "Completed all network simulations" },
  privacy: { id: "privacy_champion", name: "Privacy Champion", icon: "👁️", description: "Completed all privacy simulations" },
  beginner_complete: { id: "beginner_grad", name: "Beginner Graduate", icon: "🎓", description: "Completed all beginner simulations" },
  intermediate_complete: { id: "intermediate_grad", name: "Intermediate Graduate", icon: "🏅", description: "Completed all intermediate simulations" },
  advanced_complete: { id: "advanced_grad", name: "Advanced Graduate", icon: "🥇", description: "Completed all advanced simulations" },
  pro_complete: { id: "cyber_guardian", name: "Cyber Guardian", icon: "⚔️", description: "Completed all pro simulations" },
  perfect_score: { id: "perfect_score", name: "Perfect Score", icon: "💯", description: "Achieved 100% on a simulation" },
  speed_demon: { id: "speed_demon", name: "Speed Demon", icon: "⚡", description: "Completed a simulation in under 60 seconds" },
};

const calculateGrade = (percentage) => {
  if (percentage >= 85) return "excellent";
  if (percentage >= 60) return "good";
  return "poor";
};

const calculateXP = (simulation, percentage, timeTaken) => {
  let xp = simulation.xpReward;
  if (percentage >= 85) xp = Math.floor(xp * 1.5);
  else if (percentage >= 60) xp = Math.floor(xp * 1.0);
  else xp = Math.floor(xp * 0.5);

  // Speed bonus (under 2 minutes)
  if (timeTaken < 120) xp += 20;

  return xp;
};

export const getSimulations = async (req, res) => {
  try {
    const { level, category, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };
    if (level) filter.level = level;
    if (category) filter.category = category;

    const simulations = await Simulation.find(filter)
      .select("-steps")
      .sort({ level: 1, order: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Simulation.countDocuments(filter);

    // If user is authenticated, add completion status
    let completionMap = {};
    if (req.user) {
      const user = await User.findById(req.user.id);
      completionMap = {};
      user.completedSimulations.forEach((cs) => {
        completionMap[cs.simulationId] = cs;
      });
    }

    const enriched = simulations.map((sim) => ({
      ...sim.toObject(),
      completed: !!completionMap[sim.id],
      userScore: completionMap[sim.id]?.score || null,
    }));

    res.json({
      success: true,
      simulations: enriched,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getSimulation = async (req, res) => {
  try {
    const simulation = await Simulation.findOne({ id: req.params.id, isActive: true });
    if (!simulation) {
      return res.status(404).json({ success: false, message: "Simulation not found" });
    }

    // Check level access
    if (req.user) {
      const user = await User.findById(req.user.id);
      const levelOrder = ["beginner", "intermediate", "advanced", "pro"];
      const userLevelIndex = levelOrder.indexOf(user.level);
      const simLevelIndex = levelOrder.indexOf(simulation.level);

      if (simLevelIndex > userLevelIndex) {
        // Check if they have unlocked it manually
        const levelSimulations = await Simulation.find({
          level: levelOrder[simLevelIndex - 1],
          isActive: true,
        }).select("id");

        const prevLevelIds = levelSimulations.map((s) => s.id);
        const completedPrevLevel = prevLevelIds.filter((id) =>
          user.completedSimulations.some((cs) => cs.simulationId === id)
        );

        if (completedPrevLevel.length < 10) {
          return res.status(403).json({
            success: false,
            message: `Complete ${10 - completedPrevLevel.length} more ${levelOrder[simLevelIndex - 1]} simulations to unlock this level`,
            locked: true,
          });
        }
      }
    }

    res.json({ success: true, simulation });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const submitSimulation = async (req, res) => {
  try {
    const { answers, timeTaken, score, maxScore } = req.body;
    const simulation = await Simulation.findOne({ id: req.params.id });

    if (!simulation) {
      return res.status(404).json({ success: false, message: "Simulation not found" });
    }

    const percentage = Math.round((score / maxScore) * 100);
    const grade = calculateGrade(percentage);
    const xpEarned = calculateXP(simulation, percentage, timeTaken);

    // Find or create progress record
    let progress = await Progress.findOne({
      userId: req.user.id,
      simulationId: req.params.id,
    });

    const isFirstCompletion = !progress;

    if (progress) {
      progress.attempts += 1;
      if (score > progress.bestScore) {
        progress.bestScore = score;
        progress.score = score;
        progress.percentage = percentage;
        progress.grade = grade;
        progress.xpEarned = xpEarned;
      }
      progress.answers = answers;
      progress.timeTaken = timeTaken;
      progress.completedAt = new Date();
    } else {
      progress = await Progress.create({
        userId: req.user.id,
        simulationId: req.params.id,
        score,
        maxScore,
        percentage,
        timeTaken,
        answers,
        xpEarned,
        grade,
        bestScore: score,
      });
    }

    await progress.save();

    // Update simulation stats
    await Simulation.findOneAndUpdate(
      { id: req.params.id },
      {
        $inc: { completionCount: 1 },
        averageScore: percentage,
      }
    );

    // Update user stats
    const user = await User.findById(req.user.id);
    const earnedBadges = [];

    // Only award XP for first completion or improvement
    if (isFirstCompletion || score > (user.completedSimulations.find((cs) => cs.simulationId === req.params.id)?.score || 0)) {
      if (isFirstCompletion) {
        user.xp += xpEarned;
        user.totalXp += xpEarned;
      }
    }

    // Update or add completed simulation record
    const existingIdx = user.completedSimulations.findIndex(
      (cs) => cs.simulationId === req.params.id
    );

    if (existingIdx >= 0) {
      if (score > user.completedSimulations[existingIdx].score) {
        user.completedSimulations[existingIdx].score = score;
        user.completedSimulations[existingIdx].completedAt = new Date();
        user.completedSimulations[existingIdx].timeTaken = timeTaken;
      }
    } else {
      user.completedSimulations.push({
        simulationId: req.params.id,
        score,
        maxScore,
        completedAt: new Date(),
        timeTaken,
      });
    }

    // Update accuracy by category
    const cat = simulation.category;
    if (user.accuracyByCategory[cat]) {
      user.accuracyByCategory[cat].total += 1;
      if (grade !== "poor") user.accuracyByCategory[cat].correct += 1;
    }

    // Check for perfect score badge
    if (percentage === 100 && !user.badges.find((b) => b.id === "perfect_score")) {
      user.badges.push(BADGES.perfect_score);
      earnedBadges.push(BADGES.perfect_score);
    }

    // Check speed badge
    if (timeTaken < 60 && !user.badges.find((b) => b.id === "speed_demon")) {
      user.badges.push(BADGES.speed_demon);
      earnedBadges.push(BADGES.speed_demon);
    }

    // Check category completion badges
    const categorySimulations = await Simulation.find({ category: cat, isActive: true }).select("id");
    const categoryIds = categorySimulations.map((s) => s.id);
    const completedCategoryCount = categoryIds.filter((id) =>
      user.completedSimulations.some((cs) => cs.simulationId === id)
    ).length;

    if (completedCategoryCount >= categoryIds.length) {
      const catBadge = BADGES[cat];
      if (catBadge && !user.badges.find((b) => b.id === catBadge.id)) {
        user.badges.push(catBadge);
        earnedBadges.push(catBadge);
      }
    }

    // Check level completion badges
    const levels = ["beginner", "intermediate", "advanced", "pro"];
    for (const lvl of levels) {
      const lvlSimulations = await Simulation.find({ level: lvl, isActive: true }).select("id");
      const lvlIds = lvlSimulations.map((s) => s.id);
      const completedLvlCount = lvlIds.filter((id) =>
        user.completedSimulations.some((cs) => cs.simulationId === id)
      ).length;

      if (completedLvlCount >= lvlIds.length) {
        const lvlBadge = BADGES[`${lvl}_complete`];
        if (lvlBadge && !user.badges.find((b) => b.id === lvlBadge.id)) {
          user.badges.push(lvlBadge);
          earnedBadges.push(lvlBadge);
        }
      }
    }

    // Recalculate level
    user.level = user.calculateLevel();
    await user.save();

    res.json({
      success: true,
      result: {
        score,
        maxScore,
        percentage,
        grade,
        xpEarned: isFirstCompletion ? xpEarned : 0,
        timeTaken,
        earnedBadges,
        newLevel: user.level,
        newTotalXp: user.totalXp,
        newXp: user.xp,
      },
      message:
        grade === "excellent"
          ? "Excellent work! Outstanding performance!"
          : grade === "good"
          ? "Good job! Keep practicing to master this topic."
          : "Keep practicing! Review the explanations to improve.",
    });
  } catch (error) {
    console.error("Submit error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getLevelProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const levels = ["beginner", "intermediate", "advanced", "pro"];
    const result = {};

    for (const level of levels) {
      const levelSims = await Simulation.find({ level, isActive: true }).select("id title category");
      const completed = levelSims.filter((s) =>
        user.completedSimulations.some((cs) => cs.simulationId === s.id)
      );

      result[level] = {
        total: levelSims.length,
        completed: completed.length,
        percentage: Math.round((completed.length / levelSims.length) * 100),
        unlocked: level === "beginner" || (() => {
          const prevLevel = levels[levels.indexOf(level) - 1];
          const prevLevelSims = [];
          return user.completedSimulations.length >= 10;
        })(),
      };
    }

    res.json({ success: true, levelProgress: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
