import { motion, AnimatePresence } from "motion/react";
import { X, Clock, Calendar, ExternalLink, Youtube, Globe, BookOpen, Video } from "lucide-react";

interface Resource {
  _id: string;
  type: string;
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

interface ExpandProps {
  task: PlanDay | null;
  goalTitle: string;
  onClose: () => void;
  onMarkComplete: (id: string) => void;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

function isYouTube(url: string): boolean {
  return /youtube\.com|youtu\.be/.test(url);
}

function ResourceCard({ resource }: { resource: Resource }) {
  const ytId = isYouTube(resource.url) ? getYouTubeId(resource.url) : null;

  if (ytId) {
    return (
      <div className="rounded-xl overflow-hidden border border-[#2A2A2A]">
        <div className="bg-[#1A1A1A] px-3 py-2 flex items-center gap-2 border-b border-[#2A2A2A]">
          <Youtube className="w-3.5 h-3.5 text-red-500" />
          <span className="text-white/70 text-xs truncate">{resource.title}</span>
        </div>
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            src={`https://www.youtube.com/embed/${ytId}`}
            title={resource.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      </div>
    );
  }

  // Link preview card for articles / websites
  const icon =
    resource.type === "video" ? (
      <Video className="w-4 h-4 text-violet-400" />
    ) : resource.type === "article" ? (
      <BookOpen className="w-4 h-4 text-blue-400" />
    ) : (
      <Globe className="w-4 h-4 text-emerald-400" />
    );

  const hostname = (() => {
    try {
      return new URL(resource.url).hostname.replace("www.", "");
    } catch {
      return resource.url;
    }
  })();

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl hover:border-violet-500/40 hover:bg-[#1F1F1F] transition-all group"
    >
      <div className="w-9 h-9 rounded-lg bg-[#252525] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate group-hover:text-violet-300 transition-colors">
          {resource.title}
        </p>
        <p className="text-[#6B7280] text-xs mt-0.5 truncate">{hostname}</p>
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-[#6B7280] shrink-0 group-hover:text-violet-400 transition-colors" />
    </a>
  );
}

const STATUS_MAP = {
  completed: { label: "Completed", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  "in-progress": { label: "In Progress", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
  pending: { label: "Pending", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
};

export default function Expand({ task, goalTitle, onClose, onMarkComplete }: ExpandProps) {
  if (!task) return null;

  const status = STATUS_MAP[task.status];
  const formattedDate = new Date(task.date).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <AnimatePresence>
      {task && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 lg:left-60"
          >
            <div className="bg-[#111111] border border-[#2A2A2A] border-b-0 rounded-t-2xl max-h-[85vh] flex flex-col">

              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 rounded-full bg-[#3A3A3A]" />
              </div>

              {/* Header */}
              <div className="flex items-start justify-between px-5 pt-2 pb-4 border-b border-[#2A2A2A] shrink-0">
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-violet-400 text-xs font-semibold uppercase tracking-wider mb-1">
                    {goalTitle}
                  </p>
                  <h2 className="text-white text-lg font-bold leading-snug">
                    {task.title}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-[#1F1F1F] border border-[#2A2A2A] flex items-center justify-center text-[#6B7280] hover:text-white hover:bg-[#2A2A2A] transition-all shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">

                {/* Meta Row */}
                <div className="flex flex-wrap gap-2">
                  <span className={`text-xs px-3 py-1 rounded-full border font-medium ${status.bg} ${status.color}`}>
                    {status.label}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-[#6B7280] bg-[#1A1A1A] border border-[#2A2A2A] px-3 py-1 rounded-full">
                    <Clock className="w-3 h-3" />
                    {task.estimatedMinutes} min
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-[#6B7280] bg-[#1A1A1A] border border-[#2A2A2A] px-3 py-1 rounded-full">
                    <Calendar className="w-3 h-3" />
                    {formattedDate}
                  </span>
                  <span className="text-xs text-[#6B7280] bg-[#1A1A1A] border border-[#2A2A2A] px-3 py-1 rounded-full">
                    Day {task.dayNumber} · Week {task.weekNumber}
                  </span>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-[#6B7280] text-xs uppercase tracking-wider font-medium mb-2">
                    What to do
                  </h3>
                  <p className="text-white/80 text-sm leading-relaxed">
                    {task.description}
                  </p>
                </div>

                {/* Resources */}
                {task.resources && task.resources.length > 0 && (
                  <div>
                    <h3 className="text-[#6B7280] text-xs uppercase tracking-wider font-medium mb-3">
                      Resources ({task.resources.length})
                    </h3>
                    <div className="space-y-3">
                      {task.resources.map((r) => (
                        <ResourceCard key={r._id} resource={r} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom padding for safe area */}
                <div className="h-4" />
              </div>

              {/* Footer CTA */}
              {task.status !== "completed" && (
                <div className="px-5 py-4 border-t border-[#2A2A2A] shrink-0">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      onMarkComplete(task._id);
                      onClose();
                    }}
                    className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-sm py-3 rounded-xl transition-colors"
                  >
                    ✓ Mark as Complete
                  </motion.button>
                </div>
              )}

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}