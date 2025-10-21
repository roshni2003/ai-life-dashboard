import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-f5a18c95/health", (c) => {
  return c.json({ status: "ok" });
});

// Generate smart schedule with AI
app.post("/make-server-f5a18c95/generate-schedule", async (c) => {
  try {
    const { mood, energy, goals, availableHours, userId } = await c.req.json();
    
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return c.json({ error: "OpenAI API key not configured" }, 500);
    }

    const prompt = `You are an expert productivity coach. The user has given:
Mood: ${mood}/10
Energy Level: ${energy}/10
Goals: ${goals}
Available Time: ${availableHours} hours

Generate a personalized schedule with times, task order, and motivation tips.
Output ONLY valid JSON in this exact format (no markdown, no extra text):
[
  { "time": "9:00 AM", "task": "task name", "duration": "1h", "tip": "motivation tip" }
]`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`OpenAI API error during schedule generation: ${errorText}`);
      return c.json({ error: "Failed to generate schedule" }, 500);
    }

    const data = await response.json();
    const scheduleText = data.choices[0].message.content.trim();
    
    // Parse the JSON response
    let schedule;
    try {
      // Remove markdown code blocks if present
      const cleanedText = scheduleText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      schedule = JSON.parse(cleanedText);
    } catch (parseError) {
      console.log(`Error parsing AI schedule response: ${parseError}, Raw response: ${scheduleText}`);
      return c.json({ error: "Failed to parse AI response" }, 500);
    }

    // Save schedule to KV store with timestamp
    const scheduleKey = `schedule:${userId}:${new Date().toISOString().split('T')[0]}`;
    await kv.set(scheduleKey, {
      schedule,
      mood,
      energy,
      goals,
      availableHours,
      timestamp: new Date().toISOString(),
    });

    return c.json({ schedule });
  } catch (error) {
    console.log(`Error generating schedule: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get AI productivity tip
app.post("/make-server-f5a18c95/get-tip", async (c) => {
  try {
    const { mood, energy, recentActivity } = await c.req.json();
    
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return c.json({ error: "OpenAI API key not configured" }, 500);
    }

    const prompt = `You are a mindful productivity coach. Based on:
Mood: ${mood}/10
Energy: ${energy}/10
Recent: ${recentActivity || "Starting fresh"}

Give ONE short, encouraging productivity tip (max 2 sentences). Be warm and supportive.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`OpenAI API error during tip generation: ${errorText}`);
      return c.json({ error: "Failed to generate tip" }, 500);
    }

    const data = await response.json();
    const tip = data.choices[0].message.content.trim();

    return c.json({ tip });
  } catch (error) {
    console.log(`Error generating tip: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Chat with AI reflection coach
app.post("/make-server-f5a18c95/chat", async (c) => {
  try {
    const { message, userId, conversationHistory } = await c.req.json();
    
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return c.json({ error: "OpenAI API key not configured" }, 500);
    }

    const systemMessage = {
      role: "system",
      content: "You are a warm, empathetic AI life coach helping users reflect on their day, productivity, and well-being. Be supportive, ask thoughtful questions, and provide gentle guidance. Keep responses concise (2-3 sentences)."
    };

    const messages = [
      systemMessage,
      ...(conversationHistory || []),
      { role: "user", content: message }
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.9,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`OpenAI API error during chat: ${errorText}`);
      return c.json({ error: "Failed to get chat response" }, 500);
    }

    const data = await response.json();
    const reply = data.choices[0].message.content.trim();

    // Save conversation to KV store
    const chatKey = `chat:${userId}:${new Date().toISOString().split('T')[0]}`;
    const updatedHistory = [...(conversationHistory || []), 
      { role: "user", content: message },
      { role: "assistant", content: reply }
    ];
    await kv.set(chatKey, { history: updatedHistory, timestamp: new Date().toISOString() });

    return c.json({ reply });
  } catch (error) {
    console.log(`Error in chat endpoint: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Save mood/energy log
app.post("/make-server-f5a18c95/log-entry", async (c) => {
  try {
    const { userId, mood, energy, notes, completedTasks } = await c.req.json();
    
    const logKey = `log:${userId}:${new Date().toISOString()}`;
    await kv.set(logKey, {
      mood,
      energy,
      notes,
      completedTasks,
      timestamp: new Date().toISOString(),
    });

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error saving log entry: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get analytics data (last 7 days)
app.get("/make-server-f5a18c95/analytics/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const logs = await kv.getByPrefix(`log:${userId}`);
    
    // Sort by timestamp and get last 7 days
    const sortedLogs = logs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50); // Get more entries to ensure we have enough data

    return c.json({ logs: sortedLogs });
  } catch (error) {
    console.log(`Error fetching analytics: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get today's schedule
app.get("/make-server-f5a18c95/schedule/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const today = new Date().toISOString().split('T')[0];
    const scheduleKey = `schedule:${userId}:${today}`;
    
    const scheduleData = await kv.get(scheduleKey);
    
    return c.json({ scheduleData });
  } catch (error) {
    console.log(`Error fetching schedule: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

Deno.serve(app.fetch);