"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { InboxNotification } from "@fm/shared-types";
import type { MentionTarget } from "@fm/shared-types";

import { markInboxRead, runInboxAction } from "../lib/api";
import { MentionText } from "./mention-text";

type InboxListProps = {
  initialInbox: InboxNotification[];
  saveId: string;
  mentionTargets: MentionTarget[];
};

export function InboxList({ initialInbox, saveId, mentionTargets }: InboxListProps) {
  const [items, setItems] = useState(initialInbox);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const markRead = (notificationId: string) => {
    setError(null);
    setMessage(null);

    startTransition(async () => {
      try {
        const updated = await markInboxRead(notificationId, saveId);
        setItems((previous) => previous.map((item) => (item.id === updated.id ? updated : item)));
      } catch {
        setError("Unable to mark this notification as read.");
      }
    });
  };

  const runAction = (notificationId: string) => {
    setError(null);
    setMessage(null);

    startTransition(async () => {
      try {
        const result = await runInboxAction(notificationId, saveId);
        setItems((previous) => previous.map((item) => (item.id === result.notification.id ? result.notification : item)));
        setMessage(result.message);

        if (result.redirectHref) {
          router.push(result.redirectHref);
          router.refresh();
        }
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : "Unable to run inbox action.");
      }
    });
  };

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <article key={item.id} className="grid gap-3 border border-ink/10 bg-white/55 p-5 sm:grid-cols-[140px_1fr_auto]">
          <div className="text-xs uppercase tracking-[0.2em] text-ink/45">
            <div>{item.type}</div>
            <div className="mt-2">{new Date(item.createdAt).toLocaleDateString("en-US")}</div>
            <div className="mt-2 font-medium text-ink/65">{item.read ? "Read" : "Unread"}</div>
          </div>
          <div>
            {item.actionHref && item.actionType !== "simulate-next-fixture" ? (
              <Link href={item.actionHref} className="font-display text-3xl tracking-tight underline-offset-4 hover:underline">
                {item.title}
              </Link>
            ) : (
              <h2 className="font-display text-3xl tracking-tight">{item.title}</h2>
            )}
            <MentionText text={item.summary} mentions={mentionTargets} className="mt-3 block max-w-2xl text-sm text-ink/68" />
            {item.actionHref && item.actionType !== "simulate-next-fixture" ? (
              <p className="mt-3 text-xs uppercase tracking-[0.18em] text-ink/50">Routes to {item.actionHref}</p>
            ) : null}
          </div>
          <div className="self-start text-right text-sm uppercase tracking-[0.18em] text-ink/55">
            <div>{item.priority}</div>
            <div className="mt-3 flex flex-col gap-2 text-xs">
              {item.actionType === "simulate-next-fixture" ? (
                <button
                  type="button"
                  onClick={() => runAction(item.id)}
                  disabled={isPending}
                  className="border border-ink/15 bg-ink px-3 py-2 uppercase tracking-[0.16em] text-mist disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {item.actionLabel ?? "Run action"}
                </button>
              ) : item.actionHref ? (
                <Link href={item.actionHref} className="border border-ink/15 bg-[#f8f3ea] px-3 py-2 uppercase tracking-[0.16em] text-ink">
                  {item.actionLabel ?? "Open"}
                </Link>
              ) : null}

              {!item.read ? (
                <button
                  type="button"
                  onClick={() => markRead(item.id)}
                  disabled={isPending}
                  className="border border-ink/12 px-3 py-2 uppercase tracking-[0.16em] text-ink/72 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Mark read
                </button>
              ) : null}
            </div>
          </div>
        </article>
      ))}

      {message ? <p className="text-sm text-field">{message}</p> : null}
      {error ? <p className="text-sm text-ember">{error}</p> : null}
    </div>
  );
}
