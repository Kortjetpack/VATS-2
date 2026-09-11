import { useState } from 'react';
import { AppConfig, Call } from '../types';
import { generateUUID, generateExternalId, formatDateTime, buildCallRequest, buildCallUpdateRequest, buildEventRequest } from '../utils';

interface ApiTesterProps {
  config: AppConfig;
  onApiCall: (method: string, endpoint: string, body: any, isOutgoing?: boolean) => Promise<any>;
  onAddCall: (call: Call) => void;
}

type TestScenario = 'create_call' | 'create_call_with_events' | 'send_event' | 'update_call' | 'update_by_extid' | 'send_event_extid' | 'get_employee';

export default function ApiTester({ config, onApiCall, onAddCall }: ApiTesterProps) {
  const [scenario, setScenario] = useState<TestScenario>('create_call');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [customJson, setCustomJson] = useState('');
  const [useCustomJson, setUseCustomJson] = useState(false);

  // Form fields
  const [externalId, setExternalId] = useState(generateExternalId());
  const [number, setNumber] = useState('+74959999999');
  const [extension, setExtension] = useState('101');
  const [isIncoming, setIsIncoming] = useState(true);
  const [comment, setComment] = useState('Тестовый звонок');
  const [callId, setCallId] = useState('89fc07ad-2c8d-11e6-8a84-bae500000051');
  const [eventType, setEventType] = useState('SHOW');
  const [sequence, setSequence] = useState(1);
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState(0);
  const [recordUrl, setRecordUrl] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('extention~=10');

  const scenarios: { id: TestScenario; label: string; method: string; endpoint: string; description: string }[] = [
    { id: 'create_call', label: 'Создать звонок', method: 'POST', endpoint: '/call', description: 'Создание сущности звонка' },
    { id: 'create_call_with_events', label: 'Создать звонок + события', method: 'POST', endpoint: '/call', description: 'Создание звонка с одновременной нотификацией' },
    { id: 'send_event', label: 'Событие по ID', method: 'POST', endpoint: `/call/${callId}/event`, description: 'Отправка события карточки звонка' },
    { id: 'update_call', label: 'Обновить звонок', method: 'PUT', endpoint: `/call/${callId}`, description: 'Обновление звонка при завершении' },
    { id: 'update_by_extid', label: 'Обновить по externalId', method: 'PUT', endpoint: `/call/extid/${externalId}`, description: 'Обновление звонка по внешнему ID' },
    { id: 'send_event_extid', label: 'Событие по externalId', method: 'POST', endpoint: `/call/extid/${externalId}/event`, description: 'Событие карточки по внешнему ID' },
    { id: 'get_employee', label: 'Найти сотрудника', method: 'GET', endpoint: `/employee?filter=${employeeFilter}`, description: 'Поиск сотрудников по добавочному номеру' },
  ];

  const buildRequestBody = (): any => {
    if (useCustomJson && customJson) {
      try {
        return JSON.parse(customJson);
      } catch {
        return null;
      }
    }

    switch (scenario) {
      case 'create_call':
        return buildCallRequest({
          externalId,
          number,
          extension,
          isIncoming,
          startTime: formatDateTime(new Date()),
          comment,
        });

      case 'create_call_with_events':
        return {
          ...buildCallRequest({
            externalId,
            number,
            extension,
            isIncoming,
            startTime: formatDateTime(new Date()),
          }),
          events: [{
            eventType: 'SHOW',
            extension,
            sequence: 1,
          }],
        };

      case 'send_event':
      case 'send_event_extid':
        return buildEventRequest(eventType, extension, sequence);

      case 'update_call':
      case 'update_by_extid':
        const update: any = {};
        if (endTime) update.endTime = endTime;
        if (duration) update.duration = duration;
        if (recordUrl) update.recordUrl = [recordUrl];
        if (comment) update.comment = comment;
        update.events = [{
          eventType: 'HIDE',
          extension,
          sequence: sequence + 1,
        }];
        return update;

      case 'get_employee':
        return null;

      default:
        return {};
    }
  };

  const getEndpoint = (): string => {
    switch (scenario) {
      case 'create_call':
      case 'create_call_with_events':
        return '/call';
      case 'send_event':
        return `/call/${callId}/event`;
      case 'update_call':
        return `/call/${callId}`;
      case 'update_by_extid':
        return `/call/extid/${externalId}`;
      case 'send_event_extid':
        return `/call/extid/${externalId}/event`;
      case 'get_employee':
        return `/employee?filter=${encodeURIComponent(employeeFilter)}`;
      default:
        return '/call';
    }
  };

  const getMethod = (): string => {
    switch (scenario) {
      case 'create_call':
      case 'create_call_with_events':
      case 'send_event':
      case 'send_event_extid':
        return 'POST';
      case 'update_call':
      case 'update_by_extid':
        return 'PUT';
      case 'get_employee':
        return 'GET';
      default:
        return 'POST';
    }
  };

  const handleExecute = async () => {
    setLoading(true);
    setResult(null);

    const method = getMethod();
    const endpoint = getEndpoint();
    const body = buildRequestBody();

    try {
      const response = await onApiCall(method, endpoint, body);
      setResult(response);

      // Если это создание звонка и ответ успешный, сохраняем
      if ((scenario === 'create_call' || scenario === 'create_call_with_events') && response.status === 200 && response.body?.id) {
        onAddCall({
          id: response.body.id,
          externalId: response.body.externalId || externalId,
          number: response.body.number || number,
          isIncoming,
          startTime: response.body.startTime || formatDateTime(new Date()),
          extension: response.body.extension || extension,
          comment: response.body.comment || comment,
        });
      }
    } catch (error: any) {
      setResult({ status: 0, body: { error: error.message } });
    } finally {
      setLoading(false);
    }
  };

  const currentScenario = scenarios.find(s => s.id === scenario)!;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">🧪 API Тестер</h2>
        <p className="text-gray-400 mt-1">
          Отправка тестовых запросов к PhoneAPI МойСклад
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Левая колонка - форма */}
        <div className="space-y-4">
          {/* Выбор сценария */}
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Сценарий</h3>
            <div className="space-y-2">
              {scenarios.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setScenario(s.id); setResult(null); }}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    scenario === s.id
                      ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                      : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-gray-600 px-1.5 py-0.5 rounded">{s.method}</span>
                    <span className="text-sm font-medium">{s.label}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{s.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Параметры */}
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Параметры запроса</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id="customJson"
                  checked={useCustomJson}
                  onChange={(e) => setUseCustomJson(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="customJson" className="text-sm text-gray-300">
                  Использовать свой JSON
                </label>
              </div>

              {useCustomJson ? (
                <textarea
                  value={customJson}
                  onChange={(e) => setCustomJson(e.target.value)}
                  className="w-full h-48 bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm font-mono text-green-300 focus:border-blue-500 focus:outline-none"
                  placeholder='{"externalId": "...", "number": "+74959999999", ...}'
                />
              ) : (
                <>
                  {(scenario === 'create_call' || scenario === 'create_call_with_events' || scenario === 'send_event' || scenario === 'send_event_extid' || scenario === 'update_call' || scenario === 'update_by_extid') && (
                    <>
                      {(scenario === 'create_call' || scenario === 'create_call_with_events') && (
                        <>
                          <div>
                            <label className="text-xs text-gray-400">externalId *</label>
                            <input
                              type="text"
                              value={externalId}
                              onChange={(e) => setExternalId(e.target.value)}
                              className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-1.5 text-sm font-mono text-white focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400">number *</label>
                            <input
                              type="text"
                              value={number}
                              onChange={(e) => setNumber(e.target.value)}
                              className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-1.5 text-sm font-mono text-white focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400">extension</label>
                            <input
                              type="text"
                              value={extension}
                              onChange={(e) => setExtension(e.target.value)}
                              className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-1.5 text-sm font-mono text-white focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                          <div className="flex items-center gap-4">
                            <label className="text-xs text-gray-400">isIncoming *</label>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setIsIncoming(true)}
                                className={`px-3 py-1 rounded text-xs ${isIncoming ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'}`}
                              >
                                Входящий
                              </button>
                              <button
                                onClick={() => setIsIncoming(false)}
                                className={`px-3 py-1 rounded text-xs ${!isIncoming ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-400'}`}
                              >
                                Исходящий
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-gray-400">comment</label>
                            <input
                              type="text"
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-1.5 text-sm font-mono text-white focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                        </>
                      )}

                      {(scenario === 'send_event' || scenario === 'send_event_extid') && (
                        <>
                          <div>
                            <label className="text-xs text-gray-400">eventType *</label>
                            <select
                              value={eventType}
                              onChange={(e) => setEventType(e.target.value)}
                              className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                            >
                              <option value="SHOW">SHOW — Показать карточку</option>
                              <option value="STARTTIME">STARTTIME — Запустить таймер</option>
                              <option value="HIDE">HIDE — Скрыть карточку</option>
                              <option value="HIDE_ALL">HIDE_ALL — Скрыть для всех</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-gray-400">extension *</label>
                            <input
                              type="text"
                              value={extension}
                              onChange={(e) => setExtension(e.target.value)}
                              className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-1.5 text-sm font-mono text-white focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400">sequence *</label>
                            <input
                              type="number"
                              value={sequence}
                              onChange={(e) => setSequence(Number(e.target.value))}
                              className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-1.5 text-sm font-mono text-white focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                        </>
                      )}

                      {(scenario === 'update_call' || scenario === 'update_by_extid') && (
                        <>
                          <div>
                            <label className="text-xs text-gray-400">endTime</label>
                            <input
                              type="text"
                              value={endTime}
                              onChange={(e) => setEndTime(e.target.value)}
                              placeholder="2024-01-01 00:01:05.000"
                              className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-1.5 text-sm font-mono text-white focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400">duration (мс)</label>
                            <input
                              type="number"
                              value={duration}
                              onChange={(e) => setDuration(Number(e.target.value))}
                              className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-1.5 text-sm font-mono text-white focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400">recordUrl</label>
                            <input
                              type="text"
                              value={recordUrl}
                              onChange={(e) => setRecordUrl(e.target.value)}
                              placeholder="http://example.com/record.mp3"
                              className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-1.5 text-sm font-mono text-white focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400">comment</label>
                            <input
                              type="text"
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-1.5 text-sm font-mono text-white focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                        </>
                      )}

                      {(scenario === 'send_event' || scenario === 'update_call') && (
                        <div>
                          <label className="text-xs text-gray-400">callId</label>
                          <input
                            type="text"
                            value={callId}
                            onChange={(e) => setCallId(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-1.5 text-sm font-mono text-white focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      )}
                    </>
                  )}

                  {scenario === 'get_employee' && (
                    <div>
                      <label className="text-xs text-gray-400">filter</label>
                      <input
                        type="text"
                        value={employeeFilter}
                        onChange={(e) => setEmployeeFilter(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-1.5 text-sm font-mono text-white focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Кнопка отправки */}
          <button
            onClick={handleExecute}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white font-medium py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span> Выполняется...
              </>
            ) : (
              <>
                <span>🚀</span> Отправить запрос
              </>
            )}
          </button>
        </div>

        {/* Правая колонка - результат */}
        <div className="space-y-4">
          {/* Запрос */}
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">📤 Запрос</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-blue-600/30 text-blue-300 px-2 py-0.5 rounded">{getMethod()}</span>
                <span className="text-xs font-mono text-gray-400 truncate">{config.apiBaseUrl}{getEndpoint()}</span>
              </div>
              <div className="bg-gray-900 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Headers:</p>
                <pre className="text-xs font-mono text-yellow-300 overflow-x-auto">
{JSON.stringify({
  'Content-Type': 'application/json',
  'Accept-Encoding': 'gzip',
  'Lognex-Phone-Auth-Token': config.authToken.slice(0, 8) + '...',
}, null, 2)}
                </pre>
              </div>
              <div className="bg-gray-900 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Body:</p>
                <pre className="text-xs font-mono text-green-300 overflow-x-auto max-h-64 overflow-y-auto">
{JSON.stringify(buildRequestBody(), null, 2)}
                </pre>
              </div>
            </div>
          </div>

          {/* Ответ */}
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">📥 Ответ</h3>
            {result ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                    result.status === 200 || result.status === 204
                      ? 'bg-green-600/30 text-green-300'
                      : result.status === 0
                      ? 'bg-red-600/30 text-red-300'
                      : 'bg-orange-600/30 text-orange-300'
                  }`}>
                    HTTP {result.status || 'ERROR'}
                  </span>
                </div>
                <div className="bg-gray-900 rounded-lg p-3">
                  <pre className="text-xs font-mono text-cyan-300 overflow-x-auto max-h-96 overflow-y-auto">
{JSON.stringify(result.body, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                {loading ? 'Ожидание ответа...' : 'Нажмите «Отправить запрос» для выполнения'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
