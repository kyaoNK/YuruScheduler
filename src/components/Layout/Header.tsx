import { useTheme } from '../../contexts/ThemeContext';

interface HeaderProps {
  onCreateCard: () => void;
  onToggleView: () => void;
  onOpenSettings: () => void;
  currentView: 'timeline' | 'calendar';
}

export function Header({
  onCreateCard,
  onToggleView,
  onOpenSettings,
  currentView,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-gray-800 dark:to-gray-900 shadow-lg">
      <div className="max-w-7xl mx-auto py-5 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-2xl">🎬</span>
            </div>
            <h1 className="text-3xl font-bold text-white drop-shadow-md">
              動画スケジュール管理
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            {/* ダークモード切り替えボタン */}
            <button
              onClick={toggleTheme}
              className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all duration-200 hover:scale-105"
              title={theme === 'light' ? 'ダークモードに切り替え' : 'ライトモードに切り替え'}
            >
              {theme === 'light' ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>

            {/* 表示切替ボタン */}
            <button
              onClick={onToggleView}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all duration-200 text-base font-medium hover:scale-105"
            >
              {currentView === 'timeline' ? '📅 カレンダー' : '📊 タイムライン'}
            </button>

            {/* カード作成ボタン */}
            <button
              onClick={onCreateCard}
              className="px-4 py-2.5 bg-white text-blue-600 hover:bg-blue-50 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 rounded-lg transition-all duration-200 text-base font-medium shadow-md hover:shadow-lg hover:scale-105"
            >
              ✨ カード作成
            </button>

            {/* 設定ボタン */}
            <button
              onClick={onOpenSettings}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all duration-200 text-base font-medium hover:scale-105"
            >
              ⚙️ 設定
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
