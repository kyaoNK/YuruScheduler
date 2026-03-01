import { v4 as uuidv4 } from 'uuid';
import type { Card, AppSettings } from '../types';

/**
 * 日付から指定日数を引いた日付を計算
 */
export function subtractDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

/**
 * 公開日から自動カードを生成
 */
export function generateAutoCards(
  publishDate: Date,
  settings: AppSettings,
  parentCardTitle: string,
  parentCardId: string
): Card[] {
  const now = new Date();
  const autoCards: Card[] = [];

  // 工程ステップを順序でソート
  const sortedSteps = [...settings.processSteps].sort((a, b) => a.order - b.order);

  for (const step of sortedSteps) {
    // 締切日を計算（公開日から指定日数前）
    const dueDate = subtractDays(publishDate, step.daysBeforePublish);

    const autoCard: Card = {
      id: uuidv4(),
      title: `${parentCardTitle} - ${step.name}`,
      date: dueDate,
      memo: `自動生成: ${step.name}（公開日の${step.daysBeforePublish}日前）`,
      processStepId: step.id,
      parentCardId: parentCardId,
      type: 'auto',
      isCompleted: false,
      createdAt: now,
      updatedAt: now,
    };

    autoCards.push(autoCard);
  }

  return autoCards;
}

/**
 * 手動カードに紐づく自動カードを取得
 * （parentCardIdで判定）
 */
export function getRelatedAutoCards(
  manualCard: Card,
  allCards: Card[]
): Card[] {
  if (manualCard.type !== 'manual') {
    return [];
  }

  return allCards.filter(
    (card) =>
      card.type === 'auto' &&
      card.parentCardId === manualCard.id
  );
}

/**
 * 手動カードの公開日が変更された場合、関連する自動カードを再生成
 * @param originalManualCard 変更前の手動カード
 * @param newPublishDate 新しい公開日
 * @param newTitle 新しいタイトル
 * @param allCards 全カード
 * @param settings 工程設定
 */
export function regenerateAutoCards(
  originalManualCard: Card,
  newPublishDate: Date,
  newTitle: string,
  allCards: Card[],
  settings: AppSettings
): {
  cardsToDelete: string[];
  cardsToAdd: Card[];
} {
  // 既存の自動カードを検索して削除対象にする
  const existingAutoCards = getRelatedAutoCards(originalManualCard, allCards);
  const cardsToDelete = existingAutoCards.map((card) => card.id);

  // 新しい公開日・タイトルで自動カードを再生成
  const cardsToAdd = generateAutoCards(
    newPublishDate,
    settings,
    newTitle,
    originalManualCard.id
  );

  return {
    cardsToDelete,
    cardsToAdd,
  };
}

/**
 * 工程設定変更時に既存の自動カードを同期する
 */
export function syncAutoCardsWithSettings(
  oldSettings: AppSettings,
  newSettings: AppSettings,
  allCards: Card[]
): { updatedCards: Card[]; cardsToAdd: Card[]; cardsToDelete: string[] } {
  const oldStepMap = new Map(oldSettings.processSteps.map((s) => [s.id, s]));
  const newStepMap = new Map(newSettings.processSteps.map((s) => [s.id, s]));

  const cardsToDelete: string[] = [];
  const cardsToAdd: Card[] = [];
  let updatedCards = [...allCards];

  // 削除された工程の自動カードを削除
  for (const oldStep of oldSettings.processSteps) {
    if (!newStepMap.has(oldStep.id)) {
      const idsToRemove = allCards
        .filter((c) => c.type === 'auto' && c.processStepId === oldStep.id)
        .map((c) => c.id);
      cardsToDelete.push(...idsToRemove);
    }
  }

  // 削除対象を除外
  updatedCards = updatedCards.filter((c) => !cardsToDelete.includes(c.id));

  // 変更された工程の自動カードを更新
  for (const newStep of newSettings.processSteps) {
    const oldStep = oldStepMap.get(newStep.id);
    if (!oldStep) continue; // 新規追加は後で処理

    const nameChanged = oldStep.name !== newStep.name;
    const daysChanged = oldStep.daysBeforePublish !== newStep.daysBeforePublish;

    if (!nameChanged && !daysChanged) continue;

    updatedCards = updatedCards.map((card) => {
      if (card.type !== 'auto' || card.processStepId !== newStep.id) return card;

      const parentCard = allCards.find(
        (c) => c.id === card.parentCardId && c.type === 'manual'
      );
      if (!parentCard) return card;

      const updates: Partial<Card> = { updatedAt: new Date() };

      if (nameChanged) {
        updates.title = `${parentCard.title} - ${newStep.name}`;
      }
      if (daysChanged) {
        updates.date = subtractDays(parentCard.date, newStep.daysBeforePublish);
      }
      updates.memo = `自動生成: ${newStep.name}（公開日の${newStep.daysBeforePublish}日前）`;

      return { ...card, ...updates };
    });
  }

  // 追加された工程の自動カードを生成
  for (const newStep of newSettings.processSteps) {
    if (oldStepMap.has(newStep.id)) continue;

    const manualCards = allCards.filter((c) => c.type === 'manual');
    const now = new Date();

    for (const manual of manualCards) {
      const dueDate = subtractDays(manual.date, newStep.daysBeforePublish);
      cardsToAdd.push({
        id: uuidv4(),
        title: `${manual.title} - ${newStep.name}`,
        date: dueDate,
        memo: `自動生成: ${newStep.name}（公開日の${newStep.daysBeforePublish}日前）`,
        processStepId: newStep.id,
        parentCardId: manual.id,
        type: 'auto',
        isCompleted: false,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  return { updatedCards, cardsToAdd, cardsToDelete };
}

/**
 * 自動カードが手動で編集されたかどうかを判定
 * （タイトル、メモ、または日付が変更された場合）
 */
export function isAutoCardManuallyEdited(
  originalCard: Card,
  updates: Partial<Card>
): boolean {
  if (originalCard.type !== 'auto') {
    return false;
  }

  // タイトル、メモ、または日付が変更された場合は手動編集とみなす
  const titleChanged = updates.title && updates.title !== originalCard.title;
  const memoChanged = updates.memo !== undefined && updates.memo !== originalCard.memo;
  const dateChanged = updates.date != null && updates.date.getTime() !== originalCard.date.getTime();

  return !!(titleChanged || memoChanged || dateChanged);
}
