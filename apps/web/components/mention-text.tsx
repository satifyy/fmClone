import Link from "next/link";
import type { ReactNode } from "react";

import type { MentionTarget } from "@fm/shared-types";

type MentionTextProps = {
  text: string;
  mentions: MentionTarget[];
  className?: string;
};

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function MentionText({ text, mentions, className }: MentionTextProps) {
  if (!text) {
    return <span className={className} />;
  }

  const normalized = new Map<string, MentionTarget>();
  for (const mention of mentions) {
    const key = mention.label.toLowerCase();
    if (!normalized.has(key)) {
      normalized.set(key, mention);
    }
  }

  const labels = [...normalized.values()].map((mention) => mention.label).sort((left, right) => right.length - left.length);
  if (labels.length === 0) {
    return <span className={className}>{text}</span>;
  }

  const pattern = new RegExp(`\\b(${labels.map((label) => escapeRegex(label)).join("|")})\\b`, "gi");
  const parts: ReactNode[] = [];
  let cursor = 0;

  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    const label = match[0] ?? "";
    if (index > cursor) {
      parts.push(text.slice(cursor, index));
    }

    const mention = normalized.get(label.toLowerCase());
    if (mention) {
      parts.push(
        <Link key={`${mention.id}-${index}`} href={mention.href} className="underline decoration-ink/35 underline-offset-4 hover:decoration-ink">
          {label}
        </Link>
      );
    } else {
      parts.push(label);
    }

    cursor = index + label.length;
  }

  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }

  return <span className={className}>{parts}</span>;
}
