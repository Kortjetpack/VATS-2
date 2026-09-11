interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', icon: '📊', label: 'Обзор' },
  { id: 'tester', icon: '🧪', label: 'API Тестер' },
  { id: 'simulator', icon: '📞', label: 'Симулятор звонков' },
  { id: 'logs', icon: '📋', label: 'Журнал запросов' },
  { id: 'settings', icon: '⚙️', label: 'Настройки' },
  { id: 'docs', icon: '📖', label: 'Документация' },
];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-lg font-bold text-blue-400">📱 PhoneAPI</h1>
        <p className="text-xs text-gray-400 mt-1">Тестовый сервис для МойСклад</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              activeTab === item.id
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-500">
          <p>Сервер: 45.158.46.193</p>
          <p>Ubuntu 24.04 LTS</p>
          <p className="mt-2 text-gray-600">v1.0 — тестовая версия</p>
        </div>
      </div>
    </aside>
  );
}
