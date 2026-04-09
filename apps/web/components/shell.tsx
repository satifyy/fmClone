import Link from "next/link";
import { ReactNode } from "react";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/inbox", label: "Inbox" },
  { href: "/match-center", label: "Match Center" },
  { href: "/training", label: "Training" },
  { href: "/scouting", label: "Scouting" },
  { href: "/fixtures", label: "Fixtures" },
  { href: "/squad", label: "Squad" },
  { href: "/tactics", label: "Tactics" },
  { href: "/standings", label: "Standings" },
  { href: "/transfers", label: "Transfers" },
  { href: "/finances", label: "Finances" },
  { href: "/season-analytics", label: "Analytics" },
  { href: "/season-summary", label: "Season" }
];

export const Shell = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-[#f4efe4] text-ink">
    <div className="grid min-h-screen lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="border-b border-ink/10 bg-ink px-6 py-8 text-mist lg:border-b-0 lg:border-r">
        <div className="mb-10">
          <div className="font-display text-4xl tracking-tight">Harbor</div>
          <p className="mt-2 max-w-[18ch] text-sm text-mist/70">
            League control room for the active save.
          </p>
        </div>

        <nav className="space-y-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block border-b border-mist/10 pb-3 text-sm uppercase tracking-[0.18em] text-mist/86 transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="px-5 py-6 sm:px-8 lg:px-12 lg:py-10">{children}</main>
    </div>
  </div>
);
