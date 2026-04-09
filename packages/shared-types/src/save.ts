import type { ClubDashboard } from "./club";
import type { SeasonState, StandingRow } from "./league";

export type SaveSummary = {
  id: string;
  name: string;
  createdAt: string;
  active: boolean;
  clubId: string;
};

export type InboxNotificationType =
  | "board"
  | "scouting"
  | "medical"
  | "contract"
  | "fixture"
  | "training"
  | "system";

export type NotificationPriority = "low" | "medium" | "high";

export type InboxNotificationActionType = "navigate" | "simulate-next-fixture" | "none";

export type InboxNotification = {
  id: string;
  saveId: string;
  clubId: string;
  type: InboxNotificationType;
  priority: NotificationPriority;
  title: string;
  summary: string;
  createdAt: string;
  read: boolean;
  actionLabel?: string;
  actionHref?: string;
  actionType?: InboxNotificationActionType;
};

export type PendingActionCategory =
  | "fixture"
  | "inbox"
  | "training"
  | "transfers"
  | "tactics"
  | "medical"
  | "contracts"
  | "scouting"
  | "board";

export type PendingActionItem = {
  id: string;
  category: PendingActionCategory;
  priority: NotificationPriority;
  title: string;
  summary: string;
  href: string;
};

export type PendingActionSummary = {
  clubId: string;
  total: number;
  highPriority: number;
  items: PendingActionItem[];
};

export type BoardPressureLevel = "calm" | "stable" | "elevated" | "critical";

export type BoardPressure = {
  score: number;
  level: BoardPressureLevel;
  summary: string;
};

export type ScoutingUpdate = {
  id: string;
  title: string;
  summary: string;
  href: string;
};

export type InjuryStatus = {
  playerId: string;
  playerName: string;
  status: "concern" | "out";
  summary: string;
};

export type ContractIssue = {
  playerId: string;
  playerName: string;
  monthsRemaining: number;
  priority: NotificationPriority;
  summary: string;
};

export type ProgressionAction = "advance-day" | "simulate-next-fixture";

export type SimulatedMatchSummary = {
  matchId: string;
  fixtureId: string;
  opponentName: string;
  competition: string;
  date: string;
  score: {
    home: number;
    away: number;
  };
};

export type SaveDashboardPayload = {
  save: SaveSummary;
  season: SeasonState;
  dashboard: ClubDashboard;
  standings: StandingRow[];
  inbox: InboxNotification[];
  pendingActions: PendingActionSummary;
  boardPressure: BoardPressure;
  scoutingUpdates: ScoutingUpdate[];
  injuries: InjuryStatus[];
  contractIssues: ContractIssue[];
  unresolvedTasks: PendingActionItem[];
};

export type ProgressionResult = SaveDashboardPayload & {
  action: ProgressionAction;
  simulatedMatch?: SimulatedMatchSummary;
};

export type InboxActionResult = {
  notification: InboxNotification;
  message: string;
  redirectHref?: string;
  progression?: ProgressionResult;
};
