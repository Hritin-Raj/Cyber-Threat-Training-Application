import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";
import { authAPI } from "../services/api";
import useStore from "../store/useStore";
import { useRedirectIfAuth } from "../hooks/useAuth";

export default function Login() {
  useRedirectIfAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setAuth } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await authAPI.login(form);
      if (data.success) {
        setAuth(data.user, data.token);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 to-gray-950 border-r border-gray-800 flex-col items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="relative inline-block mb-8">
            <Shield className="w-20 h-20 text-cyan-400 mx-auto" />
            <div className="absolute inset-0 animate-ping opacity-20 bg-cyan-400 rounded-full blur-sm" />
          </div>
          <h1 className="text-4xl font-black text-white mb-4">
            Welcome Back,<br />
            <span className="text-cyan-400">Guardian</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Continue your cybersecurity training journey. Your progress awaits.
          </p>
          <div className="grid grid-cols-3 gap-4 mt-10">
            {["🎣 Phishing", "🦠 Malware", "🔐 Passwords", "🌐 Network", "👁️ Privacy", "🎭 Social Eng."].map((item) => (
              <div key={item} className="bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-xs text-gray-400 text-center">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Shield className="w-8 h-8 text-cyan-400" />
            <span className="text-white font-bold text-xl">CyberGuard <span className="text-cyan-400">Academy</span></span>
          </div>

          <h2 className="text-3xl font-black text-white mb-2">Sign In</h2>
          <p className="text-gray-400 mb-8">
            Don't have an account?{" "}
            <Link to="/signup" className="text-cyan-400 hover:text-cyan-300 font-medium">
              Create one free
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
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors placeholder-gray-600"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 p-4 bg-gray-900 border border-gray-800 rounded-xl">
            <p className="text-xs text-gray-500 font-medium mb-2">🧪 Demo Mode</p>
            <p className="text-xs text-gray-600">Create a free account to start training. No credit card required.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
