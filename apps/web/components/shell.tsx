import Link from "next/link";
import { ReactNode } from "react";

const navGroups = [
  {
    title: "Control",
    items: [
      { href: "/", label: "Dashboard" },
      { href: "/inbox", label: "Inbox" },
      { href: "/match-center", label: "Match Center" },
      { href: "/fixtures", label: "Fixtures" },
      { href: "/standings", label: "Standings" }
    ]
  },
  {
    title: "Squad",
    items: [
      { href: "/squad", label: "Squad" },
      { href: "/training", label: "Training" },
      { href: "/tactics", label: "Tactics" },
      { href: "/scouting", label: "Scouting" },
      { href: "/transfers", label: "Transfers" },
      { href: "/staff", label: "Staff" },
      { href: "/academy", label: "Academy" }
    ]
  },
  {
    title: "Board",
    items: [
      { href: "/finances", label: "Finances" },
      { href: "/season-analytics", label: "Analytics" },
      { href: "/season-summary", label: "Season" }
    ]
  }
];

export const Shell = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-[#f4efe4] text-ink">
      <div className="grid min-h-screen lg:grid-cols-[290px_minmax(0,1fr)]">
        <aside className="border-b border-ink/10 bg-ink px-6 py-8 text-mist lg:border-b-0 lg:border-r">
          <div className="mb-8">
            <div className="font-display text-4xl tracking-tight">Harbor</div>
            <p className="mt-2 max-w-[19ch] text-sm text-mist/70">
              League control room for the active save.
            </p>
          </div>

          <div className="space-y-5">
            {navGroups.map((group) => (
              <section key={group.title} className="space-y-2">
                <p className="text-[11px] uppercase tracking-[0.2em] text-mist/52">{group.title}</p>
                <nav className="space-y-2">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block border border-mist/10 px-3 py-2 text-xs uppercase tracking-[0.16em] text-mist/84 transition hover:border-mist/30 hover:text-white"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </section>
            ))}
          </div>
        </aside>

        <main className="px-5 py-6 sm:px-8 lg:px-12 lg:py-10">{children}</main>
      </div>
    </div>
  );
};
