import type { Card, AppSettings } from '../../types';
import {
  getDaysUntilDue,
  getCardBackgroundColor,
  getWarningIcon,
  getWarningMessage,
  getWarningTextColor,
} from '../../utils/cardColor';
import { getIntensityColorClasses, getIntensityLabel } from '../../utils/intensityColor';

interface CardItemProps {
  card: Card;
  settings: AppSettings | null;
  onToggleComplete: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function CardItem({ card, settings, onToggleComplete, onEdit, onDelete }: CardItemProps) {
  const handleDelete = () => {
    if (confirm('このカードを削除しますか？')) {
      onDelete(card.id);
    }
  };

  const daysUntilDue = getDaysUntilDue(card.date);
  const colorClass = getCardBackgroundColor(card);
  const warningIcon = getWarningIcon(card);
  const warningMessage = getWarningMessage(card);
  const warningTextColor = getWarningTextColor(card);

  // 手動カードかどうかを判定
  const isManualCard = card.type === 'manual';

  // 工程情報を取得
  const processStep = card.processStepId && settings
    ? settings.processSteps.find(step => step.id === card.processStepId)
    : null;

  const processStepName = processStep?.name || null;
  const intensity = processStep?.intensity ?? null;
  const intensityColors = intensity !== null ? getIntensityColorClasses(intensity) : null;

  return (
    <div
      className={`group border rounded-xl p-3 transition-all duration-300 ${colorClass} ${
        card.isCompleted ? 'opacity-60' : ''
      } hover:shadow-xl hover:scale-[1.02] backdrop-blur-sm dark:border-gray-700 animate-slide-in`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {/* 完了チェックボックス */}
          <div className="relative mt-0.5">
            <input
              type="checkbox"
              checked={card.isCompleted}
              onChange={() => onToggleComplete(card.id)}
              className="h-5 w-5 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer transition-all hover:scale-110 bg-white dark:bg-gray-800"
            />
          </div>

          <div className="flex-1 min-w-0">
            {/* タイトルと警告アイコン */}
            <div className="flex items-center space-x-2 mb-1">
              {warningIcon && (
                <span className="text-base animate-pulse" title={warningMessage || undefined}>
                  {warningIcon}
                </span>
              )}
              <h3
                className={`font-bold text-base ${
                  card.isCompleted
                    ? 'line-through text-gray-500 dark:text-gray-600'
                    : 'text-gray-900 dark:text-white'
                } truncate`}
              >
                {card.title}
              </h3>
            </div>

            {/* 警告メッセージ */}
            {warningMessage && !card.isCompleted && (
              <div
                className={`inline-block px-2 py-1 rounded-lg text-sm font-bold ${warningTextColor} bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm mb-2 shadow-md`}
              >
                {warningMessage}
              </div>
            )}

            {/* カード情報 */}
            <div className="grid grid-cols-1 gap-2 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-center space-x-2 bg-white/30 dark:bg-gray-800/30 rounded-lg px-2 py-1.5 backdrop-blur-sm">
                <span className="text-base">{isManualCard ? '📅' : '⏰'}</span>
                <div>
                  <span className="font-medium">{isManualCard ? '公開日' : '締切日'}:</span>{' '}
                  <span className="font-semibold">
                    {card.date.toLocaleDateString('ja-JP')}
                  </span>
                  {!card.isCompleted && !isManualCard && (
                    <span className="ml-2 text-xs font-bold">
                      {daysUntilDue >= 0
                        ? `(あと${daysUntilDue}日)`
                        : `(${Math.abs(daysUntilDue)}日超過)`}
                    </span>
                  )}
                </div>
              </div>

              {/* 工程名の表示（自動カードの場合） — 強度色バッジ */}
              {processStepName && intensityColors && intensity !== null && (
                <div className={`flex items-center space-x-2 ${intensityColors.bg} rounded-lg px-2 py-1.5 backdrop-blur-sm border ${intensityColors.border}`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${intensityColors.dot}`} />
                  <div>
                    <span className="font-medium">工程:</span>{' '}
                    <span className={`font-semibold ${intensityColors.text}`}>
                      {processStepName}
                    </span>
                    <span className={`ml-1 text-xs ${intensityColors.text}`}>
                      ({getIntensityLabel(intensity)})
                    </span>
                  </div>
                </div>
              )}
              {/* 工程名はあるが強度情報がない場合のフォールバック */}
              {processStepName && !intensityColors && (
                <div className="flex items-center space-x-2 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg px-2 py-1.5 backdrop-blur-sm">
                  <span className="text-base">🔧</span>
                  <div>
                    <span className="font-medium">工程:</span>{' '}
                    <span className="font-semibold text-purple-700 dark:text-purple-300">
                      {processStepName}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* タイプバッジ */}
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-xs">🏷️</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold shadow-md ${
                  card.type === 'manual'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                    : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                }`}
              >
                {card.type === 'manual' ? '手動カード' : '自動カード'}
              </span>
            </div>

            {/* メモ */}
            {card.memo && (
              <div className="mt-2 p-2 bg-white/40 dark:bg-gray-800/40 rounded-lg backdrop-blur-sm">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">📝 メモ:</span> {card.memo}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex flex-col space-y-1 ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onEdit(card.id)}
            className="p-1.5 text-blue-600 dark:text-blue-400 hover:text-white hover:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:scale-110"
            title="編集"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 text-red-600 dark:text-red-400 hover:text-white hover:bg-red-600 dark:hover:bg-red-500 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:scale-110"
            title="削除"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
