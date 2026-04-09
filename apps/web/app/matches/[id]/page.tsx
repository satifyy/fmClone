import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionTitle } from "../../../components/section-title";
import { Shell } from "../../../components/shell";
import { resultView } from "../../../lib/test-data";

const statRows = [
  { label: "Possession", homeKey: "possession" },
  { label: "Shots", homeKey: "shots" },
  { label: "Shots On Target", homeKey: "shotsOnTarget" },
  { label: "xG", homeKey: "xg" },
  { label: "Corners", homeKey: "corners" },
  { label: "Fouls", homeKey: "fouls" }
] as const;

export default async function MatchResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (id !== resultView.match.id) {
    notFound();
  }

  const { match } = resultView;

  return (
    <Shell>
      <SectionTitle
        eyebrow="Match Result"
        title={`${resultView.homeClub.name} ${match.result.score.home}-${match.result.score.away} ${resultView.awayClub.name}`}
        detail={`${resultView.competition} • Matchday ${resultView.matchday} • ${resultView.date}`}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_360px]">
        <div className="space-y-8">
          <section className="overflow-hidden rounded-[2rem] bg-ink px-6 py-8 text-mist sm:px-8">
            <p className="text-xs uppercase tracking-[0.24em] text-mist/55">Full-time</p>
            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-mist/55">{resultView.homeClub.shortName}</p>
                <h2 className="mt-2 font-display text-4xl tracking-tight">{resultView.homeClub.name}</h2>
              </div>
              <div className="text-center font-display text-6xl leading-none tracking-tight">
                {match.result.score.home}-{match.result.score.away}
              </div>
              <div className="lg:text-right">
                <p className="text-sm uppercase tracking-[0.18em] text-mist/55">{resultView.awayClub.shortName}</p>
                <h2 className="mt-2 font-display text-4xl tracking-tight">{resultView.awayClub.name}</h2>
              </div>
            </div>
            <p className="mt-6 max-w-2xl text-sm text-mist/72">{resultView.summary}</p>
          </section>

          <section className="grid gap-4 border border-ink/10 bg-white/55 p-6 lg:grid-cols-3">
            {resultView.standoutLines.map((line) => (
              <p key={line} className="text-sm leading-6 text-ink/72">
                {line}
              </p>
            ))}
          </section>

          <section className="border border-ink/10 bg-white/55 p-6">
            <div className="flex items-end justify-between border-b border-ink/10 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Match Stats</p>
                <h2 className="mt-2 font-display text-3xl tracking-tight">Performance split</h2>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {statRows.map((row) => {
                const stat = match.result.stats[row.homeKey];
                return (
                  <div key={row.label} className="grid grid-cols-[72px_minmax(0,1fr)_72px] items-center gap-4 text-sm">
                    <span className="text-left font-medium">{stat.home}</span>
                    <div className="text-center text-ink/55">{row.label}</div>
                    <span className="text-right font-medium">{stat.away}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="border border-ink/10 bg-white/55 p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Event Feed</p>
            <div className="mt-5 space-y-4">
              {match.eventFeed.events.map((event) => (
                <div key={`${event.minute}-${event.description}`} className="border-l border-ink/12 pl-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{event.type.replaceAll("-", " ")}</span>
                    <span className="text-ink/45">{event.minute}'</span>
                  </div>
                  <p className="mt-2 text-sm text-ink/68">{event.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="border border-ink/10 bg-white/55 p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Player Ratings</p>
            <div className="mt-4 space-y-3">
              {match.result.playerRatings.map((rating) => (
                <div key={rating.playerId} className="flex items-center justify-between text-sm">
                  <span>{rating.playerId}</span>
                  <span className="font-medium">{rating.rating.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="border border-ink/10 bg-white/55 p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Feed Capability</p>
            <p className="mt-4 text-sm text-ink/68">
              Current mode: {match.eventFeed.mode}. This route is ready to expand into stepwise or live feeds later.
            </p>
            <p className="mt-2 text-sm text-ink/55">{match.eventFeed.availableModes.join(" • ")}</p>
          </section>

          <section className="border border-ink/10 bg-white/55 p-6">
            <div className="space-y-3 text-sm">
              <Link className="block border-b border-ink/10 pb-3 hover:text-field" href="/match-center">
                Back to live match center
              </Link>
              <Link className="block pb-1 hover:text-field" href="/fixtures">
                Open league scoreboard
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </Shell>
  );
}
