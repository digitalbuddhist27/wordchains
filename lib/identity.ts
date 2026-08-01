const ID_KEY = "wc-player-id";
const NAME_KEY = "wc-player-name";

/**
 * Identity is per TAB (sessionStorage), not per browser. Two people on one
 * machine in two tabs are two players, and a reload or a dropped connection
 * still rejoins the same seat because sessionStorage survives a refresh.
 * The display name is remembered per browser so you only type it once.
 */
export function playerId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = sessionStorage.getItem(ID_KEY);
    if (!id) {
      id = `p_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
      sessionStorage.setItem(ID_KEY, id);
    }
    return id;
  } catch {
    return `p_${Math.random().toString(36).slice(2, 10)}`;
  }
}

export function savedName(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(NAME_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveName(name: string) {
  try {
    localStorage.setItem(NAME_KEY, name);
  } catch {}
}
