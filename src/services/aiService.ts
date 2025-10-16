// aiService.ts - stubbed
export type ScheduleItem = { time: string; task: string; duration?: string; tip?: string };

export async function generateSchedule(input: { mood: number; goals: string; hoursAvailable?: number }): Promise<ScheduleItem[]> {
  // TODO: replace with server-side call to OpenAI
  // For now, return a mocked schedule
  return [
    { time: "09:00", task: "Write blog", duration: "1h", tip: "Start with outline." },
    { time: "10:00", task: "Study React", duration: "2h", tip: "Focus on hooks." },
  ];
}
