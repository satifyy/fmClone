"use client";

import type { Club } from "@fm/shared-types";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

import { defaultClubId } from "../lib/api";

type TeamSelectorProps = {
  clubs: Club[];
};

export function TeamSelector({ clubs }: TeamSelectorProps) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  const activeClubId = useMemo(() => {
    const match = pathname.match(/^\/clubs\/([^/]+)/);
    return match?.[1] ?? defaultClubId;
  }, [pathname]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return clubs;
    }

    return clubs.filter((club) => club.name.toLowerCase().includes(normalized) || club.shortName.toLowerCase().includes(normalized));
  }, [clubs, query]);

  return (
    <section className="rounded-2xl border border-mist/10 bg-white/5 p-4">
      <p className="text-[11px] uppercase tracking-[0.2em] text-mist/55">Team Selector</p>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Filter clubs"
        className="mt-3 w-full border border-mist/15 bg-transparent px-3 py-2 text-xs text-mist placeholder:text-mist/45 focus:border-mist/35 focus:outline-none"
      />
      <div className="mt-3 max-h-56 space-y-2 overflow-auto pr-1">
        {filtered.map((club) => {
          const active = club.id === activeClubId;
          return (
            <Link
              key={club.id}
              href={`/clubs/${club.id}`}
              className={`block border px-3 py-2 text-xs transition ${
                active
                  ? "border-mist/40 bg-mist/15 text-white"
                  : "border-mist/10 text-mist/78 hover:border-mist/30 hover:text-white"
              }`}
            >
              <div className="font-medium">{club.name}</div>
              <div className="mt-1 uppercase tracking-[0.16em] text-[10px] text-mist/55">{club.shortName}</div>
            </Link>
          );
        })}
        {filtered.length === 0 ? <p className="text-xs text-mist/55">No clubs match this filter.</p> : null}
      </div>
    </section>
  );
}
