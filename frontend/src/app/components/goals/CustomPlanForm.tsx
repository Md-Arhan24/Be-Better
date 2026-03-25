import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import { URL } from "../../../api";

interface Props {
    goalId: string;
    goalTitle: string;
    startDate: string;
    endDate: string;
    durationDays: number;
    dailyTimeMinutes: number;
    onSaved: () => void; // callback after saving
}

export default function CustomPlanForm({
    goalId,
    goalTitle,
    startDate,
    endDate,
    durationDays,
    dailyTimeMinutes,
    onSaved,
}: Props) {
    const [pastedResponse, setPastedResponse] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

    // ✅ Auto-generated prompt for the user to copy
    const generatedPrompt = `Hi LLM, imagine yourself as an instructor helping me achieve the goal: "${goalTitle}".
  
Your task is to create a detailed day-by-day action plan from ${startDate} to ${endDate} (${durationDays} days), with ${dailyTimeMinutes} HRS of daily work.

Respond ONLY in this exact JSON format, no extra text:

{
  "days": [
    {
      "dayNumber": 1,
      "title": "Day 1 - Topic Title",
      "description": "Detailed description of what to do today",
      "estimatedMinutes": ${dailyTimeMinutes},
      "resources": [
        {
          "type": "video",
          "title": "Resource title",
          "url": "https://..."
        }
      ]
    }
  ]
}

Resource type must be one of: "video", "article", "exercise", "custom".
Generate all ${durationDays} days.`;

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedPrompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSave = async () => {
        setError("");
        if (!pastedResponse.trim()) {
            setError("Please paste the LLM response first.");
            return;
        }

        try {
            setSaving(true);

            // Strip markdown code fences if LLM wraps in ```json
            const cleaned = pastedResponse
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .replace(/"\[([^\]]+)\]\(([^)]+)\)"/g, '"$2"') // ✅ replaces "[text](url)" → "url" (keeps quotes)
                .trim();
            console.log("Cleaned:", cleaned);
            const parsed = JSON.parse(cleaned);

            if (!parsed.days || !Array.isArray(parsed.days)) {
                setError("Invalid format. Make sure the response has a 'days' array.");
                return;
            }

            await axios.post(
                `${URL}/planday/custom-plan/${goalId}`,
                { days: parsed.days },
                { withCredentials: true }
            );

            onSaved();
        } catch (err) {
            console.log("prase error", err);
            setError("Failed to parse or save. Make sure the JSON is valid.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-5 space-y-5"
        >
            <h2 className="text-white font-bold text-base">
                📋 Custom Plan Setup
            </h2>

            {/* Section 1 - Prompt */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <p className="text-[#6B7280] text-sm">
                        1. Copy this prompt and paste it into any LLM (ChatGPT, Gemini, Claude...)
                    </p>
                    <button
                        onClick={handleCopy}
                        className="text-xs text-[#7C3AED] border border-[#7C3AED] px-3 py-1 rounded-lg hover:bg-[#7C3AED]/10 transition-colors"
                    >
                        {copied ? "✓ Copied!" : "Copy Prompt"}
                    </button>
                </div>
                <pre className="bg-[#1A1A1A] border border-[#2A2A2A] text-[#9CA3AF] text-xs rounded-lg p-4 whitespace-pre-wrap break-words max-h-52 overflow-y-auto">
                    {generatedPrompt}
                </pre>
            </div>

            {/* Section 2 - Paste Response */}
            <div>
                <p className="text-[#6B7280] text-sm mb-2">
                    2. Paste the LLM's JSON response below
                </p>
                <textarea
                    value={pastedResponse}
                    onChange={(e) => setPastedResponse(e.target.value)}
                    placeholder='Paste the JSON response here... { "days": [...] }'
                    rows={8}
                    className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-[#7C3AED] placeholder-[#4B5563] transition-colors resize-none"
                />
            </div>

            {/* Error */}
            <AnimatePresence>
                {error && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-red-400 text-sm"
                    >
                        ⚠️ {error}
                    </motion.p>
                )}
            </AnimatePresence>

            {/* Save Button */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
                {saving ? "Saving..." : "Save Plan"}
            </motion.button>
        </motion.div>
    );
}