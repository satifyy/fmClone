import { SectionTitle } from "../../components/section-title";
import { Shell } from "../../components/shell";
import { getSeasonAnalytics } from "../../lib/api";

export default async function SeasonSummaryPage() {
  const analytics = await getSeasonAnalytics();

  return (
    <Shell>
      <SectionTitle
        eyebrow="Season"
        title="Campaign snapshot"
        detail="Live season recap connected to club, player, tactical, and league analytics feeds."
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5 border border-ink/10 bg-white/55 p-6">
          <div className="border-b border-ink/8 pb-4">
            <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Table Position</p>
            <p className="mt-3 font-display text-6xl leading-none">{analytics.club.position}</p>
          </div>
          <div className="border-b border-ink/8 pb-4">
            <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Points Pace</p>
            <p className="mt-3 text-2xl">
              {(analytics.club.points / Math.max(analytics.league.summary.matchesPlayed, 1)).toFixed(2)} per match
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Top Three</p>
            <div className="mt-4 space-y-3">
              {analytics.league.topThree.map((row, index) => (
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
          <h2 className="mt-4 font-display text-4xl tracking-tight">{analytics.playerLeaders.topScorer?.name ?? "No leader"}</h2>
          <p className="mt-2 text-sm text-mist/70">
            Leading scorer on {analytics.playerLeaders.topScorer?.value ?? 0} goals. Top creator is {analytics.playerLeaders.topCreator?.name ?? "n/a"}.
          </p>
          <div className="mt-5 border-t border-mist/15 pt-4 text-sm text-mist/78">
            <p>Style: {analytics.tactics.tacticalStyle}</p>
            <p className="mt-1">Board confidence: {analytics.board.level}</p>
          </div>
        </aside>
      </div>
    </Shell>
  );
}
