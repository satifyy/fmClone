import { DashboardWorkspace } from "../components/dashboard-workspace";
import { SectionTitle } from "../components/section-title";
import { Shell } from "../components/shell";
import { getDashboard, getMentionTargets } from "../lib/api";

export default async function DashboardPage() {
  const [dashboard, mentionTargets] = await Promise.all([getDashboard(), getMentionTargets()]);

  return (
    <Shell>
      <SectionTitle
        eyebrow="Dashboard"
        title="Club control room"
        detail="Operate the active save from one place: progress time, clear outstanding work, and jump straight into the next decision surface."
      />
      <DashboardWorkspace initialData={dashboard} mentionTargets={mentionTargets} />
    </Shell>
  );
}
