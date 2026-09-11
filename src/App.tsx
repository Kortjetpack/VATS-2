import { useState, useCallback } from 'react';
import { AppConfig, ApiLogEntry, Call } from './types';
import { generateUUID, formatDateTime, buildCallRequest, buildCallUpdateRequest, buildEventRequest, createApiLogEntry, getAuthHeaders, generateExternalId } from './utils';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ApiTester from './components/ApiTester';
import CallSimulator from './components/CallSimulator';
import RequestLog from './components/RequestLog';
import Settings from './components/Settings';
import Documentation from './components/Documentation';

const DEFAULT_CONFIG: AppConfig = {
  authToken: 'd03627d59c1948a0f9a6aa1e267c954bfd0301ec',
  apiBaseUrl: 'https://api.moysklad.ru/api/phone/1.0',
  callbackUrl: 'https://45.158.46.193/callback',
  callbackSecret: 'test-secret-key-12345',
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem('phoneapi_config');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });
  const [logs, setLogs] = useState<ApiLogEntry[]>(() => {
    const saved = localStorage.getItem('phoneapi_logs');
    return saved ? JSON.parse(saved) : [];
  });
  const [calls, setCalls] = useState<Call[]>(() => {
    const saved = localStorage.getItem('phoneapi_calls');
    return saved ? JSON.parse(saved) : [];
  });

  const saveConfig = useCallback((newConfig: AppConfig) => {
    setConfig(newConfig);
    localStorage.setItem('phoneapi_config', JSON.stringify(newConfig));
  }, []);

  const addLog = useCallback((entry: ApiLogEntry) => {
    setLogs(prev => {
      const updated = [entry, ...prev].slice(0, 200);
      localStorage.setItem('phoneapi_logs', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateLog = useCallback((id: string, updates: Partial<ApiLogEntry>) => {
    setLogs(prev => {
      const updated = prev.map(log => log.id === id ? { ...log, ...updates } : log);
      localStorage.setItem('phoneapi_logs', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addCall = useCallback((call: Call) => {
    setCalls(prev => {
      const updated = [call, ...prev].slice(0, 100);
      localStorage.setItem('phoneapi_calls', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
    localStorage.removeItem('phoneapi_logs');
  }, []);

  const clearCalls = useCallback(() => {
    setCalls([]);
    localStorage.removeItem('phoneapi_calls');
  }, []);

  const simulateApiCall = useCallback(async (
    method: string,
    endpoint: string,
    body: any,
    isOutgoing: boolean = true
  ) => {
    const url = `${config.apiBaseUrl}${endpoint}`;
    const headers = isOutgoing ? getAuthHeaders(config) : {
      'Content-Type': 'application/json',
      'Lognex-Content-MD5': '802EFD4A933386248031D2928612A13F',
    };

    const logEntry = createApiLogEntry(
      isOutgoing ? 'outgoing' : 'incoming',
      method,
      url,
      headers,
      body
    );
    addLog(logEntry);

    if (!isOutgoing) {
      // Симуляция входящего запроса от МоегоСклада
      const response = {
        status: 200,
        body: {
          result: 'OK',
          message: 'Входящий запрос обработан (симуляция)',
          timestamp: formatDateTime(new Date()),
        }
      };
      updateLog(logEntry.id, { response, status: 'success' });
      return response;
    }

    // Реальный запрос к API (или симуляция если нет токена)
    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      const responseBody = await response.json().catch(() => null);
      const logResponse = {
        status: response.status,
        body: responseBody,
      };

      updateLog(logEntry.id, {
        response: logResponse,
        status: response.ok ? 'success' : 'error',
      });

      return logResponse;
    } catch (error: any) {
      const errorResponse = {
        status: 0,
        body: {
          errors: [{
            error: 'Network Error',
            error_message: error.message || 'Не удалось выполнить запрос. Проверьте CORS и доступность API.',
            code: 'NETWORK_ERROR',
          }]
        }
      };
      updateLog(logEntry.id, {
        response: errorResponse,
        status: 'error',
      });
      return errorResponse;
    }
  }, [config, addLog, updateLog]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard calls={calls} logs={logs} config={config} />;
      case 'tester':
        return (
          <ApiTester
            config={config}
            onApiCall={simulateApiCall}
            onAddCall={addCall}
          />
        );
      case 'simulator':
        return (
          <CallSimulator
            config={config}
            onApiCall={simulateApiCall}
            onAddCall={addCall}
            calls={calls}
          />
        );
      case 'logs':
        return <RequestLog logs={logs} onClear={clearLogs} />;
      case 'calls':
        return <RequestLog logs={logs} onClear={clearCalls} callsView={calls} />;
      case 'settings':
        return <Settings config={config} onSave={saveConfig} />;
      case 'docs':
        return <Documentation />;
      default:
        return <Dashboard calls={calls} logs={logs} config={config} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
