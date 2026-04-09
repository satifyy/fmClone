"use client";

import type { SimulatedRoundMatchSummary } from "@fm/shared-types";

import Link from "next/link";
import { useEffect, useRef } from "react";

type RoundResultsModalProps = {
  userResult: SimulatedRoundMatchSummary;
  otherResults: SimulatedRoundMatchSummary[];
  onClose: () => void;
};

export function RoundResultsModal({ userResult, otherResults, onClose }: RoundResultsModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog) {
      dialog.showModal();
    }
  }, []);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    const rect = dialogRef.current?.getBoundingClientRect();
    if (
      rect &&
      (event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom)
    ) {
      onClose();
    }
  };

  const userScoreStr = `${userResult.score.home}\u2013${userResult.score.away}`;
  const userIsHome = userResult.homeClub.id === "club-harbor" || userResult.homeClub.name.includes("Harbor");
  const userGoals = userIsHome ? userResult.score.home : userResult.score.away;
  const oppGoals = userIsHome ? userResult.score.away : userResult.score.home;
  const userWon = userGoals > oppGoals;
  const userLost = userGoals < oppGoals;

  const resultLabel = userWon ? "Victory" : userLost ? "Defeat" : "Draw";
  const resultColor = userWon ? "text-field" : userLost ? "text-ember" : "text-sand";

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      onClose={onClose}
      className="m-auto max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[1.5rem] border border-ink/10 bg-[#f4efe4] p-0 text-ink shadow-[0_32px_80px_rgba(18,23,29,0.28)] backdrop:bg-ink/40 backdrop:backdrop-blur-sm"
    >
      {/* Header */}
      <div className="bg-ink px-6 py-6 text-mist">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-mist/55">Match Result</p>
            <p className={`mt-1 text-4xl font-semibold tracking-tight ${resultColor}`}>
              {resultLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full text-mist/60 transition hover:bg-white/10 hover:text-mist"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 flex items-center gap-4">
          <div className="flex-1 text-right">
            <p className="text-sm text-mist/70">{userResult.homeClub.name}</p>
          </div>
          <div className="rounded-xl border border-mist/15 bg-white/8 px-5 py-2">
            <span className="font-mono text-2xl font-bold">{userScoreStr}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm text-mist/70">{userResult.awayClub.name}</p>
          </div>
        </div>

        <div className="mt-3 text-center">
          <Link
            href={`/matches/${userResult.matchId}`}
            onClick={onClose}
            className="text-xs text-mist/60 underline underline-offset-4 hover:text-mist"
          >
            Open full match report &rarr;
          </Link>
        </div>
      </div>

      {/* Other round results */}
      {otherResults.length > 0 ? (
        <div className="px-6 py-5">
          <p className="text-[11px] uppercase tracking-[0.22em] text-ink/50">
            Other Round Outcomes
          </p>
          <div className="mt-4 space-y-2">
            {otherResults.map((result) => (
              <div
                key={result.matchId}
                className="flex items-center justify-between gap-4 border-b border-ink/8 pb-3 text-sm last:border-b-0 last:pb-0"
              >
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="truncate text-ink/80">{result.homeClub.shortName}</span>
                  <span className="shrink-0 font-mono font-semibold text-ink">
                    {result.score.home}&ndash;{result.score.away}
                  </span>
                  <span className="truncate text-ink/80">{result.awayClub.shortName}</span>
                </div>
                <Link
                  href={`/matches/${result.matchId}`}
                  onClick={onClose}
                  className="shrink-0 text-xs text-ink/45 underline underline-offset-4 hover:text-ink"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Footer */}
      <div className="border-t border-ink/8 px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-full bg-ink py-2.5 text-sm font-medium text-mist transition hover:bg-ink/85"
        >
          Continue
        </button>
      </div>
    </dialog>
  );
}
