import Link from "next/link";

import { SectionTitle } from "../../components/section-title";
import { Shell } from "../../components/shell";
import { squad } from "../../lib/mock-data";

export default function SquadPage() {
  return (
    <Shell>
      <SectionTitle
        eyebrow="Squad"
        title="Player readiness"
        detail="Compact operational view of role, morale, fatigue, and fit before lineup lock."
      />

      <div className="overflow-hidden border border-ink/10 bg-white/55">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink text-mist">
            <tr>
              <th className="px-4 py-3 font-medium">Player</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Pos</th>
              <th className="px-4 py-3 font-medium">Morale</th>
              <th className="px-4 py-3 font-medium">Fatigue</th>
              <th className="px-4 py-3 font-medium">Fitness</th>
            </tr>
          </thead>
          <tbody>
            {squad.map((player) => (
              <tr key={player.id} className="border-b border-ink/8">
                <td className="px-4 py-3">
                  <Link href={`/players/${player.id}`} className="font-medium hover:underline">
                    {player.firstName} {player.lastName}
                  </Link>
                </td>
                <td className="px-4 py-3">{player.role}</td>
                <td className="px-4 py-3">{player.positions.join(", ")}</td>
                <td className="px-4 py-3">{player.condition.morale}</td>
                <td className="px-4 py-3">{player.condition.fatigue}</td>
                <td className="px-4 py-3">{player.condition.fitness}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}

