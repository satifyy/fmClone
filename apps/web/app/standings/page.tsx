import { SectionTitle } from "../../components/section-title";
import { Shell } from "../../components/shell";
import { standings } from "../../lib/mock-data";

export default function StandingsPage() {
  return (
    <Shell>
      <SectionTitle
        eyebrow="Standings"
        title="League table"
        detail="Points first, then goal difference. Kept intentionally plain so ranking changes read instantly."
      />

      <div className="overflow-hidden border border-ink/10 bg-white/55">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink text-mist">
            <tr>
              <th className="px-4 py-3">Club</th>
              <th className="px-4 py-3">P</th>
              <th className="px-4 py-3">W</th>
              <th className="px-4 py-3">D</th>
              <th className="px-4 py-3">L</th>
              <th className="px-4 py-3">GD</th>
              <th className="px-4 py-3">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row) => (
              <tr key={row.clubId} className="border-b border-ink/8">
                <td className="px-4 py-3 font-medium">{row.clubName}</td>
                <td className="px-4 py-3">{row.played}</td>
                <td className="px-4 py-3">{row.won}</td>
                <td className="px-4 py-3">{row.drawn}</td>
                <td className="px-4 py-3">{row.lost}</td>
                <td className="px-4 py-3">{row.goalDifference}</td>
                <td className="px-4 py-3">{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}

