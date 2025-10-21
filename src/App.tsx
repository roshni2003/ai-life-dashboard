import { useState, useEffect } from 'react';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { PlanInputForm } from './components/forms/PlanInputForm';
import { ChatPage } from './components/chat/ChatPage';
import { AnalyticsPage } from './components/analytics/AnalyticsPage';

type Page = 'dashboard' | 'input' | 'chat' | 'analytics';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    // Generate or retrieve user ID
    let storedUserId = localStorage.getItem('aiLifeDashboardUserId');
    if (!storedUserId) {
      storedUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('aiLifeDashboardUserId', storedUserId);
    }
    setUserId(storedUserId);
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <>
      {currentPage === 'dashboard' && (
        <DashboardPage onNavigate={handleNavigate} userId={userId} />
      )}
      {currentPage === 'input' && (
        <PlanInputForm onNavigate={handleNavigate} userId={userId} />
      )}
      {currentPage === 'chat' && (
        <ChatPage onNavigate={handleNavigate} userId={userId} />
      )}
      {currentPage === 'analytics' && (
        <AnalyticsPage onNavigate={handleNavigate} userId={userId} />
      )}
    </>
  );
}
