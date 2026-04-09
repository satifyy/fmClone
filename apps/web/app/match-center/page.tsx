import Link from "next/link";

import { SectionTitle } from "../../components/section-title";
import { Shell } from "../../components/shell";
import { liveMatchCenter, resultView } from "../../lib/test-data";

export default function MatchCenterPage() {
  const headline = liveMatchCenter.headline;

  return (
    <Shell>
      <SectionTitle
        eyebrow="Match Center"
        title={`Live matchday ${liveMatchCenter.matchday}`}
        detail="A dedicated slate view for the current round, with your fixture in focus and the rest of the league still visible."
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_360px]">
        <div className="space-y-8">
          <section className="overflow-hidden rounded-[2rem] bg-ink px-6 py-8 text-mist sm:px-8">
            <p className="text-xs uppercase tracking-[0.24em] text-mist/55">Live Focus</p>
            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-mist/55">{headline.homeClub.shortName}</p>
                <h2 className="mt-2 font-display text-4xl tracking-tight">{headline.homeClub.name}</h2>
              </div>
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.22em] text-field">{headline.minute}' live</p>
                <div className="mt-3 font-display text-6xl leading-none tracking-tight">
                  {headline.score.home}-{headline.score.away}
                </div>
              </div>
              <div className="lg:text-right">
                <p className="text-sm uppercase tracking-[0.18em] text-mist/55">{headline.awayClub.shortName}</p>
                <h2 className="mt-2 font-display text-4xl tracking-tight">{headline.awayClub.name}</h2>
              </div>
            </div>
            <p className="mt-6 max-w-2xl text-sm text-mist/72">{headline.note}</p>
          </section>

          <section className="grid gap-4 border border-ink/10 bg-white/55 p-6 lg:grid-cols-3">
            {liveMatchCenter.watchPanels.map((panel) => (
              <div key={panel.title}>
                <p className="text-xs uppercase tracking-[0.22em] text-ink/55">{panel.title}</p>
                <p className="mt-3 font-display text-3xl tracking-tight">{panel.value}</p>
                <p className="mt-2 text-sm text-ink/65">{panel.detail}</p>
              </div>
            ))}
          </section>

          <section className="border border-ink/10 bg-white/55 p-6">
            <div className="flex items-end justify-between border-b border-ink/10 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Other matches</p>
                <h2 className="mt-2 font-display text-3xl tracking-tight">League slate</h2>
              </div>
              <p className="text-sm text-ink/62">{liveMatchCenter.date}</p>
            </div>

            <div className="mt-5 space-y-4">
              {liveMatchCenter.slate.map((fixture) => (
                <div
                  key={fixture.fixtureId}
                  className="grid gap-3 border-b border-ink/8 pb-4 last:border-b-0 last:pb-0 sm:grid-cols-[1fr_auto_1fr_auto]"
                >
                  <div className="text-lg font-medium">{fixture.homeClub.name}</div>
                  <div className="text-center font-display text-3xl tracking-tight">
                    {fixture.score.home}-{fixture.score.away}
                  </div>
                  <div className="text-lg font-medium sm:text-right">{fixture.awayClub.name}</div>
                  <div className="text-right text-xs uppercase tracking-[0.18em] text-field">
                    {fixture.state === "live" ? `${fixture.minute}' live` : "final"}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="border border-ink/10 bg-white/55 p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Live feed</p>
            <div className="mt-5 space-y-4">
              {liveMatchCenter.keyMoments.map((entry) => (
                <div key={`${entry.minute}-${entry.label}`} className="border-l border-ink/12 pl-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{entry.label}</span>
                    <span className="text-ink/45">{entry.minute}'</span>
                  </div>
                  <p className="mt-2 text-sm text-ink/68">{entry.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="border border-ink/10 bg-white/55 p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Separate surfaces</p>
            <div className="mt-4 space-y-3 text-sm">
              <Link className="block border-b border-ink/10 pb-3 hover:text-field" href={`/matches/${resultView.match.id}`}>
                Open your last result page
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
