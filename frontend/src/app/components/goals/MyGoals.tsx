import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { URL } from "../../../api";
import SideBar from "./SideBar";

interface Goal {
  _id: string;
  title: string;
  description: string;
  status: "active" | "completed" | "inactive";
  startDate: string;
  endDate: string;
  durationDays: number;
  dailyTimeMinutes: number;
}

export default function MyGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await axios.get(`${URL}/goals/`, { withCredentials: true });
        setGoals(res.data);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex min-h-screen bg-[#0A0A0A]">
      <SideBar />
      <main className="flex-1 lg:ml-60 px-6 py-8">
        <h1 className="text-white text-2xl font-bold mb-6">My Goals</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => (
            <div
              key={goal._id}
              onClick={() => navigate(`/main/goals/${goal._id}`)} // 👈 navigate on click
              className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-5 cursor-pointer hover:border-[#7C3AED] transition-colors"
            >
              <h2 className="text-white font-bold mb-2">{goal.title}</h2>
              <p className="text-[#6B7280] text-sm mb-4">{goal.description}</p>
              <div className="flex gap-2 flex-wrap">
                <span className="bg-[#1F1F1F] text-white/70 text-xs px-3 py-1 rounded-full">
                  {goal.durationDays} Days
                </span>
                <span className="bg-[#1F1F1F] text-white/70 text-xs px-3 py-1 rounded-full">
                  {goal.dailyTimeMinutes < 60
                    ? `${goal.dailyTimeMinutes} mins/day`
                    : `${(goal.dailyTimeMinutes / 60).toFixed(1)} hrs/day`
                  }
                </span>
                <span className={`text-xs px-3 py-1 rounded-full ${goal.status === "active"
                    ? "bg-green-900/30 text-green-400"
                    : "bg-[#1F1F1F] text-white/70"
                  }`}>
                  {goal.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}