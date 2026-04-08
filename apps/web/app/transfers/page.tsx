import { SectionTitle } from "../../components/section-title";
import { Shell } from "../../components/shell";
import { squad } from "../../lib/mock-data";

export default function TransfersPage() {
  return (
    <Shell>
      <SectionTitle
        eyebrow="Transfers"
        title="Market board"
        detail="Shortlist surface for v1: needs, budget pressure, and high-upside targets."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {squad.map((player) => (
          <article key={player.id} className="border border-ink/10 bg-white/55 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-ink/55">{player.positions.join("/")}</p>
            <h2 className="mt-3 font-display text-3xl tracking-tight">
              {player.firstName} {player.lastName}
            </h2>
            <p className="mt-2 text-sm text-ink/68">{player.role}</p>
            <div className="mt-5 flex items-center justify-between border-t border-ink/10 pt-4 text-sm">
              <span>Potential {player.potential}</span>
              <span>Morale {player.condition.morale}</span>
            </div>
          </article>
        ))}
      </div>
    </Shell>
  );
}

