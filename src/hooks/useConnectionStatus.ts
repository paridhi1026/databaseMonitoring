import { useState, useEffect, useCallback } from 'react';
import { DBSService } from '../services/dbsService';
import { ConnectionState } from '../types/dbs';

const STORAGE_KEY = 'cern_dbs_api_base_url';

export function useConnectionStatus() {
  const [baseUrl, setBaseUrl] = useState<string>(() => {
    return import.meta.env.VITE_API_BASE_URL || localStorage.getItem(STORAGE_KEY) || '';
  });

  const [state, setState] = useState<ConnectionState>({
    isConnected: false,
    isChecking: false,
    baseUrl,
    instance: import.meta.env.VITE_DBS_INSTANCE || 'global',
    serverInfo: null,
    error: null,
    lastChecked: null,
  });

  const checkConnection = useCallback(async (targetUrl?: string) => {
    const urlToTest = targetUrl !== undefined ? targetUrl : baseUrl;

    if (!urlToTest || urlToTest.trim() === '') {
      setState({
        isConnected: false,
        isChecking: false,
        baseUrl: '',
        instance: 'global',
        serverInfo: null,
        error: 'No backend API URL specified.',
        lastChecked: new Date().toLocaleTimeString(),
      });
      return false;
    }

    setState(prev => ({ ...prev, isChecking: true, error: null }));

    try {
      const serverInfo = await DBSService.getServerInfo(urlToTest);
      setState({
        isConnected: true,
        isChecking: false,
        baseUrl: urlToTest,
        instance: 'global',
        serverInfo,
        error: null,
        lastChecked: new Date().toLocaleTimeString(),
      });
      return true;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unable to connect to CERN DBS service';
      setState({
        isConnected: false,
        isChecking: false,
        baseUrl: urlToTest,
        instance: 'global',
        serverInfo: null,
        error: errorMsg,
        lastChecked: new Date().toLocaleTimeString(),
      });
      return false;
    }
  }, [baseUrl]);

  const updateBaseUrl = useCallback((newUrl: string) => {
    setBaseUrl(newUrl);
    if (newUrl) {
      localStorage.setItem(STORAGE_KEY, newUrl);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    checkConnection(newUrl);
  }, [checkConnection]);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return {
    ...state,
    checkConnection,
    updateBaseUrl,
  };
}
