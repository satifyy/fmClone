export type StaffRole =
  | "Head Coach"
  | "Assistant Coach"
  | "Fitness Coach"
  | "Goalkeeper Coach"
  | "Scout Chief"
  | "Sports Director"
  | "Data Analyst";

export type StaffPersonality =
  | "Methodical"
  | "Motivator"
  | "Tactician"
  | "Developer"
  | "Disciplinarian"
  | "Charismatic";

export type StaffAttributes = {
  coaching: number;       // 1–20
  motivation: number;     // 1–20
  tactics: number;        // 1–20
  fitness: number;        // 1–20
  youthDevelopment: number; // 1–20
  scoutingJudgement: number; // 1–20
  dataAnalysis: number;   // 1–20
};

export type StaffContract = {
  weeklyWage: number;
  expiresOn: string;
  yearsRemaining: number;
};

export type StaffMember = {
  id: string;
  saveId: string;
  clubId: string | null; // null = free agent / available to hire
  name: string;
  age: number;
  nationality: string;
  role: StaffRole;
  personality: StaffPersonality;
  attributes: StaffAttributes;
  /** 0–100. Below 25 the staff member will resign. */
  happiness: number;
  /** Probabilistic modifier. Higher means unpredictable but potentially explosive results (e.g. going viral). */
  volatility: number; // 1-20
  /** Hard cap on how good their volatile results can be. */
  upsideCap: number; // 1-100
  momentum?: number; // Tracking hot/cold streaks. Can be -1 to 1.
  contract: StaffContract;
};

export type StaffDepartmentPayload = {
  clubId: string;
  staffWageBudget: number;
  staffWagesUsed: number;
  staff: StaffMember[];
  availableToHire: StaffMember[];
};

export type StaffActionResult = {
  staff: StaffMember;
  message: string;
  department: StaffDepartmentPayload;
};
