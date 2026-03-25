import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";

import {
  ChevronLeft,
  ChevronRight,
  X,
  Target,
  Clock,
  TrendingUp,
  Plus,
  Loader2,
  CheckCircle2,
  Circle,
} from "lucide-react";
import SideBar from "./SideBar";
import GoalCreationForm from "./GoalCreation";
import axios from "axios";
import { URL } from "../../../api";
import * as Checkbox from "@radix-ui/react-checkbox";

// ─── Types matching your backend models ───────────────────────────────────────

interface Goal {
  _id: string;
  title: string;
  description: string;
  type: string;
  status: "active" | "paused" | "completed";
  dailyTimeMinutes: number;
  startDate: string;
  endDate: string;
  durationDays: number;
}

interface Resource {
  type: "video" | "article" | "exercise" | "custom";
  title: string;
  url: string;
}

interface PlanDay {
  _id: string;
  goalId: string;
  userId: string;
  date: string;
  dayNumber: number;
  title: string;
  description: string;
  resources: Resource[];
  estimatedMinutes: number;
  status: "pending" | "completed" | "skipped";
  completedAt: string | null;
  notes: string;
}

// ─── API helpers ──────────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: URL,
  withCredentials: true,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildCalendarMap(planDays: PlanDay[]): Record<number, PlanDay[]> {
  const map: Record<number, PlanDay[]> = {};
  planDays.forEach((pd) => {
    const day = new Date(pd.date).getUTCDate(); // ✅ always UTC
    if (!map[day]) map[day] = [];
    map[day].push(pd);
  });
  return map;
}


function isOverdue(dateStr: string, status: string): boolean {
  return new Date(dateStr) < new Date() && status === "pending";
}

function getGoalsForMonth(goals: Goal[], year: number, month: number): Goal[] {
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);
  return goals.filter((g) => {
    const start = new Date(g.startDate + "T00:00:00"); // ✅ prevents timezone shift
    const end = new Date(g.endDate + "T00:00:00");
    return start <= monthEnd && end >= monthStart;
  });
}

//format date
function formatDate(isoDate: string): string {
  const date = new Date(isoDate);

  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = String(date.getUTCFullYear()).slice(2); // last 2 digits

  return `${day}-${month}-${year}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CalendarView() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [planDays, setPlanDays] = useState<PlanDay[]>([]);
  const [selectedPlanDays, setSelectedPlanDays] = useState<PlanDay[] | null>(
    null,
  );
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [loading, setLoading] = useState(true);
  const [planLoading, setPlanLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null); // goalId being updated

  const [currentDate, setCurrentDate] = useState(new Date());
  const currentMonth = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const navigate = useNavigate();

  const [createGoal, setCreateGaol] = useState(false);

  // ── Fetch goals on mount ──
  // 1️⃣ fetchGoals — inside useEffect
  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/goals");
      const goalsArray: Goal[] = Array.isArray(data)
        ? data
        : Array.isArray(data.goals)
          ? data.goals
          : [];
      setGoals(goalsArray);

      function getMonthGoals(obj: Goal[]) {
        const now = new Date();
        const startDateOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endDateOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        return obj.filter((e) => {
          const startDate = new Date(e.startDate);
          return startDate >= startDateOfMonth && startDate <= endDateOfMonth;
        });

      }
      const thisMonthGaol = getMonthGoals(goalsArray);

      setGoals(thisMonthGaol);
      const active = goalsArray.find((g) => g.status === "active") ?? goalsArray[0] ?? null;
      setSelectedGoal(active);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []); // ← empty deps because api is stable (defined outside component)

  
  // Then update useEffect
  useEffect(() => { fetchGoals(); }, [fetchGoals]);
  // 2️⃣ fetchPlan — inside second useEffect
  useEffect(() => {
    const fetchMonthPlan = async () => {
      try {
        setPlanLoading(true);
        const { data } = await api.get(
          `/planday/month?year=${year}&month=${month + 1}`
        );
        setPlanDays(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setPlanLoading(false);
      }
    };
    fetchMonthPlan();
    window.addEventListener("focus", fetchMonthPlan);
    return () => window.removeEventListener("focus", fetchMonthPlan);
  }, [year, month]); // ← re-fetches when user navigates months

  // ── Mark a plan day complete ──
  // 3️⃣ markComplete
  const markComplete = async (planDayId: string) => {
    try {
      const { data: updated } = await api.patch(
        `/planday/${planDayId}/complete`,
      );
      setPlanDays((prev) =>
        prev.map((pd) => (pd._id === updated._id ? updated : pd)),
      );
      setSelectedPlanDays((prev) =>
        prev ? prev.map((pd) => (pd._id === updated._id ? updated : pd)) : prev,
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleGoalStatus = async (goal: Goal) => {
    const newStatus = goal.status === "completed" ? "active" : "completed";
    setStatusUpdating(goal._id);
    try {
      const { data: updated } = await api.patch(`/goals/${goal._id}/status`, {
        status: newStatus,
      });
      setGoals((prev) =>
        prev.map((g) => (g._id === updated._id ? updated : g)),
      );
      if (selectedGoal?._id === goal._id) setSelectedGoal(updated);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setStatusUpdating(null);
    }
  };

  // ── Calendar grid ──
  const daysOfWeek = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startOffset = (firstDayOfMonth + 6) % 7;

  const calendarMap = buildCalendarMap(planDays);
  const monthGoals = getGoalsForMonth(goals, year, month);




  // Stats
  const activeGoalsCount = goals.filter((g) => g.status === "active").length;
  const completedDays = planDays.filter(
    (pd) => pd.status === "completed",
  ).length;
  const progress =
    planDays.length > 0
      ? Math.round((completedDays / planDays.length) * 100)
      : 0;
  const today = new Date();
  const endDate = selectedGoal ? new Date(selectedGoal.endDate) : null;
  const daysLeft = endDate
    ? Math.max(
      0,
      Math.ceil(
        (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      ),
    )
    : 0;

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleDayClick = (day: number) => {
    const dayPlans = calendarMap[day] ?? [];

    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    if (dayPlans.length === 0) {
      // Still navigate but DailyFocus will show "no plans"
      navigate(`/main/progress?date=${dateStr}`);
      return;
    }

    navigate(`/main/progress?date=${dateStr}`);
  };

  const completedInDrawer =
    selectedPlanDays?.filter((pd) => pd.status === "completed").length ?? 0;
  const allDoneInDrawer =
    selectedPlanDays?.every((pd) => pd.status === "completed") ?? false;

  const GOAL_COLORS = ["#7C3AED", "#3B82F6", "#F97316", "#EC4899", "#14B8A6"];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#0A0A0A] items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#7C3AED] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0A0A0A]">
      <SideBar />

      <main className="flex-1 lg:ml-60">
        {/* Top Bar */}
        <div className="border-b border-[#2A2A2A] bg-[#0A0A0A] sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrevMonth}
                className="text-[#6B7280] hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h1 className="text-white text-xl sm:text-2xl font-bold">
                {currentMonth}
              </h1>
              <button
                onClick={handleNextMonth}
                className="text-[#6B7280] hover:text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex bg-[#1A1A1A] rounded-lg p-1">
              {(["month", "week", "day"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${view === v
                    ? "bg-white text-black"
                    : "text-[#6B7280] hover:text-white"
                    }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-4 sm:p-6 flex items-center gap-4">
                <Target className="w-6 h-6 text-[#7C3AED] flex-shrink-0" />
                <div>
                  <div className="text-white text-2xl sm:text-3xl font-bold">
                    {activeGoalsCount}
                  </div>
                  <div className="text-[#6B7280] text-xs sm:text-sm">
                    Active Goals
                  </div>
                </div>
              </div>
              <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-4 sm:p-6 flex items-center gap-4">
                <Clock className="w-6 h-6 text-[#EAB308] flex-shrink-0" />
                <div>
                  <div className="text-white text-2xl sm:text-3xl font-bold">
                    {daysLeft}
                  </div>
                  <div className="text-[#6B7280] text-xs sm:text-sm">
                    Remaining Days
                  </div>
                </div>
              </div>
              <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-4 sm:p-6 flex items-center gap-4">
                <TrendingUp className="w-6 h-6 text-[#22C55E] flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-white text-2xl sm:text-3xl font-bold">
                    {progress}%
                  </div>
                  <div className="text-[#6B7280] text-xs sm:text-sm mb-2">
                    Overall Progress
                  </div>
                  <div className="w-full h-1 bg-[#2A2A2A] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-[#22C55E] rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── GOALS THIS MONTH SECTION ── */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-[#6B7280] text-xs uppercase tracking-wider font-semibold">
                    Goals This Month
                  </h2>
                  <span className="bg-[#1F1F1F] border border-[#2A2A2A] text-[#6B7280] text-xs px-2 py-0.5 rounded-full">
                    {goals.length}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setCreateGaol(true);
                  }}
                  className="border border-[#2A2A2A] text-[#6B7280] hover:border-[#7C3AED] hover:text-white transition-colors rounded-md px-3 py-1 text-xs flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Goal
                </button>
              </div>
              {/*----------*/}
              {createGoal && (
                <div
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-6 overflow-y-auto"
                  onClick={() => setCreateGaol(false)} // click backdrop to close
                >
                  <div onClick={(e) => e.stopPropagation()}>
                    {" "}
                    {/* prevent close when clicking form */}
                    <GoalCreationForm
                      onSubmit={() => {
                        setCreateGaol(false);
                        fetchGoals();
                      }} // ✅ re-fetch after create
                      onCancel={() => setCreateGaol(false)}
                    />
                  </div>
                </div>
              )}

              {goals.length === 0 ? (
                <div className="bg-[#111111] border border-[#2A2A2A] border-dashed rounded-xl p-6 text-center">
                  <p className="text-[#3A3A3A] text-sm">
                    No goals scheduled for{" "}
                    {currentDate.toLocaleString("default", { month: "long" })}
                  </p>
                </div>
              ) : (
                <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl overflow-hidden">
                  {goals.map((goal, index) => {
                    const color = GOAL_COLORS[index % GOAL_COLORS.length];
                    const isCompleted = goal.status === "completed";
                    const isUpdating = statusUpdating === goal._id;


                    return (
                      <motion.div
                        key={goal._id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center gap-4 px-4 py-3.5 transition-colors ${index !== monthGoals.length - 1
                          ? "border-b border-[#1A1A1A]"
                          : ""
                          } ${isCompleted ? "opacity-60" : "hover:bg-[#161616]"}`}
                      >
                        {/* Checkbox */}
                        <button
                          onClick={() => !isUpdating && toggleGoalStatus(goal)}
                          disabled={isUpdating}
                          className="flex-shrink-0 focus:outline-none"
                          aria-label={
                            isCompleted ? "Mark as active" : "Mark as completed"
                          }
                        >
                          {isUpdating ? (
                            <Loader2
                              className="w-5 h-5 animate-spin"
                              style={{ color }}
                            />
                          ) : isCompleted ? (
                            <CheckCircle2
                              className="w-5 h-5"
                              style={{ color: "#22C55E" }}
                            />
                          ) : (
                            <Circle className="w-5 h-5 text-[#3A3A3A] hover:text-white transition-colors" />
                          )}
                        </button>

                        {/* Color dot */}
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: color }}
                        />

                        {/* Goal info */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium truncate ${isCompleted ? "line-through text-[#6B7280]" : "text-white"}`}
                          >
                            {goal.title}
                          </p>
                          <p className="text-[#6B7280] text-xs mt-0.5 truncate">
                            {goal.description}
                          </p>
                        </div>

                        {/* Meta */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="hidden sm:block text-[#6B7280] text-xs whitespace-nowrap">
                            {formatDate(goal.startDate)} → {formatDate(goal.endDate)}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${isCompleted
                              ? "bg-[#22C55E]/10 text-[#22C55E]"
                              : goal.status === "paused"
                                ? "bg-[#EAB308]/10 text-[#EAB308]"
                                : "bg-[#7C3AED]/10 text-[#7C3AED]"
                              }`}
                          >
                            {goal.status}
                          </span>
                          <span className="hidden md:block text-[#6B7280] text-xs whitespace-nowrap">
                            {goal.dailyTimeMinutes} min/day
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
            {/* ── END GOALS THIS MONTH ── */}

            {/* Goal Cards (calendar switcher) */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[#6B7280] text-xs uppercase tracking-wider font-semibold">
                  View By Goal
                </h2>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {goals.map((goal, index) => {
                  const isSelected = selectedGoal?._id === goal._id;
                  const goalColor = GOAL_COLORS[index % GOAL_COLORS.length];
                  return (
                    <motion.div
                      key={goal._id}
                      onClick={() => setSelectedGoal(goal)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ y: -2, borderColor: goalColor }}
                      className={`min-w-[220px] bg-[#111111] border rounded-xl p-4 cursor-pointer flex-shrink-0 transition-all ${isSelected
                        ? "border-[#7C3AED] bg-[#13101A]"
                        : "border-[#2A2A2A]"
                        }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 flex-1">
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: goalColor }}
                          />
                          <h3 className="text-white text-sm font-semibold truncate">
                            {goal.title}
                          </h3>
                        </div>
                        {goal.status === "active" && (
                          <span className="bg-[#2D1B69] text-[#A78BFA] text-xs px-2 py-0.5 rounded-full whitespace-nowrap ml-2">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-[#6B7280] text-xs mb-2">
                        {goal.durationDays} day plan
                      </div>
                      <div className="w-full h-1 bg-[#2A2A2A] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            backgroundColor: goalColor,
                            width: `${progress}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[#6B7280] text-xs mt-1">
                        <span>{progress}% complete</span>
                        <span>{goal.dailyTimeMinutes} min/day</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="h-px bg-[#2A2A2A] my-6" />
          </motion.div>

          {/* Days Header */}
          <div className="grid grid-cols-7 gap-2 mb-2 pb-2 border-b border-[#2A2A2A]">
            {daysOfWeek.map((d) => (
              <div
                key={d}
                className="text-[#6B7280] text-xs uppercase text-center font-medium"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          {planLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-6 h-6 text-[#7C3AED] animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: startOffset }).map((_, i) => (
                <div key={`offset-${i}`} className="min-h-[110px]" />
              ))}

              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                (day) => {
                  const dayPlans = calendarMap[day] ?? [];
                  const allCompleted =
                    dayPlans.length > 0 &&
                    dayPlans.every((pd) => pd.status === "completed");
                
                  const hasOverdue = dayPlans.some((pd) =>
                    isOverdue(pd.date, pd.status),
                  );
                  const hasPlan = dayPlans.length > 0;
                  const todayDay = new Date(year, month, day);
                  const isTodayCell =
                    todayDay.getDate() === today.getDate() &&
                    todayDay.getMonth() === today.getMonth() &&
                    todayDay.getFullYear() === today.getFullYear();

                  return (
                    <motion.div
                      key={day}
                      whileHover={{ scale: 1.02, boxShadow: "0 4px 20px rgba(124,58,237,0.15)", borderColor: "#7C3AED" }}
                      onClick={() => handleDayClick(day)}
                     className="min-h-[110px] rounded-lg border border-[#2A2A2A] bg-[#111111] p-2 sm:p-3 transition-all relative cursor-pointer"
                    >
                      {allCompleted && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 0.5, scale: 1 }}
                          className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        >
                          <span className="text-[#8e1616] text-5xl font-black">
                            X
                          </span>
                        </motion.div>
                      )}

                      <div className="relative z-10 mb-2">
                        {isTodayCell ? (
                          <div className="inline-flex items-center justify-center w-6 h-6 bg-[#7C3AED] rounded-full">
                            <span className="text-white text-sm font-medium">
                              {day}
                            </span>
                          </div>
                        ) : (
                          <span
                            className={`text-sm font-medium ${hasOverdue ? "text-[#EF4444]" : "text-white"}`}
                          >
                            {day}
                          </span>
                        )}
                        {allCompleted && (
                          <span className="ml-1 inline-block w-1.5 h-1.5 bg-[#EF4444] rounded-full" />
                        )}
                      </div>

                   
                    </motion.div>
                  );
                },
              )}
            </div>
          )}
        </div>
      </main>

      {/* Day Drawer */}
      <AnimatePresence>
        {selectedPlanDays && selectedDate && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPlanDays(null)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[400px] bg-[#111111] border-l border-[#2A2A2A] z-50 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-white text-lg font-bold mb-1">
                      {new Date(year, month, selectedDate).toLocaleDateString(
                        "default",
                        {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </h2>
                    <p className="text-[#6B7280] text-sm">
                      {selectedPlanDays.length} tasks · {completedInDrawer}{" "}
                      completed
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedPlanDays(null)}
                    className="text-[#6B7280] hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="h-px bg-[#2A2A2A] mb-6" />

                <div className="space-y-3">
                  {selectedPlanDays.map((pd) => (
                    <motion.div
                      key={pd._id}
                      layout
                      className={`p-4 rounded-lg border transition-all ${pd.status === "completed"
                        ? "bg-[#0F1A0F] border-[#166534]"
                        : "bg-[#0D0D0D] border-[#2A2A2A]"
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox.Root
                          checked={pd.status === "completed"}
                          onCheckedChange={() => {
                            if (pd.status !== "completed") markComplete(pd._id);
                          }}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 mt-0.5 ${pd.status === "completed"
                            ? "bg-[#22C55E] border-[#22C55E]"
                            : "border-[#2A2A2A] hover:border-[#7C3AED]"
                            }`}
                        >
                          <Checkbox.Indicator>
                            <motion.svg
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-3 h-3 text-white"
                              viewBox="0 0 12 12"
                            >
                              <path
                                d="M2 6l3 3 5-6"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="none"
                              />
                            </motion.svg>
                          </Checkbox.Indicator>
                        </Checkbox.Root>

                        <div className="flex-1">
                          <h3
                            className={`text-white text-sm font-medium mb-1 ${pd.status === "completed" ? "line-through text-[#6B7280]" : ""}`}
                          >
                            {pd.title}
                          </h3>
                          {pd.description && (
                            <p className="text-[#6B7280] text-xs mb-2">
                              {pd.description}
                            </p>
                          )}
                          <div className="flex gap-2 flex-wrap">
                            {pd.estimatedMinutes && (
                              <span className="text-[#6B7280] text-xs">
                                {pd.estimatedMinutes} min
                              </span>
                            )}
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${pd.status === "completed"
                                ? "bg-[#22C55E]/20 text-[#22C55E]"
                                : "bg-[#7C3AED]/20 text-[#7C3AED]"
                                }`}
                            >
                              Day {pd.dayNumber}
                            </span>
                          </div>

                          {pd.resources?.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {pd.resources.map((r, i) => (
                                <a
                                  key={i}
                                  href={r.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1 text-xs text-[#7C3AED] hover:underline"
                                >
                                  📎 {r.title}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {allDoneInDrawer && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-[#0F1A0F] border border-[#22C55E] rounded-lg text-center"
                  >
                    <span className="text-[#22C55E] font-medium">
                      All done! 🎯
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
