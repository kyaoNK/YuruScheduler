import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { AppSettings, ProcessStep } from '../../types';
import { getIntensityColorClasses, getIntensityLabel } from '../../utils/intensityColor';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings | null;
  onSave: (settings: AppSettings) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
}: SettingsModalProps) {
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>(
    settings?.processSteps || []
  );
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [newStepName, setNewStepName] = useState('');
  const [newStepDays, setNewStepDays] = useState('1');
  const [newStepIntensity, setNewStepIntensity] = useState(3);

  // モーダルが開かれるたびに最新の settings から state を同期
  useEffect(() => {
    if (isOpen && settings) {
      setProcessSteps(settings.processSteps);
      setEditingStepId(null);
      setNewStepName('');
      setNewStepDays('1');
      setNewStepIntensity(3);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  // 工程を追加
  const handleAddStep = () => {
    if (!newStepName.trim() || !newStepDays) return;

    const days = parseInt(newStepDays, 10);
    if (isNaN(days) || days < 0) {
      alert('日数は0以上の数値を入力してください');
      return;
    }

    const newStep: ProcessStep = {
      id: uuidv4(),
      name: newStepName.trim(),
      daysBeforePublish: days,
      order: processSteps.length + 1,
      intensity: newStepIntensity,
    };

    setProcessSteps([...processSteps, newStep]);
    setNewStepName('');
    setNewStepDays('1');
    setNewStepIntensity(3);
  };

  // 工程を削除
  const handleDeleteStep = (id: string) => {
    if (!confirm('この工程を削除しますか？')) return;

    const updatedSteps = processSteps
      .filter((step) => step.id !== id)
      .map((step, index) => ({ ...step, order: index + 1 }));

    setProcessSteps(updatedSteps);
  };

  // 工程のフィールドを更新（編集モードは維持）
  const handleUpdateStepField = (
    id: string,
    updates: Partial<Omit<ProcessStep, 'id' | 'order'>>
  ) => {
    setProcessSteps(
      processSteps.map((step) =>
        step.id === id ? { ...step, ...updates } : step
      )
    );
  };

  // 工程を上に移動
  const handleMoveUp = (index: number) => {
    if (index === 0) return;

    const newSteps = [...processSteps];
    [newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]];

    // orderを再設定
    const reorderedSteps = newSteps.map((step, idx) => ({
      ...step,
      order: idx + 1,
    }));

    setProcessSteps(reorderedSteps);
  };

  // 工程を下に移動
  const handleMoveDown = (index: number) => {
    if (index === processSteps.length - 1) return;

    const newSteps = [...processSteps];
    [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];

    // orderを再設定
    const reorderedSteps = newSteps.map((step, idx) => ({
      ...step,
      order: idx + 1,
    }));

    setProcessSteps(reorderedSteps);
  };

  // 設定を保存
  const handleSave = () => {
    if (processSteps.length === 0) {
      alert('少なくとも1つの工程を追加してください');
      return;
    }

    onSave({ processSteps });
    onClose();
  };

  // キャンセル
  const handleCancel = () => {
    setProcessSteps(settings?.processSteps || []);
    setEditingStepId(null);
    setNewStepName('');
    setNewStepDays('1');
    setNewStepIntensity(3);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slide-in">
        {/* ヘッダー */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">工程設定</h2>
          <p className="text-base text-gray-600 dark:text-gray-400 mt-1">
            動画制作の工程を管理します。公開日から逆算して自動カードが生成されます。
          </p>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* 工程リスト */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              現在の工程（{processSteps.length}件）
            </h3>

            {processSteps.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                工程が登録されていません。下のフォームから追加してください。
              </div>
            ) : (
              <div className="space-y-2">
                {processSteps.map((step, index) => (
                  <div
                    key={step.id}
                    className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-4 transition-all hover:shadow-md"
                  >
                    {editingStepId === step.id ? (
                      // 編集モード
                      <div className="space-y-3">
                        <div>
                          <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
                            工程名
                          </label>
                          <input
                            type="text"
                            value={step.name}
                            onChange={(e) =>
                              handleUpdateStepField(step.id, { name: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
                            公開日の何日前
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={step.daysBeforePublish}
                            onChange={(e) => {
                              const parsed = parseInt(e.target.value, 10);
                              if (!isNaN(parsed) && parsed >= 0) {
                                handleUpdateStepField(step.id, {
                                  daysBeforePublish: parsed,
                                });
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
                            重要度
                          </label>
                          <div className="flex items-center space-x-2">
                            {[1, 2, 3, 4, 5].map((level) => {
                              const colors = getIntensityColorClasses(level);
                              return (
                                <button
                                  key={level}
                                  type="button"
                                  onClick={() => handleUpdateStepField(step.id, { intensity: level })}
                                  className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all ${
                                    step.intensity === level
                                      ? `${colors.dot} text-white border-transparent ring-2 ring-offset-1 ring-gray-400 dark:ring-gray-300 scale-110`
                                      : `${colors.bg} ${colors.text} ${colors.border} hover:scale-105`
                                  }`}
                                  title={getIntensityLabel(level)}
                                >
                                  {level}
                                </button>
                              );
                            })}
                            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                              {getIntensityLabel(step.intensity)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => setEditingStepId(null)}
                          className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-all hover:scale-105 shadow-md"
                        >
                          完了
                        </button>
                      </div>
                    ) : (
                      // 表示モード
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className="text-base font-semibold text-gray-600 dark:text-gray-400">
                              #{index + 1}
                            </span>
                            <span className={`w-3 h-3 rounded-full ${getIntensityColorClasses(step.intensity).dot}`} title={`重要度: ${getIntensityLabel(step.intensity)}`} />
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {step.name}
                            </h4>
                            <span className="text-base text-gray-600 dark:text-gray-400">
                              （公開日の{step.daysBeforePublish}日前）
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {/* 並び替えボタン */}
                          <div className="flex flex-col space-y-1">
                            <button
                              onClick={() => handleMoveUp(index)}
                              disabled={index === 0}
                              className={`px-2 py-1 text-xs rounded ${
                                index === 0
                                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                  : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 transition-all'
                              }`}
                              title="上に移動"
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => handleMoveDown(index)}
                              disabled={index === processSteps.length - 1}
                              className={`px-2 py-1 text-xs rounded ${
                                index === processSteps.length - 1
                                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                  : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 transition-all'
                              }`}
                              title="下に移動"
                            >
                              ↓
                            </button>
                          </div>

                          {/* 編集・削除ボタン */}
                          <button
                            onClick={() => setEditingStepId(step.id)}
                            className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-all"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => handleDeleteStep(step.id)}
                            className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-all"
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 工程追加フォーム */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              新しい工程を追加
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
                  工程名
                </label>
                <input
                  type="text"
                  value={newStepName}
                  onChange={(e) => setNewStepName(e.target.value)}
                  placeholder="例: 企画書作成"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddStep();
                  }}
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
                  公開日の何日前
                </label>
                <input
                  type="number"
                  min="0"
                  value={newStepDays}
                  onChange={(e) => setNewStepDays(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddStep();
                  }}
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
                重要度
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((level) => {
                  const colors = getIntensityColorClasses(level);
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setNewStepIntensity(level)}
                      className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all ${
                        newStepIntensity === level
                          ? `${colors.dot} text-white border-transparent ring-2 ring-offset-1 ring-gray-400 dark:ring-gray-300 scale-110`
                          : `${colors.bg} ${colors.text} ${colors.border} hover:scale-105`
                      }`}
                      title={getIntensityLabel(level)}
                    >
                      {level}
                    </button>
                  );
                })}
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                  {getIntensityLabel(newStepIntensity)}
                </span>
              </div>
            </div>
            <button
              onClick={handleAddStep}
              className="mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all hover:scale-105 shadow-md"
            >
              工程を追加
            </button>
          </div>
        </div>

        {/* フッター */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button
            onClick={handleCancel}
            className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all hover:scale-105"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-all hover:scale-105 shadow-md hover:shadow-lg"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
