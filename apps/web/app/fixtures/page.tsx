import Link from "next/link";

import type { FixtureHistoryBucket, FixtureResultSummary } from "@fm/shared-types";

import { SectionTitle } from "../../components/section-title";
import { Shell } from "../../components/shell";
import { getFixtureHistory, getSeasonArchive } from "../../lib/api";

type SearchParams = Record<string, string | string[] | undefined>;

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  weekday: "short"
});

const phaseCopy: Record<FixtureHistoryBucket["phase"], { title: string; detail: string; tone: string }> = {
  upcoming: {
    title: "Upcoming",
    detail: "Scheduled and locked matches still ahead.",
    tone: "text-field"
  },
  completed: {
    title: "Completed",
    detail: "Played fixtures from the selected season view.",
    tone: "text-emerald-700"
  },
  postponed: {
    title: "Postponed",
    detail: "Fixtures that need a new date.",
    tone: "text-amber-700"
  }
};

function getSingleParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(value: string): string {
  return dateFormatter.format(new Date(`${value}T12:00:00.000Z`));
}

function buildHref(params: {
  season?: string;
  view?: string;
  competition?: string;
  status?: string;
  page?: number;
}) {
  const searchParams = new URLSearchParams();

  if (params.season) {
    searchParams.set("season", params.season);
  }

  if (params.view) {
    searchParams.set("view", params.view);
  }

  if (params.competition && params.competition !== "all") {
    searchParams.set("competition", params.competition);
  }

  if (params.status && params.status !== "all") {
    searchParams.set("status", params.status);
  }

  if (params.page && params.page > 1) {
    searchParams.set("page", String(params.page));
  }

  const query = searchParams.toString();
  return query ? `/fixtures?${query}` : "/fixtures";
}

function groupFixturesByDate(fixtures: FixtureResultSummary[]) {
  return fixtures.reduce<Array<{ date: string; fixtures: FixtureResultSummary[] }>>((groups, fixture) => {
    const existing = groups.find((group) => group.date === fixture.date);
    if (existing) {
      existing.fixtures.push(fixture);
      return groups;
    }

    groups.push({ date: fixture.date, fixtures: [fixture] });
    return groups;
  }, []);
}

function FixtureRow({ fixture }: { fixture: FixtureResultSummary }) {
  return (
    <div className="grid gap-3 border-b border-ink/8 py-4 last:border-b-0 sm:grid-cols-[150px_minmax(0,1fr)_170px] sm:items-center">
      <div className="text-sm text-ink/55">
        <div>{formatDate(fixture.date)}</div>
        <div>{fixture.competition.toUpperCase()} • MD {fixture.matchday}</div>
      </div>

      <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                    <div className="text-left text-lg font-medium">
                      <Link href={`/clubs/${fixture.homeClub.id}`} className="underline-offset-4 hover:underline">
                        {fixture.homeClub.name}
                      </Link>
                    </div>
        <div className="text-center font-display text-3xl tracking-tight">
          {fixture.score ? `${fixture.score.home} - ${fixture.score.away}` : fixture.phase === "postponed" ? "PPD" : "vs"}
        </div>
                    <div className="text-left text-lg font-medium sm:text-right">
                      <Link href={`/clubs/${fixture.awayClub.id}`} className="underline-offset-4 hover:underline">
                        {fixture.awayClub.name}
                      </Link>
                    </div>
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <span className="text-xs uppercase tracking-[0.18em] text-ink/55">{fixture.status}</span>
        {fixture.matchId ? (
          <Link className="text-sm text-ink/68 underline-offset-4 hover:underline" href={`/matches/${fixture.matchId}`}>
            Open result
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function CalendarView({ fixtures }: { fixtures: FixtureResultSummary[] }) {
  const groups = groupFixturesByDate(fixtures);

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <section key={group.date} className="border border-ink/10 bg-white/55 p-5">
          <div className="border-b border-ink/10 pb-3">
            <p className="text-xs uppercase tracking-[0.22em] text-ink/55">{group.date}</p>
            <h3 className="mt-2 font-display text-2xl tracking-tight">{formatDate(group.date)}</h3>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {group.fixtures.map((fixture) => (
              <div key={fixture.fixtureId} className="border border-ink/10 bg-[#f8f3ea] p-4">
                <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.18em] text-ink/55">
                  <span>{fixture.competition}</span>
                  <span>{fixture.status}</span>
                </div>
                <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <div className="text-sm font-medium">{fixture.homeClub.shortName}</div>
                  <div className="font-display text-3xl tracking-tight">
                    {fixture.score ? `${fixture.score.home}-${fixture.score.away}` : fixture.phase === "postponed" ? "PPD" : "vs"}
                  </div>
                  <div className="text-right text-sm font-medium">{fixture.awayClub.shortName}</div>
                </div>
                <p className="mt-3 text-sm text-ink/65">
                  {fixture.homeClub.name} vs {fixture.awayClub.name}
                </p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default async function FixturesPage({
  searchParams
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const season = getSingleParam(params?.season);
  const view = getSingleParam(params?.view) === "calendar" ? "calendar" : "list";
  const competition = getSingleParam(params?.competition) ?? "all";
  const status = getSingleParam(params?.status) ?? "all";
  const page = Math.max(1, Number(getSingleParam(params?.page) ?? "1") || 1);

  const [archive, history] = await Promise.all([
    getSeasonArchive(),
    getFixtureHistory({
      seasonId: season,
      competition: competition === "all" ? undefined : competition,
      status: status === "all" ? undefined : status,
      page,
      pageSize: 12
    })
  ]);

  const selectedSeason = archive.find((item) => item.seasonId === history.seasonId) ?? archive[0];

  return (
    <Shell>
      <SectionTitle
        eyebrow="Fixtures"
        title="Season fixture tracker"
        detail="Switch between calendar and list views, move through archived seasons, and separate upcoming, completed, and postponed fixtures cleanly."
      />

      <div className="space-y-8">
        <section className="grid gap-4 border border-ink/10 bg-white/55 p-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-5">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Season archive</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {archive.map((item) => {
                  const active = item.seasonId === history.seasonId;

                  return (
                    <Link
                      key={item.seasonId}
                      href={buildHref({ season: item.seasonId, view, competition, status })}
                      className={`border px-4 py-3 text-sm transition ${active ? "border-ink bg-ink text-mist" : "border-ink/12 bg-[#f8f3ea] text-ink hover:border-ink/35"}`}
                    >
                      <div className="font-medium">{item.label}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.16em] opacity-70">
                        {item.current ? "Current season" : `${item.completedFixtures}/${item.totalFixtures} played`}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-sm">
              <div className="flex gap-2">
                {["list", "calendar"].map((option) => (
                  <Link
                    key={option}
                    href={buildHref({ season: history.seasonId, view: option, competition, status })}
                    className={`border px-3 py-2 uppercase tracking-[0.16em] ${view === option ? "border-ink bg-ink text-mist" : "border-ink/12 bg-[#f8f3ea] text-ink"}`}
                  >
                    {option}
                  </Link>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {["all", ...history.availableCompetitions].map((option) => (
                  <Link
                    key={option}
                    href={buildHref({ season: history.seasonId, view, competition: option, status })}
                    className={`border px-3 py-2 uppercase tracking-[0.16em] ${competition === option ? "border-ink bg-white text-ink" : "border-ink/12 bg-[#f8f3ea] text-ink/65"}`}
                  >
                    {option}
                  </Link>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {["all", "upcoming", "completed", "postponed"].map((option) => (
                  <Link
                    key={option}
                    href={buildHref({ season: history.seasonId, view, competition, status: option })}
                    className={`border px-3 py-2 uppercase tracking-[0.16em] ${status === option ? "border-ink bg-white text-ink" : "border-ink/12 bg-[#f8f3ea] text-ink/65"}`}
                  >
                    {option}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <aside className="border border-ink/10 bg-[#f8f3ea] p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Selection</p>
            <h2 className="mt-3 font-display text-4xl tracking-tight">{history.seasonLabel}</h2>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="border border-ink/10 bg-white/70 p-3">
                <div className="text-ink/55">Fixtures</div>
                <div className="mt-2 font-display text-3xl">{selectedSeason?.totalFixtures ?? history.total}</div>
              </div>
              <div className="border border-ink/10 bg-white/70 p-3">
                <div className="text-ink/55">Played</div>
                <div className="mt-2 font-display text-3xl">{selectedSeason?.completedFixtures ?? 0}</div>
              </div>
            </div>
            <p className="mt-4 text-sm text-ink/65">
              Page {history.page} of {history.totalPages} with {history.total} fixtures after filters.
            </p>
          </aside>
        </section>

        <div className="space-y-6">
          {history.buckets.map((bucket) => (
            <section key={bucket.phase} className="space-y-4">
              <div className="flex flex-col gap-2 border-b border-ink/10 pb-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className={`text-xs uppercase tracking-[0.22em] ${phaseCopy[bucket.phase].tone}`}>{phaseCopy[bucket.phase].title}</p>
                  <h2 className="mt-2 font-display text-3xl tracking-tight">{bucket.total} fixtures</h2>
                </div>
                <p className="text-sm text-ink/62">{phaseCopy[bucket.phase].detail}</p>
              </div>

              {bucket.fixtures.length === 0 ? (
                <div className="border border-dashed border-ink/15 bg-white/45 p-5 text-sm text-ink/55">No fixtures in this section for the active filters.</div>
              ) : view === "calendar" ? (
                <CalendarView fixtures={bucket.fixtures} />
              ) : (
                <div className="border border-ink/10 bg-white/55 px-5">
                  {bucket.fixtures.map((fixture) => (
                    <FixtureRow key={fixture.fixtureId} fixture={fixture} />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-ink/10 pt-4 text-sm">
          <Link
            href={buildHref({ season: history.seasonId, view, competition, status, page: Math.max(1, history.page - 1) })}
            className={`border px-4 py-2 ${history.page === 1 ? "pointer-events-none border-ink/10 text-ink/30" : "border-ink/15 bg-[#f8f3ea] text-ink"}`}
          >
            Previous
          </Link>

          <span className="text-ink/55">
            {history.page === history.totalPages ? "End of filtered history" : "More fixtures available"}
          </span>

          <Link
            href={buildHref({ season: history.seasonId, view, competition, status, page: Math.min(history.totalPages, history.page + 1) })}
            className={`border px-4 py-2 ${history.page === history.totalPages ? "pointer-events-none border-ink/10 text-ink/30" : "border-ink/15 bg-[#f8f3ea] text-ink"}`}
          >
            Next
          </Link>
        </div>
      </div>
    </Shell>
  );
}
