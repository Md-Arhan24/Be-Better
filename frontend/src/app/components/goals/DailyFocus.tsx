import { useState, useEffect } from "react";
import { motion } from "motion/react";
import SideBar from "./SideBar";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import axios from "axios";
import { URL } from "../../../api";
import Expand from "./Expand";
import { useSearchParams } from "react-router-dom";
import { useStreak } from "./useStreak";


interface Task {
  id: string;
  goalId: string;
  goalTitle: string;
  title: string;
  description: string;
  duration: string;
  type: string;
  completed: boolean;
}

interface CustomTask {
  id: string;
  title: string;
  completed: boolean;
}

interface GoalWithActions {
  goalId: string;
  goalTitle: string;
  dailyActions: any[];
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DailyFocusView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [username, setUsername] = useState();
  const [customTasks, setCustomTasks] = useState<CustomTask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task & { planDay?: any } | null>(null);
  const [planDayMap, setPlanDayMap] = useState<Record<string, any>>({});
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get("date");
  const [noPlan, setNoPlan] = useState(false);
  const { streak, loading, updateStreak } = useStreak();

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const toggleTask = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const addCustomTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: CustomTask = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      completed: false,
    };
    setCustomTasks([...customTasks, newTask]);
    setNewTaskTitle("");
  };

  const toggleCustomTask = (id: string) => {
    setCustomTasks(
      customTasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteCustomTask = (id: string) => {
    setCustomTasks(customTasks.filter((t) => t.id !== id));
  };

  useEffect(() => {
    const token = Cookies.get("token");
    const decode = jwtDecode(token);
    const name = decode.username;
    setUsername(name);

    async function getRes() {
      try {
        const goalsRes = await axios.get(`${URL}/goals`, {
          withCredentials: true,
        });

        if (!goalsRes.data || goalsRes.data.length === 0) {
          console.log("No goals found");
          setTasks([]);
          return;
        }

        const goalIds = goalsRes.data.map((goal: any) => goal._id);

        const dailyActionsRes = await Promise.allSettled(
          goalIds.map((id: string) =>
            axios.get(`${URL}/planday/goal/${id}`, { withCredentials: true })
          )
        );

        const goalWithActions = goalIds.map((id: string, index: number) => {
          const result = dailyActionsRes[index];
          return {
            goalId: id,
            goalTitle: goalsRes.data[index].title,
            dailyActions:
              result.status === "fulfilled" ? result.value.data : [],
          };
        });

        const today = dateParam ? new Date(dateParam + "T00:00:00") : new Date();
        today.setHours(0, 0, 0, 0);

        const todayTasks = goalWithActions.flatMap((goal: GoalWithActions) =>
          goal.dailyActions
            .filter((action: any) => {
              const actionDate = new Date(action.date);
              actionDate.setHours(0, 0, 0, 0);
              return actionDate.getTime() === today.getTime();
            })
            .map((action: any) => ({
              id: action._id,
              goalId: goal.goalId,
              goalTitle: goal.goalTitle,
              title: action.title,
              description: action.description,
              duration: `${action.estimatedMinutes} min`,
              type: action.type || "Learning",
              completed: action.status === "completed",
            }))
        );


        const dayMap: Record<string, any> = {};
        goalWithActions.forEach((goal: GoalWithActions) => {
          goal.dailyActions.forEach((action: any) => {
            dayMap[action._id] = { ...action, goalTitle: goal.goalTitle };
          });
        });
        setPlanDayMap(dayMap);
        if (todayTasks.length === 0 && dateParam) {
          setNoPlan(true);
        }
        setTasks(todayTasks);
      } catch (err) {
        console.error("Failed to fetch goals or actions:", err);
      }
    }

    getRes();
  }, [dateParam]);

  //completeTasl
  const markTaskComplete = async (taskId: string) => {
    try {
      await axios.patch(
        `${URL}/planday/${taskId}/complete`,
        {},
        { withCredentials: true }
      );
      // update local state only after successful API call
      setTasks(prev =>
        prev.map(t => t.id === taskId ? { ...t, completed: true } : t)
      );
      await updateStreak();
    } catch (err) {
      console.error("Failed to mark complete:", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0A0A0A]">
      <SideBar />

      <main className="flex-1 lg:ml-60">
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-2xl">
            {/* Greeting */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className="text-white text-2xl sm:text-3xl font-bold mb-2">
                {getGreeting()}, {username} 👋
              </h1>
              <p className="text-[#6B7280]">
                Here's your plan for{" "}
                {dateParam ? new Date(dateParam + "T00:00:00")
                  .toLocaleDateString("en-US", { weekday: "short", day: "numeric" })
                  : `today — ${new Date().toLocaleDateString("en-US", { day: "numeric", weekday: "short" })}`
                }
              </p>
            </motion.div>

            {/* Progress Ring */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-12"
            >
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#2A2A2A"
                    strokeWidth="10"
                    fill="none"
                  />
                  <motion.circle
                    initial={{ strokeDashoffset: 352 }}
                    animate={{
                      strokeDashoffset: 352 - (352 * progress) / 100,
                    }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#7C3AED"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray="352"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {completedCount} / {totalCount}
                  </span>
                  <span className="text-[#6B7280] text-xs">tasks done</span>
                </div>
              </div>
            </motion.div>

            {/* Task Cards */}
            <div className="space-y-4 mb-8">
              {tasks.length === 0 ? (
                <div className="text-center text-[#6B7280] py-10">
                  {noPlan
                    ? "📭 No more plans for this day"
                    : "🎉 No tasks for today"}
                </div>
              ) : (
                tasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    onClick={() => setSelectedTask({ ...task, planDay: planDayMap[task.id] })}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className={`bg-[#111111] border border-[#2A2A2A] rounded-xl p-4 sm:p-5 relative transition-all ${task.completed ? "opacity-70" : ""
                      }`}
                  >
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${task.completed ? "bg-[#22C55E]" : "bg-[#7C3AED]"
                        }`}
                    />
                    <div className="pl-4">
                      <p className="text-[#7C3AED] text-xs mb-1">
                        {task.goalTitle}
                      </p>
                      <h3
                        className={`text-white font-bold mb-1 ${task.completed ? "line-through text-[#6B7280]" : ""
                          }`}
                      >
                        {task.title}
                      </h3>
                      <p className="text-[#6B7280] text-sm mb-4">
                        {task.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[#6B7280] text-xs">
                          {task.duration}
                        </span>
                        <span className="bg-[#1F1F1F] border border-[#2A2A2A] text-white/70 text-xs px-3 py-1 rounded-full">
                          {task.type}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation(); // prevent opening Expand drawer
                            if (!task.completed) markTaskComplete(task.id);
                          }}
                          className={`ml-auto px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${task.completed
                            ? "bg-[#22C55E] text-white cursor-default"        // ✅ done
                            : "border border-white text-white hover:bg-white/10 cursor-pointer"
                            }`}
                          disabled={task.completed}
                        >
                          {task.completed ? "✓ Completed" : "Mark Complete"}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* ✅ Custom Tasks Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-5 mb-8"
            >
              <h2 className="text-white font-bold text-base mb-4">
                ➕ Extra Tasks
              </h2>

              {/* Custom Task List */}
              <div className="space-y-3 mb-4">
                {customTasks.length === 0 ? (
                  <p className="text-[#6B7280] text-sm">
                    No extra tasks yet. Add something you've done!
                  </p>
                ) : (
                  customTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3"
                    >
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleCustomTask(task.id)}
                        className="w-4 h-4 accent-[#7C3AED] cursor-pointer"
                      />
                      <span
                        className={`flex-1 text-sm ${task.completed
                          ? "line-through text-[#6B7280]"
                          : "text-white"
                          }`}
                      >
                        {task.title}
                      </span>
                      {/* Delete */}
                      <button
                        onClick={() => deleteCustomTask(task.id)}
                        className="text-[#6B7280] hover:text-red-400 text-xs transition-colors"
                      >
                        ✕
                      </button>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Add Task Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustomTask()}
                  placeholder="Add a task..."
                  className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-[#7C3AED] placeholder-[#4B5563] transition-colors"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addCustomTask}
                  className="bg-[#7C3AED] text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-[#6D28D9] transition-colors"
                >
                  Add
                </motion.button>
              </div>
            </motion.div>

            {/* Streak Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-gradient-to-r from-[#1A0A2E] to-[#0A0A1E] border border-[#3B1D8A] rounded-xl p-6 text-center"
            >
              <div className="text-white font-bold text-lg mb-1">
                🔥 {loading ? "..." : `${streak?.current ?? 0} Day Streak`} — Keep it up!
              </div>
              <p className="text-[#6B7280] text-xs">
                Longest streak: {streak?.longest ?? 0} days
              </p>
            </motion.div>
          </div>
        </div>
        <Expand
          task={selectedTask?.planDay ?? null}
          goalTitle={selectedTask?.goalTitle ?? ""}
          onClose={() => setSelectedTask(null)}
          onMarkComplete={(id) => {
            markTaskComplete(id);
          }}
        />
      </main>
    </div>
  );
}