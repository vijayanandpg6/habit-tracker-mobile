// Shared singleton connectivity monitor.
// Uses Apple's captive portal endpoint — always available, responds in <100ms.
// Both useNetworkStatus and useSyncEngine consume this instead of running
// separate ping loops or relying on NetInfo (unreliable in iOS Simulator).

const PING_URL = 'https://captive.apple.com';
const POLL_MS = 3000;
const TIMEOUT_MS = 2000;

type Listener = (online: boolean) => void;
type TransitionListener = () => void;

let online = true;
let polling = false;

const stateListeners = new Set<Listener>();
const reconnectListeners = new Set<TransitionListener>();

async function ping(): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    const res = await fetch(PING_URL, { method: 'HEAD', signal: ctrl.signal });
    clearTimeout(t);
    return res.ok || res.status === 204;
  } catch {
    return false;
  }
}

function startPolling() {
  if (polling) return;
  polling = true;

  setInterval(async () => {
    const next = await ping();
    if (next !== online) {
      const wasOffline = !online;
      online = next;
      stateListeners.forEach((fn) => fn(online));
      if (online && wasOffline) reconnectListeners.forEach((fn) => fn());
    }
  }, POLL_MS);
}

export function subscribeOnlineState(fn: Listener): () => void {
  startPolling();
  stateListeners.add(fn);
  return () => stateListeners.delete(fn);
}

export function subscribeReconnect(fn: TransitionListener): () => void {
  startPolling();
  reconnectListeners.add(fn);
  return () => reconnectListeners.delete(fn);
}

export function getIsOnline(): boolean {
  return online;
}

// Kick off an immediate check on import so initial state is accurate quickly
ping().then((result) => {
  online = result;
  stateListeners.forEach((fn) => fn(online));
});
