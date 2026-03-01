interface RestoreModalProps {
  isOpen: boolean;
  backupTimestamp: string | null;
  onAccept: () => void;
  onDecline: () => void;
}

export function RestoreModal({
  isOpen,
  backupTimestamp,
  onAccept,
  onDecline,
}: RestoreModalProps) {
  if (!isOpen) return null;

  const formattedDate = backupTimestamp
    ? new Date(backupTimestamp).toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '不明';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-2xl max-w-md w-full animate-slide-in">
        {/* ヘッダー */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            バックアップの復元
          </h2>
        </div>

        {/* コンテンツ */}
        <div className="px-6 py-6">
          <p className="text-base text-gray-700 dark:text-gray-300 mb-4">
            以前のデータのバックアップが見つかりました。復元しますか？
          </p>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-base text-gray-600 dark:text-gray-400">
            <p>バックアップ日時: {formattedDate}</p>
          </div>
        </div>

        {/* フッター */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button
            onClick={onDecline}
            className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all hover:scale-105"
          >
            復元しない
          </button>
          <button
            onClick={onAccept}
            className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all hover:scale-105 shadow-md hover:shadow-lg"
          >
            復元する
          </button>
        </div>
      </div>
    </div>
  );
}
