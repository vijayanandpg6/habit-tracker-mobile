import { useEffect, useRef, useCallback, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { runSyncQueue, getPendingCount } from './syncEngine';
import { AppState, AppStateStatus } from 'react-native';

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
  const lastConnectedRef = useRef<boolean | null>(null);

  const sync = useCallback(async () => {
    const pending = getPendingCount();
    if (pending === 0) return;
    emitSyncState({ isSyncing: true, pendingCount: pending });
    try {
      await runSyncQueue();
    } catch {
      // sync failures are non-fatal
    } finally {
      emitSyncState({ isSyncing: false, pendingCount: getPendingCount() });
    }
  }, []);

  useEffect(() => {
    const unsubscribeNet = NetInfo.addEventListener((state) => {
      const isConnected = state.isConnected !== false &&
        !(state.isConnected === true && state.isInternetReachable === false);
      if (!lastConnectedRef.current && isConnected) {
        sync();
      }
      lastConnectedRef.current = isConnected;
    });

    const unsubscribeApp = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') sync();
    });

    sync();

    return () => {
      unsubscribeNet();
      unsubscribeApp.remove();
    };
  }, [sync]);
}
