"use client";

import type { ProgressionAction, ProgressionResult, SaveDashboardPayload } from "@fm/shared-types";

import Link from "next/link";
import { useState } from "react";

import { progressSave } from "../lib/api";

const fullDate = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric"
});

const compactDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric"
});

const finance = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const priorityTone = {
  high: "text-ember",
  medium: "text-sand",
  low: "text-ink/55"
} as const;

const pressureTone = {
  calm: "text-field",
  stable: "text-ink",
  elevated: "text-sand",
  critical: "text-ember"
} as const;

const statusTone = {
  concern: "text-sand",
  out: "text-ember"
} as const;

type DashboardWorkspaceProps = {
  initialData: SaveDashboardPayload;
};

type DashboardState = SaveDashboardPayload & {
  simulatedMatch?: ProgressionResult["simulatedMatch"];
};

export function DashboardWorkspace({ initialData }: DashboardWorkspaceProps) {
  const [data, setData] = useState<DashboardState>(initialData);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const nextFixture = data.dashboard.nextFixture;

  const handleProgress = async (action: ProgressionAction) => {
    setError(null);
    setIsPending(true);

    try {
      const nextData = await progressSave(action, data.save.id);
      setData(nextData);
    } catch (progressError) {
      setError(progressError instanceof Error ? progressError.message : "Progression failed.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-8 pb-32">
      <section className="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_360px]">
        <div className="overflow-hidden rounded-[2rem] bg-ink text-mist">
          <div className="grid gap-8 px-6 py-7 sm:px-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.22em] text-mist/58">
                <span>{data.save.name}</span>
                <span>Season {data.season.year}</span>
                <span>{fullDate.format(new Date(data.season.currentDate))}</span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-mist/55">Next Fixture</p>
                <h2 className="mt-3 max-w-[12ch] font-display text-5xl leading-none">
                  {nextFixture?.opponentName ?? "No fixture queued"}
                </h2>
                <p className="mt-4 max-w-xl text-sm text-mist/72">
                  {nextFixture
                    ? `${nextFixture.home ? "Home" : "Away"} • ${nextFixture.competition.toUpperCase()} • ${compactDate.format(new Date(nextFixture.date))}`
                    : "The current calendar is clear. Advance the save to move into the next phase."}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => void handleProgress("advance-day")}
                  disabled={isPending}
                  className="rounded-full bg-field px-4 py-2 text-sm font-medium text-white transition hover:bg-field/90 disabled:cursor-wait disabled:opacity-65"
                >
                  Advance Day
                </button>
                <button
                  type="button"
                  onClick={() => void handleProgress("simulate-next-fixture")}
                  disabled={isPending || !nextFixture}
                  className="rounded-full border border-mist/20 px-4 py-2 text-sm font-medium text-mist transition hover:border-mist/40 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Simulate Next Fixture
                </button>
                <Link href="/inbox" className="rounded-full border border-mist/20 px-4 py-2 text-sm font-medium text-mist transition hover:border-mist/40 hover:bg-white/5">
                  Review Inbox
                </Link>
                <Link
                  href="/match-center"
                  className="rounded-full border border-mist/20 px-4 py-2 text-sm font-medium text-mist transition hover:border-mist/40 hover:bg-white/5"
                >
                  Match Center
                </Link>
              </div>
              {data.simulatedMatch ? (
                <div className="rounded-3xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-mist/82">
                  Latest result: {data.simulatedMatch.score.home}-{data.simulatedMatch.score.away} vs{" "}
                  {data.simulatedMatch.opponentName}.{" "}
                  <Link href={`/matches/${data.simulatedMatch.matchId}`} className="underline underline-offset-4">
                    Open result page
                  </Link>
                </div>
              ) : null}
              {error ? <p className="text-sm text-ember">{error}</p> : null}
            </div>

            <div className="grid gap-5 border-t border-mist/10 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <div className="grid grid-cols-2 gap-4">
                <Stat label="Morale" value={String(data.dashboard.morale)} />
                <Stat label="Fitness" value={String(data.dashboard.fitness)} />
                <Stat label="Budget" value={finance.format(data.dashboard.transferBudget)} />
                <Stat label="Wages" value={finance.format(data.dashboard.wageBudget)} />
              </div>
              <div className="space-y-3 border-t border-mist/10 pt-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="uppercase tracking-[0.18em] text-mist/55">Pressure</span>
                  <span className={pressureTone[data.boardPressure.level]}>{data.boardPressure.score}/100</span>
                </div>
                <p className="text-sm text-mist/70">{data.boardPressure.summary}</p>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-5 border border-ink/10 bg-white/55 p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Unresolved Tasks</p>
            <span className="text-sm text-ink/55">{data.pendingActions.total} open</span>
          </div>
          <div className="space-y-4">
            {data.unresolvedTasks.map((task) => (
              <Link key={task.id} href={task.href} className="block border-b border-ink/8 pb-4 transition hover:border-ink/25">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="font-medium text-ink">{task.title}</span>
                  <span className={priorityTone[task.priority]}>{task.priority}</span>
                </div>
                <p className="mt-2 text-sm text-ink/65">{task.summary}</p>
              </Link>
            ))}
          </div>
          <div className="border-t border-ink/10 pt-5">
            <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Match Surfaces</p>
            <div className="mt-4 space-y-3 text-sm">
              <Link href="/match-center" className="block border-b border-ink/8 pb-3 transition hover:text-field">
                Live match center
              </Link>
              <Link href="/fixtures" className="block border-b border-ink/8 pb-3 transition hover:text-field">
                League scoreboard
              </Link>
              {data.simulatedMatch ? (
                <Link href={`/matches/${data.simulatedMatch.matchId}`} className="block transition hover:text-field">
                  Your latest result
                </Link>
              ) : (
                <span className="block text-ink/45">Your result page appears after the next simulation.</span>
              )}
            </div>
          </div>
        </aside>
      </section>

      <section className="grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="space-y-8">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="border border-ink/10 bg-white/45 p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Workflow</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <WorkflowLink href="/training" label="Open Training" detail="Adjust intensity and focus before the next block." />
                <WorkflowLink href="/transfers" label="Open Transfers" detail="Turn scouting updates into real market actions." />
                <WorkflowLink href="/tactics" label="Open Tactics" detail="Check shape, role balance, and selection." />
                <WorkflowLink href="/match-center" label="Open Match Center" detail="Focus on the live slate and the other league matches." />
                <WorkflowLink href="/fixtures" label="Open Scoreboard" detail="View the league-wide round instead of a club-only schedule." />
              </div>
            </section>

            <section className="border border-ink/10 bg-white/45 p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Recent Form</p>
              <div className="mt-5 flex flex-wrap gap-3">
                {data.dashboard.form.map((result, index) => (
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
          </div>

          <section className="border border-ink/10 bg-white/55 p-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Inbox</p>
              <Link href="/inbox" className="text-sm text-ink/55 transition hover:text-ink">
                View all
              </Link>
            </div>
            <div className="mt-5 space-y-4">
              {data.inbox.slice(0, 4).map((item) => (
                <div key={item.id} className="grid gap-2 border-b border-ink/8 pb-4 sm:grid-cols-[120px_1fr]">
                  <div className="text-xs uppercase tracking-[0.2em] text-ink/45">{item.type}</div>
                  <div>
                    <div className="flex items-center justify-between gap-4 text-sm">
                      {item.actionHref && item.actionType !== "simulate-next-fixture" ? (
                        <Link href={item.actionHref} className="font-medium underline-offset-4 hover:underline">
                          {item.title}
                        </Link>
                      ) : (
                        <span className="font-medium">{item.title}</span>
                      )}
                      <span className={priorityTone[item.priority]}>{item.priority}</span>
                    </div>
                    <p className="mt-2 text-sm text-ink/68">{item.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="border border-ink/10 bg-white/55 p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Scouting Updates</p>
            <div className="mt-5 space-y-4">
              {data.scoutingUpdates.map((update) => (
                <Link key={update.id} href={update.href} className="block border-b border-ink/8 pb-4 transition hover:border-ink/20">
                  <p className="font-medium">{update.title}</p>
                  <p className="mt-2 text-sm text-ink/68">{update.summary}</p>
                </Link>
              ))}
            </div>
          </section>

          <section className="border border-ink/10 bg-white/55 p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Medical Watch</p>
            <div className="mt-5 space-y-4">
              {data.injuries.length > 0 ? (
                data.injuries.map((item) => (
                  <div key={item.playerId} className="border-b border-ink/8 pb-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-medium">{item.playerName}</span>
                      <span className={statusTone[item.status]}>{item.status}</span>
                    </div>
                    <p className="mt-2 text-sm text-ink/68">{item.summary}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-ink/62">No active medical flags right now.</p>
              )}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="border border-ink/10 bg-white/55 p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Contract Issues</p>
              <div className="mt-5 space-y-4">
                {data.contractIssues.map((issue) => (
                  <div key={issue.playerId} className="border-b border-ink/8 pb-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-medium">{issue.playerName}</span>
                      <span className={priorityTone[issue.priority]}>{issue.monthsRemaining} mo</span>
                    </div>
                    <p className="mt-2 text-sm text-ink/68">{issue.summary}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-ink/10 bg-white/55 p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Top of Table</p>
              <div className="mt-5 space-y-3">
                {data.standings.slice(0, 4).map((row, index) => (
                  <div key={row.clubId} className="flex items-center justify-between border-b border-ink/8 pb-3 text-sm">
                    <span>
                      {index + 1}. {row.clubName}
                    </span>
                    <span className="font-medium">{row.points} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </section>

      <div className="fixed bottom-4 left-4 right-4 z-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 rounded-[1.6rem] border border-ink/10 bg-ink px-5 py-4 text-mist shadow-[0_18px_45px_rgba(18,23,29,0.25)] sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.22em] text-mist/55">Progress</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-mist/80">
              <span>{fullDate.format(new Date(data.season.currentDate))}</span>
              <span>Phase {data.season.phase}</span>
              <span>Matchday {data.season.currentMatchday}</span>
              <span>{data.pendingActions.highPriority} high-priority items</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void handleProgress("advance-day")}
              disabled={isPending}
              className="rounded-full bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-mist disabled:cursor-wait disabled:opacity-65"
            >
              Advance Day
            </button>
            <button
              type="button"
              onClick={() => void handleProgress("simulate-next-fixture")}
              disabled={isPending || !nextFixture}
              className="rounded-full bg-field px-4 py-2 text-sm font-medium text-white transition hover:bg-field/90 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Simulate Next Fixture
            </button>
            <Link href="/inbox" className="rounded-full border border-mist/20 px-4 py-2 text-sm font-medium text-mist transition hover:border-mist/40">
              Inbox
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-mist/55">{label}</p>
      <p className="mt-2 text-2xl">{value}</p>
    </div>
  );
}

function WorkflowLink({
  href,
  label,
  detail
}: {
  href: string;
  label: string;
  detail: string;
}) {
  return (
    <Link href={href} className="block border border-ink/10 px-4 py-4 transition hover:border-ink/20 hover:bg-white/70">
      <p className="font-medium">{label}</p>
      <p className="mt-2 text-sm text-ink/65">{detail}</p>
    </Link>
  );
}
