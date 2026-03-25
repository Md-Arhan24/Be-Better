import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Compass, ArrowRight, X, CalendarDays, ChevronLeft, ChevronRight, Sparkles, SlidersHorizontal } from "lucide-react";
import axios from 'axios';
import { URL } from "../../../api";
import * as Slider from "@radix-ui/react-slider";
import CustomPlanForm from "./CustomPlanForm";

interface CreatedGoal {
  _id: string;
  title: string;
  type: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  dailyTimeMinutes: number;
}

// ─── Mini Calendar Component ───────────────────────────────────────────────
function MiniCalendar({
  value,
  onChange,
  onClose,
  anchorRef,
}: {
  value: string;
  onChange: (date: string) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLDivElement>;
}) {
  const today = new Date();
  const initial = value ? new Date(value + "T00:00:00") : today;
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const calRef = useRef<HTMLDivElement>(null);

  const [openUp, setOpenUp] = useState(false);
  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUp(spaceBelow < 280);
    }
  }, [anchorRef]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        calRef.current && !calRef.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose, anchorRef]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const prevMonth = () => viewMonth === 0 ? (setViewMonth(11), setViewYear(y => y - 1)) : setViewMonth(m => m - 1);
  const nextMonth = () => viewMonth === 11 ? (setViewMonth(0), setViewYear(y => y + 1)) : setViewMonth(m => m + 1);

  const selectDay = (day: number) => {
    onChange(`${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
    onClose();
  };

  const isSelected = (day: number) => {
    if (!value) return false;
    const [y, m, d] = value.split("-").map(Number);
    return y === viewYear && m - 1 === viewMonth && d === day;
  };

  const isToday = (day: number) =>
    today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <motion.div
      ref={calRef}
      initial={{ opacity: 0, y: openUp ? 6 : -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: openUp ? 6 : -6, scale: 0.97 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="absolute z-50 bg-[#1C1C1C] border border-[#333333] rounded-xl shadow-2xl p-3 left-0 right-0"
      style={openUp ? { bottom: "calc(100% + 6px)" } : { top: "calc(100% + 6px)" }}
    >
      <div className="flex items-center justify-between mb-2.5">
        <button type="button" onClick={prevMonth}
          className="text-[#6B7280] hover:text-white p-1 rounded-md hover:bg-[#2A2A2A] transition-colors">
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <span className="text-white text-xs font-semibold tracking-wide">
          {monthNames[viewMonth]} {viewYear}
        </span>
        <button type="button" onClick={nextMonth}
          className="text-[#6B7280] hover:text-white p-1 rounded-md hover:bg-[#2A2A2A] transition-colors">
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-[#6B7280] text-[10px] font-medium py-0.5">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => (
          <div key={i} className="flex items-center justify-center">
            {day !== null ? (
              <button
                type="button"
                onClick={() => selectDay(day)}
                className={`w-7 h-7 rounded-lg text-xs font-medium transition-all
                  ${isSelected(day) ? "bg-[#7C3AED] text-white"
                    : isToday(day) ? "border border-[#7C3AED] text-[#7C3AED] hover:bg-[#7C3AED]/20"
                      : "text-[#9CA3AF] hover:bg-[#2A2A2A] hover:text-white"}`}
              >
                {day}
              </button>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-2 pt-2 border-t border-[#2A2A2A]">
        <button
          type="button"
          onClick={() => {
            const y = today.getFullYear(), m = String(today.getMonth() + 1).padStart(2, "0"), d = String(today.getDate()).padStart(2, "0");
            onChange(`${y}-${m}-${d}`); onClose();
          }}
          className="w-full text-center text-[#7C3AED] text-xs font-medium hover:text-white transition-colors py-0.5"
        >
          Today
        </button>
      </div>
    </motion.div>
  );
}

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};


// ─── Main Form ─────────────────────────────────────────────────────────────
export default function GoalCreationForm({ onSubmit, onCancel }: { onSubmit?: () => void; onCancel?: () => void }) {
  const [durationDays, setDurationDays] = useState<string>("");
  const [timeValue, setTimeValue] = useState([30]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(todayISO());
  const [visible, setVisible] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [goalType, setGoalType] = useState<"ai_generated" | "custom">("ai_generated");
  const dateAnchorRef = useRef<HTMLDivElement>(null);
  const [createdGoal, setCreatedGoal] = useState<CreatedGoal | null>(null);

  const formatDisplay = (iso: string) => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-").map(Number);
    return `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1]} ${d}, ${y}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    async function makeRequest() {
      try {
        const res = await axios.post(`${URL}/goals`,
          {
            title,
            description,
            type: goalType,
            durationDays: Number(durationDays),
            dailyTimeMinutes: timeValue[0],
            startDate
          },
          { withCredentials: true }
        );
        setCreatedGoal(res.data);
        setLoading(false);
        if (goalType === "ai_generated") {
          triggerClose(() => onSubmit?.()); // ✅ close immediately for AI type
        }
      } catch (e) {
        console.log(e);
        setLoading(false);
      }
    }

    makeRequest();
    setLoading(true);

  };

  const triggerClose = (callback?: () => void) => {
    setVisible(false);
    setTimeout(() => callback?.(), 300);
  };

  return (
    <div className="w-full flex  justify-center p-4 min-h-screen overflow-y-auto">
      <AnimatePresence>
        {visible && (
          <motion.div
            key="goal-form"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="w-full max-w-[680px] bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6 sm:p-8"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 text-[#6B7280] text-xs mb-2">
                  <Compass className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <span>New Roadmap</span>
                </div>
                <h1 className="text-white text-xl font-bold mb-0.5">What's your goal?</h1>
                <p className="text-[#6B7280] text-xs">We'll build a day-by-day plan tailored to you.</p>
              </div>
              <button
                type="button"
                onClick={() => triggerClose(() => onCancel?.())}
                className="text-[#6B7280] hover:text-white hover:bg-[#2A2A2A] rounded-lg p-1.5 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Goal Title */}
              <div>
                <label className="block text-white text-xs font-medium mb-1.5">Goal Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Learn Web Development"
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-white placeholder-[#6B7280] focus:outline-none focus:border-[#7C3AED] transition-colors text-sm"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-white text-xs font-medium mb-1.5">Describe your goal</label>
                <textarea
                  rows={2}
                  placeholder="What does success look like for you?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-white placeholder-[#6B7280] focus:outline-none focus:border-[#7C3AED] transition-colors resize-none text-sm"
                />
              </div>

              {/* ✅ Plan Type Selector */}
              <div>
                <label className="block text-white text-xs font-medium mb-2">Plan Type</label>
                <div className="grid grid-cols-2 gap-3">

                  {/* AI Generated */}
                  <button
                    type="button"
                    onClick={() => setGoalType("ai_generated")}
                    className={`flex items-start gap-3 p-4 rounded-xl border transition-all text-left ${goalType === "ai_generated"
                        ? "border-[#7C3AED] bg-[#7C3AED]/10"
                        : "border-[#2A2A2A] bg-[#0A0A0A] hover:border-[#7C3AED]/50"
                      }`}
                  >
                    <div className={`mt-0.5 p-1.5 rounded-lg ${goalType === "ai_generated" ? "bg-[#7C3AED]" : "bg-[#2A2A2A]"}`}>
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${goalType === "ai_generated" ? "text-white" : "text-[#9CA3AF]"}`}>
                        AI Generated
                      </p>
                      <p className="text-[#6B7280] text-xs mt-0.5 leading-relaxed">
                        Auto-built plan using AI
                      </p>
                    </div>
                  </button>

                  {/* Custom */}
                  <button
                    type="button"
                    onClick={() => setGoalType("custom")}
                    className={`flex items-start gap-3 p-4 rounded-xl border transition-all text-left ${goalType === "custom"
                        ? "border-[#7C3AED] bg-[#7C3AED]/10"
                        : "border-[#2A2A2A] bg-[#0A0A0A] hover:border-[#7C3AED]/50"
                      }`}
                  >
                    <div className={`mt-0.5 p-1.5 rounded-lg ${goalType === "custom" ? "bg-[#7C3AED]" : "bg-[#2A2A2A]"}`}>
                      <SlidersHorizontal className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${goalType === "custom" ? "text-white" : "text-[#9CA3AF]"}`}>
                        Custom
                      </p>
                      <p className="text-[#6B7280] text-xs mt-0.5 leading-relaxed">
                        Paste your own LLM plan
                      </p>
                    </div>
                  </button>

                </div>

                {/* ✅ Hint text based on selected type */}
                <AnimatePresence mode="wait">
                  {goalType === "custom" && (
                    <motion.p
                      key="custom-hint"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-[#6B7280] text-xs mt-2 pl-1"
                    >
                      After creating, you'll get a prompt to paste into ChatGPT / Gemini and paste the response back.
                    </motion.p>
                  )}
                  {goalType === "ai_generated" && (
                    <motion.p
                      key="ai-hint"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-[#6B7280] text-xs mt-2 pl-1"
                    >
                      We'll automatically generate a structured day-by-day plan for you.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Duration + Daily Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Duration */}
                <div>
                  <label className="block text-white text-xs font-medium mb-1.5">Duration</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      value={durationDays}
                      onChange={(e) => setDurationDays(e.target.value)}
                      placeholder="e.g. 30, 90..."
                      className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 pr-12 text-white placeholder-[#6B7280] focus:outline-none focus:border-[#7C3AED] transition-colors text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] text-xs pointer-events-none">days</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[7, 30, 60, 90].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDurationDays(String(d))}
                        className={`flex-1 py-1 rounded-lg text-xs font-medium transition-all border ${durationDays === String(d)
                            ? "bg-[#7C3AED] text-white border-[#7C3AED]"
                            : "bg-[#0A0A0A] text-[#6B7280] border-[#2A2A2A] hover:border-[#7C3AED] hover:text-white"
                          }`}
                      >
                        {d}d
                      </button>
                    ))}
                  </div>
                </div>

                {/* Daily Time */}
                <div>
                  <label className="block text-white text-xs font-medium mb-1.5">Daily time</label>
                  <div className="flex justify-center mb-3">
                    <span className="bg-[#7C3AED] text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {timeValue[0]} min / day
                    </span>
                  </div>
                  <Slider.Root
                    value={timeValue}
                    onValueChange={setTimeValue}
                    min={30} max={480} step={30}
                    className="relative flex items-center w-full h-5"
                  >
                    <Slider.Track className="relative h-1 bg-[#2A2A2A] flex-1 rounded-full">
                      <Slider.Range className="absolute h-full bg-[#7C3AED] rounded-full" />
                    </Slider.Track>
                    <Slider.Thumb className="block w-4 h-4 bg-white rounded-full shadow-md hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-[#7C3AED]" />
                  </Slider.Root>
                  <div className="flex justify-between text-[11px] text-[#6B7280] mt-1.5">
                    <span>30 min</span>
                    <span>480 min</span>
                  </div>
                </div>

              </div>

              {/* Start Date */}
              <div>
                <label className="block text-white text-xs font-medium mb-1.5">Start Date</label>
                <div ref={dateAnchorRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCalendar((v) => !v)}
                    className={`w-full bg-[#0A0A0A] border rounded-xl px-4 py-2.5 text-left flex items-center justify-between transition-colors text-sm ${showCalendar ? "border-[#7C3AED]" : "border-[#2A2A2A] hover:border-[#7C3AED]"
                      }`}
                  >
                    <span className={startDate ? "text-white" : "text-[#6B7280]"}>
                      {startDate ? formatDisplay(startDate) : "Pick a start date"}
                    </span>
                    <CalendarDays className={`w-4 h-4 flex-shrink-0 transition-colors ${showCalendar ? "text-[#7C3AED]" : "text-[#6B7280]"}`} />
                  </button>

                  <AnimatePresence>
                    {showCalendar && (
                      <MiniCalendar
                        value={startDate}
                        onChange={(d) => setStartDate(d)}
                        onClose={() => setShowCalendar(false)}
                        anchorRef={dateAnchorRef}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Cancel + Submit */}
              {!loading ? (
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => triggerClose(() => onCancel?.())}
                    className="flex-1 border border-[#2A2A2A] text-[#6B7280] hover:border-[#7C3AED] hover:text-white font-medium py-2.5 rounded-xl transition-all text-sm"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(124, 58, 237, 0.5)" }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-[2] bg-[#7C3AED] text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all text-sm"
                  >
                    Generate My Roadmap
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-3">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-white text-sm">
                    Building your roadmap...
                  </motion.div>
                  <div className="w-full h-9 bg-[#2A2A2A] rounded-lg overflow-hidden relative">
                    <motion.div
                      initial={{ x: "-100%" }} animate={{ x: "100%" }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      className="h-full w-1/3 bg-gradient-to-r from-transparent via-[#7C3AED] to-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }} animate={{ opacity: [0, 0.5, 0] }}
                        transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                        className="h-3 bg-[#1A1A1A] rounded"
                      />
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[#4B5563] text-[10px] text-center">
                Powered by AI · Usually takes 5–10 seconds
              </p>
            </form>
          </motion.div>
        )}

        {/* ✅ CustomPlanForm appears after goal is created with custom type */}
        {createdGoal && createdGoal.type === "custom" && (
          <motion.div
            key="custom-plan-form"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-[680px]"
          >
            <CustomPlanForm
              goalId={createdGoal._id}
              goalTitle={createdGoal.title}
              startDate={createdGoal.startDate}
              endDate={createdGoal.endDate}
              durationDays={createdGoal.durationDays}
              dailyTimeMinutes={createdGoal.dailyTimeMinutes}
              onSaved={() => {
                setCreatedGoal(null);
                triggerClose(() => onSubmit?.());
              }}
            />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}