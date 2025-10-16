import React, { useState } from "react";
import { generateSchedule } from "../../services/aiService";
import { Box, TextField, Button, Slider, Typography, Card, CardContent } from "@mui/material";

export default function MoodForm() {
    const [mood, setMood] = useState(5);
    const [goals, setGoals] = useState("");
    const [schedule, setSchedule] = useState<any[]>([]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await generateSchedule({ mood, goals, hoursAvailable: 5 });
        setSchedule(result);
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2, maxWidth: 500, mx: "auto" }}>
            <div>
                <Typography variant="caption">Mood</Typography>
                <Slider value={mood} onChange={(e, v) => setMood(v as number)} min={0} max={10} />
            </div>

            <TextField
                label="Today's goals (comma separated)"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                multiline
                minRows={2}
            />

            <Button type="submit" variant="contained">Generate Plan</Button>

            {/* Display the generated schedule */}
            {schedule.length > 0 && (
                <Box mt={3}>
                    <Typography variant="h6">Your AI Schedule:</Typography>
                    {schedule.map((item, index) => (
                        <Card key={index} sx={{ mt: 2, backgroundColor: "#f8f9fa" }}>
                            <CardContent>
                                <Typography variant="subtitle1">{item.time} — {item.task}</Typography>
                                <Typography variant="body2" color="text.secondary">Duration: {item.duration}</Typography>
                                <Typography variant="body2" color="primary">{item.tip}</Typography>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}
        </Box>
    );
}
