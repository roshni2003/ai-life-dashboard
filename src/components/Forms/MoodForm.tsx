import React, { useState } from "react";
import { Box, TextField, Button, Slider, Typography } from "@mui/material";

export default function MoodForm() {
  const [mood, setMood] = useState(5);
  const [goals, setGoals] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: call the AI schedule generator via service
    console.log({ mood, goals });
    alert("Submitted (stub) — check console");
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2 }}>
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
    </Box>
  );
}
