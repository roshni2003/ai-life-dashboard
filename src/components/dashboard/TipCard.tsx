import { Card, CardContent } from '../ui/card';
import { Sparkles } from 'lucide-react';

interface TipCardProps {
  tip: string;
}

export function TipCard({ tip }: TipCardProps) {
  return (
    <Card className="bg-gradient-to-r from-purple-500 to-pink-500 border-0 text-white">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-full">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h3 className="mb-2">✨ AI Tip of the Day</h3>
            <p className="text-white/90">{tip}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
