import type { TransferCenterItem } from "@fm/shared-types";

import { SectionTitle } from "../../components/section-title";
import { Shell } from "../../components/shell";
import { getTransferCenter } from "../../lib/api";

const money = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(amount);

const stageLabel = (value: string) => value.replace(/-/g, " ");

function TransferList({
  title,
  detail,
  items,
  empty
}: {
  title: string;
  detail: string;
  items: TransferCenterItem[];
  empty: string;
}) {
  return (
    <section className="border border-ink/10 bg-white/60">
      <div className="border-b border-ink/10 px-5 py-4">
        <p className="text-xs uppercase tracking-[0.22em] text-ink/50">{title}</p>
        <p className="mt-2 max-w-2xl text-sm text-ink/68">{detail}</p>
      </div>

      <div>
        {items.length > 0 ? (
          items.map((item) => (
            <article
              key={item.negotiation.id}
              className="grid gap-4 border-b border-ink/8 px-5 py-4 last:border-b-0 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,1fr)]"
            >
              <div>
                <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-ink/48">
                  <span>{item.player.positions.join("/")}</span>
                  <span>{item.negotiation.direction}</span>
                  <span>{stageLabel(item.negotiation.stage)}</span>
                </div>
                <h2 className="mt-2 font-display text-3xl tracking-tight">
                  {item.player.firstName} {item.player.lastName}
                </h2>
                <p className="mt-2 text-sm text-ink/68">{item.negotiation.summary}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-ink/52">
                  <span>Priority {item.negotiation.priority}</span>
                  <span>Potential {item.player.potential}</span>
                  <span>Market {money(item.player.marketValue.amount)}</span>
                </div>
              </div>

              <div className="text-sm text-ink/68">
                <p className="text-xs uppercase tracking-[0.18em] text-ink/48">Counterparty</p>
                <p className="mt-2 font-medium text-ink">{item.counterpartyClubName}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.18em] text-ink/48">Latest movement</p>
                <p className="mt-2">{new Date(item.negotiation.lastUpdated).toLocaleString("en-US")}</p>
              </div>

              <div>
                <div className="grid gap-3 text-sm sm:grid-cols-3 lg:grid-cols-1">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-ink/48">Offer</p>
                    <p className="mt-2 text-xl text-ink">{money(item.estimatedValue)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-ink/48">Asking</p>
                    <p className="mt-2 text-xl text-ink">{money(item.negotiation.askingPrice)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-ink/48">Probability</p>
                    <p className="mt-2 text-xl text-ink">{item.negotiation.probability}%</p>
                  </div>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="px-5 py-6 text-sm text-ink/62">{empty}</div>
        )}
      </div>
    </section>
  );
}

export default async function TransfersPage() {
  const transferCenter = await getTransferCenter();

  return (
    <Shell>
      <SectionTitle
        eyebrow="Transfers"
        title="Transfer center"
        detail="Track live negotiations, incoming targets, outgoing pressure, and completed business from one list-oriented control surface."
      />

      <div className="mb-8 grid gap-4 lg:grid-cols-4">
        <div className="border border-ink/10 bg-white/55 p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-ink/50">Active talks</p>
          <p className="mt-3 font-display text-5xl tracking-tight">{transferCenter.activeNegotiations.length}</p>
        </div>
        <div className="border border-ink/10 bg-white/55 p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-ink/50">Incoming targets</p>
          <p className="mt-3 font-display text-5xl tracking-tight">{transferCenter.incomingTargets.length}</p>
        </div>
        <div className="border border-ink/10 bg-white/55 p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-ink/50">Outgoing offers</p>
          <p className="mt-3 font-display text-5xl tracking-tight">{transferCenter.outgoingOffers.length}</p>
        </div>
        <div className="border border-ink/10 bg-white/55 p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-ink/50">Completed deals</p>
          <p className="mt-3 font-display text-5xl tracking-tight">{transferCenter.completedHistory.length}</p>
        </div>
      </div>

      <div className="space-y-6">
        <TransferList
          title="Active Negotiations"
          detail="Deals currently moving through contact, bidding, countering, or player talks."
          items={transferCenter.activeNegotiations}
          empty="No live negotiations are open."
        />
        <TransferList
          title="Incoming Targets"
          detail="Scouted players with enough momentum to keep on the recruitment board."
          items={transferCenter.incomingTargets}
          empty="No incoming targets are active."
        />
        <TransferList
          title="Outgoing Offers"
          detail="External pressure on current squad members, ordered by estimated transfer value."
          items={transferCenter.outgoingOffers}
          empty="No clubs are pushing on your squad right now."
        />
        <TransferList
          title="Completed Transfer History"
          detail="Closed business that already reshaped the squad or budget."
          items={transferCenter.completedHistory}
          empty="No completed transfer history is recorded yet."
        />
      </div>
    </Shell>
  );
}
