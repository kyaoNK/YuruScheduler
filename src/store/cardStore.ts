import { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Card, CardType, AppSettings } from '../types';
import { loadCards, loadSettings, serializeCard, saveData } from '../utils/storage';
import {
  generateAutoCards,
  regenerateAutoCards,
  isAutoCardManuallyEdited,
  syncAutoCardsWithSettings,
} from '../utils/autoCard';

/**
 * カードストアのカスタムフック
 */
export function useCardStore() {
  const [cards, setCards] = useState<Card[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isInitialLoad = useRef(true);

  // 初回ロード
  useEffect(() => {
    try {
      const loadedCards = loadCards();
      const loadedSettings = loadSettings();
      setCards(loadedCards);
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // cards または settings が変更されたらlocalStorageに一括永続化（初回ロード直後はスキップ）
  useEffect(() => {
    if (isLoading) return;
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    if (!settings) return;
    saveData({
      cards: cards.map(serializeCard),
      settings,
    });
  }, [cards, settings, isLoading]);

  // カードの作成
  const createCard = useCallback(
    (cardData: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>): Card => {
      const now = new Date();
      const newCard: Card = {
        ...cardData,
        id: uuidv4(),
        createdAt: now,
        updatedAt: now,
      };

      setCards(prevCards => [...prevCards, newCard]);

      return newCard;
    },
    []
  );

  // 手動カード作成と同時に自動カードも生成
  const createCardWithAuto = useCallback(
    (cardData: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>): Card => {
      const now = new Date();
      const manualCard: Card = {
        ...cardData,
        id: uuidv4(),
        createdAt: now,
        updatedAt: now,
      };

      setCards(prevCards => {
        // 手動カードの場合のみ自動カードを生成
        if (cardData.type === 'manual' && settings) {
          const autoCards = generateAutoCards(
            cardData.date,
            settings,
            cardData.title,
            manualCard.id
          );
          return [...prevCards, manualCard, ...autoCards];
        }
        return [...prevCards, manualCard];
      });

      return manualCard;
    },
    [settings]
  );

  // カードの更新
  const updateCard = useCallback(
    (id: string, updates: Partial<Omit<Card, 'id' | 'createdAt'>>): void => {
      setCards(prevCards => {
        const targetCard = prevCards.find((c) => c.id === id);
        if (!targetCard) return prevCards;

        const shouldConvertToManual = isAutoCardManuallyEdited(targetCard, updates);

        return prevCards.map((card) => {
          if (card.id === id) {
            return {
              ...card,
              ...updates,
              type: shouldConvertToManual ? 'manual' : card.type,
              updatedAt: new Date(),
            };
          }
          return card;
        });
      });
    },
    []
  );

  // 手動カードの公開日変更時に自動カードを再生成
  const updateManualCardPublishDate = useCallback(
    (id: string, newPublishDate: Date, otherUpdates?: Partial<Omit<Card, 'id' | 'createdAt' | 'date'>>): void => {
      setCards(prevCards => {
        const targetCard = prevCards.find((c) => c.id === id);
        if (!targetCard || targetCard.type !== 'manual' || !settings) {
          return prevCards.map((card) => {
            if (card.id === id) {
              return {
                ...card,
                date: newPublishDate,
                ...otherUpdates,
                updatedAt: new Date(),
              };
            }
            return card;
          });
        }

        const newTitle = otherUpdates?.title || targetCard.title;
        const { cardsToDelete, cardsToAdd } = regenerateAutoCards(
          targetCard,
          newPublishDate,
          newTitle,
          prevCards,
          settings
        );

        let updatedCards = prevCards.filter((card) => !cardsToDelete.includes(card.id));

        updatedCards = updatedCards.map((card) => {
          if (card.id === id) {
            return {
              ...card,
              date: newPublishDate,
              ...otherUpdates,
              updatedAt: new Date(),
            };
          }
          return card;
        });

        return [...updatedCards, ...cardsToAdd];
      });
    },
    [settings]
  );

  // カードの削除（手動カードの場合は関連する自動カードも削除）
  const deleteCard = useCallback(
    (id: string): void => {
      setCards(prevCards => {
        const target = prevCards.find((c) => c.id === id);
        if (!target) return prevCards;

        if (target.type === 'manual') {
          // 手動カード＋紐づく自動カードを両方削除
          return prevCards.filter(
            (card) => card.id !== id && card.parentCardId !== id
          );
        }
        // 自動カード単体の削除
        return prevCards.filter((card) => card.id !== id);
      });
    },
    []
  );

  // カードの完了状態を切り替え
  const toggleCardCompletion = useCallback(
    (id: string): void => {
      setCards(prevCards => {
        const card = prevCards.find((c) => c.id === id);
        if (!card) return prevCards;

        return prevCards.map((c) => {
          if (c.id === id) {
            return {
              ...c,
              isCompleted: !c.isCompleted,
              updatedAt: new Date(),
            };
          }
          return c;
        });
      });
    },
    []
  );

  // カードをタイプで変換（自動→手動）
  const convertCardToManual = useCallback(
    (id: string): void => {
      setCards(prevCards =>
        prevCards.map((card) => {
          if (card.id === id) {
            return {
              ...card,
              type: 'manual' as const,
              updatedAt: new Date(),
            };
          }
          return card;
        })
      );
    },
    []
  );

  // 設定の更新（工程変更時は既存の自動カードも同期）
  const updateSettings = useCallback((newSettings: AppSettings): void => {
    if (settings) {
      const { updatedCards, cardsToAdd, cardsToDelete } = syncAutoCardsWithSettings(
        settings,
        newSettings,
        cards
      );

      if (cardsToDelete.length > 0 || cardsToAdd.length > 0) {
        setCards([...updatedCards, ...cardsToAdd]);
      } else {
        // 名前や日数の変更でカードが更新された可能性をチェック
        const hasUpdates = updatedCards.some(
          (uc, i) => uc !== cards[i]
        );
        if (hasUpdates) {
          setCards(updatedCards);
        }
      }
    }
    setSettings(newSettings);
  }, [settings, cards]);

  // IDでカードを取得
  const getCardById = useCallback(
    (id: string): Card | undefined => {
      return cards.find((card) => card.id === id);
    },
    [cards]
  );

  // タイプでカードをフィルタリング
  const getCardsByType = useCallback(
    (type: CardType): Card[] => {
      return cards.filter((card) => card.type === type);
    },
    [cards]
  );

  // 日付範囲でカードをフィルタリング
  const getCardsByDateRange = useCallback(
    (startDate: Date, endDate: Date): Card[] => {
      return cards.filter((card) => {
        return card.date >= startDate && card.date <= endDate;
      });
    },
    [cards]
  );

  // 日付順にソートされたカードを取得
  const getSortedCards = useCallback((): Card[] => {
    return [...cards].sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [cards]);

  return {
    // State
    cards,
    settings,
    isLoading,

    // CRUD操作
    createCard,
    createCardWithAuto,
    updateCard,
    updateManualCardPublishDate,
    deleteCard,
    toggleCardCompletion,
    convertCardToManual,

    // 設定管理
    updateSettings,

    // クエリ関数
    getCardById,
    getCardsByType,
    getCardsByDateRange,
    getSortedCards,
  };
}
