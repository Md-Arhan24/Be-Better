import { motion, AnimatePresence } from "motion/react";
import { Share2, RefreshCw, User, Clock, ChevronDown, ChevronUp, CheckCircle2, Circle, Loader2 } from "lucide-react";
import SideBar from "./SideBar";
import axios from "axios";
import { URL } from "../../../api";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface Goal {
  _id: string;
  userId: string;
  title: string;
  description: string;
  type: "ai_generated" | "manual";
  status: "active" | "completed" | "inactive";
  dailyTimeMinutes: number;
  startDate: string;
  endDate: string;
  durationDays: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Resource {
  _id: string;
  title: string;
  url: string;
}

interface PlanDay {
  _id: string;
  userId: string;
  goalId: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed";
  dayNumber: number;
  weekNumber: number;
  monthNumber: number;
  estimatedMinutes: number;
  date: string;
  completedAt: string | null;
  resources: Resource[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const STATUS_STYLES: Record<
  PlanDay["status"],
  { border: string; dot: string; label: string }
> = {
  completed: {
    border: "border-emerald-500/30",
    dot: "bg-emerald-400",
    label: "text-emerald-400",
  },
  "in-progress": {
    border: "border-violet-500/30",
    dot: "bg-violet-400",
    label: "text-violet-400",
  },
  pending: {
    border: "border-[#2A2A2A]",
    dot: "bg-[#3A3A3A]",
    label: "text-[#6B7280]",
  },
};

function PlanDayCard({ day, index }: { day: PlanDay; index: number }) {
  const style = STATUS_STYLES[day.status];

  const formattedDate = new Date(day.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className={`bg-[#111111] border ${style.border} rounded-xl p-4 flex flex-col gap-3 hover:border-[#3A3A3A] hover:bg-[#161616] transition-all duration-200 group`}
    >
      {/* Row 1: Day number + Date */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold tracking-widest text-[#6B7280] uppercase">
            Day
          </span>
          <span className="text-white font-bold text-sm tabular-nums">
            {String(day.dayNumber).padStart(2, "0")}
          </span>
        </div>
        <span className="text-[11px] text-[#6B7280]">{formattedDate}</span>
      </div>

      {/* Row 2: Daily time */}
      <div className="flex items-center gap-1.5">
        <Clock className="w-3 h-3 text-[#4B5563]" />
        <span className="text-[11px] text-[#4B5563]">
          {day.estimatedMinutes} min
        </span>
        {/* Status dot */}
        <div className="ml-auto flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
          <span className={`text-[10px] capitalize font-medium ${style.label}`}>
            {day.status}
          </span>
        </div>
      </div>

      {/* Row 3: Title */}
      <p className="text-white text-sm font-semibold leading-snug line-clamp-1 group-hover:text-violet-300 transition-colors">
        {day.title.replace(/^Day \d+ [-–] /, "")}
      </p>

      {/* Row 4: Description */}
      <p className="text-[#6B7280] text-xs leading-relaxed line-clamp-2">
        {day.description}
      </p>
    </motion.div>
  );
}

export default function RoadmapOverview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [userGoal, setUserGoal] = useState<Goal | null>(null);
  const [planDays, setPlanDays] = useState<PlanDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  function getTime(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffInMs = end.getTime() - start.getTime();
    return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  }

  useEffect(() => {
    async function getData() {
      try {
        const [goalRes, planRes] = await Promise.all([
          axios.get(`${URL}/goals/${id}`, { withCredentials: true }),
          axios.get(`${URL}/planday/goal/${id}`, { withCredentials: true }),
        ]);
        setUserGoal(goalRes.data);
        // Sort by dayNumber ascending to guarantee order
        const sorted: PlanDay[] = [...planRes.data].sort(
          (a, b) => a.dayNumber - b.dayNumber
        );
        setPlanDays(sorted);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    }
    getData();
  }, [id]);

  // Derived values
  const completedCount = planDays.filter((d) => d.status === "completed").length;
  const overallProgress =
    planDays.length > 0 ? Math.round((completedCount / planDays.length) * 100) : 0;

  const PREVIEW_COUNT = 7;
  const visibleDays = showAll ? planDays : planDays.slice(0, PREVIEW_COUNT);
  const hiddenCount = planDays.length - PREVIEW_COUNT;

  async function deleteGoal(): Promise<void> {
    try {
      await axios.delete(`${URL}/goals/${id}`, { withCredentials: true });
      navigate("/main/goals");
    } catch (e) {
      console.log(e);
    }
  }

  if (loading)
    return (
      <div className="flex min-h-screen bg-[#0A0A0A] items-center justify-center">
        <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
      </div>
    );
  if (!userGoal)
    return (
      <div className="flex min-h-screen bg-[#0A0A0A] items-center justify-center text-white">
        Goal not found
      </div>
    );

  return (
    <div className="flex min-h-screen bg-[#0A0A0A]">
      <SideBar />

      <main className="flex-1 lg:ml-60">
        {/* Top Bar */}
        <div className="border-b border-[#2A2A2A] bg-[#0A0A0A] sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="text-[#6B7280] text-sm">
              <span
                className="cursor-pointer hover:text-white transition-colors"
                onClick={() => navigate("/main/goals")}
              >
                My Goals
              </span>
              <span className="mx-2">/</span>
              <span className="text-white truncate max-w-[140px] sm:max-w-xs inline-block align-bottom">
                {userGoal.title}
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={deleteGoal}
                className="px-3 sm:px-4 py-2 border border-red-500 text-red-500 rounded-lg text-sm font-medium hover:bg-red-500/10 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Delete</span>
              </button>
              <button className="px-3 sm:px-4 py-2 text-[#6B7280] hover:text-white transition-colors flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
              <div className="w-8 h-8 rounded-full bg-[#7C3AED] flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Goal Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#111111] border border-[#e0dede] rounded-xl p-5 sm:p-6 mb-8"
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-white text-xl sm:text-2xl font-bold mb-4">
                  {userGoal.description}
                </h1>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-[#1F1F1F] border border-[#2A2A2A] text-white/70 text-xs px-3 py-1.5 rounded-full">
                    {getTime(userGoal.startDate, userGoal.endDate)} Days
                  </span>
                  <span className="bg-[#1F1F1F] border border-[#2A2A2A] text-white/70 text-xs px-3 py-1.5 rounded-full">
                    {(userGoal.dailyTimeMinutes / 60).toFixed(2)} hrs / Day
                  </span>
                  <span className="bg-[#1F1F1F] border border-[#2A2A2A] text-white/70 text-xs px-3 py-1.5 rounded-full">
                    Start {formatDate(userGoal.startDate)}
                  </span>
                  <span className="bg-[#1F1F1F] border border-[#2A2A2A] text-white/70 text-xs px-3 py-1.5 rounded-full">
                    Ends {formatDate(userGoal.endDate)}
                  </span>
                </div>
              </div>

              {/* Progress Ring */}
              <div className="relative w-24 h-24 shrink-0">
                <svg className="w-24 h-24 -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="#2A2A2A" strokeWidth="8" fill="none" />
                  <motion.circle
                    initial={{ strokeDashoffset: 251 }}
                    animate={{ strokeDashoffset: 251 - (251 * overallProgress) / 100 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    cx="48" cy="48" r="40"
                    stroke="#7C3AED" strokeWidth="8" fill="none"
                    strokeDasharray="251" strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-white font-bold text-xl leading-none">{overallProgress}%</span>
                  <span className="text-[#6B7280] text-[9px] mt-0.5 tracking-wide">DONE</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Plan Days Section */}
          <div>
            {/* Section Header */}
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-[#6B7280] text-xs uppercase tracking-wider font-medium whitespace-nowrap">
                Daily Plan
              </h2>
              <div className="flex-1 h-px bg-[#2A2A2A]" />
              {planDays.length > 0 && (
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[#6B7280] text-xs tabular-nums">
                    {completedCount}/{planDays.length}
                  </span>
                  {completedCount === planDays.length && planDays.length > 0 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Circle className="w-4 h-4 text-[#3A3A3A]" />
                  )}
                </div>
              )}
            </div>

            {/* Empty state */}
            {planDays.length === 0 && (
              <div className="text-center py-16 text-[#4B5563] text-sm">
                No plan days found for this goal.
              </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {visibleDays.map((day, i) => (
                <PlanDayCard key={day._id} day={day} index={i} />
              ))}
            </div>

            {/* Show More / Show Less */}
            {planDays.length > PREVIEW_COUNT && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 flex justify-center"
                >
                  <button
                    onClick={() => setShowAll((prev) => !prev)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#111111] border border-[#2A2A2A] hover:border-violet-500/40 hover:bg-[#161616] text-[#6B7280] hover:text-violet-300 text-sm rounded-lg transition-all duration-200"
                  >
                    {showAll ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Show {hiddenCount} more day{hiddenCount !== 1 ? "s" : ""}
                      </>
                    )}
                  </button>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}