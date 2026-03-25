import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useLocation, useNavigate } from "react-router";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { URL } from "../../../api";
import "react-toastify/dist/ReactToastify.css";
import {
  Target,
  Calendar,
  TrendingUp,
  Settings,
  User,
  Menu,
  LogOut,
  X,
} from "lucide-react";

// Reads actual window width synchronously — no async delay
function getIsDesktop() {
  return window.innerWidth >= 1024;
}

export default function SideBar() {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Lazy initializer runs synchronously on first render
  //    so isDesktop and isOpen are CORRECT from frame 1
  const [isDesktop, setIsDesktop] = useState<boolean>(() => getIsDesktop());
  const [isOpen, setIsOpen]       = useState<boolean>(() => getIsDesktop());

  const [userName, setUserName]                   = useState("");
  const [showSettingsPopup, setShowSettingsPopup] = useState(false);

  const navItems = [
    { icon: Target,     label: "All Goals", path: "/main/goals" },
    { icon: Calendar,   label: "Calendar",  path: "/main/calendar" },
    { icon: TrendingUp, label: "Progress",  path: "/main/progress" },
  ];

  // ── Resize listener — keeps state in sync as window changes ──
  useEffect(() => {
    function handleResize() {
      const desktop = getIsDesktop();
      setIsDesktop(desktop);
      setIsOpen(desktop); // open on desktop, close on mobile when crossing breakpoint
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── Close sidebar on route change on mobile ──
  useEffect(() => {
    if (!isDesktop) setIsOpen(false);
  }, [location.pathname, isDesktop]);

  // ── Auth ──
useEffect(() => {
  const username = localStorage.getItem("username");
  setUserName(username || "");
}, []);

  const showToastMessage = (message: string, success: boolean) => {
    if (success) toast.success(message, { position: "bottom-right" });
    else         toast.error(message,   { position: "top-right" });
  };

async function logout() {
  try {
    const res = await axios.post(`${URL}/logout`, {}, { withCredentials: true });
    if (res.data.status) {
      localStorage.removeItem("username");
      localStorage.removeItem("userId");

      showToastMessage("User logged out successfully", true);
      setShowSettingsPopup(false);
      setTimeout(() => navigate("/"), 1000);
    } else {
      showToastMessage("No active session", false);
    }
  } catch (e) {
    console.log(e);
    showToastMessage("No user found", false);
  }
}

  return (
    <>
      <ToastContainer />

      {/* ── Hamburger — visible only on mobile when sidebar is closed ── */}
      {!isDesktop && !isOpen && (
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#0D0D0D] border border-[#2A2A2A] text-[#6B7280] hover:text-white hover:bg-[#1A1A1A] transition-colors flex items-center justify-center"
        >
          <Menu className="w-5 h-5" />
        </motion.button>
      )}

      {/* ── Backdrop — mobile only, tap outside to close ── */}
      <AnimatePresence>
        {isOpen && !isDesktop && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 z-40"
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            key="sidebar"
            initial={{ x: -240 }}
            animate={{ x: 0 }}
            exit={{ x: -240 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-60 bg-[#0D0D0D] h-screen fixed left-0 top-0 border-r border-[#2A2A2A] flex flex-col z-50"
          >
            {/* Logo row */}
            <div className="p-6 border-b border-[#2A2A2A]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#7C3AED]" />
                  <span className="text-white font-bold text-lg">Be Better</span>
                </div>

                {/* Mobile → X to close | Desktop → dot to collapse */}
                {!isDesktop ? (
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-[#6B7280] hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setIsOpen(false)}
                    title="Collapse sidebar"
                    className="group"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#2A2A2A] group-hover:bg-[#7C3AED] transition-colors" />
                  </button>
                )}
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
              <ul className="space-y-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.path}>
                      <Link to={item.path}>
                        <motion.div
                          whileHover={{ x: 4 }}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative ${
                            isActive
                              ? "text-[#7C3AED] bg-[#1A1A1A]"
                              : "text-[#6B7280] hover:text-white hover:bg-[#1A1A1A]"
                          }`}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="activeNav"
                              className="absolute left-0 top-0 bottom-0 w-1 bg-[#7C3AED] rounded-r"
                            />
                          )}
                          <item.icon className="w-5 h-5" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </motion.div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-[#2A2A2A] relative">
              <AnimatePresence>
                {showSettingsPopup && (
                  <motion.div
                    key="settings-popup"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="absolute bottom-20 left-4 right-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 shadow-xl z-10"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white text-sm font-semibold">Account</span>
                      <button
                        onClick={() => setShowSettingsPopup(false)}
                        className="text-[#6B7280] hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#2A2A2A]">
                      <div className="w-7 h-7 rounded-full bg-[#7C3AED] flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-[#6B7280] text-xs truncate">{userName}</span>
                    </div>
                    <button
                      onClick={logout}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-medium transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#1A1A1A] cursor-pointer transition-colors">
                <div className="w-8 h-8 rounded-full bg-[#7C3AED] flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-white text-sm font-medium">{userName}</div>
                  <div className="text-[#6B7280] text-xs">View profile</div>
                </div>
                <button
                  onClick={() => setShowSettingsPopup((prev) => !prev)}
                  className={`transition-colors ${
                    showSettingsPopup ? "text-white" : "text-[#6B7280] hover:text-white"
                  }`}
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}