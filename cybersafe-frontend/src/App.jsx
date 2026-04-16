import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import useStore from "./store/useStore";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Simulations from "./pages/Simulations";
import SimulationPlayer from "./pages/SimulationPlayer";
import VisualSimulations from "./pages/VisualSimulations";
import VisualSimPlayer from "./pages/VisualSimPlayer";
import Learn from "./pages/Learn";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  const { theme } = useStore();

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="bg-gray-950 min-h-screen">
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/dashboard"
              element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
            />
            <Route
              path="/simulations"
              element={<ProtectedRoute><Simulations /></ProtectedRoute>}
            />
            <Route
              path="/simulations/:id"
              element={<ProtectedRoute><SimulationPlayer /></ProtectedRoute>}
            />
            <Route
              path="/visual-simulations"
              element={<ProtectedRoute><VisualSimulations /></ProtectedRoute>}
            />
            <Route
              path="/visual-simulations/:id"
              element={<ProtectedRoute><VisualSimPlayer /></ProtectedRoute>}
            />
            <Route
              path="/learn"
              element={<ProtectedRoute><Learn /></ProtectedRoute>}
            />
            <Route
              path="/leaderboard"
              element={<ProtectedRoute><Leaderboard /></ProtectedRoute>}
            />
            <Route
              path="/profile"
              element={<ProtectedRoute><Profile /></ProtectedRoute>}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1f2937",
              color: "#fff",
              border: "1px solid #374151",
            },
          }}
        />
      </div>
    </div>
  );
}

export default App;
