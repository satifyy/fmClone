"use client";

import { useMemo, useState, useTransition } from "react";

import type { ClubFinanceBoardPayload, FinanceMechanicAction } from "@fm/shared-types";

import { adjustClubBudget, defaultSaveId, runFinanceMechanic } from "../lib/api";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

type FinanceBoardProps = {
  initialData: ClubFinanceBoardPayload;
};

export function FinanceBoard({ initialData }: FinanceBoardProps) {
  const [data, setData] = useState(initialData);
  const [transferBudget, setTransferBudget] = useState(initialData.finances.transferBudget);
  const [wageBudget, setWageBudget] = useState(initialData.finances.wageBudget);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const runMechanic = (action: FinanceMechanicAction) => {
    setError(null);
    setMessage(null);

    startTransition(async () => {
      try {
        const result = await runFinanceMechanic(data.clubId, action, defaultSaveId);
        setData(result.board);
        setTransferBudget(result.board.finances.transferBudget);
        setWageBudget(result.board.finances.wageBudget);
        setMessage(result.outcome.message);
      } catch (mechanicError) {
        setError(mechanicError instanceof Error ? mechanicError.message : "Finance mechanic failed.");
      }
    });
  };

  const bounds = useMemo(
    () => ({
      minTransfer: Math.min(...data.adjustmentRules.map((rule) => rule.minTransferBudget)),
      maxTransfer: Math.max(...data.adjustmentRules.map((rule) => rule.maxTransferBudget)),
      minWage: Math.min(...data.adjustmentRules.map((rule) => rule.minWageBudget)),
      maxWage: Math.max(...data.adjustmentRules.map((rule) => rule.maxWageBudget))
    }),
    [data.adjustmentRules]
  );

  const saveAdjustments = () => {
    setError(null);
    setMessage(null);

    startTransition(async () => {
      try {
        const updated = await adjustClubBudget(data.clubId, {
          transferBudget,
          wageBudget,
          saveId: defaultSaveId
        });

        setData(updated);
        setTransferBudget(updated.finances.transferBudget);
        setWageBudget(updated.finances.wageBudget);
        setMessage("Budget allocation updated.");
      } catch (adjustmentError) {
        setError(adjustmentError instanceof Error ? adjustmentError.message : "Budget update failed.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-5">
        <div className="border border-ink/10 bg-[#f8f3ea] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-ink/55">Balance</p>
          <p className="mt-2 text-3xl">{money.format(data.finances.balance)}</p>
        </div>
        <div className="border border-ink/10 bg-[#f8f3ea] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-ink/55">Total Debt</p>
          <p className="mt-2 text-3xl text-ember/90">{money.format(data.finances.debt ?? 0)}</p>
        </div>
        <div className="border border-ink/10 bg-[#f8f3ea] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-ink/55">Transfer Budget</p>
          <p className="mt-2 text-3xl">{money.format(data.finances.transferBudget)}</p>
        </div>
        <div className="border border-ink/10 bg-[#f8f3ea] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-ink/55">Wage Budget</p>
          <p className="mt-2 text-3xl">{money.format(data.finances.wageBudget)}</p>
        </div>
        <div className="border border-ink/10 bg-[#f8f3ea] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-ink/55">Digital Follows</p>
          <p className="mt-2 text-3xl">{Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(data.digital?.followers ?? 0)}</p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="border border-ink/10 bg-white/60 p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Budget Management</p>
          <div className="mt-5 grid gap-5">
            <label className="block">
              <span className="text-sm text-ink/65">Transfer budget</span>
              <input
                type="range"
                min={bounds.minTransfer}
                max={bounds.maxTransfer}
                step={50_000}
                value={transferBudget}
                onChange={(event) => setTransferBudget(Number(event.target.value))}
                className="mt-3 w-full"
              />
              <div className="mt-2 flex items-center justify-between text-xs text-ink/58">
                <span>{money.format(bounds.minTransfer)}</span>
                <span>{money.format(transferBudget)}</span>
                <span>{money.format(bounds.maxTransfer)}</span>
              </div>
            </label>

            <label className="block">
              <span className="text-sm text-ink/65">Wage budget</span>
              <input
                type="range"
                min={bounds.minWage}
                max={bounds.maxWage}
                step={5_000}
                value={wageBudget}
                onChange={(event) => setWageBudget(Number(event.target.value))}
                className="mt-3 w-full"
              />
              <div className="mt-2 flex items-center justify-between text-xs text-ink/58">
                <span>{money.format(bounds.minWage)}</span>
                <span>{money.format(wageBudget)}</span>
                <span>{money.format(bounds.maxWage)}</span>
              </div>
            </label>

            <button
              type="button"
              onClick={saveAdjustments}
              disabled={isPending}
              className="w-fit bg-ink px-4 py-2 text-sm text-mist disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isPending ? "Saving..." : "Save budget split"}
            </button>
            {message ? <p className="text-sm text-field">{message}</p> : null}
            {error ? <p className="text-sm text-ember">{error}</p> : null}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="border border-ink/10 bg-ink p-5 text-mist">
            <p className="text-xs uppercase tracking-[0.22em] text-mist/60">Board confidence</p>
            <h2 className="mt-2 font-display text-4xl capitalize">{data.boardConfidence.level}</h2>
            <p className="mt-2 text-sm text-mist/76">{data.boardConfidence.summary}</p>
            <p className="mt-3 text-sm text-mist/76">Score {data.boardConfidence.score}/100</p>
          </div>

          <div className="border border-ink/10 bg-white/60 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Ownership</p>
            <p className="mt-2 text-lg capitalize">{data.ownership.model.replace("-", " ")}</p>
            <p className="mt-2 text-sm text-ink/68">{data.ownership.summary}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.16em] text-ink/50">
              Owners: {data.ownership.owners.join(" • ")}
            </p>
          </div>
        </aside>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="border border-ink/10 bg-white/60 p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Finance Mechanics</p>
          <p className="mt-3 max-w-2xl text-sm text-ink/66">
            Run active interventions to reshape cash flow and board support without waiting for passive updates.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => runMechanic("request-investment")}
              className="border border-ink/15 bg-[#f8f3ea] px-3 py-2 text-xs uppercase tracking-[0.16em] text-ink disabled:cursor-not-allowed disabled:opacity-45"
            >
              Request investment
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => runMechanic("commercial-push")}
              className="border border-ink/15 bg-[#f8f3ea] px-3 py-2 text-xs uppercase tracking-[0.16em] text-ink disabled:cursor-not-allowed disabled:opacity-45"
            >
              Commercial push
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => runMechanic("trim-wage-bill")}
              className="border border-ink/15 bg-[#f8f3ea] px-3 py-2 text-xs uppercase tracking-[0.16em] text-ink disabled:cursor-not-allowed disabled:opacity-45"
            >
              Trim wage bill
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => runMechanic("take-loan")}
              className="border border-ink/15 bg-sand/30 px-3 py-2 text-xs uppercase tracking-[0.16em] text-ink disabled:cursor-not-allowed disabled:opacity-45"
            >
              Take $2.5M Loan
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => runMechanic("pay-debt")}
              className="border border-ink/15 bg-sand/30 px-3 py-2 text-xs uppercase tracking-[0.16em] text-ink disabled:cursor-not-allowed disabled:opacity-45"
            >
              Pay Down Debt
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => runMechanic("sign-sponsorship")}
              className="border border-ink/15 bg-sand/30 px-3 py-2 text-xs uppercase tracking-[0.16em] text-ink disabled:cursor-not-allowed disabled:opacity-45"
            >
              Sign Sponsor
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => runMechanic("viral-campaign")}
              className="border border-ink/15 bg-sand/30 px-3 py-2 text-xs uppercase tracking-[0.16em] text-ink disabled:cursor-not-allowed disabled:opacity-45"
            >
              Viral Ad Campaign
            </button>
          </div>
          <p className="mt-4 text-xs text-ink/55">These actions persist and update board confidence calculations. Digital hooks cost money but build following.</p>
        </article>

        <aside className="border border-ink/10 bg-white/60 p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Recent Mechanics</p>
          <div className="mt-4 space-y-3 text-sm">
            {data.recentMechanics.length > 0 ? (
              data.recentMechanics.map((entry) => (
                <div key={entry.id} className="border border-ink/10 bg-[#f8f3ea] p-3">
                  <p className="font-medium">{new Date(entry.occurredOn).toLocaleDateString("en-US")}</p>
                  <p className="mt-1 text-ink/66">{entry.message}</p>
                  <p className="mt-2 text-xs text-ink/55">
                    Balance {entry.balanceDelta >= 0 ? "+" : ""}
                    {money.format(entry.balanceDelta)} • Board {entry.boardDelta >= 0 ? "+" : ""}
                    {entry.boardDelta}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-ink/62">No finance mechanics have been triggered in this save.</p>
            )}
          </div>
        </aside>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="border border-ink/10 bg-white/60 p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Budget Rules</p>
          <div className="mt-4 space-y-3 text-sm">
            {data.adjustmentRules.map((rule) => (
              <div key={rule.id} className="border border-ink/10 bg-[#f8f3ea] p-3">
                <p className="font-medium">{rule.label}</p>
                <p className="mt-1 text-ink/65">{rule.detail}</p>
                <p className="mt-2 text-xs text-ink/58">
                  Transfer {money.format(rule.minTransferBudget)} - {money.format(rule.maxTransferBudget)}
                </p>
                <p className="text-xs text-ink/58">
                  Wages {money.format(rule.minWageBudget)} - {money.format(rule.maxWageBudget)}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="border border-ink/10 bg-white/60 p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Ownership And Investor Events</p>
          <div className="mt-4 space-y-3 text-sm">
            {data.investorEvents.length > 0 ? (
              data.investorEvents.map((event) => (
                <div key={event.id} className="border border-ink/10 bg-[#f8f3ea] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{event.title}</p>
                    <span className="text-xs uppercase tracking-[0.14em] text-ink/55">{event.occurredOn}</span>
                  </div>
                  <p className="mt-1 text-ink/66">{event.summary}</p>
                  {typeof event.cashDelta === "number" ? <p className="mt-2 text-xs text-ink/60">Impact {money.format(event.cashDelta)}</p> : null}
                </div>
              ))
            ) : (
              <p className="text-ink/62">No investor events logged in the current window.</p>
            )}
          </div>
        </article>
      </section>

      <section className="border border-ink/10 bg-white/60 p-5">
        <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Long-Term Financial Plan</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <div>
            <p className="text-sm font-medium">Objectives ({data.longTermPlan.horizonYears}-year horizon)</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink/68">
              {data.longTermPlan.objectives.map((objective) => (
                <li key={objective}>{objective}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium">Risk Register</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink/68">
              {data.longTermPlan.risks.map((risk) => (
                <li key={risk}>{risk}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
