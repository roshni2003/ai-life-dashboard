import React from "react";
import { Grid, Card, CardContent, Typography, Button } from "@mui/material";
import MoodForm from "../components/Forms/MoodForm";

export default function DashboardPage() {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6">Today's Plan</Typography>
            {/* placeholder for schedule */}
            <Typography color="text.secondary">Your plan will appear here.</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6">Quick Input</Typography>
            <MoodForm />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
