import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

function resolveOnline(state: NetInfoState): boolean {
  // isConnected: false → definitely offline
  // isConnected: null  → unknown, treat as online (avoid false offline banner)
  // isInternetReachable: only trust it when explicitly false AND isConnected is true
  if (state.isConnected === false) return false;
  if (state.isConnected === true && state.isInternetReachable === false) return false;
  return true;
}

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsOnline(resolveOnline(state));
    });

    NetInfo.fetch().then((state) => setIsOnline(resolveOnline(state)));

    return unsubscribe;
  }, []);

  return isOnline;
}
