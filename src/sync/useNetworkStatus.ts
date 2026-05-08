import { useState, useEffect } from 'react';
import { getIsOnline, subscribeOnlineState } from './connectivityMonitor';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(getIsOnline);

  useEffect(() => {
    const unsub = subscribeOnlineState(setIsOnline);
    return unsub;
  }, []);

  return isOnline;
}
