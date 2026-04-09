"use client";

import { useMemo, useState, useTransition } from "react";

import type { Player, TacticalBoardDto, TacticalBoardSlot, TacticsUpdateRequest } from "@fm/shared-types";

import { defaultClubId, previewTactics, updateTactics } from "../lib/api";

type TacticsEditorProps = {
  initialBoard: TacticalBoardDto | null;
};

const lineToRow: Record<TacticalBoardSlot["line"], number> = {
  attack: 1,
  midfield: 2,
  defense: 3,
  goalkeeper: 4
};

const instructionLabels: Record<keyof TacticalBoardDto["instructions"], string> = {
  mentality: "Mentality",
  pressingIntensity: "Pressing",
  tempo: "Tempo",
  width: "Width",
  defensiveLine: "Defensive Line",
  directness: "Directness",
  timeWasting: "Time Wasting"
};

const mentalityOptions: TacticalBoardDto["instructions"]["mentality"][] = [
  "very-defensive",
  "defensive",
  "balanced",
  "positive",
  "attacking"
];

const toRequest = (board: TacticalBoardDto): TacticsUpdateRequest => ({
  formation: board.formation,
  instructions: board.instructions,
  roles: board.starters.map((slot) => ({
    slot: slot.id,
    playerId: slot.player?.id ?? "",
    position: slot.position,
    role: slot.role
  })),
  benchPlayerIds: board.bench.map((player) => player.id)
});

const playerName = (player: Player | null | undefined): string =>
  player ? `${player.firstName} ${player.lastName}` : "Unassigned";

const ratingTone = (value: number): string => {
  if (value >= 80) return "text-field";
  if (value >= 65) return "text-ink";
  return "text-ember";
};

export function TacticsEditor({ initialBoard }: TacticsEditorProps) {
  const [board, setBoard] = useState<TacticalBoardDto | null>(initialBoard);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(initialBoard?.starters[0]?.id ?? null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(initialBoard ? null : "Tactics data is unavailable.");
  const [isPending, startTransition] = useTransition();

  const savedSignature = useMemo(() => (initialBoard ? JSON.stringify(toRequest(initialBoard)) : null), [initialBoard]);
  const currentSignature = useMemo(() => (board ? JSON.stringify(toRequest(board)) : null), [board]);
  const hasUnsavedChanges = savedSignature !== null && currentSignature !== null && savedSignature !== currentSignature;

  const selectedSlot = board?.starters.find((slot) => slot.id === selectedSlotId) ?? board?.starters[0] ?? null;
  const selectedStarterIds = new Set(board?.starters.map((slot) => slot.player?.id).filter((value): value is string => Boolean(value)) ?? []);
  const selectedBenchIds = new Set(board?.bench.map((player) => player.id) ?? []);
  const benchLimit = Math.max(0, (board?.squad.length ?? 0) - (board?.starters.length ?? 0));

  const commitPreview = (nextRequest: TacticsUpdateRequest) => {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      try {
        const nextBoard = await previewTactics(board?.clubId ?? defaultClubId, nextRequest);
        setBoard(nextBoard);
        setSelectedSlotId((current) => current ?? nextBoard.starters[0]?.id ?? null);
      } catch {
        setError("Unable to preview tactics changes right now.");
      }
    });
  };

  const commitSave = () => {
    if (!board) return;
    setError(null);
    setMessage(null);
    startTransition(async () => {
      try {
        const saved = await updateTactics(board.clubId, toRequest(board));
        setBoard(saved);
        setMessage("Tactics saved.");
      } catch {
        setError("Unable to save tactics changes.");
      }
    });
  };

  const updateFormation = (formation: string) => {
    if (!board) return;
    commitPreview({ ...toRequest(board), formation });
  };

  const updateMentality = (mentality: TacticalBoardDto["instructions"]["mentality"]) => {
    if (!board) return;
    commitPreview({ ...toRequest(board), instructions: { ...board.instructions, mentality } });
  };

  const adjustInstruction = (key: Exclude<keyof TacticalBoardDto["instructions"], "mentality">, delta: number) => {
    if (!board) return;
    commitPreview({
      ...toRequest(board),
      instructions: {
        ...board.instructions,
        [key]: Math.max(0, Math.min(100, board.instructions[key] + delta))
      }
    });
  };

  const updateSelectedSlotRole = (role: string) => {
    if (!board || !selectedSlot) return;
    commitPreview({
      ...toRequest(board),
      roles: toRequest(board).roles.map((entry) => (entry.slot === selectedSlot.id ? { ...entry, role } : entry))
    });
  };

  const updateSelectedSlotPlayer = (playerId: string) => {
    if (!board || !selectedSlot) return;
    const request = toRequest(board);
    const current = request.roles.find((entry) => entry.slot === selectedSlot.id);
    const occupied = request.roles.find((entry) => entry.playerId === playerId);
    const nextRoles = request.roles.map((entry) => {
      if (entry.slot === selectedSlot.id) {
        return { ...entry, playerId };
      }

      if (occupied && current && entry.slot === occupied.slot) {
        return { ...entry, playerId: current.playerId };
      }

      return entry;
    });

    commitPreview({
      ...request,
      roles: nextRoles,
      benchPlayerIds: request.benchPlayerIds.filter((id) => id !== playerId)
    });
  };

  const toggleBenchPlayer = (playerId: string) => {
    if (!board || selectedStarterIds.has(playerId)) return;
    const request = toRequest(board);
    const exists = request.benchPlayerIds.includes(playerId);
    const benchPlayerIds = exists
      ? request.benchPlayerIds.filter((id) => id !== playerId)
      : [...request.benchPlayerIds, playerId].slice(0, benchLimit);

    commitPreview({ ...request, benchPlayerIds });
  };

  const assignmentLabel = (playerId: string): string => {
    if (!board) return "Available";
    const starterSlot = board.starters.find((slot) => slot.player?.id === playerId);
    if (starterSlot) {
      return `Starter • ${starterSlot.label}`;
    }

    if (selectedBenchIds.has(playerId)) {
      return "Substitute";
    }

    return "Available";
  };

  if (!board) {
    return <div className="border border-ember/25 bg-white/70 p-6 text-sm text-ink/72">{error ?? "Loading tactics..."}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_360px]">
        <section className="overflow-hidden border border-ink/10 bg-white/60">
          <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Shape Board</p>
              <h2 className="mt-2 font-display text-3xl text-ink">{board.formation}</h2>
            </div>
            <label className="text-sm text-ink/70">
              <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-ink/55">Formation</span>
              <select
                value={board.formation}
                onChange={(event) => updateFormation(event.target.value)}
                className="border border-ink/15 bg-white px-3 py-2"
              >
                {board.availableFormations.map((formation) => (
                  <option key={formation} value={formation}>
                    {formation}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-6 p-5">
            <div className="grid gap-4 rounded-[1.75rem] bg-ink p-4 text-mist">
              <div className="grid min-h-[520px] grid-cols-5 grid-rows-4 gap-3 rounded-[1.35rem] border border-mist/10 bg-[linear-gradient(180deg,rgba(130,167,108,0.96),rgba(72,109,56,0.98))] p-4">
                {board.starters.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setSelectedSlotId(slot.id)}
                    style={{ gridColumn: slot.lane + 1, gridRow: lineToRow[slot.line] }}
                    className={`min-h-[108px] border px-3 py-2 text-left transition ${
                      selectedSlot?.id === slot.id ? "border-sand bg-black/28" : "border-white/10 bg-black/18 hover:bg-black/24"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-mist/70">
                      <span>{slot.label}</span>
                      <span className={ratingTone(slot.familiarity)}>{slot.familiarity}</span>
                    </div>
                    <p className="mt-3 text-sm font-medium leading-tight">{playerName(slot.player)}</p>
                    <p className="mt-2 text-xs text-mist/70">{slot.role}</p>
                    <div className="mt-3 flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-mist/60">
                      <span>{slot.position}</span>
                      <span>{slot.fitScore} fit</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="border border-ink/10 bg-[#fffaf0] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-ink/52">Familiarity</p>
                <p className="mt-2 font-display text-4xl">{board.summary.familiarity}</p>
                <p className="mt-2 text-sm text-ink/68">{board.summary.tacticalStyle}</p>
              </div>
              <div className="border border-ink/10 bg-[#fffaf0] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-ink/52">Intensity</p>
                <p className="mt-2 font-display text-4xl">{board.summary.intensity}</p>
                <p className="mt-2 text-sm text-ink/68">Squad load rises with pressing, tempo, and line height.</p>
              </div>
              <div className="border border-ink/10 bg-[#fffaf0] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-ink/52">Fitness Cost</p>
                <p className="mt-2 font-display text-4xl">{board.summary.projectedFitnessCost}</p>
                <p className="mt-2 text-sm text-ink/68">Projected matchday drain on the selected XI.</p>
              </div>
              <div className="border border-ink/10 bg-[#fffaf0] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-ink/52">Bench</p>
                <p className="mt-2 font-display text-4xl">{board.bench.length}</p>
                <p className="mt-2 text-sm text-ink/68">Reserve group carried into the tactical board.</p>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="border border-ink/10 bg-white/70 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Slot Control</p>
            {selectedSlot ? (
              <div className="mt-4 space-y-4">
                <div>
                  <p className="font-medium text-ink">{selectedSlot.label}</p>
                  <p className="mt-1 text-sm text-ink/68">
                    {selectedSlot.position} slot, {selectedSlot.familiarity} familiarity, {selectedSlot.fitScore} fit
                  </p>
                </div>
                <p className="text-sm text-ink/68">Choose a player from the matchday selection list to assign this slot.</p>
                <label className="block text-sm text-ink/72">
                  <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-ink/55">Role</span>
                  <select
                    value={selectedSlot.role}
                    onChange={(event) => updateSelectedSlotRole(event.target.value)}
                    className="w-full border border-ink/15 bg-white px-3 py-2"
                  >
                    {selectedSlot.roleOptions.map((option) => (
                      <option key={option.role} value={option.role}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ) : null}
          </section>

          <section className="border border-ink/10 bg-white/70 p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Intensity Controls</p>
              <label className="text-sm text-ink/72">
                <select
                  value={board.instructions.mentality}
                  onChange={(event) => updateMentality(event.target.value as TacticalBoardDto["instructions"]["mentality"])}
                  className="border border-ink/15 bg-white px-3 py-2"
                >
                  {mentalityOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-4 space-y-3">
              {(Object.keys(board.instructions) as Array<keyof TacticalBoardDto["instructions"]>)
                .filter((key) => key !== "mentality")
                .map((key) => (
                  <div key={key} className="grid grid-cols-[1fr_auto] gap-4 border-t border-ink/8 pt-3 text-sm">
                    <div>
                      <p className="text-ink">{instructionLabels[key]}</p>
                      <div className="mt-2 h-2 bg-ink/10">
                        <div className="h-2 bg-field" style={{ width: `${board.instructions[key]}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => adjustInstruction(key, -5)} className="border border-ink/15 px-2 py-1">
                        -
                      </button>
                      <span className="min-w-10 text-center">{board.instructions[key]}</span>
                      <button type="button" onClick={() => adjustInstruction(key, 5)} className="border border-ink/15 px-2 py-1">
                        +
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        </aside>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="border border-ink/10 bg-white/70 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Matchday Selection</p>
            <p className="text-sm text-ink/62">
              XI {board.starters.length} • Subs {board.bench.length}/{benchLimit}
            </p>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {board.squad.map((player) => {
                const isStarter = selectedStarterIds.has(player.id);
                const isBench = selectedBenchIds.has(player.id);
                const assignedSlot = board.starters.find((slot) => slot.player?.id === player.id);
                const canBench = !isStarter;

                return (
                  <div
                    key={player.id}
                    className={`border p-4 ${
                      isStarter ? "border-ink bg-ink/[0.04]" : isBench ? "border-field bg-field/8" : "border-ink/10 bg-[#fffaf0]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-ink">
                        {player.firstName} {player.lastName}
                      </p>
                      <span className="text-xs uppercase tracking-[0.18em] text-ink/52">{player.positions.join("/")}</span>
                    </div>
                    <p className="mt-2 text-sm text-ink/68">{player.role}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-ink/52">
                      fitness {player.condition.fitness} • morale {player.condition.morale}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-xs uppercase tracking-[0.18em] text-ink/52">{assignmentLabel(player.id)}</span>
                      {selectedSlot ? (
                        <button
                          type="button"
                          onClick={() => updateSelectedSlotPlayer(player.id)}
                          disabled={assignedSlot?.id === selectedSlot.id}
                          className="border border-ink/15 px-3 py-1 text-xs uppercase tracking-[0.16em] text-ink disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          {assignedSlot?.id === selectedSlot.id ? "Selected Slot" : `Assign ${selectedSlot.label}`}
                        </button>
                      ) : null}
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="text-xs text-ink/58">
                        {assignedSlot ? `${assignedSlot.role} in ${assignedSlot.label}` : "Available for bench or rotation"}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleBenchPlayer(player.id)}
                        disabled={!canBench}
                        className="border border-ink/15 px-3 py-1 text-xs uppercase tracking-[0.16em] text-ink disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        {isBench ? "Remove Sub" : "Make Sub"}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <aside className="border border-ink/10 bg-white/70 p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Validation</p>
          <div className="mt-4 space-y-3 text-sm text-ink/72">
            <p className={board.validation.valid ? "text-field" : "text-ember"}>
              {board.validation.valid ? "Lineup and bench pass validation." : "Board has validation issues."}
            </p>
            {board.validation.issues.length > 0 ? (
              <div className="space-y-2">
                {board.validation.issues.map((issue) => (
                  <p key={issue} className="border-l border-ember pl-3 text-ember">
                    {issue}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={commitSave}
              disabled={isPending || !board.validation.valid}
              className="bg-ink px-4 py-2 text-sm text-mist disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Working..." : "Save Tactics"}
            </button>
            {hasUnsavedChanges ? <span className="text-sm text-ink/60">Unsaved changes</span> : null}
          </div>
          {message ? <p className="mt-3 text-sm text-field">{message}</p> : null}
          {error ? <p className="mt-3 text-sm text-ember">{error}</p> : null}
        </aside>
      </section>
    </div>
  );
}
