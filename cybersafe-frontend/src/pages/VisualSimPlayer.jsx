import { Suspense } from "react";
import { useParams, Link } from "react-router-dom";
import { getSimById } from "../simulations/index";
import { ArrowLeft } from "lucide-react";

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Loading simulation…</p>
      </div>
    </div>
  );
}

export default function VisualSimPlayer() {
  const { id } = useParams();
  const sim = getSimById(id);

  if (!sim) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-center px-4">
        <div>
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-white text-2xl font-black mb-2">Simulation Not Found</h2>
          <p className="text-gray-400 mb-6">The simulation "{id}" doesn't exist.</p>
          <Link to="/visual-simulations" className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-6 py-3 rounded-xl transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Lab
          </Link>
        </div>
      </div>
    );
  }

  const SimComponent = sim.component;
  return (
    <Suspense fallback={<LoadingScreen />}>
      <SimComponent />
    </Suspense>
  );
}
