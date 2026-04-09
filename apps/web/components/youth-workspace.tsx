"use client";

import type { YouthAcademyPayload, YouthPlayer } from "@fm/shared-types";

import { useState } from "react";

import { youthAction } from "../lib/api";

const finance = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const readinessColor = (r: number) =>
  r >= 65 ? "text-field" : r >= 45 ? "text-sand" : "text-ember";

const abilityColor = (r: number) =>
  r >= 14 ? "text-field" : r >= 10 ? "text-sand" : "text-ink/60";

const potentialColor = (r: number) =>
  r >= 16 ? "text-field font-semibold" : r >= 13 ? "text-sand" : "text-ink/60";

function ReadinessBar({ value }: { value: number }) {
  const color =
    value >= 65 ? "bg-field" : value >= 45 ? "bg-sand" : "bg-ember";
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-ink/55 uppercase tracking-[0.16em]">Readiness</span>
        <span className={readinessColor(value)}>{value}%</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-ink/8">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function YouthCard({
  player,
  onAction,
  isPending
}: {
  player: YouthPlayer;
  onAction: (action: "promote" | "sell") => void;
  isPending: boolean;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 border border-ink/10 bg-white/50 p-5">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-medium text-ink">{player.firstName} {player.lastName}</p>
            <p className="mt-0.5 text-xs text-ink/55">{player.positions.join(", ")} · Age {player.age}</p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
           <div>
              <p className="text-ink/50 uppercase tracking-widest text-[10px]">Ability</p>
              <p className={`mt-0.5 font-medium ${abilityColor(player.ability)}`}>{player.ability} / 20</p>
           </div>
           <div>
              <p className="text-ink/50 uppercase tracking-widest text-[10px]">Potential</p>
              <p className={`mt-0.5 font-medium ${potentialColor(player.potential)}`}>{player.potential} / 20</p>
           </div>
        </div>
        
        <div className="mt-3 text-xs">
           <p className="text-ink/50 uppercase tracking-widest text-[10px]">Personality</p>
           <p className="mt-0.5 text-ink/80 capitalize">{player.personality}</p>
        </div>

        <div className="mt-3">
           <ReadinessBar value={player.readiness} />
        </div>
      </div>
      <div className="border-t border-ink/8 pt-3">
        <div className="flex items-center justify-between text-xs text-ink/55 mb-3">
          <span>Wage</span>
          <span>{finance.format(player.weeklyWage)}/wk</span>
        </div>
        <div className="flex gap-2">
           <button
             type="button"
             onClick={() => onAction("promote")}
             disabled={isPending || player.readiness < 40}
             className="flex-1 rounded-full bg-ink py-2 text-xs font-medium text-mist transition hover:bg-ink/85 disabled:cursor-not-allowed disabled:opacity-50"
           >
             Promote
           </button>
           <button
             type="button"
             onClick={() => onAction("sell")}
             disabled={isPending}
             className="flex-1 rounded-full border border-ink/20 py-2 text-xs font-medium text-ink transition hover:border-ink/50 hover:bg-ink/5 disabled:cursor-wait disabled:opacity-50"
           >
             Sell
           </button>
        </div>
      </div>
    </div>
  );
}

export function YouthWorkspace({
  initialData,
  saveId
}: {
  initialData: YouthAcademyPayload;
  saveId: string;
}) {
  const [data, setData] = useState(initialData);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const usedPct = Math.min(100, Math.round((data.youthWagesUsed / data.youthWageBudget) * 100));

  const handleAction = async (action: "promote" | "sell", youthId: string) => {
    setError(null);
    setPendingId(youthId);
    try {
      const result = await youthAction(action, youthId, saveId);
      setData(result.academy);
    } catch (err) {
      setError(err instanceof Error ? err.message : `${action} failed`);
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="space-y-10 pb-24">
      {/* Header */}
      <div>
        <h1 className="font-display text-4xl text-ink">Youth Academy</h1>
        <p className="mt-2 text-sm text-ink/60">
          Develop the next generation of talent. Promote players to the first team or sell them for profit. Academy Rating: <span className="font-semibold text-field">{data.academyRating}/100</span>.
        </p>
      </div>

      {/* Budget bar */}
      <section className="border border-ink/10 bg-white/50 p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Academy Wage Budget</p>
          <p className="text-sm text-ink/70">
            <span className={usedPct > 90 ? "text-ember font-semibold" : ""}>{finance.format(data.youthWagesUsed)}</span>
            {" / "}
            {finance.format(data.youthWageBudget)} / wk
          </p>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-ink/8">
          <div
            className={`h-full rounded-full transition-all ${usedPct > 90 ? "bg-ember" : usedPct > 70 ? "bg-sand" : "bg-field"}`}
            style={{ width: `${usedPct}%` }}
          />
        </div>
      </section>

      {error ? <p className="text-sm text-ember">{error}</p> : null}

      {/* Youth players grid */}
      <section>
        <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Academy Prospects</p>
        {data.players.length === 0 ? (
          <p className="mt-4 text-sm text-ink/50">Your academy is currently empty.</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.players.map((player) => (
              <YouthCard
                key={player.id}
                player={player}
                onAction={(action) => void handleAction(action, player.id)}
                isPending={pendingId === player.id}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
