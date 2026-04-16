import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { simAPI } from "../services/api";
import useStore from "../store/useStore";
import LoadingSpinner from "../components/LoadingSpinner";
import { BadgeGrid } from "../components/BadgeCard";
import {
  ArrowLeft, Clock, Zap, CheckCircle, XCircle, ChevronRight, Star,
  AlertCircle, Trophy, RotateCcw, Home, BookOpen, Shield
} from "lucide-react";

const GRADE_CONFIG = {
  excellent: { label: "Excellent!", color: "text-emerald-400", bg: "bg-emerald-500/20 border-emerald-500/30", icon: "🏆", stars: 3 },
  good: { label: "Good Job!", color: "text-blue-400", bg: "bg-blue-500/20 border-blue-500/30", icon: "🥈", stars: 2 },
  poor: { label: "Keep Practicing", color: "text-red-400", bg: "bg-red-500/20 border-red-500/30", icon: "📚", stars: 1 },
};

export default function SimulationPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateUser } = useStore();

  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [stepAnswers, setStepAnswers] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [earnedXP, setEarnedXP] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const startTimeRef = useRef(Date.now());
  const stepStartRef = useRef(Date.now());

  useEffect(() => {
    const fetchSim = async () => {
      try {
        const { data } = await simAPI.getOne(id);
        setSimulation(data.simulation);
        startTimeRef.current = Date.now();
      } catch (err) {
        if (err.response?.data?.locked) {
          setError(err.response.data.message);
        } else {
          setError("Simulation not found");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSim();
  }, [id]);

  if (loading) return <LoadingSpinner message="Loading simulation..." />;
  if (error) return (
    <div className="min-h-screen bg-gray-950 pt-20 flex items-center justify-center">
      <div className="text-center p-8">
        <Shield className="w-16 h-16 text-gray-700 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Access Restricted</h2>
        <p className="text-gray-400 mb-6">{error}</p>
        <Link to="/simulations" className="bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold px-6 py-2.5 rounded-xl">
          Back to Simulations
        </Link>
      </div>
    </div>
  );
  if (!simulation) return null;

  const steps = simulation.steps.filter((s) => s.type !== "scenario" || s.content);
  const interactiveSteps = steps.filter((s) => s.type !== "info");
  const totalSteps = steps.length;
  const step = steps[currentStep];

  const getProgress = () => Math.round((currentStep / totalSteps) * 100);

  const handleSingleAnswer = (optionId) => {
    if (showFeedback) return;
    setCurrentAnswer(optionId);
  };

  const handleMultiAnswer = (optionId) => {
    if (showFeedback) return;
    const current = Array.isArray(currentAnswer) ? currentAnswer : [];
    if (current.includes(optionId)) {
      setCurrentAnswer(current.filter((a) => a !== optionId));
    } else {
      setCurrentAnswer([...current, optionId]);
    }
  };

  const isCorrect = () => {
    if (!step || !step.correctAnswer) return true;
    if (step.type === "multiselect") {
      const correct = [...step.correctAnswer].sort().join(",");
      const given = [...(currentAnswer || [])].sort().join(",");
      return correct === given;
    }
    if (step.type === "input") {
      return textInput.toLowerCase().trim() === String(step.correctAnswer).toLowerCase().trim();
    }
    return currentAnswer === step.correctAnswer;
  };

  const getPointsEarned = () => {
    if (!step?.points) return 0;
    if (step.type === "scenario" || step.type === "info") return 0;
    // Partial credit for multi-select
    if (step.type === "multiselect" && Array.isArray(step.correctAnswer)) {
      const correct = step.correctAnswer.filter((a) => (currentAnswer || []).includes(a)).length;
      const incorrect = (currentAnswer || []).filter((a) => !step.correctAnswer.includes(a)).length;
      const ratio = Math.max(0, (correct - incorrect) / step.correctAnswer.length);
      return Math.round(step.points * ratio);
    }
    return isCorrect() ? step.points : 0;
  };

  const submitAnswer = () => {
    if (step.type === "scenario" || step.type === "info") {
      nextStep();
      return;
    }
    if (currentAnswer === null && step.type !== "input") return;
    if (step.type === "input" && !textInput.trim()) return;

    const pts = getPointsEarned();
    const correct = isCorrect();

    setStepAnswers((prev) => ({
      ...prev,
      [step.id]: {
        stepId: step.id,
        answer: step.type === "input" ? textInput : currentAnswer,
        isCorrect: correct,
        pointsEarned: pts,
      },
    }));

    setAnswers((prev) => ({ ...prev, [step.id]: pts }));
    setShowFeedback(true);
  };

  const nextStep = () => {
    setShowFeedback(false);
    setCurrentAnswer(null);
    setTextInput("");
    stepStartRef.current = Date.now();

    if (currentStep + 1 >= totalSteps) {
      finishSimulation();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const finishSimulation = async () => {
    setSubmitting(true);
    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const totalScore = Object.values(answers).reduce((sum, pts) => sum + pts, 0);
    const maxScore = simulation.maxScore || 100;
    const answersArray = Object.values(stepAnswers);

    try {
      const { data } = await simAPI.submit(id, {
        answers: answersArray,
        timeTaken,
        score: totalScore,
        maxScore,
      });
      setResult(data.result);
      setEarnedXP(data.result.xpEarned || 0);
      setEarnedBadges(data.result.earnedBadges || []);

      if (data.result.xpEarned > 0) {
        updateUser({
          xp: data.result.newXp,
          totalXp: data.result.newTotalXp,
          level: data.result.newLevel,
        });
      }
    } catch (err) {
      console.error("Submit failed:", err);
      setResult({
        score: totalScore,
        maxScore,
        percentage: Math.round((totalScore / maxScore) * 100),
        grade: totalScore >= 85 ? "excellent" : totalScore >= 60 ? "good" : "poor",
        xpEarned: 0,
        timeTaken,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Results Screen
  if (result) {
    const grade = GRADE_CONFIG[result.grade] || GRADE_CONFIG.poor;
    return (
      <div className="min-h-screen bg-gray-950 pt-20 pb-10 flex items-center justify-center">
        <div className="max-w-xl w-full mx-4">
          <div className={`bg-gray-900 border ${grade.bg} rounded-2xl p-8 text-center`}>
            {/* Grade Icon */}
            <div className="text-6xl mb-4">{grade.icon}</div>

            {/* Stars */}
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3].map((star) => (
                <Star
                  key={star}
                  className={`w-8 h-8 transition-all duration-500 ${
                    star <= grade.stars ? "text-amber-400 fill-amber-400" : "text-gray-700"
                  }`}
                />
              ))}
            </div>

            <h2 className={`text-3xl font-black mb-1 ${grade.color}`}>{grade.label}</h2>
            <p className="text-gray-400 mb-6">{simulation.title}</p>

            {/* Score */}
            <div className="bg-gray-800 rounded-xl p-6 mb-6">
              <div className="text-5xl font-black text-white mb-1">{result.percentage}%</div>
              <div className="text-gray-500 text-sm">
                {result.score} / {result.maxScore} points • {Math.floor(result.timeTaken / 60)}:{String(result.timeTaken % 60).padStart(2, "0")} time
              </div>
            </div>

            {/* XP Earned */}
            {earnedXP > 0 && (
              <div className="flex items-center justify-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-4">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-bold text-lg">+{earnedXP} XP Earned!</span>
              </div>
            )}

            {/* Badges */}
            {earnedBadges.length > 0 && (
              <div className="mb-6">
                <h3 className="text-white font-bold mb-3">🏅 New Badges Unlocked!</h3>
                <BadgeGrid badges={earnedBadges} />
              </div>
            )}

            {/* Grade Thresholds */}
            <div className="grid grid-cols-3 gap-2 mb-6 text-xs">
              <div className={`p-2 rounded-lg ${result.percentage < 60 ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-gray-800 text-gray-500"}`}>
                Poor<br />{"<60%"}
              </div>
              <div className={`p-2 rounded-lg ${result.percentage >= 60 && result.percentage < 85 ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-gray-800 text-gray-500"}`}>
                Good<br />60-84%
              </div>
              <div className={`p-2 rounded-lg ${result.percentage >= 85 ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-gray-800 text-gray-500"}`}>
                Excellent<br />85%+
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setResult(null);
                  setCurrentStep(0);
                  setAnswers({});
                  setStepAnswers({});
                  setCurrentAnswer(null);
                  setTextInput("");
                  setShowFeedback(false);
                  startTimeRef.current = Date.now();
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Try Again
              </button>
              <Link
                to="/simulations"
                className="flex-1 flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold py-3 rounded-xl transition-colors"
              >
                <Home className="w-4 h-4" /> More Simulations
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (submitting) return <LoadingSpinner message="Calculating your score..." />;

  return (
    <div className="min-h-screen bg-gray-950 pt-20 pb-10">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/simulations" className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-white font-bold text-lg">{simulation.title}</h1>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {simulation.estimatedTime}min</span>
              <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-yellow-400" /><span className="text-yellow-400">+{simulation.xpReward} XP</span></span>
              <span className="capitalize">{simulation.level}</span>
            </div>
          </div>
          <div className="text-right text-sm">
            <div className="text-white font-bold">{currentStep + 1} / {totalSteps}</div>
            <div className="text-gray-500 text-xs">steps</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-gray-800 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${getProgress()}%` }}
          />
        </div>

        {/* Step Content */}
        {step && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            {/* Scenario/Context */}
            {step.content && (
              <div className="bg-gray-800/50 border-b border-gray-800 p-6">
                {step.type === "scenario" && (
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold mb-3 uppercase tracking-wider">
                    <BookOpen className="w-4 h-4" /> Scenario
                  </div>
                )}
                <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                  {step.content}
                </pre>
              </div>
            )}

            <div className="p-6">
              {/* Question */}
              {step.question && (
                <h3 className="text-white font-semibold text-lg mb-6 leading-snug">{step.question}</h3>
              )}

              {/* Answer UI based on step type */}
              {(step.type === "question" || step.type === "scenario") && step.options?.length > 0 && (
                <div className="space-y-3">
                  {step.options.map((opt) => {
                    const isSelected = currentAnswer === opt.id;
                    const isCorrectOpt = opt.isCorrect;
                    let className = "w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start gap-3 ";

                    if (showFeedback) {
                      if (isCorrectOpt) {
                        className += "border-emerald-500/50 bg-emerald-500/10 text-white";
                      } else if (isSelected && !isCorrectOpt) {
                        className += "border-red-500/50 bg-red-500/10 text-white";
                      } else {
                        className += "border-gray-800 bg-gray-800/30 text-gray-500 opacity-60";
                      }
                    } else if (isSelected) {
                      className += "border-cyan-500/50 bg-cyan-500/10 text-white cursor-pointer";
                    } else {
                      className += "border-gray-800 bg-gray-800/30 text-gray-300 hover:border-gray-600 hover:bg-gray-800 cursor-pointer";
                    }

                    return (
                      <button key={opt.id} className={className} onClick={() => handleSingleAnswer(opt.id)} disabled={showFeedback}>
                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                          isSelected && !showFeedback ? "border-cyan-400 bg-cyan-400/20" :
                          showFeedback && isCorrectOpt ? "border-emerald-400 bg-emerald-400" :
                          showFeedback && isSelected && !isCorrectOpt ? "border-red-400 bg-red-400" :
                          "border-gray-600"
                        }`}>
                          {showFeedback && isCorrectOpt && <CheckCircle className="w-3 h-3 text-white" />}
                          {showFeedback && isSelected && !isCorrectOpt && <XCircle className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{opt.text}</p>
                          {showFeedback && opt.explanation && (
                            <p className="text-xs mt-2 text-gray-400">{opt.explanation}</p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {step.type === "multiselect" && step.options?.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Select all that apply
                  </p>
                  {step.options.map((opt) => {
                    const isSelected = Array.isArray(currentAnswer) && currentAnswer.includes(opt.id);
                    const isCorrectOpt = opt.isCorrect;
                    let className = "w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start gap-3 ";

                    if (showFeedback) {
                      if (isCorrectOpt && isSelected) {
                        className += "border-emerald-500/50 bg-emerald-500/10 text-white";
                      } else if (isCorrectOpt && !isSelected) {
                        className += "border-amber-500/50 bg-amber-500/10 text-white";
                      } else if (!isCorrectOpt && isSelected) {
                        className += "border-red-500/50 bg-red-500/10 text-white";
                      } else {
                        className += "border-gray-800 bg-gray-800/30 text-gray-500 opacity-50";
                      }
                    } else if (isSelected) {
                      className += "border-cyan-500/50 bg-cyan-500/10 text-white cursor-pointer";
                    } else {
                      className += "border-gray-800 bg-gray-800/30 text-gray-300 hover:border-gray-600 hover:bg-gray-800 cursor-pointer";
                    }

                    return (
                      <button key={opt.id} className={className} onClick={() => handleMultiAnswer(opt.id)} disabled={showFeedback}>
                        <div className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                          isSelected && !showFeedback ? "border-cyan-400 bg-cyan-400/20" :
                          showFeedback && isCorrectOpt && isSelected ? "border-emerald-400 bg-emerald-400" :
                          showFeedback && isCorrectOpt && !isSelected ? "border-amber-400 bg-amber-400/20" :
                          showFeedback && !isCorrectOpt && isSelected ? "border-red-400 bg-red-400" :
                          "border-gray-600"
                        }`}>
                          {isSelected && <span className="w-2 h-2 bg-current rounded-sm" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{opt.text}</p>
                          {showFeedback && opt.explanation && (
                            <p className="text-xs mt-2 text-gray-400">{opt.explanation}</p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {step.type === "input" && (
                <div>
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    disabled={showFeedback}
                    placeholder="Type your answer here..."
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 placeholder-gray-600"
                  />
                </div>
              )}

              {/* Feedback */}
              {showFeedback && step.explanation && (
                <div className={`mt-6 p-4 rounded-xl border ${
                  isCorrect()
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                }`}>
                  <div className="flex items-center gap-2 font-semibold mb-2">
                    {isCorrect() ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {isCorrect() ? "Correct!" : "Not quite..."}
                  </div>
                  <p className="text-sm text-gray-300">{step.explanation}</p>
                  {getPointsEarned() > 0 && (
                    <p className="text-xs mt-2 font-semibold">+{getPointsEarned()} points</p>
                  )}
                </div>
              )}

              {/* Action Button */}
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Step {currentStep + 1} of {totalSteps}
                </div>
                {step.type === "scenario" || step.type === "info" ? (
                  <button
                    onClick={nextStep}
                    className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold px-6 py-2.5 rounded-xl transition-colors"
                  >
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                ) : showFeedback ? (
                  <button
                    onClick={nextStep}
                    className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold px-6 py-2.5 rounded-xl transition-colors"
                  >
                    {currentStep + 1 >= totalSteps ? "See Results" : "Next Question"}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={submitAnswer}
                    disabled={currentAnswer === null && step.type !== "input"}
                    className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-gray-950 font-bold px-6 py-2.5 rounded-xl transition-colors"
                  >
                    Submit Answer
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Score tracking */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>Points collected: {Object.values(answers).reduce((s, p) => s + p, 0)} / {simulation.maxScore}</span>
          <span>{simulation.category}</span>
        </div>
      </div>
    </div>
  );
}
