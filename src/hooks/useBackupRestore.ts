import { useState, useEffect } from 'react';
import { backupExists, readBackup, readBackupTimestamp } from '../utils/backup';
import { loadData, saveData } from '../utils/storage';
import type { AppData } from '../types';

interface BackupRestoreState {
  isChecking: boolean;
  hasBackup: boolean;
  backupTimestamp: string | null;
  acceptRestore: () => Promise<AppData | null>;
  declineRestore: () => void;
}

export function useBackupRestore(): BackupRestoreState {
  const [isChecking, setIsChecking] = useState(true);
  const [hasBackup, setHasBackup] = useState(false);
  const [backupTimestamp, setBackupTimestamp] = useState<string | null>(null);

  useEffect(() => {
    async function check() {
      try {
        // localStorageにデータがある場合は復元不要
        const currentData = loadData();
        if (currentData.cards.length > 0) {
          setIsChecking(false);
          return;
        }

        // localStorageが空の場合のみバックアップを確認
        const hasFile = await backupExists();
        if (hasFile) {
          const timestamp = await readBackupTimestamp();
          setBackupTimestamp(timestamp);
          setHasBackup(true);
        }
      } catch (error) {
        console.error('Backup check failed:', error);
      } finally {
        setIsChecking(false);
      }
    }

    check();
  }, []);

  const acceptRestore = async (): Promise<AppData | null> => {
    const data = await readBackup();
    if (data) {
      saveData(data);
    }
    setHasBackup(false);
    return data;
  };

  const declineRestore = () => {
    setHasBackup(false);
  };

  return {
    isChecking,
    hasBackup,
    backupTimestamp,
    acceptRestore,
    declineRestore,
  };
}
