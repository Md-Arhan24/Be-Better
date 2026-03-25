import { useParams } from "react-router-dom"; // 👈 import
import { useState,useEffect } from "react";
import axios from 'axios';

export default function RoadmapOverview() {
      interface Goal {
  _id: string;
  userId: string;
  title: string;
  description: string;
  type: "ai_generated" | "manual";   // extend if you have more types
  status: "active" | "completed" | "inactive";  // extend if needed
  dailyTimeMinutes: number;
  startDate: string;   // ISO date string from API
  endDate: string;
  durationDays: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
    
  const { id } = useParams(); // 👈 get goal id from URL
  const [userGoal, setUserGoal] = useState<Goal | null>(null); // 👈 single goal now
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await axios.get(`${URL}/goals/${id}`, { // 👈 fetch by id
          withCredentials: true,
        });
        setUserGoal(res.data);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!userGoal) return <div>Goal not found</div>;

  // Now use userGoal.title directly instead of userGoal[0].title
  return (
   <>
   
   </>
  );
}