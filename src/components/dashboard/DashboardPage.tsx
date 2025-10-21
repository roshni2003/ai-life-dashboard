import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ScheduleCard } from './ScheduleCard';
import { TipCard } from './TipCard';
import { Brain, Calendar, TrendingUp, MessageCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface ScheduleItem {
  time: string;
  task: string;
  duration: string;
  tip: string;
}

interface ScheduleData {
  schedule: ScheduleItem[];
  mood: number;
  energy: number;
  goals: string;
  availableHours: number;
  timestamp: string;
}

interface DashboardPageProps {
  onNavigate: (page: string) => void;
  userId: string;
}

export function DashboardPage({ onNavigate, userId }: DashboardPageProps) {
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tip, setTip] = useState<string>('');

  useEffect(() => {
    loadTodaySchedule();
    loadDailyTip();
  }, [userId]);

  const loadTodaySchedule = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f5a18c95/schedule/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setScheduleData(data.scheduleData);
      }
    } catch (error) {
      console.error('Error loading schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDailyTip = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f5a18c95/get-tip`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            mood: scheduleData?.mood || 7,
            energy: scheduleData?.energy || 7,
            recentActivity: 'Starting fresh today',
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTip(data.tip);
      }
    } catch (error) {
      console.error('Error loading tip:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl">AI Life Dashboard</h1>
            <p className="text-gray-600 mt-2">Your Smart Day Planner</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onNavigate('analytics')}>
              <TrendingUp className="mr-2 h-4 w-4" />
              Analytics
            </Button>
            <Button variant="outline" onClick={() => onNavigate('chat')}>
              <MessageCircle className="mr-2 h-4 w-4" />
              Reflect
            </Button>
          </div>
        </div>

        {/* AI Tip of the Day */}
        {tip && <TipCard tip={tip} />}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate('input')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                Generate Smart Plan
              </CardTitle>
              <CardDescription>
                Create an AI-powered schedule for today
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate('chat')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-500" />
                AI Reflection Chat
              </CardTitle>
              <CardDescription>
                Discuss your progress and get guidance
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate('analytics')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-pink-500" />
                View Analytics
              </CardTitle>
              <CardDescription>
                Track your mood, energy, and productivity
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Schedule
            </CardTitle>
            <CardDescription>
              {scheduleData 
                ? `Generated at ${new Date(scheduleData.timestamp).toLocaleTimeString()}`
                : 'No schedule yet for today'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
            ) : scheduleData ? (
              <div className="space-y-3">
                {scheduleData.schedule.map((item, index) => (
                  <ScheduleCard key={index} item={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  You haven't created a plan for today yet.
                </p>
                <Button onClick={() => onNavigate('input')}>
                  <Brain className="mr-2 h-4 w-4" />
                  Create Your Plan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        {scheduleData && (
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Mood Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl">{scheduleData.mood}/10</div>
                <div className="text-sm text-gray-500 mt-1">
                  {scheduleData.mood >= 7 ? '😊 Positive' : scheduleData.mood >= 4 ? '😐 Neutral' : '😔 Low'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Energy Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl">{scheduleData.energy}/10</div>
                <div className="text-sm text-gray-500 mt-1">
                  {scheduleData.energy >= 7 ? '⚡ High' : scheduleData.energy >= 4 ? '🔋 Moderate' : '🪫 Low'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Available Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl">{scheduleData.availableHours}h</div>
                <div className="text-sm text-gray-500 mt-1">Planned for today</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
