"use client";

import type { StaffDepartmentPayload, StaffMember } from "@fm/shared-types";

import { useState } from "react";

import { staffAction } from "../lib/api";

const finance = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const happinessTone = (h: number) =>
  h >= 70 ? "text-field" : h >= 45 ? "text-sand" : "text-ember";

const personalityColor: Record<string, string> = {
  Methodical: "bg-[#3b5249] text-mist",
  Motivator: "bg-[#5a3b28] text-mist",
  Tactician: "bg-[#283d5a] text-mist",
  Developer: "bg-[#4a3b5a] text-mist",
  Disciplinarian: "bg-[#5a3b3b] text-mist",
  Charismatic: "bg-[#3b4e3b] text-mist"
};

function HappinessBar({ value }: { value: number }) {
  const color =
    value >= 70 ? "bg-field" : value >= 45 ? "bg-sand" : "bg-ember";
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-ink/55 uppercase tracking-[0.16em]">Happiness</span>
        <span className={happinessTone(value)}>{value}/100</span>
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

function AttributeRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-ink/60">{label}</span>
      <div className="flex items-center gap-2">
        <div className="h-1 w-20 overflow-hidden rounded-full bg-ink/8">
          <div className="h-full rounded-full bg-ink/30" style={{ width: `${(value / 20) * 100}%` }} />
        </div>
        <span className="w-5 text-right font-medium">{value}</span>
      </div>
    </div>
  );
}

function StaffCard({
  member,
  mode,
  onAction,
  isPending
}: {
  member: StaffMember;
  mode: "current" | "hire";
  onAction: () => void;
  isPending: boolean;
}) {
  const attrs = member.attributes;
  const keyAttrs: [string, number][] =
    member.role === "Fitness Coach"
      ? [["Fitness", attrs.fitness], ["Youth Dev", attrs.youthDevelopment], ["Data", attrs.dataAnalysis]]
      : member.role === "Goalkeeper Coach"
        ? [["Coaching", attrs.coaching], ["Youth Dev", attrs.youthDevelopment], ["Tactics", attrs.tactics]]
        : member.role === "Scout Chief"
          ? [["Scouting", attrs.scoutingJudgement], ["Tactics", attrs.tactics], ["Data", attrs.dataAnalysis]]
          : member.role === "Data Analyst"
            ? [["Data", attrs.dataAnalysis], ["Tactics", attrs.tactics], ["Scouting", attrs.scoutingJudgement]]
            : member.role === "Sports Director"
              ? [["Scouting", attrs.scoutingJudgement], ["Data", attrs.dataAnalysis], ["Motivation", attrs.motivation]]
              : [["Coaching", attrs.coaching], ["Tactics", attrs.tactics], ["Motivation", attrs.motivation]];

  return (
    <div className="flex flex-col gap-4 border border-ink/10 bg-white/50 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-ink">{member.name}</p>
          <p className="mt-0.5 text-xs text-ink/55">{member.role} · Age {member.age}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] ${personalityColor[member.personality] ?? "bg-ink/8 text-ink"}`}
        >
          {member.personality}
        </span>
      </div>

      <div className="space-y-1.5">
        {keyAttrs.map(([label, val]) => (
          <AttributeRow key={label} label={label} value={val} />
        ))}
      </div>

      {mode === "current" ? (
        <>
          <HappinessBar value={member.happiness} />
          <div className="border-t border-ink/8 pt-3">
            <div className="flex items-center justify-between text-xs text-ink/55">
              <span>Contract expires {member.contract.expiresOn.slice(0, 7)}</span>
              <span>{finance.format(member.contract.weeklyWage)}/wk</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onAction}
            disabled={isPending}
            className="w-full rounded-full border border-ember/30 py-2 text-xs font-medium text-ember transition hover:border-ember/60 hover:bg-ember/5 disabled:cursor-wait disabled:opacity-50"
          >
            Release
          </button>
        </>
      ) : (
        <>
          <div className="border-t border-ink/8 pt-3">
            <div className="flex items-center justify-between text-xs text-ink/55">
              <span>Contract: {member.contract.yearsRemaining}y</span>
              <span>{finance.format(member.contract.weeklyWage)}/wk</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onAction}
            disabled={isPending}
            className="w-full rounded-full bg-ink py-2 text-xs font-medium text-mist transition hover:bg-ink/85 disabled:cursor-wait disabled:opacity-50"
          >
            Hire
          </button>
        </>
      )}
    </div>
  );
}

export function StaffWorkspace({
  initialData,
  saveId
}: {
  initialData: StaffDepartmentPayload;
  saveId: string;
}) {
  const [data, setData] = useState(initialData);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const usedPct = Math.min(100, Math.round((data.staffWagesUsed / data.staffWageBudget) * 100));

  const handleAction = async (action: "hire" | "sack", staffId: string) => {
    setError(null);
    setPendingId(staffId);
    try {
      const result = await staffAction(action, staffId, saveId);
      setData(result.department);
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
        <h1 className="font-display text-4xl text-ink">Staff</h1>
        <p className="mt-2 text-sm text-ink/60">
          Manage your backroom team. Staff happiness drives retention — unhappy staff will resign.
        </p>
      </div>

      {/* Budget bar */}
      <section className="border border-ink/10 bg-white/50 p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Staff Wage Budget</p>
          <p className="text-sm text-ink/70">
            <span className={usedPct > 90 ? "text-ember font-semibold" : ""}>{finance.format(data.staffWagesUsed)}</span>
            {" / "}
            {finance.format(data.staffWageBudget)} / wk
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

      {/* Current staff */}
      <section>
        <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Current Staff</p>
        {data.staff.length === 0 ? (
          <p className="mt-4 text-sm text-ink/50">No staff currently employed. Hire from the candidates below.</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.staff.map((member) => (
              <StaffCard
                key={member.id}
                member={member}
                mode="current"
                onAction={() => void handleAction("sack", member.id)}
                isPending={pendingId === member.id}
              />
            ))}
          </div>
        )}
      </section>

      {/* Available to hire */}
      {data.availableToHire.length > 0 ? (
        <section>
          <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Available to Hire</p>
          <p className="mt-1 text-sm text-ink/50">
            Free agents currently on the market. Budget remaining:{" "}
            <span className="font-medium text-ink">{finance.format(data.staffWageBudget - data.staffWagesUsed)}/wk</span>
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.availableToHire.map((member) => (
              <StaffCard
                key={member.id}
                member={member}
                mode="hire"
                onAction={() => void handleAction("hire", member.id)}
                isPending={pendingId === member.id}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
