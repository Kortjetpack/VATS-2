import { useState } from 'react';
import { AppConfig, Call } from '../types';
import { generateExternalId, generateUUID, formatDateTime } from '../utils';

interface CallSimulatorProps {
  config: AppConfig;
  onApiCall: (method: string, endpoint: string, body: any, isOutgoing?: boolean) => Promise<any>;
  onAddCall: (call: Call) => void;
  calls: Call[];
}

export default function CallSimulator({ config, onApiCall, onAddCall, calls }: CallSimulatorProps) {
  const [simulating, setSimulating] = useState(false);
  const [simLog, setSimLog] = useState<string[]>([]);
  const [scenario, setScenario] = useState<'full_incoming' | 'full_outgoing' | 'incoming_no_answer'>('full_incoming');

  const addLog = (msg: string) => {
    setSimLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const simulateFullIncoming = async () => {
    setSimulating(true);
    setSimLog([]);
    const extId = generateExternalId();
    const callUuid = generateUUID();
    const callerNumber = '+74951234567';
    const employeeExt = '101';
    const startTime = formatDateTime(new Date());

    addLog('═══ Сценарий: Входящий звонок ═══');
    addLog('');
    addLog('Шаг 1: Создание звонка (POST /call)');
    addLog(`  externalId: ${extId}`);
    addLog(`  number: ${callerNumber}`);
    addLog(`  extension: ${employeeExt}`);
    addLog(`  isIncoming: true`);
    addLog(`  startTime: ${startTime}`);

    const createBody = {
      externalId: extId,
      number: callerNumber,
      extension: employeeExt,
      isIncoming: true,
      startTime,
      events: [{ eventType: 'SHOW', extension: employeeExt, sequence: 1 }],
    };

    const createResult = await onApiCall('POST', '/call', createBody);
    addLog(`  → Ответ: HTTP ${createResult.status}`);
    if (createResult.body?.id) {
      addLog(`  → id: ${createResult.body.id}`);
    }

    onAddCall({
      id: createResult.body?.id || callUuid,
      externalId: extId,
      number: callerNumber,
      isIncoming: true,
      startTime,
      extension: employeeExt,
      comment: 'Входящий звонок (симуляция)',
    });

    await new Promise(r => setTimeout(r, 500));

    addLog('');
    addLog('Шаг 2: Запуск таймера (POST /call/{id}/event)');
    addLog(`  eventType: STARTTIME`);
    addLog(`  extension: ${employeeExt}`);
    addLog(`  sequence: 2`);

    const startTimerResult = await onApiCall('POST', `/call/${createResult.body?.id || callUuid}/event`, {
      eventType: 'STARTTIME',
      extension: employeeExt,
      sequence: 2,
    });
    addLog(`  → Ответ: HTTP ${startTimerResult.status}`);

    // Симуляция разговора
    addLog('');
    addLog('⏱ Симуляция разговора (5 секунд)...');
    await new Promise(r => setTimeout(r, 2000));

    const endTime = formatDateTime(new Date());
    addLog('');
    addLog('Шаг 3: Завершение звонка (PUT /call/{id})');
    addLog(`  endTime: ${endTime}`);
    addLog(`  duration: 5000 мс`);
    addLog(`  events: [HIDE]`);

    const updateResult = await onApiCall('PUT', `/call/${createResult.body?.id || callUuid}`, {
      endTime,
      duration: 5000,
      comment: 'Разговор завершён',
      events: [{ eventType: 'HIDE', extension: employeeExt, sequence: 3 }],
    });
    addLog(`  → Ответ: HTTP ${updateResult.status}`);

    addLog('');
    addLog('═══ Сценарий завершён ═══');
    setSimulating(false);
  };

  const simulateFullOutgoing = async () => {
    setSimulating(true);
    setSimLog([]);
    const extId = generateExternalId();
    const callUuid = generateUUID();
    const destNumber = '+74959876543';
    const srcExtension = '100';
    const startTime = formatDateTime(new Date());

    addLog('═══ Сценарий: Исходящий звонок ═══');
    addLog('');
    addLog('Шаг 0: МойСклад отправляет запрос на исходящий вызов');
    addLog(`  POST ${config.callbackUrl}`);
    addLog(`  Headers: Lognex-Content-MD5: ${config.callbackSecret ? '802EFD4A...' : 'N/A'}`);
    addLog(`  Body: { srcNumber: "${srcExtension}", destNumber: "${destNumber}", uid: "admin@company" }`);
    addLog('  → Наш сервер принимает запрос и инициирует вызов');

    await new Promise(r => setTimeout(r, 500));

    addLog('');
    addLog('Шаг 1: Создание звонка (POST /call)');
    addLog(`  externalId: ${extId}`);
    addLog(`  number: ${destNumber}`);
    addLog(`  extension: ${srcExtension}`);
    addLog(`  isIncoming: false`);

    const createBody = {
      externalId: extId,
      number: destNumber,
      extension: srcExtension,
      isIncoming: false,
      startTime,
      events: [{ eventType: 'SHOW', extension: srcExtension, sequence: 1 }],
    };

    const createResult = await onApiCall('POST', '/call', createBody);
    addLog(`  → Ответ: HTTP ${createResult.status}`);

    onAddCall({
      id: createResult.body?.id || callUuid,
      externalId: extId,
      number: destNumber,
      isIncoming: false,
      startTime,
      extension: srcExtension,
      comment: 'Исходящий звонок (симуляция)',
    });

    await new Promise(r => setTimeout(r, 500));

    addLog('');
    addLog('⏱ Симуляция ожидания ответа (3 секунды)...');
    await new Promise(r => setTimeout(r, 1500));

    const endTime = formatDateTime(new Date());
    addLog('');
    addLog('Шаг 2: Завершение (PUT /call/{id})');
    addLog(`  endTime: ${endTime}`);
    addLog(`  duration: 3000 мс`);

    const updateResult = await onApiCall('PUT', `/call/${createResult.body?.id || callUuid}`, {
      endTime,
      duration: 3000,
      events: [{ eventType: 'HIDE', extension: srcExtension, sequence: 2 }],
    });
    addLog(`  → Ответ: HTTP ${updateResult.status}`);

    addLog('');
    addLog('═══ Сценарий завершён ═══');
    setSimulating(false);
  };

  const simulateNoAnswer = async () => {
    setSimulating(true);
    setSimLog([]);
    const extId = generateExternalId();
    const callUuid = generateUUID();
    const callerNumber = '+74955555555';
    const employeeExt = '102';
    const startTime = formatDateTime(new Date());

    addLog('═══ Сценарий: Входящий — нет ответа ═══');
    addLog('');
    addLog('Шаг 1: Создание звонка (POST /call)');
    addLog(`  number: ${callerNumber}, extension: ${employeeExt}`);

    const createResult = await onApiCall('POST', '/call', {
      externalId: extId,
      number: callerNumber,
      extension: employeeExt,
      isIncoming: true,
      startTime,
      events: [{ eventType: 'SHOW', extension: employeeExt, sequence: 1 }],
    });
    addLog(`  → Ответ: HTTP ${createResult.status}`);

    onAddCall({
      id: createResult.body?.id || callUuid,
      externalId: extId,
      number: callerNumber,
      isIncoming: true,
      startTime,
      extension: employeeExt,
      comment: 'Пропущенный звонок (симуляция)',
    });

    await new Promise(r => setTimeout(r, 1000));

    addLog('');
    addLog('⏱ Ожидание ответа (10 секунд)...');
    await new Promise(r => setTimeout(r, 1500));

    const endTime = formatDateTime(new Date());
    addLog('');
    addLog('Шаг 2: Завершение — нет ответа');
    addLog(`  duration: 10000 мс (без соединения)`);

    await onApiCall('PUT', `/call/${createResult.body?.id || callUuid}`, {
      endTime,
      duration: 10000,
      comment: 'Нет ответа',
      events: [{ eventType: 'HIDE', extension: employeeExt, sequence: 2 }],
    });

    addLog('');
    addLog('═══ Сценарий завершён ═══');
    setSimulating(false);
  };

  const handleSimulate = async () => {
    switch (scenario) {
      case 'full_incoming':
        await simulateFullIncoming();
        break;
      case 'full_outgoing':
        await simulateFullOutgoing();
        break;
      case 'incoming_no_answer':
        await simulateNoAnswer();
        break;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">📞 Симулятор звонков</h2>
        <p className="text-gray-400 mt-1">
          Полная симуляция сценариев работы с PhoneAPI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Выбор сценария */}
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Выберите сценарий</h3>
            <div className="space-y-3">
              <button
                onClick={() => setScenario('full_incoming')}
                disabled={simulating}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  scenario === 'full_incoming'
                    ? 'bg-green-600/20 border-green-500/50'
                    : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>📥</span>
                  <span className="font-medium text-white">Входящий звонок (с ответом)</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Создание → SHOW → STARTTIME → разговор → HIDE
                </p>
              </button>

              <button
                onClick={() => setScenario('full_outgoing')}
                disabled={simulating}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  scenario === 'full_outgoing'
                    ? 'bg-orange-600/20 border-orange-500/50'
                    : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>📤</span>
                  <span className="font-medium text-white">Исходящий звонок</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Callback от МоегоСклада → создание → SHOW → разговор → HIDE
                </p>
              </button>

              <button
                onClick={() => setScenario('incoming_no_answer')}
                disabled={simulating}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  scenario === 'incoming_no_answer'
                    ? 'bg-red-600/20 border-red-500/50'
                    : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>📵</span>
                  <span className="font-medium text-white">Входящий — нет ответа</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Создание → SHOW → ожидание → HIDE (пропущен)
                </p>
              </button>
            </div>

            <button
              onClick={handleSimulate}
              disabled={simulating}
              className="w-full mt-4 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 text-white font-medium py-3 px-6 rounded-xl transition-colors"
            >
              {simulating ? '⏳ Симуляция...' : '▶ Запустить симуляцию'}
            </button>
          </div>

          {/* История звонков */}
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">История звонков</h3>
            {calls.length === 0 ? (
              <p className="text-gray-500 text-sm">Нет звонков</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {calls.slice(0, 20).map((call, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded bg-gray-700/50 text-xs">
                    <span>{call.isIncoming ? '📥' : '📤'}</span>
                    <span className="font-mono text-white">{call.number}</span>
                    <span className="text-gray-500">→</span>
                    <span className="text-blue-400">ext:{call.extension}</span>
                    <span className="text-gray-500 ml-auto">{call.startTime?.slice(11, 19)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Лог симуляции */}
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">📋 Лог симуляции</h3>
          <div className="bg-gray-900 rounded-lg p-4 h-[500px] overflow-y-auto font-mono text-xs">
            {simLog.length === 0 ? (
              <p className="text-gray-500">Запустите симуляцию для просмотра лога...</p>
            ) : (
              simLog.map((line, i) => (
                <div key={i} className={`${
                  line.includes('═══') ? 'text-yellow-400 font-bold' :
                  line.includes('→ Ответ: HTTP 2') ? 'text-green-400' :
                  line.includes('→ Ответ: HTTP 4') || line.includes('→ Ответ: HTTP 5') ? 'text-red-400' :
                  line.includes('Шаг') ? 'text-blue-400' :
                  line.includes('⏱') ? 'text-orange-400' :
                  'text-gray-300'
                }`}>
                  {line}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
