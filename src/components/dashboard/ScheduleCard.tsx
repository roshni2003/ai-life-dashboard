import { Clock, CheckCircle2 } from 'lucide-react';
import { Card } from '../ui/card';
import { useState } from 'react';

interface ScheduleItem {
  time: string;
  task: string;
  duration: string;
  tip: string;
}

interface ScheduleCardProps {
  item: ScheduleItem;
}

export function ScheduleCard({ item }: ScheduleCardProps) {
  const [completed, setCompleted] = useState(false);

  return (
    <Card 
      className={`p-4 hover:shadow-md transition-all cursor-pointer ${
        completed ? 'bg-green-50 border-green-200' : ''
      }`}
      onClick={() => setCompleted(!completed)}
    >
      <div className="flex items-start gap-4">
        <div className={`mt-1 ${completed ? 'text-green-500' : 'text-gray-400'}`}>
          <CheckCircle2 className="h-5 w-5" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-2 py-1 rounded text-sm bg-purple-100 text-purple-700`}>
              {item.time}
            </span>
            <span className={`px-2 py-1 rounded text-sm bg-blue-100 text-blue-700`}>
              <Clock className="inline h-3 w-3 mr-1" />
              {item.duration}
            </span>
          </div>
          
          <h4 className={completed ? 'line-through text-gray-500' : ''}>
            {item.task}
          </h4>
          
          <p className="text-sm text-gray-600 mt-2 italic">
            💡 {item.tip}
          </p>
        </div>
      </div>
    </Card>
  );
}
