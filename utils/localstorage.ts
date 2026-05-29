export type LocalStorageKeys =
  | "subject_code"
  | "subject_id"
  | `attendanceRow_id:${string}`
  | "language"
  | "word_cloud_browser_token"
  | `word_cloud_answered:${string}`;

export function setLocalStorage(key: LocalStorageKeys, value: string) {
  localStorage.setItem(key, value);
}

export function getLocalStorage(key: LocalStorageKeys) {
  return localStorage.getItem(key);
}

export function removeLocalStorage(key: LocalStorageKeys) {
  localStorage.removeItem(key);
}
