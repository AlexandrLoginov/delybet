/** @username Telegram (без префикса @): админка и переключатель предпросмотра Pro в профиле. */
const PROFILE_ADMIN_USERNAMES = new Set([
  "alexandr_loginov_designer",
  "aleksandr_loginov_designer",
]);

export function isProfileAdminTelegramUsername(
  username: string | undefined
): boolean {
  if (!username) return false;
  return PROFILE_ADMIN_USERNAMES.has(username.toLowerCase());
}
