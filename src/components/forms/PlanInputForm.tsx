import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface PlanInputFormProps {
  onNavigate: (page: string) => void;
  userId: string;
}

export function PlanInputForm({ onNavigate, userId }: PlanInputFormProps) {
  const [mood, setMood] = useState([7]);
  const [energy, setEnergy] = useState([7]);
  const [goals, setGoals] = useState('');
  const [availableHours, setAvailableHours] = useState('5');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f5a18c95/generate-schedule`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            mood: mood[0],
            energy: energy[0],
            goals,
            availableHours: parseFloat(availableHours),
            userId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate schedule');
      }

      const data = await response.json();
      console.log('Schedule generated:', data);

      // Log this entry
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f5a18c95/log-entry`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            userId,
            mood: mood[0],
            energy: energy[0],
            notes: goals,
            completedTasks: 0,
          }),
        }
      );

      // Navigate back to dashboard
      onNavigate('dashboard');
    } catch (error) {
      console.error('Error generating schedule:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate schedule');
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmoji = (value: number) => {
    if (value >= 8) return '😄';
    if (value >= 6) return '😊';
    if (value >= 4) return '😐';
    if (value >= 2) return '😔';
    return '😢';
  };

  const getEnergyEmoji = (value: number) => {
    if (value >= 8) return '⚡';
    if (value >= 6) return '🔋';
    if (value >= 4) return '🪫';
    return '💤';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
      <div className="max-w-2xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => onNavigate('dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-500" />
              Generate Your Smart Plan
            </CardTitle>
            <CardDescription>
              Tell us about your day and we'll create a personalized schedule
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mood Slider */}
              <div className="space-y-3">
                <Label>
                  How are you feeling today? {getMoodEmoji(mood[0])}
                </Label>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">😢</span>
                  <Slider
                    value={mood}
                    onValueChange={setMood}
                    min={1}
                    max={10}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-500">😄</span>
                </div>
                <div className="text-center">
                  <span className="text-2xl">{mood[0]}/10</span>
                </div>
              </div>

              {/* Energy Slider */}
              <div className="space-y-3">
                <Label>
                  What's your energy level? {getEnergyEmoji(energy[0])}
                </Label>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">💤</span>
                  <Slider
                    value={energy}
                    onValueChange={setEnergy}
                    min={1}
                    max={10}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-500">⚡</span>
                </div>
                <div className="text-center">
                  <span className="text-2xl">{energy[0]}/10</span>
                </div>
              </div>

              {/* Goals Input */}
              <div className="space-y-2">
                <Label htmlFor="goals">What do you want to accomplish today?</Label>
                <Textarea
                  id="goals"
                  placeholder="E.g., Write blog post, Study React, Workout, Read 30 pages..."
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  required
                  rows={4}
                />
                <p className="text-sm text-gray-500">
                  List your tasks or goals, separated by commas
                </p>
              </div>

              {/* Available Hours */}
              <div className="space-y-2">
                <Label htmlFor="hours">How many hours do you have available?</Label>
                <Input
                  id="hours"
                  type="number"
                  min="1"
                  max="16"
                  step="0.5"
                  value={availableHours}
                  onChange={(e) => setAvailableHours(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating Your Plan...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Smart Plan
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
