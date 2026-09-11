import { AppConfig, ApiLogEntry, Call } from '../types';
import { safeDate } from '../utils';

interface DashboardProps {
  calls: Call[];
  logs: ApiLogEntry[];
  config: AppConfig;
}

export default function Dashboard({ calls, logs, config }: DashboardProps) {
  const totalCalls = calls.length;
  const incomingCalls = calls.filter(c => c.isIncoming).length;
  const outgoingCalls = calls.filter(c => !c.isIncoming).length;
  const successLogs = logs.filter(l => l.status === 'success').length;
  const errorLogs = logs.filter(l => l.status === 'error').length;

  const stats = [
    { label: 'Всего звонков', value: totalCalls, icon: '📞', color: 'blue' },
    { label: 'Входящие', value: incomingCalls, icon: '📥', color: 'green' },
    { label: 'Исходящие', value: outgoingCalls, icon: '📤', color: 'orange' },
    { label: 'Успешных запросов', value: successLogs, icon: '✅', color: 'emerald' },
    { label: 'Ошибок', value: errorLogs, icon: '❌', color: 'red' },
    { label: 'Всего запросов', value: logs.length, icon: '📋', color: 'purple' },
  ];

  const recentLogs = logs.slice(0, 10);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Обзор</h2>
        <p className="text-gray-400 mt-1">
          Тестовый сервис виртуальной телефонии для интеграции с МойСклад PhoneAPI
        </p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Информация о конфигурации */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">🔧 Конфигурация</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">API URL:</span>
              <span className="text-blue-400 text-sm font-mono truncate ml-2 max-w-[200px]">{config.apiBaseUrl}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Auth Token:</span>
              <span className="text-green-400 text-sm font-mono">{config.authToken.slice(0, 8)}...{config.authToken.slice(-4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Callback URL:</span>
              <span className="text-orange-400 text-sm font-mono truncate ml-2 max-w-[200px]">{config.callbackUrl}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Статус:</span>
              <span className="text-green-400 text-sm">● Активен</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">📡 Сценарий работы</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="bg-blue-600/20 text-blue-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">1</span>
              <div>
                <p className="text-white font-medium">Создание звонка</p>
                <p className="text-gray-400">POST /call — создаём сущность звонка</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-blue-600/20 text-blue-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">2</span>
              <div>
                <p className="text-white font-medium">Нотификация</p>
                <p className="text-gray-400">POST /call/{'{id}'}/event — рассылаем события</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-blue-600/20 text-blue-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">3</span>
              <div>
                <p className="text-white font-medium">Завершение</p>
                <p className="text-gray-400">PUT /call/{'{id}'} — обновляем при завершении</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Последние запросы */}
      <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">📋 Последние запросы</h3>
        {recentLogs.length === 0 ? (
          <p className="text-gray-500 text-sm">Нет запросов. Перейдите в «API Тестер» для отправки тестовых запросов.</p>
        ) : (
          <div className="space-y-2">
            {recentLogs.map(log => (
              <div key={log.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-700/50">
                <span className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-green-400' : log.status === 'error' ? 'bg-red-400' : 'bg-yellow-400'}`} />
                <span className={`text-xs font-mono px-2 py-0.5 rounded ${log.direction === 'outgoing' ? 'bg-blue-900/50 text-blue-300' : 'bg-orange-900/50 text-orange-300'}`}>
                  {log.direction === 'outgoing' ? '→ OUT' : '← IN'}
                </span>
                <span className="text-xs font-mono text-yellow-400 w-12">{log.method}</span>
                <span className="text-xs text-gray-300 truncate flex-1 font-mono">{log.url}</span>
                <span className="text-xs text-gray-500">
                  {safeDate(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
