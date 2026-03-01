/**
 * 重要度(1-5)に応じたカラークラスを返す
 */

interface IntensityColorClasses {
  bg: string;
  text: string;
  border: string;
  dot: string;
}

const INTENSITY_COLORS: Record<number, IntensityColorClasses> = {
  1: {
    bg: 'bg-green-100 dark:bg-green-900/40',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-300 dark:border-green-600',
    dot: 'bg-green-500',
  },
  2: {
    bg: 'bg-blue-100 dark:bg-blue-900/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-300 dark:border-blue-600',
    dot: 'bg-blue-500',
  },
  3: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/40',
    text: 'text-yellow-700 dark:text-yellow-300',
    border: 'border-yellow-300 dark:border-yellow-600',
    dot: 'bg-yellow-500',
  },
  4: {
    bg: 'bg-orange-100 dark:bg-orange-900/40',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-300 dark:border-orange-600',
    dot: 'bg-orange-500',
  },
  5: {
    bg: 'bg-red-100 dark:bg-red-900/40',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-300 dark:border-red-600',
    dot: 'bg-red-500',
  },
};

const INTENSITY_LABELS: Record<number, string> = {
  1: '低',
  2: '低中',
  3: '中',
  4: '高中',
  5: '高',
};

export function getIntensityColorClasses(intensity: number): IntensityColorClasses {
  return INTENSITY_COLORS[intensity] || INTENSITY_COLORS[3];
}

export function getIntensityLabel(intensity: number): string {
  return INTENSITY_LABELS[intensity] || INTENSITY_LABELS[3];
}
