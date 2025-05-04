"use client";
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

const habits = [
  { name: "Sleep (hrs)", key: "sleep", max: 12 },
  { name: "Water (cups)", key: "water", max: 12 },
  { name: "Screen Time (hrs)", key: "screen", max: 12 },
];

type HabitData = {
  date: string;
  sleep: number;
  water: number;
  screen: number;
};

export default function Home() {
  const [today, setToday] = useState("");
  const [habitValues, setHabitValues] = useState<Record<string, number>>({
    sleep: 0,
    water: 0,
    screen: 0,
  });
  const [log, setLog] = useState<HabitData[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setToday(new Date().toISOString().slice(0, 10));
  }, [today]);

  useEffect(() => {
    if (!today) return;

    const savedLog = localStorage.getItem("habit-log");
    if (savedLog) {
      const parsed: HabitData[] = JSON.parse(savedLog);
      setLog(parsed);
      const lastEntry = parsed[parsed.length - 1];
      if (lastEntry?.date === today) {
        setHabitValues({
          sleep: lastEntry.sleep,
          water: lastEntry.water,
          screen: lastEntry.screen,
        });
      }
      let streakCount = 0;
      for (let i = parsed.length - 1; i >= 0; i--) {
        const date = new Date(parsed[i].date);
        const expected = new Date();
        expected.setDate(expected.getDate() - (parsed.length - 1 - i));
        if (date.toDateString() === expected.toDateString()) {
          streakCount++;
        } else break;
      }
      setStreak(streakCount);
    }
  }, [today]);

  const saveData = () => {
    if (!today) return;
  
    // Ensure newEntry has the required properties of HabitData
    const newEntry: HabitData = {
      date: today,
      sleep: habitValues.sleep,
      water: habitValues.water,
      screen: habitValues.screen,
    };
  
    let updatedLog = [...log.filter((entry) => entry.date !== today), newEntry];
    updatedLog = updatedLog.sort((a, b) => a.date.localeCompare(b.date));
  
    setLog(updatedLog);
    localStorage.setItem("habit-log", JSON.stringify(updatedLog));
    alert("✅ Habits saved!");
  };
  

  const weeklyData = log.slice(-7);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* NAV */}
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">HabitWise</h1>
        <div className="space-x-4 text-sm">
       
        </div>
      </nav>

      {/* HEADER */}
      <header className="px-6 py-10 text-center">
        <motion.h2
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl font-semibold"
        >
          Track Your Habits. Improve Every Day.
        </motion.h2>
        <p className="text-gray-600 mt-2">Stay consistent with your personal goals</p>
      </header>

      {/* DAILY CHECK-IN */}
      <section className="px-6 max-w-4xl mx-auto space-y-6">
        <div className="bg-white shadow rounded-xl p-6 space-y-4">
          <h3 className="text-xl font-semibold">Daily Check-in — {today || "Loading..."}</h3>
          {habits.map((habit) => (
            <div key={habit.key} className="flex items-center justify-between">
              <label htmlFor={habit.key} className="w-1/3">
                {habit.name}
              </label>
              <input
                type="range"
                id={habit.key}
                min={0}
                max={habit.max}
                value={habitValues[habit.key]}
                onChange={(e) =>
                  setHabitValues({ ...habitValues, [habit.key]: Number(e.target.value) })
                }
                className="w-2/3"
              />
              <span className="ml-4 w-10 text-right">{habitValues[habit.key]}</span>
            </div>
          ))}
          <button
            onClick={saveData}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Save Progress
          </button>
        </div>

        {/* PROGRESS CHARTS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {habits.map((habit) => (
            <div key={habit.key} className="bg-white shadow rounded-xl p-4">
              <h4 className="text-md font-medium text-center">{habit.name} (Last 7 Days)</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={weeklyData}>
                  <XAxis dataKey="date" hide />
                  <YAxis domain={[0, habit.max]} />
                  <Tooltip />
                  <Line type="monotone" dataKey={habit.key} stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>

        {/* STREAK */}
        <div className="text-center mt-8">
          <p className="text-xl font-semibold">
            🔥 Current Streak: <span className="text-blue-600">{streak} days</span>
          </p>
        </div>
      </section>

 
    </div>
  );
}
