import type {
  Club,
  ClubFinanceBoardPayload,
  FinanceMechanicAction,
  FinanceMechanicResponse,
  ClubDetail,
  ClubSquad,
  FixtureHistoryResponse,
  InboxActionResult,
  InboxNotification,
  LeagueMetadata,
  LeagueStandingsPayload,
  PendingActionSummary,
  Player,
  ProgressionAction,
  ProgressionResult,
  MentionTarget,
  PlayerActionResult,
  ScoutingPagePayload,
  SaveDashboardPayload,
  SeasonAnalyticsPayload,
  SeasonArchiveSummary,
  TacticalBoardDto,
  TacticsUpdateRequest,
  TransferCenterPayload,
  TrainingPlan
} from "@fm/shared-types";

import {
  clubFinanceBoardPayload,
  fixtureHistoryResponse,
  getFallbackSaveDashboard,
  inbox as fallbackInbox,
  leagueStandingsPayload,
  seasonAnalyticsPayload,
  seasonArchive,
  trainingPlan as fallbackTrainingPlan,
  transferCenterPayload
} from "./test-data";

export const defaultSaveId = "save-alpha";
export const defaultClubId = "club-harbor";

const serverApiBaseUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";
export const browserApiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";

const buildApiUrl = (path: string, baseUrl = serverApiBaseUrl) => new URL(path, baseUrl).toString();

const buildQueryString = (params: Record<string, string | number | undefined>) => {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) {
      continue;
    }

    searchParams.set(key, String(value));
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export async function apiFetch<T>(path: string): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`API request failed for ${path}`);
  }

  return (await response.json()) as T;
}

async function apiMutation<T>(path: string, method: "POST" | "PUT", body: unknown): Promise<T> {
  const response = await fetch(buildApiUrl(path, browserApiBaseUrl), {
    method,
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`API mutation failed for ${path}`);
  }

  return (await response.json()) as T;
}

export async function getDashboard(saveId = defaultSaveId): Promise<SaveDashboardPayload> {
  try {
    return await apiFetch<SaveDashboardPayload>(`/saves/${saveId}/dashboard`);
  } catch {
    return getFallbackSaveDashboard(saveId);
  }
}

export async function getInbox(saveId = defaultSaveId): Promise<InboxNotification[]> {
  try {
    return await apiFetch<InboxNotification[]>(`/saves/${saveId}/inbox`);
  } catch {
    return fallbackInbox.filter((item) => item.saveId === saveId);
  }
}

export async function getSeasonArchive(): Promise<SeasonArchiveSummary[]> {
  try {
    return await apiFetch<SeasonArchiveSummary[]>("/season/archive");
  } catch {
    return seasonArchive;
  }
}

export async function getFixtureHistory(params: {
  seasonId?: string;
  competition?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<FixtureHistoryResponse> {
  try {
    return await apiFetch<FixtureHistoryResponse>(
      `/fixtures/history${buildQueryString({
        seasonId: params.seasonId,
        competition: params.competition,
        status: params.status,
        page: params.page,
        pageSize: params.pageSize
      })}`
    );
  } catch {
    return fixtureHistoryResponse;
  }
}

export async function getLeagueMetadata(seasonId?: string, leagueId?: string): Promise<LeagueMetadata> {
  return apiFetch<LeagueMetadata>(`/league/metadata${buildQueryString({ seasonId, leagueId })}`);
}

export async function getLeagueStandings(seasonId?: string, leagueId?: string): Promise<LeagueStandingsPayload> {
  try {
    return await apiFetch<LeagueStandingsPayload>(`/league/standings${buildQueryString({ seasonId, leagueId })}`);
  } catch {
    return {
      ...leagueStandingsPayload,
      selectedSeason: seasonId ?? leagueStandingsPayload.selectedSeason,
      isHistorical: seasonId !== undefined && seasonId !== leagueStandingsPayload.selectedSeason
    };
  }
}

export async function getPendingActions(saveId = defaultSaveId): Promise<PendingActionSummary> {
  return apiFetch<PendingActionSummary>(`/saves/${saveId}/pending-actions`);
}

export async function getTrainingPlan(clubId = defaultClubId): Promise<TrainingPlan> {
  try {
    return await apiFetch<TrainingPlan>(`/clubs/${clubId}/training`);
  } catch {
    return {
      ...fallbackTrainingPlan,
      clubId
    };
  }
}

export async function fetchClubSquad(clubId = defaultClubId): Promise<ClubSquad | null> {
  try {
    return await apiFetch<ClubSquad>(`/clubs/${clubId}/squad`);
  } catch {
    return null;
  }
}

export async function fetchClubDetail(clubId = defaultClubId): Promise<ClubDetail | null> {
  try {
    return await apiFetch<ClubDetail>(`/clubs/${clubId}`);
  } catch {
    return null;
  }
}

export async function getClubs(): Promise<Club[]> {
  return apiFetch<Club[]>("/clubs");
}

export async function getMentionTargets(saveId = defaultSaveId): Promise<MentionTarget[]> {
  try {
    return await apiFetch<MentionTarget[]>(`/saves/${saveId}/mentions`);
  } catch {
    return [];
  }
}

export async function fetchPlayerProfile(playerId: string): Promise<Player | null> {
  try {
    return await apiFetch<Player>(`/players/${playerId}`);
  } catch {
    return null;
  }
}

export async function runPlayerAction(
  playerId: string,
  action: "enquire" | "bid" | "talk",
  saveId = defaultSaveId
): Promise<PlayerActionResult> {
  return apiMutation<PlayerActionResult>(`/players/${playerId}/actions`, "POST", {
    action,
    saveId
  });
}

export async function fetchTacticsBoard(clubId = defaultClubId): Promise<TacticalBoardDto | null> {
  try {
    return await apiFetch<TacticalBoardDto>(`/clubs/${clubId}/tactics`);
  } catch {
    return null;
  }
}

export async function previewTactics(clubId: string, request: TacticsUpdateRequest): Promise<TacticalBoardDto> {
  return apiMutation<TacticalBoardDto>(`/clubs/${clubId}/tactics/preview`, "POST", request);
}

export async function updateTactics(clubId: string, request: TacticsUpdateRequest): Promise<TacticalBoardDto> {
  return apiMutation<TacticalBoardDto>(`/clubs/${clubId}/tactics`, "PUT", request);
}

export async function progressSave(action: ProgressionAction, saveId = defaultSaveId): Promise<ProgressionResult> {
  const response = await fetch(buildApiUrl(`/saves/${saveId}/progression`, browserApiBaseUrl), {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({ action })
  });

  if (!response.ok) {
    const failure = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(failure?.message ?? `Progression failed for ${action}`);
  }

  return (await response.json()) as ProgressionResult;
}

export async function runInboxAction(notificationId: string, saveId = defaultSaveId): Promise<InboxActionResult> {
  const response = await fetch(buildApiUrl(`/saves/${saveId}/inbox/${notificationId}/action`, browserApiBaseUrl), {
    method: "POST"
  });

  if (!response.ok) {
    const failure = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(failure?.message ?? "Inbox action failed");
  }

  return (await response.json()) as InboxActionResult;
}

export async function markInboxRead(notificationId: string, saveId = defaultSaveId): Promise<InboxNotification> {
  const response = await fetch(buildApiUrl(`/saves/${saveId}/inbox/${notificationId}/read`, browserApiBaseUrl), {
    method: "PATCH"
  });

  if (!response.ok) {
    throw new Error("Failed to mark inbox notification as read");
  }

  return (await response.json()) as InboxNotification;
}

export async function getSeasonAnalytics(seasonId?: string, saveId = defaultSaveId): Promise<SeasonAnalyticsPayload> {
  try {
    return await apiFetch<SeasonAnalyticsPayload>(`/analytics/season/summary${buildQueryString({ seasonId, saveId })}`);
  } catch {
    return {
      ...seasonAnalyticsPayload,
      seasonId: seasonId ?? seasonAnalyticsPayload.seasonId,
      isHistorical: Boolean(seasonId && seasonId !== seasonAnalyticsPayload.seasonId)
    };
  }
}

export async function getClubFinanceBoard(clubId = defaultClubId, saveId = defaultSaveId): Promise<ClubFinanceBoardPayload> {
  try {
    return await apiFetch<ClubFinanceBoardPayload>(`/clubs/${clubId}/finance-board${buildQueryString({ saveId })}`);
  } catch {
    return {
      ...clubFinanceBoardPayload,
      clubId
    };
  }
}

export async function adjustClubBudget(
  clubId: string,
  budgets: {
    transferBudget: number;
    wageBudget: number;
    saveId?: string;
  }
): Promise<ClubFinanceBoardPayload> {
  return apiMutation<ClubFinanceBoardPayload>(`/clubs/${clubId}/finances/adjust`, "POST", budgets);
}

export async function runFinanceMechanic(
  clubId: string,
  action: FinanceMechanicAction,
  saveId = defaultSaveId
): Promise<FinanceMechanicResponse> {
  return apiMutation<FinanceMechanicResponse>(`/clubs/${clubId}/finances/mechanics`, "POST", {
    action,
    saveId
  });
}

export async function getTransferCenter(clubId = defaultClubId): Promise<TransferCenterPayload> {
  try {
    return await apiFetch<TransferCenterPayload>(`/transfers/center${buildQueryString({ clubId })}`);
  } catch {
    return {
      ...transferCenterPayload,
      clubId
    };
  }
}

export async function getScoutingPage(saveId = defaultSaveId): Promise<ScoutingPagePayload> {
  return apiFetch<ScoutingPagePayload>(`/saves/${saveId}/scouting`);
}
