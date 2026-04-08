import { Shell } from "../components/shell";
import { SectionTitle } from "../components/section-title";
import { dashboard, matchTimeline, standings } from "../lib/mock-data";

const finance = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

export default function DashboardPage() {
  return (
    <Shell>
      <SectionTitle
        eyebrow="Dashboard"
        title="Club control room"
        detail="One active save, one club, one clear view of readiness before the next block of league fixtures."
      />

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_340px]">
        <div className="space-y-8">
          <div className="overflow-hidden rounded-[2rem] bg-ink text-mist">
            <div className="grid gap-10 px-6 py-8 sm:px-8 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-mist/60">Next Fixture</p>
                <h2 className="mt-3 max-w-[10ch] font-display text-5xl leading-none">
                  {dashboard.nextFixture?.opponentName}
                </h2>
                <p className="mt-4 text-sm text-mist/72">
                  {dashboard.nextFixture?.home ? "Home" : "Away"} • {dashboard.nextFixture?.competition} •{" "}
                  {dashboard.nextFixture?.date}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-mist/10 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-mist/55">Morale</p>
                  <p className="mt-2 text-4xl">{dashboard.morale}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-mist/55">Fitness</p>
                  <p className="mt-2 text-4xl">{dashboard.fitness}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-mist/55">Transfer Budget</p>
                  <p className="mt-2 text-2xl">{finance.format(dashboard.transferBudget)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-mist/55">Wage Budget</p>
                  <p className="mt-2 text-2xl">{finance.format(dashboard.wageBudget)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="border border-ink/10 bg-white/40 p-6 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Recent Form</p>
              <div className="mt-5 flex gap-3">
                {dashboard.form.map((result, index) => (
                  <div
                    key={`${result}-${index}`}
                    className={`flex h-14 w-14 items-center justify-center rounded-full text-lg ${
                      result === "W"
                        ? "bg-field text-white"
                        : result === "D"
                          ? "bg-sand text-ink"
                          : "bg-ember text-white"
                    }`}
                  >
                    {result}
                  </div>
                ))}
              </div>
            </section>

            <section className="border border-ink/10 bg-white/40 p-6 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.22em] text-ink/55">League Table</p>
              <div className="mt-4 space-y-3">
                {standings.slice(0, 4).map((row, index) => (
                  <div key={row.clubId} className="flex items-center justify-between border-b border-ink/8 pb-3 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="w-4 text-ink/45">{index + 1}</span>
                      <span>{row.clubName}</span>
                    </div>
                    <span className="font-medium">{row.points} pts</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <aside className="border border-ink/10 bg-white/55 p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Match Center</p>
          <div className="mt-5 space-y-4">
            {matchTimeline.map((entry) => (
              <div key={`${entry.minute}-${entry.label}`} className="border-l border-ink/15 pl-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{entry.label}</span>
                  <span className="text-ink/45">{entry.minute}'</span>
                </div>
                <p className="mt-2 text-sm text-ink/68">{entry.text}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </Shell>
  );
}

