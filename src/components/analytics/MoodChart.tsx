import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LogEntry {
  mood: number;
  energy: number;
  notes: string;
  completedTasks: number;
  timestamp: string;
}

interface MoodChartProps {
  logs: LogEntry[];
}

export function MoodChart({ logs }: MoodChartProps) {
  // Prepare data for chart (reverse to show oldest to newest)
  const chartData = logs
    .slice()
    .reverse()
    .slice(-14) // Show last 14 entries
    .map(log => ({
      date: new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      mood: log.mood,
    }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={[0, 10]} />
        <Tooltip />
        <Line 
          type="monotone" 
          dataKey="mood" 
          stroke="#a855f7" 
          strokeWidth={2}
          dot={{ fill: '#a855f7', r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
