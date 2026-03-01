import type { Card, AppSettings } from '../../types';
import { CardItem } from './CardItem';

interface CardListProps {
  cards: Card[];
  settings: AppSettings | null;
  onToggleComplete: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function CardList({ cards, settings, onToggleComplete, onEdit, onDelete }: CardListProps) {
  if (cards.length === 0) {
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
    <div className="space-y-4">
      {cards.map((card) => (
        <CardItem
          key={card.id}
          card={card}
          settings={settings}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
