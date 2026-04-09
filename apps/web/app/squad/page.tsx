import { SectionTitle } from "../../components/section-title";
import { Shell } from "../../components/shell";
import { SquadTable } from "../../components/squad-table";
import { defaultClubId, fetchClubSquad } from "../../lib/api";
import { getFallbackClubSquad } from "../../lib/squad-fallback";

export const dynamic = "force-dynamic";

export default async function SquadPage() {
  const squad = (await fetchClubSquad(defaultClubId)) ?? getFallbackClubSquad();

  return (
    <Shell>
      <SectionTitle
        eyebrow="Squad"
        title="Player readiness"
        detail={`Full ${squad.formation} squad view with matchday grouping, recent form, and player value.`}
      />

      <SquadTable squad={squad} />
    </Shell>
  );
}
