import { useState, useEffect } from 'react';
import type { Card } from '../../types';

interface CardFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    date: Date;
    memo: string;
    dateType: 'publishDate' | 'dueDate';
  }) => void;
  editingCard?: Card | null;
}

/**
 * Dateオブジェクトからローカルタイムゾーンの "YYYY-MM-DD" 文字列を返す
 */
function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function CardFormModal({ isOpen, onClose, onSubmit, editingCard }: CardFormModalProps) {
  const [title, setTitle] = useState('');
  const [dateValue, setDateValue] = useState('');
  const [memo, setMemo] = useState('');
  const [error, setError] = useState<string | null>(null);

  // 自動カードの編集時は締切日を表示、それ以外は公開日
  const isAutoCard = editingCard?.type === 'auto';
  const dateLabel = isAutoCard ? '締切日' : '公開日';

  // 編集モードの場合、カード情報をフォームに反映
  useEffect(() => {
    if (editingCard) {
      setTitle(editingCard.title);
      setDateValue(toLocalDateString(editingCard.date));
      setMemo(editingCard.memo);
    } else {
      setTitle('');
      setDateValue('');
      setMemo('');
    }
    setError(null);
  }, [editingCard, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('タイトルを入力してください');
      return;
    }

    if (!dateValue) {
      setError(`${dateLabel}を入力してください`);
      return;
    }

    const dateObj = new Date(dateValue);

    if (isNaN(dateObj.getTime())) {
      setError(`${dateLabel}が無効です`);
      return;
    }

    onSubmit({
      title: title.trim(),
      date: dateObj,
      memo: memo.trim(),
      dateType: isAutoCard ? 'dueDate' : 'publishDate',
    });
    // フォームリセットは onClose 側で行う（モーダル閉じと同時）
  };

  const handleClose = () => {
    setTitle('');
    setDateValue('');
    setMemo('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-2xl w-full max-w-md mx-4 animate-slide-in">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {editingCard ? 'カード編集' : 'カード作成'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors hover:scale-110"
          >
            ✕
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* エラーメッセージ */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-md animate-slide-in">
              {error}
            </div>
          )}

          {/* タイトル */}
          <div>
            <label htmlFor="title" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              placeholder="例: 新作動画の編集"
              required
            />
          </div>

          {/* 日付 */}
          <div>
            <label htmlFor="dateField" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
              {dateLabel} <span className="text-red-500">*</span>
            </label>
            <input
              id="dateField"
              type="date"
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              required
            />
            {!isAutoCard && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                工程設定に基づいて締切日が自動で設定されます
              </p>
            )}
          </div>

          {/* メモ */}
          <div>
            <label htmlFor="memo" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
              メモ
            </label>
            <textarea
              id="memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              placeholder="メモを入力（任意）"
              rows={3}
            />
          </div>

          {/* ボタン */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-all hover:scale-105"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 rounded-md transition-all hover:scale-105 shadow-md hover:shadow-lg"
            >
              {editingCard ? '更新' : '作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
