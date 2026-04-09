export type LedgerEntry = {
  id: string;
  amount: number;
  category: "matchday" | "broadcast" | "sponsor" | "merch" | "social" | "transfers" | "loan" | "wages" | "facilities";
  impact: "positive" | "negative";
  date: string;
};

export type ClubLoan = {
  id: string;
  clubId: string;
  principal: number;
  interestRate: number;
  weeklyPayment: number;
  paymentsRemaining: number;
};

export type SponsorshipDeal = {
  id: string;
  clubId: string;
  sponsorName: string;
  type: "safe" | "performance" | "risky";
  upfrontAmount: number;
  weeklyAmount: number;
  weeksRemaining: number;
  performanceBonusPaid?: boolean;
};
