import { SectionTitle } from "../../components/section-title";
import { Shell } from "../../components/shell";
import { getDashboard, getTrainingPlan } from "../../lib/api";

const meter = (value: number) => `${value}%`;

export default async function TrainingPage() {
  const [dashboard, trainingPlan] = await Promise.all([getDashboard(), getTrainingPlan()]);

  return (
    <Shell>
      <SectionTitle
        eyebrow="Training"
        title="Load and focus"
        detail="Training is framed around the next fixture, current injuries, and the readiness level of the active squad."
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <section className="space-y-6 border border-ink/10 bg-white/55 p-6">
          <div className="border-b border-ink/8 pb-4">
            <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Current Focus</p>
            <p className="mt-3 font-display text-5xl capitalize tracking-tight">{trainingPlan.focus}</p>
          </div>
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="uppercase tracking-[0.18em] text-ink/55">Intensity</span>
              <span>{meter(trainingPlan.intensity)}</span>
            </div>
            <div className="mt-3 h-2 bg-ink/10">
              <div className="h-2 bg-field" style={{ width: meter(trainingPlan.intensity) }} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="border border-ink/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-ink/55">Squad Fitness</p>
              <p className="mt-3 text-3xl">{dashboard.dashboard.fitness}</p>
            </div>
            <div className="border border-ink/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-ink/55">Morale</p>
              <p className="mt-3 text-3xl">{dashboard.dashboard.morale}</p>
            </div>
            <div className="border border-ink/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-ink/55">Injury Flags</p>
              <p className="mt-3 text-3xl">{dashboard.injuries.length}</p>
            </div>
          </div>
        </section>

        <aside className="border border-ink/10 bg-white/55 p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Medical Watch</p>
          <div className="mt-4 space-y-4">
            {dashboard.injuries.length > 0 ? (
              dashboard.injuries.map((item) => (
                <div key={item.playerId} className="border-b border-ink/8 pb-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium">{item.playerName}</span>
                    <span className={item.status === "out" ? "text-ember" : "text-sand"}>{item.status}</span>
                  </div>
                  <p className="mt-2 text-ink/68">{item.summary}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-ink/62">No immediate injury concerns.</p>
            )}
          </div>
        </aside>
      </div>
    </Shell>
  );
}
