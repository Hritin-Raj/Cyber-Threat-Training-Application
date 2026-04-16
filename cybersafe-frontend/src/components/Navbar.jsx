import { Link, useLocation, useNavigate } from "react-router-dom";
import useStore from "../store/useStore";
import {
  Shield, Menu, X, Sun, Moon, LogOut, User, Trophy, BookOpen,
  LayoutDashboard, Gamepad2, Bell, FlaskConical
} from "lucide-react";

const NAV_LINKS = [
  { to: "/dashboard",           label: "Dashboard", icon: LayoutDashboard },
  { to: "/simulations",         label: "Train",     icon: Gamepad2 },
  { to: "/visual-simulations",  label: "Lab",       icon: FlaskConical },
  { to: "/learn",               label: "Learn",     icon: BookOpen },
  { to: "/leaderboard",         label: "Leaderboard",icon: Trophy },
];

const LEVEL_COLORS = {
  beginner: "text-emerald-400",
  intermediate: "text-blue-400",
  advanced: "text-purple-400",
  pro: "text-amber-400",
};

export default function Navbar() {
  const { user, isAuthenticated, logout, toggleTheme, theme, sidebarOpen, toggleSidebar } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const levelColor = LEVEL_COLORS[user?.level] || "text-gray-400";

  if (!isAuthenticated) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="relative">
              <Shield className="w-8 h-8 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              <div className="absolute inset-0 animate-pulse opacity-30 bg-cyan-400 rounded-full blur-sm" />
            </div>
            <div className="hidden sm:block">
              <span className="text-white font-bold text-lg">CyberGuard</span>
              <span className="text-cyan-400 font-bold text-lg"> Academy</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname.startsWith(to) && (to !== "/" || location.pathname === "/")
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* XP Display */}
            {user && (
              <div className="hidden sm:flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-1.5">
                <div className="text-yellow-400 font-bold text-sm">⚡ {user.totalXp?.toLocaleString() || 0} XP</div>
                <div className={`text-xs font-medium capitalize ${levelColor}`}>
                  {user.level}
                </div>
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Profile Link */}
            <Link
              to="/profile"
              className="flex items-center gap-2 p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </div>
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="hidden sm:flex p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleSidebar}
              className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {sidebarOpen && (
        <div className="md:hidden border-t border-gray-800 bg-gray-900">
          <div className="px-4 py-3 space-y-1">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => toggleSidebar()}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname.startsWith(to) && (to !== "/" || location.pathname === "/")
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-gray-800"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
