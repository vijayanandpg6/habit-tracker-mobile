import { useEffect, useCallback, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { runSyncQueue, getPendingCount } from './syncEngine';
import { subscribeReconnect } from './connectivityMonitor';

export interface SyncState {
  isSyncing: boolean;
  pendingCount: number;
}

const listeners = new Set<(s: SyncState) => void>();
let globalSyncState: SyncState = { isSyncing: false, pendingCount: 0 };

function emitSyncState(state: SyncState) {
  globalSyncState = state;
  listeners.forEach((fn) => fn(state));
}

export function useSyncState(): SyncState {
  const [state, setState] = useState<SyncState>(globalSyncState);
  useEffect(() => {
    listeners.add(setState);
    return () => { listeners.delete(setState); };
  }, []);
  return state;
}

export function useSyncEngine() {
  const sync = useCallback(async () => {
    const pending = getPendingCount();
    if (pending === 0) return;
    emitSyncState({ isSyncing: true, pendingCount: pending });
    try {
      await runSyncQueue();
    } catch {
      // non-fatal
    } finally {
      emitSyncState({ isSyncing: false, pendingCount: getPendingCount() });
    }
  }, []);

  useEffect(() => {
    // Sync on reconnect (detected by connectivityMonitor via captive.apple.com ping)
    const unsubReconnect = subscribeReconnect(sync);

    // Sync when app comes to foreground
    const unsubApp = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (next === 'active') sync();
    });

    // Sync on mount in case there are pending items from a previous session
    sync();

    return () => {
      unsubReconnect();
      unsubApp.remove();
    };
  }, [sync]);
}
