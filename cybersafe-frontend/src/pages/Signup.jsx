import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff, UserPlus, AlertCircle, Check } from "lucide-react";
import { authAPI } from "../services/api";
import useStore from "../store/useStore";
import { useRedirectIfAuth } from "../hooks/useAuth";

const getPasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
};

const strengthConfig = [
  { label: "Very Weak", color: "bg-red-500", textColor: "text-red-400" },
  { label: "Weak", color: "bg-orange-500", textColor: "text-orange-400" },
  { label: "Fair", color: "bg-yellow-500", textColor: "text-yellow-400" },
  { label: "Good", color: "bg-blue-500", textColor: "text-blue-400" },
  { label: "Strong", color: "bg-emerald-500", textColor: "text-emerald-400" },
  { label: "Very Strong", color: "bg-emerald-400", textColor: "text-emerald-300" },
];

export default function Signup() {
  useRedirectIfAuth();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setAuth } = useStore();
  const navigate = useNavigate();

  const passwordStrength = getPasswordStrength(form.password);
  const strengthInfo = strengthConfig[Math.min(passwordStrength, 5)];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);

    try {
      const { data } = await authAPI.register(form);
      if (data.success) {
        setAuth(data.user, data.token);
        navigate("/dashboard");
      }
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(
        errors ? errors.map((e) => e.msg).join(". ") : err.response?.data?.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 to-gray-950 border-r border-gray-800 flex-col items-center justify-center p-12">
        <div className="max-w-md">
          <Shield className="w-16 h-16 text-cyan-400 mb-8" />
          <h2 className="text-4xl font-black text-white mb-4">
            Your Security<br />
            <span className="text-cyan-400">Journey Starts Here</span>
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Join CyberGuard Academy and transform from a security novice to a Cyber Guardian.
          </p>
          <div className="space-y-4">
            {[
              { icon: "🎮", text: "40+ interactive cybersecurity simulations" },
              { icon: "⚡", text: "Real-time feedback and explanations" },
              { icon: "🏆", text: "Earn badges and climb the leaderboard" },
              { icon: "📊", text: "Track your progress and weak areas" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 text-gray-300">
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Shield className="w-8 h-8 text-cyan-400" />
            <span className="text-white font-bold text-xl">CyberGuard <span className="text-cyan-400">Academy</span></span>
          </div>

          <h2 className="text-3xl font-black text-white mb-2">Create Account</h2>
          <p className="text-gray-400 mb-8">
            Already have an account?{" "}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium">
              Sign in
            </Link>
          </p>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 mb-6 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
              <input
                type="text"
                required
                minLength={3}
                maxLength={20}
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors placeholder-gray-600"
                placeholder="CyberHero123"
              />
              <p className="text-xs text-gray-600 mt-1">3-20 characters. This will appear on the leaderboard.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors placeholder-gray-600"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors placeholder-gray-600"
                  placeholder="Min. 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password strength bar */}
              {form.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= passwordStrength ? strengthInfo.color : "bg-gray-800"
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${strengthInfo.textColor}`}>{strengthInfo.label}</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </>
              )}
            </button>

            <p className="text-xs text-gray-600 text-center">
              By creating an account, you agree to learn and practice cybersecurity responsibly.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
