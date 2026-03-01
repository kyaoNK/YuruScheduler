import type { Card, AppSettings } from '../../types';
import { getDueStatus } from '../../utils/cardColor';
import { CardItem } from './CardItem';

interface CardStatusColumnsProps {
  cards: Card[];
  settings: AppSettings | null;
  onToggleComplete: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const STATUS_CONFIG = [
  {
    key: 'overdue' as const,
    label: '期限超過',
    dotColor: 'bg-red-500',
    headerBg: 'bg-red-50 dark:bg-red-900/20',
    headerBorder: 'border-red-200 dark:border-red-800',
  },
  {
    key: 'critical' as const,
    label: '緊急',
    dotColor: 'bg-orange-500',
    headerBg: 'bg-orange-50 dark:bg-orange-900/20',
    headerBorder: 'border-orange-200 dark:border-orange-800',
  },
  {
    key: 'warning' as const,
    label: '警告',
    dotColor: 'bg-yellow-500',
    headerBg: 'bg-yellow-50 dark:bg-yellow-900/20',
    headerBorder: 'border-yellow-200 dark:border-yellow-800',
  },
  {
    key: 'normal' as const,
    label: '通常',
    dotColor: 'bg-green-500',
    headerBg: 'bg-gray-50 dark:bg-gray-800/50',
    headerBorder: 'border-gray-200 dark:border-gray-700',
  },
];

export function CardStatusColumns({
  cards,
  settings,
  onToggleComplete,
  onEdit,
  onDelete,
}: CardStatusColumnsProps) {
  // カードをステータスごとにグループ分け
  const grouped = {
    overdue: [] as Card[],
    critical: [] as Card[],
    warning: [] as Card[],
    normal: [] as Card[],
  };

  for (const card of cards) {
    const status = getDueStatus(card);
    if (status in grouped) {
      grouped[status as keyof typeof grouped].push(card);
    }
  }

  const totalCards = cards.length;
  if (totalCards === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-12 text-center animate-fade-in border border-gray-200 dark:border-gray-700">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          カードがありません
        </h3>
        <p className="text-lg text-gray-500 dark:text-gray-400">
          右上の「✨ カード作成」ボタンから新しいカードを作成してください。
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-4 animate-slide-in">
      {STATUS_CONFIG.map((config) => {
        const columnCards = grouped[config.key];
        return (
          <div key={config.key} className="flex flex-col">
            {/* 列ヘッダー */}
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border mb-3 ${config.headerBg} ${config.headerBorder}`}>
              <span className={`w-3 h-3 rounded-full ${config.dotColor}`} />
              <span className="font-semibold text-sm text-gray-900 dark:text-white">
                {config.label}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({columnCards.length}件)
              </span>
            </div>

            {/* カードスタック */}
            <div className="space-y-3 flex-1">
              {columnCards.length === 0 ? (
                <div className="text-center py-6 text-sm text-gray-400 dark:text-gray-500">
                  なし
                </div>
              ) : (
                columnCards.map((card) => (
                  <CardItem
                    key={card.id}
                    card={card}
                    settings={settings}
                    onToggleComplete={onToggleComplete}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
