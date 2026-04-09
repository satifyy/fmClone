import { SectionTitle } from "../../components/section-title";
import { Shell } from "../../components/shell";
import { TacticsEditor } from "../../components/tactics-editor";
import { fetchTacticsBoard } from "../../lib/api";

export default async function TacticsPage() {
  const board = await fetchTacticsBoard();

  return (
    <Shell>
      <SectionTitle
        eyebrow="Tactics"
        title={board?.formation ?? "Tactics"}
        detail="Interactive tactical controls with live familiarity, intensity, and lineup feedback."
      />

      <TacticsEditor initialBoard={board} />
    </Shell>
  );
}
