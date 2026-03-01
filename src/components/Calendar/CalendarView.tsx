import { useState, useRef, useCallback } from 'react';
import type { Card, AppSettings } from '../../types';
import {
  getCardCalendarColor,
  getWarningIcon,
} from '../../utils/cardColor';
import { getIntensityColorClasses } from '../../utils/intensityColor';
import { useCalendarColumnWidths } from '../../hooks/useCalendarColumnWidths';

interface CalendarViewProps {
  cards: Card[];
  settings: AppSettings | null;
  onToggleComplete: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onMoveCard?: (cardId: string, newDate: Date) => void;
}

export function CalendarView({
  cards,
  settings,
  onToggleComplete,
  onEdit,
  onDelete,
  onMoveCard,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dragCardId, setDragCardId] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const didDragRef = useRef(false);
  const { widths, updateWidth, resetWidths, gridTemplateColumns } = useCalendarColumnWidths();

  // リサイズ用
  const resizingRef = useRef<{ index: number; startX: number; startWidths: number[] } | null>(null);

  const handleResizeStart = useCallback((index: number, e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidths = [...widths];
    resizingRef.current = { index, startX, startWidths };

    const handleMouseMove = (ev: MouseEvent) => {
      if (!resizingRef.current) return;
      const diff = ev.clientX - resizingRef.current.startX;
      // 100px幅あたり0.5frの比率で調整
      const delta = diff / 100 * 0.5;
      const { index: idx, startWidths: sw } = resizingRef.current;
      const totalOriginal = sw[idx] + sw[idx + 1];
      let newCurrent = sw[idx] + delta;
      let newNext = totalOriginal - newCurrent;
      const minWidth = 0.3;
      if (newCurrent < minWidth) newCurrent = minWidth;
      if (newNext < minWidth) {
        newNext = minWidth;
        newCurrent = totalOriginal - minWidth;
      }
      // 直接updateWidthを呼ぶ代わりに差分を計算
      updateWidth(idx, newCurrent - sw[idx]);
      resizingRef.current.startWidths = [...widths];
      resizingRef.current.startX = ev.clientX;
    };

    const handleMouseUp = () => {
      resizingRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [widths, updateWidth]);

  // 月の最初の日を取得
  const getFirstDayOfMonth = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  // 月の最後の日を取得
  const getLastDayOfMonth = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  };

  // 月の日数を取得
  const getDaysInMonth = (date: Date): number => {
    return getLastDayOfMonth(date).getDate();
  };

  // 月の最初の日の曜日を取得（0 = 日曜日）
  const getFirstDayOfWeek = (date: Date): number => {
    return getFirstDayOfMonth(date).getDay();
  };

  // 前月へ移動
  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  // 次月へ移動
  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  // 今月へ移動
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // 指定した日付のカードを取得
  const getCardsForDate = (date: Date): Card[] => {
    return cards.filter((card) => {
      const cardDate = new Date(card.date);
      return (
        cardDate.getFullYear() === date.getFullYear() &&
        cardDate.getMonth() === date.getMonth() &&
        cardDate.getDate() === date.getDate()
      );
    });
  };

  // カレンダーグリッドを生成
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfWeek = getFirstDayOfWeek(currentDate);
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  // 今日の日付と一致するかチェック
  const isToday = (day: number): boolean => {
    const today = new Date();
    return (
      today.getFullYear() === currentDate.getFullYear() &&
      today.getMonth() === currentDate.getMonth() &&
      today.getDate() === day
    );
  };

  // D&D ハンドラー
  const handleDragStart = (cardId: string) => {
    setDragCardId(cardId);
    didDragRef.current = false;
  };

  const handleDragEnd = () => {
    if (dragCardId) {
      didDragRef.current = true;
    }
    setDragCardId(null);
    setDragOverDate(null);
  };

  const getDateKey = (date: Date): string => {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  };

  const handleDragOver = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    setDragOverDate(getDateKey(date));
  };

  const handleDragLeave = () => {
    setDragOverDate(null);
  };

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    if (dragCardId && onMoveCard) {
      onMoveCard(dragCardId, date);
    }
    setDragCardId(null);
    setDragOverDate(null);
  };

  const handleCardClick = (cardId: string) => {
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }
    onEdit(cardId);
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-2xl p-6 animate-fade-in">
      {/* カレンダーヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={resetWidths}
            className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-all"
            title="列幅をリセット"
          >
            列幅リセット
          </button>
          <button
            onClick={goToPreviousMonth}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all hover:scale-105"
          >
            ← 前月
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all hover:scale-105"
          >
            今月
          </button>
          <button
            onClick={goToNextMonth}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all hover:scale-105"
          >
            次月 →
          </button>
        </div>
      </div>

      {/* 曜日ヘッダー + カレンダーグリッド（1つのGridで列幅を共有） */}
      <div className="gap-2" style={{ display: 'grid', gridTemplateColumns }}>
        {/* 曜日ヘッダー */}
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={`relative text-center text-lg font-semibold py-2 ${
              index === 0
                ? 'text-red-600 dark:text-red-400'
                : index === 6
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {day}
            {/* リサイズハンドル */}
            {index < 6 && (
              <span
                className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-blue-300 dark:hover:bg-blue-600 rounded transition-colors"
                onMouseDown={(e) => handleResizeStart(index, e)}
              />
            )}
          </div>
        ))}

        {/* カレンダー日付セル */}
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="min-h-[4rem]" />;
          }

          const date = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            day
          );
          const dayCards = getCardsForDate(date);
          const isTodayDate = isToday(day);
          const dateKey = getDateKey(date);
          const isDragOver = dragOverDate === dateKey;

          return (
            <div
              key={day}
              className={`border rounded-lg p-1.5 min-h-[4rem] transition-all ${
                isTodayDate
                  ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-400 dark:border-blue-500 border-2 shadow-md'
                  : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
              } ${isDragOver ? 'ring-2 ring-blue-400' : ''}`}
              onDragOver={(e) => handleDragOver(e, date)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, date)}
            >
              {/* 日付表示 */}
              <div
                className={`text-xs font-semibold mb-0.5 ${
                  isTodayDate ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {day}
              </div>

              {/* カードリスト - 1行表示 */}
              <div className="space-y-0.5">
                {dayCards.map((card) => {
                  const warningIcon = getWarningIcon(card);
                  const colorClass = getCardCalendarColor(card);
                  const isDragging = dragCardId === card.id;

                  // 強度ドット
                  const processStep = card.processStepId && settings
                    ? settings.processSteps.find(s => s.id === card.processStepId)
                    : null;
                  const intensity = processStep?.intensity ?? null;
                  const intensityDotClass = intensity !== null
                    ? getIntensityColorClasses(intensity).dot
                    : null;

                  const typeLabel = card.type === 'manual' ? '手動カード' : '自動カード';

                  return (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={() => handleDragStart(card.id)}
                      onDragEnd={handleDragEnd}
                      className={`text-xs p-1 rounded border cursor-pointer hover:opacity-80 transition-opacity text-gray-900 dark:text-gray-100 ${colorClass} ${
                        card.isCompleted ? 'opacity-50' : ''
                      } ${isDragging ? 'opacity-30' : ''}`}
                      onClick={() => handleCardClick(card.id)}
                      title={`${card.title} (${typeLabel})`}
                    >
                      <div className={`flex items-center space-x-1 ${card.isCompleted ? 'line-through' : ''}`}>
                        {/* 強度ドット */}
                        {intensityDotClass && (
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${intensityDotClass}`} />
                        )}
                        {/* 警告アイコン */}
                        {warningIcon && <span className="flex-shrink-0 text-xs">{warningIcon}</span>}
                        {/* タイトル */}
                        <span className="truncate font-medium flex-1 min-w-0">{(() => {
                          const sepIndex = card.title.lastIndexOf(' - ');
                          if (sepIndex >= 0) {
                            const baseName = card.title.slice(0, sepIndex);
                            const stepName = card.title.slice(sepIndex);
                            return (baseName.length > 10 ? baseName.slice(0, 10) + '…' : baseName) + stepName;
                          }
                          return card.title.length > 10 ? card.title.slice(0, 10) + '…' : card.title;
                        })()}</span>
                        {/* 完了・削除ボタン */}
                        <div className="flex items-center space-x-0.5 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleComplete(card.id);
                            }}
                            className={`w-5 h-5 flex items-center justify-center rounded transition-colors text-xs font-bold ${
                              card.isCompleted
                                ? 'bg-yellow-200 dark:bg-yellow-700 text-yellow-700 dark:text-yellow-200 hover:bg-yellow-300 dark:hover:bg-yellow-600'
                                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-green-200 dark:hover:bg-green-700 hover:text-green-700 dark:hover:text-green-200'
                            }`}
                            title={card.isCompleted ? '未完了に戻す' : '完了'}
                          >
                            {card.isCompleted ? '↩' : '✓'}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('このカードを削除しますか？')) {
                                onDelete(card.id);
                              }
                            }}
                            className="w-5 h-5 flex items-center justify-center rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-red-200 dark:hover:bg-red-700 hover:text-red-700 dark:hover:text-red-200 transition-colors text-xs font-bold"
                            title="削除"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 凡例 */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">凡例:</h3>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-600 rounded"></div>
            <span>期限間近・超過</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-600 rounded"></div>
            <span>7日以内</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"></div>
            <span>通常</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded"></div>
            <span>完了済み</span>
          </div>
        </div>
      </div>
    </div>
  );
}
