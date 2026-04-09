import { SectionTitle } from "../../components/section-title";
import { Shell } from "../../components/shell";
import { getScoutingPage } from "../../lib/api";

const money = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(amount);

const bandColor: Record<string, string> = {
  low: "text-field",
  medium: "text-sand",
  high: "text-ember"
};

export default async function ScoutingPage() {
  const scouting = await getScoutingPage();

  return (
    <Shell>
      <SectionTitle
        eyebrow="Scouting"
        title="Scouting network"
        detail="Assignments, discovery pipeline, and uncertain player estimates stay in one recruitment page so scout quality and risk are visible before you bid."
      />

      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <section className="border border-ink/10 bg-white/60 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-ink/50">Scout Assignments</p>
            <div className="mt-5 space-y-4">
              {scouting.assignments.map((assignment) => {
                const scout = scouting.scouts.find((item) => item.id === assignment.scoutId);
                return (
                  <article key={assignment.id} className="border-b border-ink/8 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-display text-3xl tracking-tight">{scout?.name ?? "Unknown scout"}</h2>
                        <p className="mt-2 text-sm text-ink/68">
                          {assignment.coverageType} coverage on {assignment.coverageLabel}
                        </p>
                      </div>
                      <div className="text-right text-xs uppercase tracking-[0.18em] text-ink/48">
                        <div>{assignment.priority}</div>
                        <div className="mt-2">Due {new Date(assignment.nextReportDue).toLocaleDateString("en-US")}</div>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-ink/48">Overall</p>
                        <p className="mt-2 text-2xl">{scout?.overall ?? "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-ink/48">Leads</p>
                        <p className="mt-2 text-2xl">
                          {assignment.activeLeads}/{assignment.capacity}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-ink/48">Progress</p>
                        <p className="mt-2 text-2xl">{assignment.progress}%</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-ink/48">Reliability</p>
                        <p className="mt-2 text-2xl">{scout?.reliability ?? "-"}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="border border-ink/10 bg-white/60 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-ink/50">Discovery Pipeline</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-5">
              {Object.entries(scouting.pipeline).map(([stage, count]) => (
                <div key={stage} className="border border-ink/8 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-ink/48">{stage}</p>
                  <p className="mt-3 font-display text-4xl tracking-tight">{count}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="border border-ink/10 bg-white/60">
          <div className="border-b border-ink/10 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.22em] text-ink/50">Player Discovery Board</p>
            <p className="mt-2 max-w-2xl text-sm text-ink/68">
              Estimated attributes stay explicitly uncertain, and the assigned scouts determine how tight each projection is.
            </p>
          </div>

          <div>
            {scouting.players.map((entry) => (
              <article
                key={entry.player.id}
                className="grid gap-5 border-b border-ink/8 px-5 py-5 last:border-b-0 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-ink/48">
                    <span>{entry.player.positions.join("/")}</span>
                    <span>{entry.knowledge.pipelineStage}</span>
                    <span>{entry.knowledge.interest}</span>
                    <span>{entry.knowledge.assignedCoverage}</span>
                  </div>
                  <h2 className="mt-2 font-display text-3xl tracking-tight">
                    {entry.player.firstName} {entry.player.lastName}
                  </h2>
                  <p className="mt-2 text-sm text-ink/68">{entry.knowledge.recommendation}</p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-ink/48">Fit</p>
                      <p className="mt-2 text-2xl">{entry.knowledge.fitScore}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-ink/48">Familiarity</p>
                      <p className="mt-2 text-2xl">{entry.knowledge.familiarity}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-ink/48">Value</p>
                      <p className="mt-2 text-xl">{money(entry.knowledge.estimatedMarketValue)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-ink/48">Scout accuracy</p>
                      <p className="mt-2 text-2xl">{entry.scoutQualityEffect.expectedAccuracy}%</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-ink/48">Strengths</p>
                      <p className="mt-2 text-ink/68">{entry.knowledge.strengths.join(", ")}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-ink/48">Risks</p>
                      <p className="mt-2 text-ink/68">{entry.knowledge.risks.join(", ")}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-ink/48">Unknowns</p>
                      <p className="mt-2 text-ink/68">{entry.knowledge.unknowns.join(", ")}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.18em] text-ink/48">Estimated attributes</p>
                    <p className="text-xs text-ink/55">{entry.scoutQualityEffect.summary}</p>
                  </div>
                  <div className="space-y-3">
                    {entry.knowledge.attributeEstimates.map((estimate) => (
                      <div key={estimate.attribute}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="capitalize text-ink">{estimate.attribute}</span>
                          <span className={bandColor[estimate.uncertainty]}>
                            {estimate.low}-{estimate.high} ({estimate.expected})
                          </span>
                        </div>
                        <div className="mt-2 h-2 bg-ink/8">
                          <div
                            className="h-2 bg-ink"
                            style={{
                              width: `${(estimate.high / 20) * 100}%`
                            }}
                          />
                        </div>
                        <div className="mt-1 text-xs text-ink/52">Confidence {estimate.confidence}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </Shell>
  );
}
