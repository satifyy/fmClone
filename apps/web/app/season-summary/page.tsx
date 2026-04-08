import { SectionTitle } from "../../components/section-title";
import { Shell } from "../../components/shell";
import { standings } from "../../lib/mock-data";

export default function SeasonSummaryPage() {
  return (
    <Shell>
      <SectionTitle
        eyebrow="Season"
        title="Campaign snapshot"
        detail="Single-screen recap for table position, trajectory, and awards framing."
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5 border border-ink/10 bg-white/55 p-6">
          <div className="border-b border-ink/8 pb-4">
            <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Table Position</p>
            <p className="mt-3 font-display text-6xl leading-none">2nd</p>
          </div>
          <div className="border-b border-ink/8 pb-4">
            <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Points Pace</p>
            <p className="mt-3 text-2xl">1.87 per match</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Top Three</p>
            <div className="mt-4 space-y-3">
              {standings.slice(0, 3).map((row, index) => (
                <div key={row.clubId} className="flex items-center justify-between text-sm">
                  <span>{index + 1}. {row.clubName}</span>
                  <span>{row.points} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="border border-ink/10 bg-ink p-6 text-mist">
          <p className="text-xs uppercase tracking-[0.22em] text-mist/55">Awards Track</p>
          <h2 className="mt-4 font-display text-4xl tracking-tight">Stone</h2>
          <p className="mt-2 text-sm text-mist/70">Leading the Golden Boot race and carrying the highest match-winning threat in the squad.</p>
        </aside>
      </div>
    </Shell>
  );
}

