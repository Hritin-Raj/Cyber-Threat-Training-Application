import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  id: String,
  text: String,
  isCorrect: { type: Boolean, default: false },
  explanation: String,
});

const stepSchema = new mongoose.Schema({
  id: Number,
  type: {
    type: String,
    enum: ["info", "question", "multiselect", "dragdrop", "input", "scenario"],
  },
  content: String,
  question: String,
  options: [optionSchema],
  correctAnswer: mongoose.Schema.Types.Mixed,
  explanation: String,
  points: { type: Number, default: 10 },
  hints: [String],
});

const simulationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["phishing", "malware", "password", "socialEngineering", "network", "privacy"],
      required: true,
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "pro"],
      required: true,
    },
    difficulty: { type: Number, min: 1, max: 5, default: 1 },
    maxScore: { type: Number, default: 100 },
    estimatedTime: { type: Number, default: 5 },
    xpReward: { type: Number, default: 50 },
    tags: [String],
    steps: [stepSchema],
    badge: {
      id: String,
      name: String,
      description: String,
      icon: String,
    },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    completionCount: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Simulation", simulationSchema);
