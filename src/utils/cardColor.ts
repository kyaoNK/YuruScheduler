import type { Card } from '../types';

/**
 * 締切までの日数を計算
 */
export function getDaysUntilDue(dueDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * 締切の状態を判定
 */
export type DueStatus = 'overdue' | 'critical' | 'warning' | 'normal' | 'completed';

export function getDueStatus(card: Card): DueStatus {
  if (card.isCompleted) {
    return 'completed';
  }

  const daysUntilDue = getDaysUntilDue(card.date);

  if (daysUntilDue < 0) {
    return 'overdue'; // 期限超過
  }
  if (daysUntilDue <= 3) {
    return 'critical'; // 0〜3日: 緊急
  }
  if (daysUntilDue <= 7) {
    return 'warning'; // 4〜7日: 警告
  }
  return 'normal'; // 7日以上: 通常
}

/**
 * カードの背景色クラスを取得（タイムライン表示用）
 */
export function getCardBackgroundColor(card: Card): string {
  const status = getDueStatus(card);

  switch (status) {
    case 'completed':
      return 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700';
    case 'overdue':
      return 'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700';
    case 'critical':
      return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700';
    case 'warning':
      return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700';
    case 'normal':
      return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
  }
}

/**
 * カードの背景色クラスを取得（カレンダー表示用）
 */
export function getCardCalendarColor(card: Card): string {
  const status = getDueStatus(card);

  switch (status) {
    case 'completed':
      return 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600';
    case 'overdue':
      return 'bg-red-100 dark:bg-red-900/50 border-red-400 dark:border-red-600';
    case 'critical':
      return 'bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-600';
    case 'warning':
      return 'bg-yellow-100 dark:bg-yellow-900/40 border-yellow-300 dark:border-yellow-600';
    case 'normal':
      return 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600';
  }
}

/**
 * 警告アイコンを取得
 */
export function getWarningIcon(card: Card): string | null {
  const status = getDueStatus(card);

  switch (status) {
    case 'overdue':
      return '🚨'; // 期限超過
    case 'critical':
      return '⚠️'; // 緊急
    case 'warning':
      return '⏰'; // 警告
    case 'completed':
      return '✅'; // 完了
    case 'normal':
      return null;
  }
}

/**
 * 警告メッセージを取得
 */
export function getWarningMessage(card: Card): string | null {
  const status = getDueStatus(card);
  const daysUntilDue = getDaysUntilDue(card.date);

  switch (status) {
    case 'overdue':
      return `期限超過！（${Math.abs(daysUntilDue)}日遅れ）`;
    case 'critical':
      return `締切まであと${daysUntilDue}日`;
    case 'warning':
      return `締切まであと${daysUntilDue}日`;
    case 'completed':
      return '完了済み';
    case 'normal':
      return null;
  }
}

/**
 * 警告レベルに応じたテキスト色クラスを取得
 */
export function getWarningTextColor(card: Card): string {
  const status = getDueStatus(card);

  switch (status) {
    case 'overdue':
      return 'text-red-700';
    case 'critical':
      return 'text-red-600';
    case 'warning':
      return 'text-yellow-700';
    case 'completed':
      return 'text-gray-500';
    case 'normal':
      return 'text-gray-700';
  }
}
