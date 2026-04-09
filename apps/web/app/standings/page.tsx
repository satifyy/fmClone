import Link from "next/link";

import { SectionTitle } from "../../components/section-title";
import { Shell } from "../../components/shell";
import { getLeagueStandings } from "../../lib/api";

const zoneStyles = {
  promotion: "border-l-[#2F6B52]",
  "promotion-playoff": "border-l-[#C28743]",
  relegation: "border-l-[#A6403B]",
  playoff: "border-l-[#7A6A42]",
  midtable: "border-l-transparent"
} as const;

const markerStyles = {
  positive: "bg-[#dcebdd] text-[#1f5135]",
  warning: "bg-[#f2e3c8] text-[#8a5a1c]",
  danger: "bg-[#f0d3d0] text-[#8a2f2a]",
  neutral: "bg-ink/8 text-ink/70"
} as const;

type PageProps = {
  searchParams?: Promise<{
    seasonId?: string;
    leagueId?: string;
  }>;
};

export default async function StandingsPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : undefined;
  const payload = await getLeagueStandings(params?.seasonId, params?.leagueId);

  return (
    <Shell>
      <SectionTitle
        eyebrow="Standings"
        title={`${payload.league.name} table`}
        detail="Expanded table view with xG, form context, promotion and relegation bands, and archived prior seasons."
      />

      <div className="space-y-6">
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="border border-ink/10 bg-white/55 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-ink/55">League</p>
            <div className="mt-3 flex flex-wrap gap-2 border-b border-ink/10 pb-4">
              {payload.availableLeagues.map((league) => {
                const active = league.id === payload.league.id;
                const href = league.id === payload.availableLeagues[0]?.id ? "/standings" : `/standings?leagueId=${league.id}`;

                return (
                  <Link
                    key={league.id}
                    href={href}
                    className={`border px-3 py-2 text-sm transition ${
                      active ? "border-ink bg-ink text-mist" : "border-ink/12 bg-white hover:border-ink/35"
                    }`}
                  >
                    {league.name}
                  </Link>
                );
              })}
            </div>

            <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Season</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {payload.availableSeasons.map((season) => {
                const isCurrentSeason = season === payload.league.season || season === payload.selectedSeason;
                const seasonId = isCurrentSeason
                  ? undefined
                  : season.startsWith("season-")
                    ? season
                    : `season-${season.slice(0, 4)}`;
                const active = season === payload.selectedSeason || season === payload.league.season;
                const searchParams = new URLSearchParams();

                if (params?.leagueId && params.leagueId !== payload.availableLeagues[0]?.id) {
                  searchParams.set("leagueId", params.leagueId);
                }

                if (seasonId) {
                  searchParams.set("seasonId", seasonId);
                }

                const href = searchParams.toString() ? `/standings?${searchParams.toString()}` : "/standings";

                return (
                  <Link
                    key={season}
                    href={href}
                    className={`border px-3 py-2 text-sm transition ${
                      active ? "border-ink bg-ink text-mist" : "border-ink/12 bg-white hover:border-ink/35"
                    }`}
                  >
                    {season}
                  </Link>
                );
              })}
            </div>
            <p className="mt-4 text-sm text-ink/62">
              {payload.isHistorical ? "Viewing archived final table." : "Live table for the active save."}
            </p>
          </div>

          <aside className="border border-ink/10 bg-ink p-5 text-mist">
            <p className="text-xs uppercase tracking-[0.22em] text-mist/55">League rules</p>
            <div className="mt-4 space-y-4">
              {payload.league.rules.map((rule) => (
                <div key={rule.title}>
                  <p className="text-sm uppercase tracking-[0.18em] text-mist/60">{rule.title}</p>
                  <p className="mt-1 text-sm text-mist/78">{rule.detail}</p>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="border border-ink/10 bg-white/55">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-ink text-mist">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Club</th>
                  <th className="px-4 py-3">P</th>
                  <th className="px-4 py-3">W</th>
                  <th className="px-4 py-3">D</th>
                  <th className="px-4 py-3">L</th>
                  <th className="px-4 py-3">GF</th>
                  <th className="px-4 py-3">GA</th>
                  <th className="px-4 py-3">GD</th>
                  <th className="px-4 py-3">xG</th>
                  <th className="px-4 py-3">xGA</th>
                  <th className="px-4 py-3">xGD</th>
                  <th className="px-4 py-3">Form</th>
                  <th className="px-4 py-3">Pts</th>
                </tr>
              </thead>
              <tbody>
                {payload.table.map((row) => (
                  <tr
                    key={row.clubId}
                    className={`border-b border-ink/8 border-l-4 ${zoneStyles[row.zone ?? "midtable"]}`}
                  >
                    <td className="px-4 py-4 font-medium">{row.position}</td>
                    <td className="px-4 py-4">
                      <Link href={`/clubs/${row.clubId}`} className="font-medium underline-offset-4 hover:underline">
                        {row.clubName}
                      </Link>
                      {row.contextualMarkers && row.contextualMarkers.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {row.contextualMarkers.map((marker) => (
                            <span
                              key={`${row.clubId}-${marker.label}`}
                              className={`px-2 py-1 text-[11px] uppercase tracking-[0.16em] ${markerStyles[marker.tone]}`}
                            >
                              {marker.label}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-4">{row.played}</td>
                    <td className="px-4 py-4">{row.won}</td>
                    <td className="px-4 py-4">{row.drawn}</td>
                    <td className="px-4 py-4">{row.lost}</td>
                    <td className="px-4 py-4">{row.goalsFor}</td>
                    <td className="px-4 py-4">{row.goalsAgainst}</td>
                    <td className="px-4 py-4">{row.goalDifference}</td>
                    <td className="px-4 py-4">{row.xgFor?.toFixed(2) ?? "0.00"}</td>
                    <td className="px-4 py-4">{row.xgAgainst?.toFixed(2) ?? "0.00"}</td>
                    <td className="px-4 py-4">{row.xgDifference?.toFixed(2) ?? "0.00"}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1">
                        {(row.form ?? []).map((result, index) => (
                          <span
                            key={`${row.clubId}-${index}`}
                            className={`inline-flex h-7 w-7 items-center justify-center text-xs ${
                              result === "W"
                                ? "bg-[#dcebdd] text-[#1f5135]"
                                : result === "L"
                                  ? "bg-[#f0d3d0] text-[#8a2f2a]"
                                  : "bg-[#efe8d9] text-[#6a5736]"
                            }`}
                          >
                            {result}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-base font-semibold">{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="border border-ink/10 bg-white/55 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-ink/55">League xG</p>
            <p className="mt-3 text-3xl">{payload.summary.xg.toFixed(2)}</p>
            <p className="mt-2 text-sm text-ink/62">Combined expected goals created across the division.</p>
          </div>
          <div className="border border-ink/10 bg-white/55 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-ink/55">xG per match</p>
            <p className="mt-3 text-3xl">{payload.summary.xgPerMatch.toFixed(2)}</p>
            <p className="mt-2 text-sm text-ink/62">Current attacking environment for this season view.</p>
          </div>
          <div className="border border-ink/10 bg-white/55 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Matches played</p>
            <p className="mt-3 text-3xl">{payload.summary.matchesPlayed}</p>
            <p className="mt-2 text-sm text-ink/62">League matches included in the active table.</p>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {payload.league.zones.map((zone) => (
            <div key={zone.type} className="border border-ink/10 bg-white/55 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-ink/55">{zone.label}</p>
              <p className="mt-3 text-2xl">
                {zone.start === zone.end ? `${zone.start}` : `${zone.start}-${zone.end}`}
              </p>
              <p className="mt-2 text-sm text-ink/62">{zone.description}</p>
            </div>
          ))}
        </section>
      </div>
    </Shell>
  );
}
