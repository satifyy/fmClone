import { notFound } from "next/navigation";

import { SectionTitle } from "../../../components/section-title";
import { Shell } from "../../../components/shell";
import { squad } from "../../../lib/mock-data";

export default async function PlayerPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const player = squad.find((entry) => entry.id === id);

  if (!player) {
    notFound();
  }

  return (
    <Shell>
      <SectionTitle
        eyebrow="Player"
        title={`${player.firstName} ${player.lastName}`}
        detail={`${player.role} • ${player.positions.join(", ")} • Age ${player.age}`}
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {Object.entries(player.attributes).map(([label, value]) => (
            <div key={label} className="border-b border-ink/10 pb-3">
              <div className="flex items-center justify-between text-sm">
                <span className="uppercase tracking-[0.18em] text-ink/55">{label}</span>
                <span>{value}</span>
              </div>
            </div>
          ))}
        </div>

        <aside className="border border-ink/10 bg-white/55 p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Condition</p>
          <div className="mt-5 space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span>Morale</span>
              <span>{player.condition.morale}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Fatigue</span>
              <span>{player.condition.fatigue}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Fitness</span>
              <span>{player.condition.fitness}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Potential</span>
              <span>{player.potential}</span>
            </div>
          </div>
        </aside>
      </div>
    </Shell>
  );
}
