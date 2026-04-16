import { Shield } from "lucide-react";

export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <Shield className="w-12 h-12 text-cyan-400 animate-pulse" />
        <div className="absolute inset-0 animate-spin">
          <div className="w-12 h-12 border-2 border-transparent border-t-cyan-400 rounded-full" />
        </div>
      </div>
      <p className="text-gray-400 text-sm animate-pulse">{message}</p>
    </div>
  );
}

export function InlineSpinner({ size = "sm" }) {
  const sizes = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" };
  return (
    <div className={`${sizes[size]} border-2 border-gray-700 border-t-cyan-400 rounded-full animate-spin`} />
  );
}
