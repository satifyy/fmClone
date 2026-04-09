"use client";

import type { ClubSquad, Player, PlayerSquadStatus } from "@fm/shared-types";

import { useRouter } from "next/navigation";

const marketValue = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1
});

const statusTone: Record<PlayerSquadStatus, string> = {
  starters: "bg-field/12 text-field",
  bench: "bg-ink/8 text-ink",
  reserves: "bg-sand/50 text-ink/75",
  injured: "bg-ember/12 text-ember",
  suspended: "bg-sand/70 text-ink"
};

const statusLabel: Record<PlayerSquadStatus, string> = {
  starters: "Starter",
  bench: "Bench",
  reserves: "Reserve",
  injured: "Injured",
  suspended: "Suspended"
};

function recentLine(player: Player): string {
  if (player.positions.includes("GK") || player.positions.includes("CB")) {
    return `${player.recentForm.cleanSheets} CS • ${player.recentForm.minutes}m`;
  }

  return `${player.recentForm.goalContributions} GC • ${player.recentForm.minutes}m`;
}

export function SquadTable({ squad }: { squad: ClubSquad }) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {squad.groups.map((group) => (
        <section key={group.status} className="overflow-hidden border border-ink/10 bg-white/55">
          <div className="flex items-end justify-between gap-4 border-b border-ink/10 px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-ink/55">{group.label}</p>
              <p className="mt-2 text-sm text-ink/68">{group.description}</p>
            </div>
            <p className="text-sm text-ink/55">{group.players.length} players</p>
          </div>

          {group.players.length > 0 ? (
            <table className="w-full text-left text-sm">
              <thead className="bg-ink text-mist">
                <tr>
                  <th className="px-4 py-3 font-medium">Player</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Pos</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Form</th>
                  <th className="px-4 py-3 font-medium">Recent</th>
                  <th className="px-4 py-3 font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                {group.players.map((player) => (
                  <tr
                    key={player.id}
                    tabIndex={0}
                    role="link"
                    onClick={() => router.push(`/players/${player.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        router.push(`/players/${player.id}`);
                      }
                    }}
                    className="cursor-pointer border-b border-ink/8 transition-colors hover:bg-sand/35 focus:outline-none focus:ring-2 focus:ring-ink/20"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">
                        {player.firstName} {player.lastName}
                      </div>
                      <div className="mt-1 text-xs uppercase tracking-[0.18em] text-ink/45">
                        Age {player.age} • {player.nationality}
                      </div>
                    </td>
                    <td className="px-4 py-3">{player.role}</td>
                    <td className="px-4 py-3">{player.positions.join(", ")}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusTone[player.squadStatus]}`}
                      >
                        {statusLabel[player.squadStatus]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{player.recentForm.score}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.18em] text-ink/45">{player.recentForm.trend}</div>
                    </td>
                    <td className="px-4 py-3 text-ink/72">{recentLine(player)}</td>
                    <td className="px-4 py-3 font-medium">{marketValue.format(player.marketValue.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-5 py-6 text-sm text-ink/55">No players in this group.</div>
          )}
        </section>
      ))}
    </div>
  );
}
