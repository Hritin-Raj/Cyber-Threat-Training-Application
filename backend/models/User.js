import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const badgeSchema = new mongoose.Schema({
  id: String,
  name: String,
  description: String,
  icon: String,
  earnedAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [20, "Username cannot exceed 20 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    avatar: {
      type: String,
      default: "",
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "pro"],
      default: "beginner",
    },
    xp: {
      type: Number,
      default: 0,
    },
    totalXp: {
      type: Number,
      default: 0,
    },
    streak: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: Date,
      default: Date.now,
    },
    completedSimulations: [
      {
        simulationId: String,
        score: Number,
        maxScore: Number,
        completedAt: { type: Date, default: Date.now },
        timeTaken: Number,
      },
    ],
    badges: [badgeSchema],
    accuracyByCategory: {
      phishing: { correct: { type: Number, default: 0 }, total: { type: Number, default: 0 } },
      malware: { correct: { type: Number, default: 0 }, total: { type: Number, default: 0 } },
      password: { correct: { type: Number, default: 0 }, total: { type: Number, default: 0 } },
      socialEngineering: { correct: { type: Number, default: 0 }, total: { type: Number, default: 0 } },
      network: { correct: { type: Number, default: 0 }, total: { type: Number, default: 0 } },
      privacy: { correct: { type: Number, default: 0 }, total: { type: Number, default: 0 } },
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update streak method
userSchema.methods.updateStreak = function () {
  const now = new Date();
  const last = new Date(this.lastActiveDate);
  const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    this.streak += 1;
  } else if (diffDays > 1) {
    this.streak = 1;
  }
  this.lastActiveDate = now;
};

// Get level based on XP
userSchema.methods.calculateLevel = function () {
  const xp = this.totalXp;
  if (xp >= 5000) return "pro";
  if (xp >= 2000) return "advanced";
  if (xp >= 500) return "intermediate";
  return "beginner";
};

// Virtual for rank
userSchema.virtual("rank").get(function () {
  const xp = this.totalXp;
  if (xp >= 5000) return "Cyber Guardian";
  if (xp >= 2000) return "Security Analyst";
  if (xp >= 500) return "Security Trainee";
  return "Recruit";
});

export default mongoose.model("User", userSchema);
