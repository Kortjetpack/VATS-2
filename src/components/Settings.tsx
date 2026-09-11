import { useState } from 'react';
import { AppConfig } from '../types';

interface SettingsProps {
  config: AppConfig;
  onSave: (config: AppConfig) => void;
}

export default function Settings({ config, onSave }: SettingsProps) {
  const [form, setForm] = useState<AppConfig>({ ...config });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">⚙️ Настройки</h2>
        <p className="text-gray-400 mt-1">
          Конфигурация подключения к PhoneAPI МойСклад и callback-серверу
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* PhoneAPI МойСклад */}
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">🔑 PhoneAPI МойСклад</h3>
          <p className="text-sm text-gray-400 mb-4">
            Параметры для отправки запросов к API МоегоСклада (создание звонков, события)
          </p>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-300 block mb-1">API Base URL</label>
              <input
                type="text"
                value={form.apiBaseUrl}
                onChange={(e) => setForm({ ...form, apiBaseUrl: e.target.value })}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-sm font-mono text-white focus:border-blue-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">Базовый URL API для отправки запросов</p>
            </div>
            <div>
              <label className="text-sm text-gray-300 block mb-1">Lognex-Phone-Auth-Token</label>
              <input
                type="text"
                value={form.authToken}
                onChange={(e) => setForm({ ...form, authToken: e.target.value })}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-sm font-mono text-white focus:border-blue-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Ключ аутентификации, генерируется при подключении Phone API в каталоге Решений МойСклад
              </p>
            </div>
          </div>
        </div>

        {/* Callback сервер */}
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">📡 Callback-сервер</h3>
          <p className="text-sm text-gray-400 mb-4">
            Параметры нашего сервера, который принимает запросы от МоегоСклада (исходящие вызовы)
          </p>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-300 block mb-1">Callback URL</label>
              <input
                type="text"
                value={form.callbackUrl}
                onChange={(e) => setForm({ ...form, callbackUrl: e.target.value })}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-sm font-mono text-white focus:border-blue-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                URL нашего сервера, на который МойСклад отправляет запросы исходящих вызовов
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-300 block mb-1">Секретный ключ (для MD5 подписи)</label>
              <input
                type="text"
                value={form.callbackSecret}
                onChange={(e) => setForm({ ...form, callbackSecret: e.target.value })}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-sm font-mono text-white focus:border-blue-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Используется для проверки подписи Lognex-Content-MD5 во входящих запросах от МоегоСклада
              </p>
            </div>
          </div>
        </div>

        {/* Информация о сервере */}
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">🖥 Сервер</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">IP-адрес:</span>
              <span className="text-sm font-mono text-white">45.158.46.193</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">ОС:</span>
              <span className="text-sm text-white">Ubuntu 24.04 LTS</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Конфигурация:</span>
              <span className="text-sm text-white">1x2.2ГГц, 0.5Гб RAM, 10Гб HDD</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">SSH:</span>
              <span className="text-sm text-green-400">● Доступен</span>
            </div>
          </div>
        </div>

        {/* Инструкция по деплою */}
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">📦 Деплой бэкенда на сервер</h3>
          <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs text-green-300 space-y-1 overflow-x-auto">
            <p className="text-gray-500"># Установка Node.js</p>
            <p>curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -</p>
            <p>sudo apt-get install -y nodejs</p>
            <p></p>
            <p className="text-gray-500"># Установка Asterisk (опционально)</p>
            <p>sudo apt-get install asterisk</p>
            <p></p>
            <p className="text-gray-500"># Клонирование и запуск сервиса</p>
            <p>git clone {'<repo>'} /opt/phone-api</p>
            <p>cd /opt/phone-api && npm install</p>
            <p>npm start</p>
            <p></p>
            <p className="text-gray-500"># Настройка nginx reverse proxy</p>
            <p>sudo apt-get install nginx</p>
            <p>sudo nano /etc/nginx/sites-available/phone-api</p>
          </div>
        </div>

        {/* Кнопка сохранения */}
        <button
          onClick={handleSave}
          className={`w-full py-3 px-6 rounded-xl font-medium transition-all ${
            saved
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {saved ? '✅ Сохранено!' : '💾 Сохранить настройки'}
        </button>
      </div>
    </div>
  );
}
