"use client";

import { useState, useTransition } from "react";

import { runPlayerAction } from "../lib/api";

type PlayerInteractionView = {
  action: "enquire" | "bid" | "talk";
  status: "monitoring" | "considering" | "engaged" | "paused";
  note: string;
  updatedAt: string;
};

type PlayerActionButtonsProps = {
  playerId: string;
  saveId: string;
  initialInteraction?: PlayerInteractionView;
  compact?: boolean;
};

const actionLabels: Record<"enquire" | "bid" | "talk", string> = {
  enquire: "Enquire",
  bid: "Bid",
  talk: "Talk"
};

export function PlayerActionButtons({ playerId, saveId, initialInteraction, compact = false }: PlayerActionButtonsProps) {
  const [interaction, setInteraction] = useState<PlayerInteractionView | undefined>(initialInteraction);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const runAction = (action: "enquire" | "bid" | "talk") => {
    setError(null);
    setMessage(null);

    startTransition(async () => {
      try {
        const result = await runPlayerAction(playerId, action, saveId);
        setInteraction({
          action: result.interaction.action,
          status: result.interaction.status,
          note: result.interaction.note,
          updatedAt: result.interaction.updatedAt
        });
        setMessage(result.message);
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : "Unable to run player action.");
      }
    });
  };

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div className="flex flex-wrap gap-2">
        {(["enquire", "bid", "talk"] as const).map((action) => {
          const active = interaction?.action === action;
          return (
            <button
              key={action}
              type="button"
              onClick={() => runAction(action)}
              disabled={isPending}
              className={`border px-3 py-1.5 text-xs uppercase tracking-[0.16em] transition ${
                active
                  ? "border-ink bg-ink text-mist"
                  : "border-ink/20 bg-white text-ink hover:border-ink/45"
              } disabled:cursor-not-allowed disabled:opacity-45`}
            >
              {actionLabels[action]}
            </button>
          );
        })}
      </div>

      {interaction ? (
        <p className="text-xs text-ink/65">
          {interaction.status} • {new Date(interaction.updatedAt).toLocaleDateString("en-US")}
        </p>
      ) : null}
      {message ? <p className="text-xs text-field">{message}</p> : null}
      {error ? <p className="text-xs text-ember">{error}</p> : null}
    </div>
  );
}
