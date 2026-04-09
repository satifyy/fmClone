import Link from "next/link";

import { SectionTitle } from "../../components/section-title";
import { Shell } from "../../components/shell";
import { getSeasonAnalytics } from "../../lib/api";

type SearchParams = Record<string, string | string[] | undefined>;

function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SeasonAnalyticsPage({
  searchParams
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const seasonId = single(params?.seasonId);
  const analytics = await getSeasonAnalytics(seasonId);
  const maxPoints = Math.max(1, ...analytics.trends.map((point) => point.points));

  return (
    <Shell>
      <SectionTitle
        eyebrow="Analytics"
        title={`${analytics.club.clubName} performance intelligence`}
        detail="Player, club, tactical, and league-level analytics with trend visualization and historical comparison."
      />

      <div className="space-y-8">
        <section className="grid gap-4 border border-ink/10 bg-white/55 p-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="border border-ink/10 bg-[#f8f3ea] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-ink/55">Position</p>
              <p className="mt-2 font-display text-4xl">{analytics.club.position}</p>
              <p className="mt-2 text-sm text-ink/65">{analytics.seasonLabel}</p>
            </div>
            <div className="border border-ink/10 bg-[#f8f3ea] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-ink/55">Points</p>
              <p className="mt-2 font-display text-4xl">{analytics.club.points}</p>
              <p className="mt-2 text-sm text-ink/65">{analytics.club.wins}-{analytics.club.draws}-{analytics.club.losses}</p>
            </div>
            <div className="border border-ink/10 bg-[#f8f3ea] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-ink/55">Board Confidence</p>
              <p className="mt-2 font-display text-4xl capitalize">{analytics.board.level}</p>
              <p className="mt-2 text-sm text-ink/65">{analytics.board.score}/100</p>
            </div>
          </div>

          <aside className="border border-ink/10 bg-ink p-5 text-mist">
            <p className="text-xs uppercase tracking-[0.22em] text-mist/60">Leaders</p>
            <div className="mt-4 space-y-3 text-sm">
              <p>
                Top scorer: <span className="font-medium">{analytics.playerLeaders.topScorer?.name ?? "n/a"}</span> ({analytics.playerLeaders.topScorer?.value ?? 0})
              </p>
              <p>
                Top creator: <span className="font-medium">{analytics.playerLeaders.topCreator?.name ?? "n/a"}</span> ({analytics.playerLeaders.topCreator?.value ?? 0})
              </p>
              <p>
                Top rating: <span className="font-medium">{analytics.playerLeaders.topAverageRating?.name ?? "n/a"}</span> ({analytics.playerLeaders.topAverageRating?.value ?? 0})
              </p>
            </div>
            <p className="mt-5 border-t border-mist/10 pt-4 text-sm text-mist/75">{analytics.board.summary}</p>
          </aside>
        </section>

        <section className="border border-ink/10 bg-white/55 p-5">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Trend Chart</p>
            <Link href="/season-summary" className="text-sm underline-offset-4 hover:underline">
              Open summary
            </Link>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              {analytics.trends.map((point) => (
                <div key={point.label} className="border border-ink/10 bg-[#f8f3ea] p-3">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.16em] text-ink/55">
                    <span>{point.label}</span>
                    <span>{point.points} pts</span>
                  </div>
                  <div className="mt-2 h-2 bg-ink/10">
                    <div className="h-2 bg-field" style={{ width: `${(point.points / maxPoints) * 100}%` }} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-ink/62">
                    <span>xG {point.xgFor.toFixed(2)}</span>
                    <span>xGA {point.xgAgainst.toFixed(2)}</span>
                    <span>Morale {point.morale}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border border-ink/10 bg-[#f8f3ea] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-ink/55">Tactical Signal</p>
              <h3 className="mt-3 font-display text-3xl">{analytics.tactics.formation}</h3>
              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div className="border border-ink/10 bg-white/70 p-3">
                  <p className="text-ink/55">Familiarity</p>
                  <p className="mt-1 text-xl">{analytics.tactics.familiarity}</p>
                </div>
                <div className="border border-ink/10 bg-white/70 p-3">
                  <p className="text-ink/55">Intensity</p>
                  <p className="mt-1 text-xl">{analytics.tactics.intensity}</p>
                </div>
                <div className="border border-ink/10 bg-white/70 p-3 sm:col-span-2">
                  <p className="text-ink/55">Projected fitness cost</p>
                  <p className="mt-1 text-xl">{analytics.tactics.projectedFitnessCost}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border border-ink/10 bg-white/55 p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Historical Comparison</p>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-ink text-mist">
                <tr>
                  <th className="px-3 py-2">Season</th>
                  <th className="px-3 py-2">Pos</th>
                  <th className="px-3 py-2">Pts</th>
                  <th className="px-3 py-2">GF</th>
                  <th className="px-3 py-2">GA</th>
                  <th className="px-3 py-2">xG</th>
                  <th className="px-3 py-2">xGA</th>
                </tr>
              </thead>
              <tbody>
                {analytics.historicalComparison.map((row) => (
                  <tr key={row.seasonId} className="border-b border-ink/8">
                    <td className="px-3 py-3">{row.seasonLabel}</td>
                    <td className="px-3 py-3">{row.position}</td>
                    <td className="px-3 py-3">{row.points}</td>
                    <td className="px-3 py-3">{row.goalsFor}</td>
                    <td className="px-3 py-3">{row.goalsAgainst}</td>
                    <td className="px-3 py-3">{row.xgFor.toFixed(2)}</td>
                    <td className="px-3 py-3">{row.xgAgainst.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Shell>
  );
}
