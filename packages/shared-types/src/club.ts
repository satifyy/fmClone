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
  finances: {
    balance: number;
    wageBudget: number;
    transferBudget: number;
  };
  facilities: number;
  coaching: number;
  academy: number;
  boardExpectation: string;
  styleIdentity: ClubStyleIdentity;
  userControlled: boolean;
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

