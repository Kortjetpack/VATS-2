import { useState } from 'react';
import { ApiLogEntry, Call } from '../types';

interface RequestLogProps {
  logs: ApiLogEntry[];
  onClear: () => void;
  callsView?: Call[];
}

export default function RequestLog({ logs, onClear, callsView }: RequestLogProps) {
  const [selectedLog, setSelectedLog] = useState<ApiLogEntry | null>(null);
  const [filter, setFilter] = useState<'all' | 'outgoing' | 'incoming' | 'success' | 'error'>('all');

  const filteredLogs = logs.filter(log => {
    switch (filter) {
      case 'outgoing': return log.direction === 'outgoing';
      case 'incoming': return log.direction === 'incoming';
      case 'success': return log.status === 'success';
      case 'error': return log.status === 'error';
      default: return true;
    }
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {callsView ? '📞 История звонков' : '📋 Журнал запросов'}
          </h2>
          <p className="text-gray-400 mt-1">
            {callsView
              ? `Всего звонков: ${callsView.length}`
              : `Всего запросов: ${logs.length}`
            }
          </p>
        </div>
        <button
          onClick={onClear}
          className="bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-2 rounded-lg text-sm transition-colors border border-red-500/30"
        >
          🗑 Очистить
        </button>
      </div>

      {!callsView && (
        <div className="flex gap-2 mb-4">
          {[
            { id: 'all', label: 'Все' },
            { id: 'outgoing', label: '→ Исходящие' },
            { id: 'incoming', label: '← Входящие' },
            { id: 'success', label: '✅ Успешные' },
            { id: 'error', label: '❌ Ошибки' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                filter === f.id
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                  : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {callsView ? (
        // Режим истории звонков
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          {callsView.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-4xl mb-2">📵</p>
              <p>Нет звонков. Запустите симуляцию или создайте звонок через API Тестер.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {callsView.map((call, i) => (
                <div key={i} className="p-4 hover:bg-gray-700/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{call.isIncoming ? '📥' : '📤'}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-white">{call.number}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${call.isIncoming ? 'bg-green-600/20 text-green-400' : 'bg-orange-600/20 text-orange-400'}`}>
                          {call.isIncoming ? 'Входящий' : 'Исходящий'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                        <span>ext: {call.extension || '—'}</span>
                        <span>extId: {call.externalId?.slice(0, 10)}...</span>
                        <span>{call.startTime}</span>
                      </div>
                      {call.comment && (
                        <p className="text-xs text-gray-500 mt-1">{call.comment}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Режим журнала запросов
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="max-h-[600px] overflow-y-auto divide-y divide-gray-700">
              {filteredLogs.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>Нет запросов</p>
                </div>
              ) : (
                filteredLogs.map(log => (
                  <button
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className={`w-full text-left p-3 hover:bg-gray-700/50 transition-colors ${
                      selectedLog?.id === log.id ? 'bg-blue-600/10 border-l-2 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        log.status === 'success' ? 'bg-green-400' :
                        log.status === 'error' ? 'bg-red-400' : 'bg-yellow-400'
                      }`} />
                      <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                        log.direction === 'outgoing' ? 'bg-blue-900/50 text-blue-300' : 'bg-orange-900/50 text-orange-300'
                      }`}>
                        {log.direction === 'outgoing' ? '→' : '←'}
                      </span>
                      <span className="text-xs font-mono text-yellow-400">{log.method}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 truncate font-mono">{log.url}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{log.timestamp.toLocaleTimeString()}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-2 bg-gray-800 rounded-xl border border-gray-700 p-5">
            {selectedLog ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-mono px-2 py-1 rounded ${
                    selectedLog.status === 'success' ? 'bg-green-600/20 text-green-300' :
                    selectedLog.status === 'error' ? 'bg-red-600/20 text-red-300' : 'bg-yellow-600/20 text-yellow-300'
                  }`}>
                    {selectedLog.status.toUpperCase()}
                  </span>
                  <span className="text-xs font-mono text-yellow-400">{selectedLog.method}</span>
                  {selectedLog.response && (
                    <span className="text-xs text-gray-400">HTTP {selectedLog.response.status}</span>
                  )}
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">URL:</p>
                  <p className="text-sm font-mono text-blue-300 break-all">{selectedLog.url}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Headers:</p>
                  <pre className="bg-gray-900 rounded-lg p-3 text-xs font-mono text-yellow-300 overflow-x-auto">
{JSON.stringify(selectedLog.headers, null, 2)}
                  </pre>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Body запроса:</p>
                  <pre className="bg-gray-900 rounded-lg p-3 text-xs font-mono text-green-300 overflow-x-auto max-h-48 overflow-y-auto">
{JSON.stringify(selectedLog.body, null, 2)}
                  </pre>
                </div>

                {selectedLog.response && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Ответ:</p>
                    <pre className="bg-gray-900 rounded-lg p-3 text-xs font-mono text-cyan-300 overflow-x-auto max-h-48 overflow-y-auto">
{JSON.stringify(selectedLog.response.body, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <p>Выберите запрос из списка</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
