import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    simulationId: {
      type: String,
      required: true,
    },
    score: { type: Number, default: 0 },
    maxScore: { type: Number, default: 100 },
    percentage: { type: Number, default: 0 },
    timeTaken: { type: Number, default: 0 },
    attempts: { type: Number, default: 1 },
    bestScore: { type: Number, default: 0 },
    answers: [
      {
        stepId: Number,
        answer: mongoose.Schema.Types.Mixed,
        isCorrect: Boolean,
        pointsEarned: Number,
      },
    ],
    xpEarned: { type: Number, default: 0 },
    grade: {
      type: String,
      enum: ["poor", "good", "excellent"],
      default: "poor",
    },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Ensure one record per user per simulation (with attempt tracking)
progressSchema.index({ userId: 1, simulationId: 1 });

export default mongoose.model("Progress", progressSchema);
