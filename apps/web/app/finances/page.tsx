import { FinanceBoard } from "../../components/finance-board";
import { SectionTitle } from "../../components/section-title";
import { Shell } from "../../components/shell";
import { defaultClubId, getClubFinanceBoard } from "../../lib/api";

export default async function FinancesPage() {
  const board = await getClubFinanceBoard(defaultClubId);

  return (
    <Shell>
      <SectionTitle
        eyebrow="Finances"
        title="Financial management and board"
        detail="Adjust wage and transfer allocation, monitor board confidence, review ownership events, and track long-term financial planning."
      />

      <FinanceBoard initialData={board} />
    </Shell>
  );
}
