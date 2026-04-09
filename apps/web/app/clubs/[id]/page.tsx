import Link from "next/link";
import { notFound } from "next/navigation";

import { PlayerActionButtons } from "../../../components/player-action-buttons";
import { SectionTitle } from "../../../components/section-title";
import { Shell } from "../../../components/shell";
import { defaultSaveId, fetchClubDetail, fetchClubSquad } from "../../../lib/api";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

export default async function ClubPage({ params }: PageProps) {
  const { id } = await params;
  const [detail, squad] = await Promise.all([fetchClubDetail(id), fetchClubSquad(id)]);

  if (!detail) {
    notFound();
  }

  return (
    <Shell>
      <SectionTitle
        eyebrow="Club"
        title={detail.club.name}
        detail={`${detail.city} • ${detail.stadium.name} • ${detail.stadium.capacity.toLocaleString()} capacity`}
      />

      <div className="space-y-6">
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="border border-ink/10 bg-white/55 p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Club profile</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-ink/55">Board expectation</p>
                <p className="mt-2 text-lg">{detail.club.boardExpectation}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-ink/55">Style</p>
                <p className="mt-2 text-lg capitalize">{detail.club.styleIdentity}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-ink/55">Facilities</p>
                <p className="mt-2 text-lg">{detail.club.facilities}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-ink/55">Academy</p>
                <p className="mt-2 text-lg">{detail.club.academy}</p>
              </div>
            </div>

            <div className="mt-6 border-t border-ink/10 pt-5">
              <p className="text-xs uppercase tracking-[0.18em] text-ink/55">Colors</p>
              <div className="mt-3 flex gap-3">
                {[detail.colors.primary, detail.colors.secondary, detail.colors.accent].map((color) => (
                  <div key={color} className="space-y-2">
                    <div className="h-12 w-12 border border-ink/10" style={{ backgroundColor: color }} />
                    <p className="text-xs text-ink/62">{color}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="border border-ink/10 bg-ink p-6 text-mist">
            <p className="text-xs uppercase tracking-[0.22em] text-mist/55">Financial status</p>
            <h2 className="mt-4 font-display text-4xl tracking-tight">{detail.financialStatus.label}</h2>
            <p className="mt-3 text-sm text-mist/76">{detail.financialStatus.summary}</p>
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-mist/60">Balance</span>
                <span>{money.format(detail.club.finances.balance)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-mist/60">Transfer budget</span>
                <span>{money.format(detail.club.finances.transferBudget)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-mist/60">Wage budget</span>
                <span>{money.format(detail.club.finances.wageBudget)}</span>
              </div>
            </div>
          </aside>
        </section>

        <section className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="border border-ink/10 bg-white/55 p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Squad overview</p>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-3xl">{detail.squadOverview.squadSize}</p>
                <p className="text-sm text-ink/60">Players in squad</p>
              </div>
              <div>
                <p className="text-3xl">{detail.squadOverview.averageAge}</p>
                <p className="text-sm text-ink/60">Average age</p>
              </div>
              <div>
                <p className="text-3xl">{detail.squadOverview.internationals}</p>
                <p className="text-sm text-ink/60">Nationalities represented</p>
              </div>
              <div className="border-t border-ink/10 pt-4 text-sm">
                <p className="text-ink/55">Top scorer</p>
                <p className="mt-1 font-medium">
                  {detail.squadOverview.topScorer
                    ? `${detail.squadOverview.topScorer.name} • ${detail.squadOverview.topScorer.goals}`
                    : "No data"}
                </p>
              </div>
              <div className="text-sm">
                <p className="text-ink/55">Top creator</p>
                <p className="mt-1 font-medium">
                  {detail.squadOverview.topCreator
                    ? `${detail.squadOverview.topCreator.name} • ${detail.squadOverview.topCreator.assists}`
                    : "No data"}
                </p>
              </div>
            </div>
          </aside>

          <div className="border border-ink/10 bg-white/55 p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Club history</p>
            <div className="mt-4 space-y-4">
              {detail.history.map((entry) => (
                <div key={entry.season} className="grid gap-2 border-b border-ink/8 pb-4 last:border-b-0 last:pb-0 sm:grid-cols-[110px_80px_minmax(0,1fr)]">
                  <p className="font-medium">{entry.season}</p>
                  <p className="text-ink/60">{entry.finish}</p>
                  <p className="text-sm text-ink/68">{entry.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="border border-ink/10 bg-white/55 p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Recent results</p>
            <div className="mt-4 space-y-3">
              {detail.recentResults.map((result) => (
                <div key={result.fixtureId} className="grid gap-3 border-b border-ink/8 pb-4 last:border-b-0 last:pb-0 sm:grid-cols-[64px_minmax(0,1fr)_120px_110px] sm:items-center">
                  <div
                    className={`inline-flex h-10 w-10 items-center justify-center text-sm ${
                      result.outcome === "W"
                        ? "bg-[#dcebdd] text-[#1f5135]"
                        : result.outcome === "L"
                          ? "bg-[#f0d3d0] text-[#8a2f2a]"
                          : "bg-[#efe8d9] text-[#6a5736]"
                    }`}
                  >
                    {result.outcome}
                  </div>
                  <div>
                    <p className="font-medium">
                      {result.venue} vs{" "}
                      <Link href={`/clubs/${result.opponentId}`} className="underline-offset-4 hover:underline">
                        {result.opponentName}
                      </Link>
                    </p>
                    <p className="mt-1 text-sm text-ink/60">
                      {result.date} • xG {result.xg.club.toFixed(2)}-{result.xg.opponent.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-lg font-medium">
                    {result.score.club}-{result.score.opponent}
                  </div>
                  <div>
                    {result.matchId ? (
                      <Link href={`/matches/${result.matchId}`} className="text-sm underline-offset-4 hover:underline">
                        Open match
                      </Link>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="border border-ink/10 bg-white/55 p-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Full squad actions</p>
              <span className="text-sm text-ink/55">{squad?.players.length ?? 0} players</span>
            </div>
            <div className="mt-4 max-h-[620px] space-y-4 overflow-auto pr-1">
              {(squad?.players ?? []).map((player) => (
                <div key={player.id} className="border-b border-ink/8 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <Link href={`/players/${player.id}`} className="font-medium underline-offset-4 hover:underline">
                        {player.firstName} {player.lastName}
                      </Link>
                      <p className="mt-1 text-sm text-ink/60">
                        {player.positions.join("/")} • {player.role}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p>{player.seasonStats.goals} G</p>
                      <p className="text-ink/60">{player.seasonStats.assists} A</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <PlayerActionButtons playerId={player.id} saveId={defaultSaveId} initialInteraction={player.interaction} compact />
                  </div>
                </div>
              ))}
              {(squad?.players.length ?? 0) === 0 ? (
                <p className="text-sm text-ink/62">No squad data is available for this club.</p>
              ) : null}
            </div>
          </aside>
        </section>
      </div>
    </Shell>
  );
}
