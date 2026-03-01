import {
  exists,
  readTextFile,
  writeTextFile,
  BaseDirectory,
} from '@tauri-apps/plugin-fs';
import type { AppData } from '../types';

const BACKUP_FILENAME = 'backup.json';
const BACKUP_VERSION = 1;

interface BackupFile {
  version: number;
  timestamp: string;
  appVersion: string;
  data: AppData;
}

/**
 * AppDataをアプリの実行ファイルと同じディレクトリにバックアップ保存する。
 * エラーはログ出力のみ（メイン保存処理に影響させない）。
 */
export async function writeBackup(data: AppData): Promise<void> {
  try {
    const backupFile: BackupFile = {
      version: BACKUP_VERSION,
      timestamp: new Date().toISOString(),
      appVersion: '0.1.0',
      data,
    };

    await writeTextFile(BACKUP_FILENAME, JSON.stringify(backupFile, null, 2), {
      baseDir: BaseDirectory.Resource,
    });
  } catch (error) {
    console.error('Failed to write backup file:', error);
  }
}

/**
 * バックアップファイルが存在するか確認する。
 */
export async function backupExists(): Promise<boolean> {
  try {
    return await exists(BACKUP_FILENAME, {
      baseDir: BaseDirectory.Resource,
    });
  } catch {
    return false;
  }
}

/**
 * バックアップファイルを読み込んでパースする。
 * 存在しない・読み込めない場合はnullを返す。
 */
export async function readBackup(): Promise<AppData | null> {
  try {
    const hasBackup = await backupExists();
    if (!hasBackup) return null;

    const content = await readTextFile(BACKUP_FILENAME, {
      baseDir: BaseDirectory.Resource,
    });
    const backupFile: BackupFile = JSON.parse(content);

    if (
      !backupFile.data ||
      !Array.isArray(backupFile.data.cards) ||
      !backupFile.data.settings
    ) {
      console.warn('Backup file has invalid data structure');
      return null;
    }

    return backupFile.data;
  } catch (error) {
    console.error('Failed to read backup file:', error);
    return null;
  }
}

/**
 * バックアップのタイムスタンプを取得する（UI表示用）。
 */
export async function readBackupTimestamp(): Promise<string | null> {
  try {
    const hasBackup = await backupExists();
    if (!hasBackup) return null;

    const content = await readTextFile(BACKUP_FILENAME, {
      baseDir: BaseDirectory.Resource,
    });
    const backupFile: BackupFile = JSON.parse(content);
    return backupFile.timestamp ?? null;
  } catch {
    return null;
  }
}
