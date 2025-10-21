import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { MoodChart } from './MoodChart';
import { EnergyChart } from './EnergyChart';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface LogEntry {
  mood: number;
  energy: number;
  notes: string;
  completedTasks: number;
  timestamp: string;
}

interface AnalyticsPageProps {
  onNavigate: (page: string) => void;
  userId: string;
}

export function AnalyticsPage({ onNavigate, userId }: AnalyticsPageProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [userId]);

  const loadAnalytics = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f5a18c95/analytics/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAverageMood = () => {
    if (logs.length === 0) return 0;
    const sum = logs.reduce((acc, log) => acc + log.mood, 0);
    return (sum / logs.length).toFixed(1);
  };

  const getAverageEnergy = () => {
    if (logs.length === 0) return 0;
    const sum = logs.reduce((acc, log) => acc + log.energy, 0);
    return (sum / logs.length).toFixed(1);
  };

  const getTotalTasks = () => {
    return logs.reduce((acc, log) => acc + (log.completedTasks || 0), 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => onNavigate('dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="space-y-6">
          <div>
            <h1 className="text-4xl flex items-center gap-3">
              <TrendingUp className="h-8 w-8" />
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Track your mood, energy, and productivity over time</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : logs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  No data yet. Start creating daily plans to see your analytics!
                </p>
                <Button onClick={() => onNavigate('input')}>
                  Create Your First Plan
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Average Mood</CardTitle>
                    <CardDescription>Last {logs.length} entries</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl">{getAverageMood()}/10</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {parseFloat(getAverageMood()) >= 7 ? '😊 Generally positive' : 
                       parseFloat(getAverageMood()) >= 4 ? '😐 Neutral' : '😔 Could improve'}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Average Energy</CardTitle>
                    <CardDescription>Last {logs.length} entries</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl">{getAverageEnergy()}/10</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {parseFloat(getAverageEnergy()) >= 7 ? '⚡ High energy' : 
                       parseFloat(getAverageEnergy()) >= 4 ? '🔋 Moderate' : '💤 Low energy'}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Total Tasks</CardTitle>
                    <CardDescription>Completed so far</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl">{getTotalTasks()}</div>
                    <div className="text-sm text-gray-500 mt-1">Keep going! 🎯</div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Mood Trend</CardTitle>
                    <CardDescription>Your mood over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MoodChart logs={logs} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Energy Levels</CardTitle>
                    <CardDescription>Your energy patterns</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <EnergyChart logs={logs} />
                  </CardContent>
                </Card>
              </div>

              {/* Recent Entries */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Entries</CardTitle>
                  <CardDescription>Your latest mood and energy logs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {logs.slice(0, 5).map((log, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="text-sm text-gray-500">
                            {new Date(log.timestamp).toLocaleDateString()} at {new Date(log.timestamp).toLocaleTimeString()}
                          </div>
                          {log.notes && (
                            <div className="text-sm mt-1">{log.notes}</div>
                          )}
                        </div>
                        <div className="flex gap-4">
                          <div className="text-center">
                            <div className="text-xs text-gray-500">Mood</div>
                            <div>{log.mood}/10</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500">Energy</div>
                            <div>{log.energy}/10</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
