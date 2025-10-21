import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LogEntry {
  mood: number;
  energy: number;
  notes: string;
  completedTasks: number;
  timestamp: string;
}

interface EnergyChartProps {
  logs: LogEntry[];
}

export function EnergyChart({ logs }: EnergyChartProps) {
  // Prepare data for chart (reverse to show oldest to newest)
  const chartData = logs
    .slice()
    .reverse()
    .slice(-14) // Show last 14 entries
    .map(log => ({
      date: new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      energy: log.energy,
    }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={[0, 10]} />
        <Tooltip />
        <Bar dataKey="energy" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
}
