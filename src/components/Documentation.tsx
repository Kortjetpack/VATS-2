import { useState } from 'react';

export default function Documentation() {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', label: 'Обзор' },
    { id: 'auth', label: 'Аутентификация' },
    { id: 'call-create', label: 'Создать звонок' },
    { id: 'call-update', label: 'Обновить звонок' },
    { id: 'call-extid', label: 'По externalId' },
    { id: 'events', label: 'События' },
    { id: 'employees', label: 'Сотрудники' },
    { id: 'callback', label: 'Исходящий вызов' },
    { id: 'errors', label: 'Ошибки' },
    { id: 'limits', label: 'Ограничения' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">📖 Документация PhoneAPI МойСклад</h2>
        <p className="text-gray-400 mt-1">
          Полная справка по API интеграции телефонных провайдеров
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Навигация */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-xl p-3 border border-gray-700 sticky top-4">
            <nav className="space-y-1">
              {sections.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeSection === s.id
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Контент */}
        <div className="lg:col-span-3">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            {activeSection === 'overview' && <OverviewSection />}
            {activeSection === 'auth' && <AuthSection />}
            {activeSection === 'call-create' && <CallCreateSection />}
            {activeSection === 'call-update' && <CallUpdateSection />}
            {activeSection === 'call-extid' && <CallExtIdSection />}
            {activeSection === 'events' && <EventsSection />}
            {activeSection === 'employees' && <EmployeesSection />}
            {activeSection === 'callback' && <CallbackSection />}
            {activeSection === 'errors' && <ErrorsSection />}
            {activeSection === 'limits' && <LimitsSection />}
          </div>
        </div>
      </div>
    </div>
  );
}

function CodeBlock({ children, lang = 'json' }: { children: string; lang?: string }) {
  return (
    <div className="bg-gray-900 rounded-lg p-4 my-3 overflow-x-auto">
      <div className="text-xs text-gray-500 mb-2">{lang}</div>
      <pre className="text-xs font-mono text-green-300 whitespace-pre">{children}</pre>
    </div>
  );
}

function Endpoint({ method, path }: { method: string; path: string }) {
  const methodColors: Record<string, string> = {
    GET: 'bg-green-600/20 text-green-300',
    POST: 'bg-blue-600/20 text-blue-300',
    PUT: 'bg-orange-600/20 text-orange-300',
    DELETE: 'bg-red-600/20 text-red-300',
  };
  return (
    <div className="flex items-center gap-2 my-2 p-2 bg-gray-900 rounded-lg">
      <span className={`text-xs font-mono font-bold px-2 py-1 rounded ${methodColors[method] || 'bg-gray-600 text-gray-300'}`}>
        {method}
      </span>
      <span className="text-sm font-mono text-white">{path}</span>
    </div>
  );
}

function OverviewSection() {
  return (
    <div className="prose prose-invert max-w-none">
      <h3 className="text-xl font-bold text-white mb-4">Общие сведения</h3>
      <p className="text-gray-300 mb-4">
        Phone API — это API интеграции для телефонных провайдеров, позволяющее:
      </p>
      <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4">
        <li>Создавать сущности звонков</li>
        <li>Рассылать события (нотификации) о звонках</li>
        <li>Обновлять звонки при завершении/добавлении записи</li>
        <li>Принимать запросы на исходящие вызовы от МоегоСклада</li>
      </ul>

      <h4 className="text-lg font-semibold text-white mt-6 mb-3">Сценарий работы</h4>
      <div className="space-y-3">
        <div className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg">
          <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">1</span>
          <div>
            <p className="text-white font-medium">Создание сущности звонка</p>
            <p className="text-gray-400 text-sm">POST /call — при начале входящего/исходящего звонка</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg">
          <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">2</span>
          <div>
            <p className="text-white font-medium">Рассылка событий (нотификации)</p>
            <p className="text-gray-400 text-sm">POST /call/{'{id}'}/event — показать/скрыть карточку звонка у пользователя</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg">
          <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">3</span>
          <div>
            <p className="text-white font-medium">Обновление при завершении</p>
            <p className="text-gray-400 text-sm">PUT /call/{'{id}'} — добавить endTime, duration, recordUrl</p>
          </div>
        </div>
      </div>

      <h4 className="text-lg font-semibold text-white mt-6 mb-3">Формат даты и времени</h4>
      <CodeBlock lang="text">{`Без миллисекунд: ГГГГ-ММ-ДД ЧЧ:мм:сс
С миллисекундами: ГГГГ-ММ-ДД ЧЧ:мм:сс.ммм

Пример: 2017-01-01 00:00:05.000`}</CodeBlock>

      <h4 className="text-lg font-semibold text-white mt-6 mb-3">Обязательные заголовки</h4>
      <CodeBlock lang="http">{`Content-Type: application/json
Accept-Encoding: gzip
Lognex-Phone-Auth-Token: {token}`}</CodeBlock>
    </div>
  );
}

function AuthSection() {
  return (
    <div className="prose prose-invert max-w-none">
      <h3 className="text-xl font-bold text-white mb-4">Аутентификация</h3>
      <p className="text-gray-300 mb-4">
        Аутентификация осуществляется через передачу в заголовке параметра{' '}
        <code className="bg-gray-700 px-1.5 py-0.5 rounded text-blue-300">Lognex-Phone-Auth-Token</code>{' '}
        со значением ключа аутентификации.
      </p>
      <p className="text-gray-300 mb-4">
        Ключ генерируется для клиента при подключении Phone API в каталоге Решений МойСклад.
      </p>

      <h4 className="text-lg font-semibold text-white mt-6 mb-3">Пример заголовка</h4>
      <CodeBlock lang="http">{`Lognex-Phone-Auth-Token: d03627d59c1948a0f9a6aa1e267c954bfd0301ec`}</CodeBlock>

      <h4 className="text-lg font-semibold text-white mt-6 mb-3">Дополнительные заголовки ответов</h4>
      <ul className="list-disc list-inside text-gray-300 space-y-2">
        <li><code className="text-yellow-300">X-Lognex-Auth</code> — расширенный код ошибки аутентификации</li>
        <li><code className="text-yellow-300">X-Lognex-Auth-Message</code> — сообщение об ошибке</li>
        <li><code className="text-yellow-300">X-Lognex-API-Version-Deprecated</code> — дата отключения версии API</li>
      </ul>
    </div>
  );
}

function CallCreateSection() {
  return (
    <div className="prose prose-invert max-w-none">
      <h3 className="text-xl font-bold text-white mb-4">Создать звонок</h3>
      <Endpoint method="POST" path="https://api.moysklad.ru/api/phone/1.0/call" />

      <h4 className="text-lg font-semibold text-white mt-6 mb-3">Атрибуты запроса</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="text-left py-2 text-gray-400">Поле</th>
              <th className="text-left py-2 text-gray-400">Тип</th>
              <th className="text-left py-2 text-gray-400">Обязательное</th>
              <th className="text-left py-2 text-gray-400">Описание</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            <tr className="border-b border-gray-700"><td className="py-2 font-mono text-blue-300">externalId</td><td>String</td><td>✅</td><td>Внешний ID звонка</td></tr>
            <tr className="border-b border-gray-700"><td className="py-2 font-mono text-blue-300">number</td><td>String</td><td>✅</td><td>Внешний номер телефона</td></tr>
            <tr className="border-b border-gray-700"><td className="py-2 font-mono text-blue-300">isIncoming</td><td>Boolean</td><td>✅</td><td>true — входящий, false — исходящий</td></tr>
            <tr className="border-b border-gray-700"><td className="py-2 font-mono text-blue-300">startTime</td><td>String</td><td>✅</td><td>Время начала (yyyy-MM-dd HH:mm:ss.SSS)</td></tr>
            <tr className="border-b border-gray-700"><td className="py-2 font-mono text-blue-300">extension</td><td>String</td><td></td><td>Добавочный номер</td></tr>
            <tr className="border-b border-gray-700"><td className="py-2 font-mono text-blue-300">counterparty</td><td>Meta</td><td></td><td>Ссылка на контрагента</td></tr>
            <tr className="border-b border-gray-700"><td className="py-2 font-mono text-blue-300">employee</td><td>Meta</td><td></td><td>Ссылка на сотрудника (приоритетнее extension)</td></tr>
            <tr className="border-b border-gray-700"><td className="py-2 font-mono text-blue-300">endTime</td><td>String</td><td></td><td>Время окончания</td></tr>
            <tr className="border-b border-gray-700"><td className="py-2 font-mono text-blue-300">duration</td><td>Integer</td><td></td><td>Продолжительность в мс</td></tr>
            <tr className="border-b border-gray-700"><td className="py-2 font-mono text-blue-300">recordUrl</td><td>Array</td><td></td><td>Массив URL записей разговоров</td></tr>
            <tr className="border-b border-gray-700"><td className="py-2 font-mono text-blue-300">comment</td><td>String</td><td></td><td>Комментарий (до 4096 символов)</td></tr>
            <tr><td className="py-2 font-mono text-blue-300">events</td><td>Array</td><td></td><td>Список событий карточки</td></tr>
          </tbody>
        </table>
      </div>

      <h4 className="text-lg font-semibold text-white mt-6 mb-3">Пример запроса</h4>
      <CodeBlock>{`{
  "externalId": "AkjhDlkJDlkjD09D",
  "number": "+74959999999",
  "extension": "101",
  "isIncoming": true,
  "startTime": "2017-01-01 00:00:05.000",
  "comment": "example comment"
}`}</CodeBlock>

      <h4 className="text-lg font-semibold text-white mt-6 mb-3">Пример ответа (200)</h4>
      <CodeBlock>{`{
  "meta": {
    "href": "https://api.moysklad.ru/api/phone/1.0/call/89fc07ad-2c8d-11e6-8a84-bae500000051",
    "type": "call",
    "mediaType": "application/json"
  },
  "id": "89fc07ad-2c8d-11e6-8a84-bae500000051",
  "externalId": "AkjhDlkJDlkjD09D",
  "number": "+74959999999",
  "counterparty": {
    "href": "https://api.moysklad.ru/api/remap/1.2/entity/counterparty/...",
    "type": "counterparty",
    "mediaType": "application/json"
  },
  "counterpartyowner": {
    "extention": "100",
    "meta": {
      "href": "https://api.moysklad.ru/api/remap/1.2/entity/employee/...",
      "type": "employee",
      "mediaType": "application/json"
    }
  },
  "extension": "100",
  "employee": { ... },
  "isIncoming": true,
  "startTime": "2017-01-01 00:00:05.000",
  "endTime": null,
  "duration": null,
  "recordUrl": []
}`}</CodeBlock>
    </div>
  );
}

function CallUpdateSection() {
  return (
    <div className="prose prose-invert max-w-none">
      <h3 className="text-xl font-bold text-white mb-4">Обновить звонок</h3>
      <Endpoint method="PUT" path="https://api.moysklad.ru/api/phone/1.0/call/{id}" />

      <p className="text-gray-300 mb-4">
        Обновляется представление звонка. В теле запроса можно указать только те поля, которые необходимо изменить.
      </p>

      <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4 mb-4">
        <p className="text-yellow-300 text-sm">
          <strong>Важно:</strong> Поля, уже заполненные у сущности, не перезаписываются (за исключением <code className="bg-gray-700 px-1 rounded">comment</code>).
          Поле <code className="bg-gray-700 px-1 rounded">recordUrl</code> добавляет данные.
          Поле <code className="bg-gray-700 px-1 rounded">employee</code> приоритетнее <code className="bg-gray-700 px-1 rounded">extension</code>.
          Поле <code className="bg-gray-700 px-1 rounded">endTime</code> приоритетнее <code className="bg-gray-700 px-1 rounded">duration</code>.
        </p>
      </div>

      <h4 className="text-lg font-semibold text-white mt-6 mb-3">Пример запроса</h4>
      <CodeBlock>{`{
  "endTime": "2017-01-01 00:01:05.000",
  "recordUrl": ["http://some_url.ru"],
  "comment": "updated example comment",
  "events": [
    {
      "eventType": "HIDE",
      "extension": "101",
      "sequence": 2
    }
  ]
}`}</CodeBlock>
    </div>
  );
}

function CallExtIdSection() {
  return (
    <div className="prose prose-invert max-w-none">
      <h3 className="text-xl font-bold text-white mb-4">Обновить звонок по внешнему ID</h3>
      <Endpoint method="PUT" path="https://api.moysklad.ru/api/phone/1.0/call/extid/{extid}" />

      <p className="text-gray-300 mb-4">
        Аналогично обновлению по внутреннему ID, но используется внешний идентификатор (externalId),
        который задаётся при создании звонка.
      </p>

      <h4 className="text-lg font-semibold text-white mt-6 mb-3">Пример запроса</h4>
      <CodeBlock>{`PUT /api/phone/1.0/call/extid/AjllkmSAkml

{
  "extension": "100",
  "endTime": "2017-01-01 00:00:05.000",
  "recordUrl": ["http://some_url.ru"],
  "comment": "updated call comment",
  "events": [
    {
      "eventType": "SHOW",
      "extension": "101",
      "sequence": 1
    }
  ]
}`}</CodeBlock>
    </div>
  );
}

function EventsSection() {
  return (
    <div className="prose prose-invert max-w-none">
      <h3 className="text-xl font-bold text-white mb-4">События карточки звонка</h3>

      <Endpoint method="POST" path="/api/phone/1.0/call/{id}/event" />
      <Endpoint method="POST" path="/api/phone/1.0/call/extid/{extid}/event" />

      <h4 className="text-lg font-semibold text-white mt-6 mb-3">Типы событий</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="text-left py-2 text-gray-400">eventType</th>
              <th className="text-left py-2 text-gray-400">Описание</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            <tr className="border-b border-gray-700"><td className="py-2 font-mono text-green-300">SHOW</td><td>Показать карточку звонка</td></tr>
            <tr className="border-b border-gray-700"><td className="py-2 font-mono text-blue-300">STARTTIME</td><td>Запустить таймер карточки</td></tr>
            <tr className="border-b border-gray-700"><td className="py-2 font-mono text-orange-300">HIDE</td><td>Скрыть карточку звонка</td></tr>
            <tr><td className="py-2 font-mono text-red-300">HIDE_ALL</td><td>Скрыть карточки для всех участников</td></tr>
          </tbody>
        </table>
      </div>

      <h4 className="text-lg font-semibold text-white mt-6 mb-3">Атрибуты события</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="text-left py-2 text-gray-400">Поле</th>
              <th className="text-left py-2 text-gray-400">Обязательное</th>
              <th className="text-left py-2 text-gray-400">Описание</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            <tr className="border-b border-gray-700"><td className="py-2 font-mono text-blue-300">eventType</td><td>✅</td><td>Тип события</td></tr>
            <tr className="border-b border-gray-700"><td className="py-2 font-mono text-blue-300">extension</td><td>✅*</td><td>Добавочный номер (* не обяз. для HIDE_ALL)</td></tr>
            <tr className="border-b border-gray-700"><td className="py-2 font-mono text-blue-300">sequence</td><td>✅</td><td>Порядковый номер события</td></tr>
            <tr><td className="py-2 font-mono text-blue-300">employee</td><td></td><td>Сотрудник (Meta)</td></tr>
          </tbody>
        </table>
      </div>

      <h4 className="text-lg font-semibold text-white mt-6 mb-3">Пример запроса</h4>
      <CodeBlock>{`{
  "eventType": "SHOW",
  "extension": "101",
  "sequence": 1,
  "employee": {
    "href": "https://api.moysklad.ru/api/remap/1.2/entity/employee/...",
    "type": "employee",
    "mediaType": "application/json"
  }
}`}</CodeBlock>

      <p className="text-gray-400 text-sm mt-2">Ответ: <span className="text-green-400">HTTP 204 No Content</span></p>
    </div>
  );
}

function EmployeesSection() {
  return (
    <div className="prose prose-invert max-w-none">
      <h3 className="text-xl font-bold text-white mb-4">Сотрудники</h3>
      <Endpoint method="GET" path="/api/phone/1.0/employee?filter=extention=1234" />

      <p className="text-gray-300 mb-4">
        Поиск сотрудников с добавочным номером с возможностью фильтрации.
      </p>

      <h4 className="text-lg font-semibold text-white mt-6 mb-3">Параметры фильтрации</h4>
      <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4">
        <li><code className="text-yellow-300">extention=1234</code> — точное совпадение</li>
        <li><code className="text-yellow-300">extention~=12</code> — содержит подстроку</li>
      </ul>

      <h4 className="text-lg font-semibold text-white mt-6 mb-3">Пример ответа</h4>
      <CodeBlock>{`{
  "employees": [
    {
      "meta": {
        "href": "https://api.moysklad.ru/api/remap/1.2/entity/employee/7bac6104-...",
        "type": "employee",
        "mediaType": "application/json"
      },
      "extention": "1234"
    }
  ]
}`}</CodeBlock>
    </div>
  );
}

function CallbackSection() {
  return (
    <div className="prose prose-invert max-w-none">
      <h3 className="text-xl font-bold text-white mb-4">Исходящий вызов (Callback от МоегоСклада)</h3>

      <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4 mb-4">
        <p className="text-blue-300 text-sm">
          <strong>Важно:</strong> Это запрос, который МойСклад отправляет НА НАШ сервер для инициирования исходящего вызова.
          Мы должны реализовать обработчик этого запроса на нашем бэкенде.
        </p>
      </div>

      <Endpoint method="POST" path="https://our-server.com/callback" />

      <h4 className="text-lg font-semibold text-white mt-6 mb-3">Заголовки</h4>
      <CodeBlock lang="http">{`Content-Type: application/json
Lognex-Content-MD5: 802EFD4A933386248031D2928612A13F`}</CodeBlock>

      <p className="text-gray-300 mb-4">
        Подпись <code className="bg-gray-700 px-1 rounded text-yellow-300">Lognex-Content-MD5</code> генерируется
        по алгоритму MD5 от конкатенации ключа доступа и значений параметров запроса.
      </p>

      <h4 className="text-lg font-semibold text-white mt-6 mb-3">Тело запроса</h4>
      <CodeBlock>{`{
  "srcNumber": "100",
  "destNumber": "+74959999999",
  "uid": "admin@companyname"
}`}</CodeBlock>

      <h4 className="text-lg font-semibold text-white mt-6 mb-3">Описание полей</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="text-left py-2 text-gray-400">Поле</th>
              <th className="text-left py-2 text-gray-400">Описание</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            <tr className="border-b border-gray-700"><td className="py-2 font-mono text-blue-300">srcNumber</td><td>Номер, с которого производится вызов (добавочный)</td></tr>
            <tr className="border-b border-gray-700"><td className="py-2 font-mono text-blue-300">destNumber</td><td>Номер телефона, на который происходит звонок</td></tr>
            <tr><td className="py-2 font-mono text-blue-300">uid</td><td>Логин сотрудника, совершающего вызов</td></tr>
          </tbody>
        </table>
      </div>

      <h4 className="text-lg font-semibold text-white mt-6 mb-3">Что делает наш сервер</h4>
      <ol className="list-decimal list-inside text-gray-300 space-y-2">
        <li>Получает POST запрос от МоегоСклада</li>
        <li>Проверяет MD5 подпись (Lognex-Content-MD5)</li>
        <li>Инициирует SIP-вызов через Asterisk/телефонный провайдер</li>
        <li>Возвращает HTTP 200</li>
        <li>После соединения создаёт звонок через PhoneAPI (POST /call)</li>
      </ol>
    </div>
  );
}

function ErrorsSection() {
  return (
    <div className="prose prose-invert max-w-none">
      <h3 className="text-xl font-bold text-white mb-4">Обработка ошибок</h3>

      <h4 className="text-lg font-semibold text-white mt-4 mb-3">Структура ошибки</h4>
      <CodeBlock>{`{
  "errors": [
    {
      "error": "Заголовок ошибки",
      "parameter": "имя_параметра",
      "code": 1000,
      "error_message": "Описание ошибки"
    }
  ]
}`}</CodeBlock>

      <h4 className="text-lg font-semibold text-white mt-6 mb-3">HTTP статусы</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="text-left py-2 text-gray-400">Код</th>
              <th className="text-left py-2 text-gray-400">Значение</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            <tr className="border-b border-gray-700"><td className="py-2 font-mono text-yellow-300">400</td><td>Ошибка в структуре JSON</td></tr>
            <tr className="border-b border-gray-700"><td className="py-2 font-mono text-yellow-300">401</td><td>Неверная аутентификация</td></tr>
            <tr className="border-b border-gray-700"><td className="py-2 font-mono text-yellow-300">403</td><td>Нет прав</td></tr>
            <tr className="border-b border-gray-700"><td className="py-2 font-mono text-yellow-300">404</td><td>Ресурс не существует</td></tr>
            <tr className="border-b border-gray-700"><td className="py-2 font-mono text-yellow-300">412</td><td>Не указан обязательный параметр</td></tr>
            <tr className="border-b border-gray-700"><td className="py-2 font-mono text-yellow-300">429</td><td>Превышен лимит запросов</td></tr>
            <tr className="border-b border-gray-700"><td className="py-2 font-mono text-yellow-300">500</td><td>Внутренняя ошибка сервера</td></tr>
            <tr className="border-b border-gray-700"><td className="py-2 font-mono text-yellow-300">502</td><td>Сервис временно недоступен</td></tr>
            <tr><td className="py-2 font-mono text-yellow-300">504</td><td>Таймаут</td></tr>
          </tbody>
        </table>
      </div>

      <h4 className="text-lg font-semibold text-white mt-6 mb-3">Коды ошибок</h4>
      <div className="space-y-3">
        {[
          { code: 1000, msg: 'Элемент URI не является идентификатором' },
          { code: 1021, msg: 'Объект с типом и идентификатором не найден' },
          { code: 1039, msg: 'Операция не поддерживается для данного ресурса' },
          { code: 1040, msg: 'Неверно заданы параметры запроса' },
          { code: 1056, msg: 'Ошибка аутентификации' },
          { code: 2001, msg: 'Входящий запрос не соответствует формату JSON' },
          { code: 3000, msg: 'Поле не может быть пустым или отсутствовать' },
          { code: 55008, msg: 'Не установлено решение для работы с API' },
        ].map(err => (
          <div key={err.code} className="flex items-start gap-3 p-2 bg-gray-700/30 rounded">
            <span className="text-xs font-mono bg-red-600/20 text-red-300 px-2 py-0.5 rounded shrink-0">{err.code}</span>
            <span className="text-sm text-gray-300">{err.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LimitsSection() {
  return (
    <div className="prose prose-invert max-w-none">
      <h3 className="text-xl font-bold text-white mb-4">Ограничения</h3>

      <div className="space-y-4">
        <div className="bg-gray-700/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⏱</span>
            <div>
              <p className="text-white font-medium">100 запросов за 5 секунд</p>
              <p className="text-gray-400 text-sm">Периодическое ограничение</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-700/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👤</span>
            <div>
              <p className="text-white font-medium">5 одновременных запросов от одного пользователя</p>
              <p className="text-gray-400 text-sm">Параллелизм на пользователя</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-700/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌐</span>
            <div>
              <p className="text-white font-medium">100 одновременных запросов с одного IP</p>
              <p className="text-gray-400 text-sm">Параллелизм на IP-адрес</p>
            </div>
          </div>
        </div>
      </div>

      <h4 className="text-lg font-semibold text-white mt-6 mb-3">Фильтрация</h4>
      <p className="text-gray-300 mb-4">
        Для фильтрации используется URL-параметр <code className="bg-gray-700 px-1.5 py-0.5 rounded text-blue-300">filter</code>.
      </p>
      <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs text-green-300 space-y-1">
        <p className="text-gray-500"># Операторы: = != ~ ~= =~</p>
        <p>filter=extention=101</p>
        <p>filter=extention~=10</p>
        <p></p>
        <p className="text-gray-500"># Проверка на пустое значение</p>
        <p>filter=fieldName=; (равно null/пусто)</p>
        <p>filter=fieldName!=; (не пусто)</p>
        <p></p>
        <p className="text-gray-500"># Множественные условия (ИЛИ для =, И для !=)</p>
        <p>filter=sum=100;sum=150 → sum IN (100, 150)</p>
        <p>filter=name!=0001;name!=0002 → name NOT IN (0001, 0002)</p>
      </div>
    </div>
  );
}
