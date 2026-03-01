/**
 * カードの種類
 * - manual: 手動で作成されたカード
 * - auto: 公開日から自動生成されたカード
 */
export type CardType = 'manual' | 'auto';

/**
 * カードの基本情報
 */
export interface Card {
  /** カードの一意識別子 */
  id: string;
  /** カードのタイトル */
  title: string;
  /** 日付（手動カードは公開日、自動カードは締切日） */
  date: Date;
  /** メモ */
  memo: string;
  /** どの工程の締切日か（手動カードはnull） */
  processStepId: string | null;
  /** 親の手動カードID（自動カードの場合のみ、手動カードはnull） */
  parentCardId: string | null;
  /** カードの種類 (手動/自動) */
  type: CardType;
  /** 完了フラグ */
  isCompleted: boolean;
  /** 作成日時 */
  createdAt: Date;
  /** 更新日時 */
  updatedAt: Date;
}

/**
 * 工程ステップの定義
 */
export interface ProcessStep {
  /** ステップの一意識別子 */
  id: string;
  /** ステップ名 */
  name: string;
  /** 公開日から何日前か */
  daysBeforePublish: number;
  /** 表示順序 */
  order: number;
  /** 重要度（1-5） */
  intensity: number;
}

/**
 * アプリケーション設定
 */
export interface AppSettings {
  /** 工程ステップのリスト */
  processSteps: ProcessStep[];
}

/**
 * ローカルストレージに保存する際のカードデータ
 * (DateオブジェクトをISO文字列に変換)
 */
export interface CardStorage {
  id: string;
  title: string;
  date: string;
  memo: string;
  processStepId: string | null;
  parentCardId: string | null;
  type: CardType;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * ローカルストレージに保存する際のアプリデータ
 */
export interface AppData {
  cards: CardStorage[];
  settings: AppSettings;
}
