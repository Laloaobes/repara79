const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';
const STARTED_AT_KEY = 'auth_started_at';
const LAST_ACTIVITY_KEY = 'auth_last_activity_at';
const NOTICE_KEY = 'auth_session_notice';

const positiveNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const SESSION_IDLE_MS = positiveNumber(
  import.meta.env.VITE_SESSION_IDLE_MINUTES,
  30,
) * 60_000;

export const SESSION_MAX_MS = positiveNumber(
  import.meta.env.VITE_SESSION_MAX_HOURS,
  8,
) * 60 * 60_000;

export type SessionExpirationReason = 'idle' | 'maximum' | 'invalid';

const messages: Record<SessionExpirationReason, string> = {
  idle: 'La sesión se cerró por inactividad. Ingresa nuevamente para continuar.',
  maximum: 'La sesión alcanzó su tiempo máximo de vigencia. Ingresa nuevamente.',
  invalid: 'La sesión expiró o dejó de ser válida. Ingresa nuevamente.',
};

export const beginSessionTracking = (): void => {
  const now = String(Date.now());
  localStorage.setItem(STARTED_AT_KEY, now);
  localStorage.setItem(LAST_ACTIVITY_KEY, now);
};

export const ensureSessionTracking = (): void => {
  const now = String(Date.now());
  if (!localStorage.getItem(STARTED_AT_KEY)) localStorage.setItem(STARTED_AT_KEY, now);
  if (!localStorage.getItem(LAST_ACTIVITY_KEY)) localStorage.setItem(LAST_ACTIVITY_KEY, now);
};

export const touchSession = (): void => {
  if (localStorage.getItem(TOKEN_KEY)) {
    localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
  }
};

export const getExpirationReason = (now = Date.now()): SessionExpirationReason | null => {
  const startedAt = Number(localStorage.getItem(STARTED_AT_KEY));
  const lastActivityAt = Number(localStorage.getItem(LAST_ACTIVITY_KEY));

  if (startedAt > 0 && now - startedAt >= SESSION_MAX_MS) return 'maximum';
  if (lastActivityAt > 0 && now - lastActivityAt >= SESSION_IDLE_MS) return 'idle';

  return null;
};

export const storeSessionNotice = (reason: SessionExpirationReason): void => {
  sessionStorage.setItem(NOTICE_KEY, messages[reason]);
};

export const consumeSessionNotice = (): string | null => {
  const notice = sessionStorage.getItem(NOTICE_KEY);
  sessionStorage.removeItem(NOTICE_KEY);
  return notice;
};

export const clearLocalSession = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(STARTED_AT_KEY);
  localStorage.removeItem(LAST_ACTIVITY_KEY);
};
