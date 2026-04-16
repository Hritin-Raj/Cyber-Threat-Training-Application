import { Link } from "react-router-dom";
import { Shield, Zap, Trophy, BookOpen, ChevronRight, Lock, Target, Brain } from "lucide-react";
import { useRedirectIfAuth } from "../hooks/useAuth";

const FEATURES = [
  {
    icon: "🎮",
    title: "Real-World Simulations",
    description: "Practice with actual phishing emails, fake login pages, social engineering scenarios, and network attacks.",
  },
  {
    icon: "🏆",
    title: "Gamified Progression",
    description: "Earn XP, unlock levels, collect badges, and climb the global leaderboard as you sharpen your skills.",
  },
  {
    icon: "📚",
    title: "Curated Threat Intel",
    description: "Stay current with live cybersecurity news and articles from top security researchers worldwide.",
  },
  {
    icon: "📊",
    title: "Personal Analytics",
    description: "Track your weak areas, accuracy by category, and improvement over time with detailed dashboards.",
  },
];

const LEVELS = [
  { name: "Beginner", icon: "🛡️", color: "text-emerald-400 border-emerald-400/30 bg-emerald-400/5", desc: "Phishing, passwords, safe browsing basics" },
  { name: "Intermediate", icon: "⚔️", color: "text-blue-400 border-blue-400/30 bg-blue-400/5", desc: "Network intrusion, MITM, SQL injection" },
  { name: "Advanced", icon: "🔥", color: "text-purple-400 border-purple-400/30 bg-purple-400/5", desc: "APT kill chain, zero-days, cloud security" },
  { name: "Pro", icon: "💀", color: "text-amber-400 border-amber-400/30 bg-amber-400/5", desc: "Red teaming, nation-state actors, CISO simulations" },
];

export default function Landing() {
  useRedirectIfAuth();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/90 backdrop-blur-sm border-b border-gray-900">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-7 h-7 text-cyan-400" />
            <span className="font-bold text-lg">
              CyberGuard <span className="text-cyan-400">Academy</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">
              Sign In
            </Link>
            <Link
              to="/signup"
              className="bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold text-sm px-4 py-2 rounded-lg transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 text-cyan-400 text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Gamified Cybersecurity Training
          </div>

          <h1 className="text-5xl sm:text-6xl font-black mb-6 leading-tight">
            Learn to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              Defend
            </span>{" "}
            Against Real Cyber Threats
          </h1>

          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            Practice with interactive simulations. Earn XP and badges. Master cybersecurity like playing a game — but with real-world skills.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-lg px-8 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-cyan-500/25"
            >
              Start Training Free
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-lg px-8 py-4 rounded-xl transition-colors border border-gray-700"
            >
              Sign In
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-12 pt-12 border-t border-gray-800">
            {[
              { value: "40+", label: "Simulations" },
              { value: "4", label: "Difficulty Levels" },
              { value: "6", label: "Threat Categories" },
              { value: "100%", label: "Free to Start" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-black text-cyan-400">{stat.value}</div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Levels */}
      <section className="py-16 px-6 bg-gray-900/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">
            Four <span className="text-cyan-400">Progressive</span> Levels
          </h2>
          <p className="text-center text-gray-400 mb-10">Complete 10 simulations to unlock the next level</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {LEVELS.map((level, i) => (
              <div key={level.name} className={`rounded-xl border p-5 ${level.color} relative`}>
                {i > 0 && (
                  <Lock className="absolute top-3 right-3 w-4 h-4 opacity-40" />
                )}
                <div className="text-3xl mb-3">{level.icon}</div>
                <h3 className="font-bold text-white mb-1">{level.name}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{level.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need to{" "}
            <span className="text-cyan-400">Stay Secure</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-white font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simulation Preview */}
      <section className="py-16 px-6 bg-gray-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 text-purple-400 text-sm font-medium mb-4">
                <Brain className="w-4 h-4" />
                Real Simulations
              </div>
              <h2 className="text-3xl font-bold mb-4">
                Not Just Theory — <span className="text-purple-400">Real Scenarios</span>
              </h2>
              <p className="text-gray-400 mb-6">
                Interact with realistic phishing emails, fake websites, social engineering conversations, and network logs.
                Learn by doing, not just reading.
              </p>
              <ul className="space-y-3">
                {[
                  "Phishing email analysis with real-looking emails",
                  "Password strength analyzer with feedback",
                  "Social engineering chat simulations",
                  "Network intrusion log analysis",
                  "Malware download identification",
                  "SQL injection & XSS detection exercises",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-gray-300 text-sm">
                    <Target className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-500 text-xs ml-2">Email Preview</span>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">From:</span>
                  <span className="text-red-400">security@paypa1.com</span>
                  <span className="bg-red-400/20 text-red-400 text-xs px-2 py-0.5 rounded-full">⚠️ Suspicious</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Subject:</span>
                  <span className="text-white">URGENT: Account suspended</span>
                </div>
                <div className="border-t border-gray-700 pt-3 mt-3 text-gray-300">
                  Click <span className="text-blue-400 underline">here</span> to verify immediately...
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-white">What's suspicious here?</p>
                {["Lookalike domain (paypa1 ≠ paypal)", "Urgency pressure", "Suspicious link URL", "Generic greeting"].map((opt) => (
                  <div key={opt} className="flex items-center gap-3 bg-gray-800 rounded-lg p-3 cursor-pointer hover:bg-gray-700 transition-colors">
                    <div className="w-4 h-4 border-2 border-cyan-400 rounded" />
                    <span className="text-sm text-gray-300">{opt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-5xl mb-4">🛡️</div>
          <h2 className="text-3xl font-bold mb-4">
            Ready to Become a{" "}
            <span className="text-cyan-400">Cyber Guardian?</span>
          </h2>
          <p className="text-gray-400 mb-8">
            Join thousands of learners building real cybersecurity skills through interactive training.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-lg px-10 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-cyan-500/25"
          >
            Start for Free
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-900 py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <span className="text-gray-500 text-sm">CyberGuard Academy</span>
          </div>
          <p className="text-gray-600 text-sm">© 2024 CyberGuard Academy</p>
        </div>
      </footer>
    </div>
  );
}
