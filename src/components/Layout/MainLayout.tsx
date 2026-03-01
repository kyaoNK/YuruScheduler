import { ReactNode } from 'react';
import { Header } from './Header';

interface MainLayoutProps {
  children: ReactNode;
  onCreateCard: () => void;
  onToggleView: () => void;
  onOpenSettings: () => void;
  currentView: 'timeline' | 'calendar';
}

export function MainLayout({
  children,
  onCreateCard,
  onToggleView,
  onOpenSettings,
  currentView,
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <Header
        onCreateCard={onCreateCard}
        onToggleView={onToggleView}
        onOpenSettings={onOpenSettings}
        currentView={currentView}
      />
      <main className="max-w-7xl mx-auto py-6 px-4 animate-fade-in">{children}</main>
    </div>
  );
}
