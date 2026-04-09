import { notFound } from "next/navigation";

import { SectionTitle } from "../../../components/section-title";
import { Shell } from "../../../components/shell";
import { fetchPlayerProfile } from "../../../lib/api";
import { getFallbackPlayerProfile } from "../../../lib/squad-fallback";

export const dynamic = "force-dynamic";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1
});

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1
});

function quickReadItems(player: NonNullable<Awaited<ReturnType<typeof fetchPlayerProfile>>>) {
  return [
    {
      label: "Value",
      value: money.format(player.marketValue.amount),
      detail: `${player.marketValue.trend} valuation • ${player.marketValue.confidence}% confidence`
    },
    {
      label: "Form",
      value: `${player.recentForm.score}`,
      detail: player.recentForm.summary
    },
    {
      label: "Morale",
      value: `${player.condition.morale}`,
      detail: `Fitness ${player.condition.fitness} • Fatigue ${player.condition.fatigue}`
    },
    {
      label: "Contract",
      value: `${player.contract.yearsRemaining} yrs`,
      detail: `${money.format(player.contract.weeklyWage)}/wk • ${player.contract.squadStatus}`
    },
    {
      label: "Role Fit",
      value: `${player.roleFit.score}`,
      detail: player.roleFit.summary
    },
    {
      label: "Development",
      value: player.development.trajectory,
      detail: player.development.summary
    }
  ];
}

function statItems(player: NonNullable<Awaited<ReturnType<typeof fetchPlayerProfile>>>) {
  return [
    ["Appearances", player.seasonStats.appearances],
    ["Starts", player.seasonStats.starts],
    ["Minutes", compact.format(player.seasonStats.minutes)],
    ["Goals", player.seasonStats.goals],
    ["Assists", player.seasonStats.assists],
    ["Clean Sheets", player.seasonStats.cleanSheets],
    ["Avg Rating", player.seasonStats.averageRating]
  ];
}

export default async function PlayerPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const player = (await fetchPlayerProfile(id)) ?? getFallbackPlayerProfile(id);

  if (!player) {
    notFound();
  }

  const quickRead = quickReadItems(player);
  const primaryInjury = player.injuries.find((injury) => injury.status !== "fit");

  return (
    <Shell>
      <SectionTitle
        eyebrow="Player"
        title={`${player.firstName} ${player.lastName}`}
        detail={`${player.role} • ${player.positions.join(", ")} • Age ${player.age} • ${player.squadStatus}`}
      />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_360px]">
        <div className="space-y-8">
          <section className="overflow-hidden border border-ink/10 bg-white/55">
            <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Quick Read</p>
                  <p className="mt-3 max-w-2xl text-sm text-ink/68">
                    {player.recentForm.summary} Role fit sits at {player.roleFit.score} and the current development signal is{" "}
                    {player.development.trajectory}.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {quickRead.map((item) => (
                    <article key={item.label} className="border border-ink/10 bg-[#faf6ef] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-ink/45">{item.label}</p>
                      <p className="mt-3 text-2xl font-medium capitalize">{item.value}</p>
                      <p className="mt-2 text-sm text-ink/62">{item.detail}</p>
                    </article>
                  ))}
                </div>
              </div>

              <aside className="border border-ink/10 bg-ink px-5 py-6 text-mist">
                <p className="text-xs uppercase tracking-[0.22em] text-mist/60">Profile Card</p>
                <div className="mt-5 space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Preferred Foot</span>
                    <span className="capitalize">{player.preferredFoot}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Potential</span>
                    <span>{player.potential}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Market Value</span>
                    <span>{money.format(player.marketValue.amount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Scouting Scope</span>
                    <span className="capitalize">{player.scouting.scope}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Status</span>
                    <span className="capitalize">{player.squadStatus}</span>
                  </div>
                </div>

                {primaryInjury ? (
                  <div className="mt-6 border-t border-mist/10 pt-5 text-sm">
                    <p className="text-xs uppercase tracking-[0.18em] text-mist/60">Medical Flag</p>
                    <p className="mt-3 font-medium">{primaryInjury.type}</p>
                    <p className="mt-2 text-mist/72">Expected return {primaryInjury.expectedReturn ?? "TBD"}</p>
                  </div>
                ) : null}
              </aside>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <article className="border border-ink/10 bg-white/55 p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Season Stats</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {statItems(player).map(([label, value]) => (
                  <div key={label} className="border-b border-ink/10 pb-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-ink/45">{label}</p>
                    <p className="mt-2 text-2xl">{value}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="border border-ink/10 bg-white/55 p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Scouting Knowledge</p>
              <p className="mt-4 text-sm text-ink/68">{player.scouting.summary}</p>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>Confidence</span>
                  <span>{player.scouting.confidence}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last Updated</span>
                  <span>{player.scouting.lastUpdated}</span>
                </div>
              </div>
              <div className="mt-5">
                <p className="text-xs uppercase tracking-[0.18em] text-ink/45">Known Strengths</p>
                <p className="mt-2 text-sm text-ink/72">{player.scouting.knownStrengths.join(" • ") || "None recorded"}</p>
              </div>
              <div className="mt-5">
                <p className="text-xs uppercase tracking-[0.18em] text-ink/45">Unknowns</p>
                <p className="mt-2 text-sm text-ink/72">{player.scouting.unknowns.join(" • ") || "No material gaps"}</p>
              </div>
            </article>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <article className="border border-ink/10 bg-white/55 p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-ink/55">History</p>
              <div className="mt-5 space-y-4">
                {player.history.map((entry) => (
                  <div key={`${entry.season}-${entry.competition}`} className="border-b border-ink/10 pb-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{entry.season}</span>
                      <span className="text-ink/55">{entry.clubName}</span>
                    </div>
                    <p className="mt-2 text-ink/68">
                      {entry.appearances} apps • {entry.goals} goals • {entry.assists} assists • {entry.averageRating} avg
                    </p>
                  </div>
                ))}
              </div>
            </article>

            <article className="border border-ink/10 bg-white/55 p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Injuries And Traits</p>
              <div className="mt-5 space-y-4 text-sm">
                {player.injuries.map((injury) => (
                  <div key={`${injury.type}-${injury.occurredOn}`} className="border-b border-ink/10 pb-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{injury.type}</span>
                      <span className="capitalize text-ink/55">{injury.status}</span>
                    </div>
                    <p className="mt-2 text-ink/68">
                      {injury.occurredOn} • {injury.gamesMissed} games missed
                      {injury.expectedReturn ? ` • Return ${injury.expectedReturn}` : ""}
                    </p>
                  </div>
                ))}
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-ink/45">Traits</p>
                  <p className="mt-2 text-sm text-ink/72">{player.traits.join(" • ") || "No standout traits logged"}</p>
                </div>
              </div>
            </article>
          </section>

          <section className="border border-ink/10 bg-white/55 p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Attributes</p>
            <div className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
              {Object.entries(player.attributes).map(([label, value]) => (
                <div key={label} className="border-b border-ink/10 pb-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="uppercase tracking-[0.18em] text-ink/55">{label}</span>
                    <span>{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="border border-ink/10 bg-white/55 p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Form Window</p>
            <div className="mt-5 flex gap-2">
              {player.recentForm.recentRatings.map((rating, index) => (
                <div key={`${rating}-${index}`} className="flex h-14 w-14 items-center justify-center rounded-full bg-sand text-sm">
                  {rating}
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-ink/68">
              {player.recentForm.goalContributions} goal contributions and {player.recentForm.cleanSheets} clean sheets in the latest window.
            </p>
          </section>

          <section className="border border-ink/10 bg-white/55 p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Condition</p>
            <div className="mt-5 space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span>Morale</span>
                <span>{player.condition.morale}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Fitness</span>
                <span>{player.condition.fitness}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Fatigue</span>
                <span>{player.condition.fatigue}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Chemistry</span>
                <span>{player.condition.chemistry}</span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </Shell>
  );
}
