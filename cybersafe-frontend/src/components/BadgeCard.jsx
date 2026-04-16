export default function BadgeCard({ badge, size = "md" }) {
  const sizes = {
    sm: "w-12 h-12 text-2xl",
    md: "w-16 h-16 text-3xl",
    lg: "w-20 h-20 text-4xl",
  };

  return (
    <div className="flex flex-col items-center gap-2 group">
      <div
        className={`${sizes[size]} bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:border-cyan-500/50 group-hover:shadow-cyan-500/10 transition-all duration-200`}
      >
        <span>{badge.icon}</span>
      </div>
      <div className="text-center">
        <div className="text-xs font-medium text-gray-300 leading-tight">{badge.name}</div>
        {size !== "sm" && (
          <div className="text-xs text-gray-500 mt-0.5">{badge.description}</div>
        )}
      </div>
    </div>
  );
}

export function BadgeGrid({ badges, limit }) {
  const displayBadges = limit ? badges.slice(0, limit) : badges;
  const remaining = limit ? badges.length - limit : 0;

  if (!badges || badges.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">🏅</div>
        <div className="text-sm">No badges yet. Complete simulations to earn them!</div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4">
      {displayBadges.map((badge) => (
        <BadgeCard key={badge.id} badge={badge} size="sm" />
      ))}
      {remaining > 0 && (
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 bg-gray-800 border border-gray-700 rounded-2xl flex items-center justify-center text-gray-400 font-bold text-sm">
            +{remaining}
          </div>
          <div className="text-xs text-gray-500">more</div>
        </div>
      )}
    </div>
  );
}
