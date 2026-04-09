export type ClubStyleIdentity =
  | "possession"
  | "pressing"
  | "counter"
  | "set-piece"
  | "balanced";

export type Club = {
  id: string;
  saveId: string;
  name: string;
  shortName: string;
  reputation: number;
  digital: {
    followers: number;
    engagementRate: number; // 0 to 100
  };
  finances: {
    balance: number;
    wageBudget: number;
    transferBudget: number;
    debt: number; // For FFP & Loans limit tracking
  };
  facilities: number;
  coaching: number;
  academy: number;
  boardExpectation: string;
  styleIdentity: ClubStyleIdentity;
  userControlled: boolean;
};

export type ClubOwnershipModel = "supporter-trust" | "private-owner" | "consortium";

export type ClubOwnershipProfile = {
  model: ClubOwnershipModel;
  owners: string[];
  investmentHorizon: "short" | "medium" | "long";
  summary: string;
};

export type ClubBoardConfidence = {
  score: number;
  level: "secure" | "stable" | "concern" | "critical";
  summary: string;
  expectations: string[];
};

export type BudgetAdjustmentRule = {
  id: string;
  label: string;
  detail: string;
  minTransferBudget: number;
  maxTransferBudget: number;
  minWageBudget: number;
  maxWageBudget: number;
};

export type InvestorEvent = {
  id: string;
  occurredOn: string;
  title: string;
  summary: string;
  impact: "positive" | "neutral" | "negative";
  cashDelta?: number;
};

export type LongTermFinancialPlan = {
  horizonYears: number;
  objectives: string[];
  risks: string[];
};

export type FinanceMechanicAction = "request-investment" | "commercial-push" | "trim-wage-bill" | "take-loan" | "pay-debt" | "sign-sponsorship" | "viral-campaign";

export type FinanceMechanicOutcome = {
  id: string;
  action: FinanceMechanicAction;
  occurredOn: string;
  message: string;
  boardDelta: number;
  balanceDelta: number;
  transferBudgetDelta: number;
  wageBudgetDelta: number;
};

export type ClubFinanceBoardPayload = {
  clubId: string;
  digital?: Club["digital"];
  finances: Club["finances"];
  boardConfidence: ClubBoardConfidence;
  ownership: ClubOwnershipProfile;
  adjustmentRules: BudgetAdjustmentRule[];
  investorEvents: InvestorEvent[];
  longTermPlan: LongTermFinancialPlan;
  recentMechanics: FinanceMechanicOutcome[];
};

export type FinanceMechanicResponse = {
  board: ClubFinanceBoardPayload;
  outcome: FinanceMechanicOutcome;
};

export type ClubFinancialHealth = "wealthy" | "stable" | "watchlist" | "strained";

export type ClubHistoryEntry = {
  season: string;
  finish: string;
  note: string;
};

export type ClubRecentResult = {
  fixtureId: string;
  matchId?: string;
  date: string;
  competition: string;
  opponentId: string;
  opponentName: string;
  venue: "H" | "A";
  outcome: "W" | "D" | "L";
  score: {
    club: number;
    opponent: number;
  };
  xg: {
    club: number;
    opponent: number;
  };
};

export type ClubDetail = {
  club: Club;
  leagueId: string;
  city: string;
  stadium: {
    name: string;
    capacity: number;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  financialStatus: {
    level: ClubFinancialHealth;
    label: string;
    summary: string;
  };
  history: ClubHistoryEntry[];
  squadOverview: {
    squadSize: number;
    averageAge: number;
    internationals: number;
    topScorer: {
      playerId: string;
      name: string;
      goals: number;
    } | null;
    topCreator: {
      playerId: string;
      name: string;
      assists: number;
    } | null;
  };
  recentResults: ClubRecentResult[];
};

export type ClubDashboard = {
  club: Club;
  nextFixture?: {
    fixtureId: string;
    opponentName: string;
    home: boolean;
    competition: string;
    date: string;
  };
  form: Array<"W" | "D" | "L">;
  morale: number;
  fitness: number;
  injuryCount: number;
  transferBudget: number;
  wageBudget: number;
};
