import { SectionTitle } from "../../components/section-title";
import { Shell } from "../../components/shell";
import { dashboard, fixtures } from "../../lib/mock-data";

export default function FixturesPage() {
  return (
    <Shell>
      <SectionTitle
        eyebrow="Fixtures"
        title="Upcoming schedule"
        detail="League rhythm, venue context, and the next control point for simulation."
      />

      <div className="space-y-4">
        {fixtures.map((fixture) => (
          <div key={fixture.id} className="grid gap-3 border border-ink/10 bg-white/55 p-5 sm:grid-cols-[140px_1fr_auto]">
            <div className="text-sm text-ink/55">
              <div>MD {fixture.matchday}</div>
              <div>{fixture.date}</div>
            </div>
            <div>
              <div className="font-display text-3xl tracking-tight">
                {fixture.homeClubId === dashboard.club.id ? dashboard.club.name : "Opponent"} vs{" "}
                {fixture.awayClubId === dashboard.club.id ? dashboard.club.name : dashboard.nextFixture?.opponentName}
              </div>
              <p className="mt-2 text-sm text-ink/65">{fixture.competition.toUpperCase()}</p>
            </div>
            <div className="self-center text-sm uppercase tracking-[0.18em] text-field">{fixture.status}</div>
          </div>
        ))}
      </div>
    </Shell>
  );
}

