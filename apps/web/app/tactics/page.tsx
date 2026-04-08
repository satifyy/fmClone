import { SectionTitle } from "../../components/section-title";
import { Shell } from "../../components/shell";
import { tactics } from "../../lib/mock-data";

const meter = (value: number) => `${value}%`;

export default function TacticsPage() {
  return (
    <Shell>
      <SectionTitle
        eyebrow="Tactics"
        title={tactics.formation}
        detail="Instructions stay dense and editable. The page favors scan speed over ornament."
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <section className="space-y-6">
          {Object.entries(tactics.instructions).map(([key, value]) => (
            <div key={key} className="border-b border-ink/10 pb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="uppercase tracking-[0.18em] text-ink/55">{key}</span>
                <span>{typeof value === "number" ? meter(value) : value}</span>
              </div>
              {typeof value === "number" ? (
                <div className="mt-3 h-2 w-full bg-ink/10">
                  <div className="h-2 bg-field" style={{ width: meter(value) }} />
                </div>
              ) : null}
            </div>
          ))}
        </section>

        <aside className="border border-ink/10 bg-white/45 p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Key Roles</p>
          <div className="mt-4 space-y-4">
            {tactics.roles.map((role) => (
              <div key={role.slot} className="border-b border-ink/8 pb-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>{role.position}</span>
                  <span className="text-ink/45">{role.slot}</span>
                </div>
                <p className="mt-1 text-ink/70">{role.role}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </Shell>
  );
}

