import type { AppData, AppSettings, Card, CardStorage, ProcessStep } from '../types';
import { writeBackup } from './backup';

const STORAGE_KEY = 'yuruscheduler_data';

/**
 * デフォルトの工程ステップ
 */
const DEFAULT_PROCESS_STEPS: ProcessStep[] = [
  {
    id: 'step-1',
    name: '初稿締切',
    daysBeforePublish: 3,
    order: 1,
    intensity: 3,
  },
  {
    id: 'step-2',
    name: '最終稿締切',
    daysBeforePublish: 1,
    order: 2,
    intensity: 3,
  },
];

/**
 * デフォルトのアプリケーション設定
 */
const DEFAULT_SETTINGS: AppSettings = {
  processSteps: DEFAULT_PROCESS_STEPS,
};

/**
 * 安全にDateを生成する。無効な値の場合はfallbackを返す。
 */
function safeDate(value: unknown, fallback: Date = new Date()): Date {
  const d = new Date(value as string | number);
  return isNaN(d.getTime()) ? fallback : d;
}

/**
 * 安全にISO文字列に変換する。無効なDateの場合は現在日時を使う。
 */
function safeToISOString(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return new Date().toISOString();
  }
  return date.toISOString();
}

/**
 * CardStorageをCardに変換
 */
export function deserializeCard(cardStorage: CardStorage): Card {
  const now = new Date();
  return {
    ...cardStorage,
    date: safeDate(cardStorage.date, now),
    createdAt: safeDate(cardStorage.createdAt, now),
    updatedAt: safeDate(cardStorage.updatedAt, now),
  };
}

/**
 * CardをCardStorageに変換
 */
export function serializeCard(card: Card): CardStorage {
  return {
    ...card,
    date: safeToISOString(card.date),
    createdAt: safeToISOString(card.createdAt),
    updatedAt: safeToISOString(card.updatedAt),
  };
}

/**
 * データの整合性をチェック
 */
function validateAppData(data: any): data is AppData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  // cardsが配列かチェック
  if (!Array.isArray(data.cards)) {
    return false;
  }

  // settingsが存在し、processStepsが配列かチェック
  if (!data.settings || !Array.isArray(data.settings.processSteps)) {
    return false;
  }

  return true;
}

/**
 * ローカルストレージからデータを読み込む
 */
export function loadData(): AppData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);

      // データの整合性チェック
      if (validateAppData(data)) {
        // 既存データのintensity未設定ステップにデフォルト値を補完
        data.settings.processSteps = data.settings.processSteps.map(
          (step: ProcessStep) => ({
            ...step,
            intensity: step.intensity ?? 3,
          })
        );
        return data;
      } else {
        console.warn('Invalid data format in localStorage, using defaults');
      }
    }
  } catch (error) {
    console.error('Failed to load data from localStorage:', error);
  }

  // データがない場合、または不正な場合はデフォルト値を返す
  return {
    cards: [],
    settings: DEFAULT_SETTINGS,
  };
}

/**
 * ローカルストレージにデータを保存する
 */
export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save data to localStorage:', error);
  }

  // Documentsフォルダにも自動バックアップ（fire-and-forget）
  writeBackup(data);
}

/**
 * カードを読み込む
 */
export function loadCards(): Card[] {
  const data = loadData();
  return data.cards.map(deserializeCard);
}

/**
 * カードを保存する
 */
export function saveCards(cards: Card[]): void {
  const data = loadData();
  data.cards = cards.map(serializeCard);
  saveData(data);
}

/**
 * 設定を読み込む
 */
export function loadSettings(): AppSettings {
  const data = loadData();
  return data.settings || DEFAULT_SETTINGS;
}

/**
 * 設定を保存する
 */
export function saveSettings(settings: AppSettings): void {
  const data = loadData();
  data.settings = settings;
  saveData(data);
}
