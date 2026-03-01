import { useState, useEffect, useCallback } from 'react';
import { useCardStore } from './store/cardStore';
import { useBackupRestore } from './hooks/useBackupRestore';
import { MainLayout } from './components/Layout/MainLayout';
import { CardList } from './components/Card/CardList';
import { CardStatusColumns } from './components/Card/CardStatusColumns';
import { CardFormModal } from './components/Form/CardFormModal';
import { CalendarView } from './components/Calendar/CalendarView';
import { SettingsModal } from './components/Settings/SettingsModal';
import { RestoreModal } from './components/Backup/RestoreModal';

function App() {
  const {
    cards,
    settings,
    isLoading,
    createCardWithAuto,
    updateCard,
    updateManualCardPublishDate,
    deleteCard,
    toggleCardCompletion,
    updateSettings,
    getSortedCards,
  } = useCardStore();

  const {
    isChecking,
    hasBackup,
    backupTimestamp,
    acceptRestore,
    declineRestore,
  } = useBackupRestore();

  const [showSplash, setShowSplash] = useState(true);

  // スプラッシュスクリーンを2秒後に消す
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const [currentView, setCurrentView] = useState<'timeline' | 'calendar'>(() => {
    // localStorageから表示モードを読み込む
    const saved = localStorage.getItem('yuru_movie_view_mode');
    return (saved === 'calendar' ? 'calendar' : 'timeline') as 'timeline' | 'calendar';
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 表示モードが変更されたらlocalStorageに保存
  useEffect(() => {
    localStorage.setItem('yuru_movie_view_mode', currentView);
  }, [currentView]);

  // カード作成/編集フォームの送信処理
  const handleFormSubmit = (data: {
    title: string;
    date: Date;
    memo: string;
    dateType: 'publishDate' | 'dueDate';
  }) => {
    if (editingCard) {
      // 編集モード
      const existingCard = cards.find((c) => c.id === editingCard);

      if (existingCard && existingCard.type === 'manual') {
        // 手動カードの公開日が変更された場合
        const publishDateChanged =
          existingCard.date.getTime() !== data.date.getTime();

        if (publishDateChanged) {
          // 公開日変更時は自動カードも再生成
          updateManualCardPublishDate(editingCard, data.date, {
            title: data.title,
            memo: data.memo,
          });
        } else {
          // 公開日変更なしの場合は通常の更新
          updateCard(editingCard, {
            title: data.title,
            memo: data.memo,
          });
        }
      } else {
        // 自動カードの編集（締切日を更新）
        updateCard(editingCard, {
          title: data.title,
          date: data.date,
          memo: data.memo,
        });
      }
    } else {
      // 新規作成モード - 手動カード
      createCardWithAuto({
        title: data.title,
        date: data.date,  // 公開日
        memo: data.memo,
        processStepId: null,
        parentCardId: null,
        type: 'manual',
        isCompleted: false,
      });
    }

    setIsFormOpen(false);
    setEditingCard(null);
  };

  // カード編集の開始
  const handleEditCard = (id: string) => {
    setEditingCard(id);
    setIsFormOpen(true);
  };

  // フォームを閉じる
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCard(null);
  };

  // 表示切り替え（タイムライン/カレンダー）
  const handleToggleView = () => {
    setCurrentView((prev) => (prev === 'timeline' ? 'calendar' : 'timeline'));
  };

  // 設定画面を開く
  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  // カレンダーD&D: カードを別の日に移動
  const handleMoveCard = useCallback((cardId: string, newDate: Date) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    if (card.type === 'manual') {
      // 手動カード: 公開日変更 → 自動カード再生成
      updateManualCardPublishDate(cardId, newDate);
    } else {
      // 自動カード: 日付変更（自動→手動に変換される）
      updateCard(cardId, { date: newDate });
    }
  }, [cards, updateManualCardPublishDate, updateCard]);

  // バックアップ復元の承諾
  const handleAcceptRestore = async () => {
    const restoredData = await acceptRestore();
    if (restoredData) {
      window.location.reload();
    }
  };

  if (showSplash || isLoading || isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center animate-fade-in">
        <div className="text-center">
          <div className="text-8xl mb-6 animate-bounce">🎬</div>
          <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">
            動画スケジュール管理
          </h1>
          <p className="text-lg text-white/70">
            あなたの動画制作をサポートします
          </p>
          <div className="mt-8 inline-block animate-spin rounded-full h-8 w-8 border-4 border-white/30 border-t-white"></div>
        </div>
      </div>
    );
  }

  // バックアップが見つかった場合は復元モーダルを表示
  if (hasBackup) {
    return (
      <RestoreModal
        isOpen={true}
        backupTimestamp={backupTimestamp}
        onAccept={handleAcceptRestore}
        onDecline={declineRestore}
      />
    );
  }

  const sortedCards = getSortedCards();
  const activeCards = sortedCards.filter((card) => !card.isCompleted);
  const completedCards = sortedCards.filter((card) => card.isCompleted);
  const editingCardData = editingCard
    ? cards.find((card) => card.id === editingCard)
    : null;

  return (
    <>
      <MainLayout
        onCreateCard={() => setIsFormOpen(true)}
        onToggleView={handleToggleView}
        onOpenSettings={handleOpenSettings}
        currentView={currentView}
      >
        {currentView === 'timeline' ? (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 animate-slide-in">
              タイムライン表示 ({activeCards.length}件)
            </h2>
            <CardStatusColumns
              cards={activeCards}
              settings={settings}
              onToggleComplete={toggleCardCompletion}
              onEdit={handleEditCard}
              onDelete={deleteCard}
            />

            {/* 完了済みカードセクション */}
            {completedCards.length > 0 && (
              <div className="mt-8">
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="flex items-center space-x-2 text-lg font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors mb-4"
                >
                  <span className={`transition-transform ${showCompleted ? 'rotate-90' : ''}`}>
                    ▶
                  </span>
                  <span>完了済み ({completedCards.length}件)</span>
                </button>
                {showCompleted && (
                  <div className="opacity-70">
                    <CardList
                      cards={completedCards}
                      settings={settings}
                      onToggleComplete={toggleCardCompletion}
                      onEdit={handleEditCard}
                      onDelete={deleteCard}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <CalendarView
            cards={cards}
            settings={settings}
            onToggleComplete={toggleCardCompletion}
            onEdit={handleEditCard}
            onDelete={deleteCard}
            onMoveCard={handleMoveCard}
          />
        )}
      </MainLayout>

      {/* カード作成/編集モーダル */}
      <CardFormModal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        editingCard={editingCardData}
      />

      {/* 設定モーダル */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={updateSettings}
      />
    </>
  );
}

export default App;
