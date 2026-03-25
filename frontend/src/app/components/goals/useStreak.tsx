// hooks/useStreak.ts
import { useState, useEffect } from "react";
import axios from "axios";

interface Streak {
  current: number;
  longest: number;
  lastActivityDate: string | null;
}

export const useStreak = () => {
  const [streak, setStreak] = useState<Streak>({ current: 0, longest: 0, lastActivityDate: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreak();
  }, []);

  const fetchStreak = async () => {
    try {
      const { data } = await axios.get("/streak");
      setStreak(data.streak);
    } finally {
      setLoading(false);
    }
  };

  // Call this when user completes a lesson, quiz, etc.
  const updateStreak = async () => {
    try{
      const { data } = await axios.post("/streak/update");
      setStreak(data.streak);
      return data.streak;

    }catch(e){
      console.log(e);
    }
  };

  return { streak, loading, updateStreak };
};