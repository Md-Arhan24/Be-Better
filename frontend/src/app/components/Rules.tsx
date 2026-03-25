import { motion } from "motion/react";
import { CheckCircle2, Target, TrendingUp, Calendar, Bell } from "lucide-react";

export function Rules() {
  const rules = [
    {
      icon: Target,
      title: "Set Clear Goals",
      description: "Define specific, measurable objectives that align with your vision of success.",
    },
    {
      icon: Calendar,
      title: "Daily Check-ins",
      description: "Review your progress every day to stay accountable and maintain momentum.",
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      description: "Monitor your achievements and celebrate small wins along the journey.",
    },
    {
      icon: Bell,
      title: "Stay Consistent",
      description: "Build lasting habits through regular reminders and consistent action.",
    },
  ];

  return (
    <section id="features" className="py-24 bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle, black 1px, transparent 1px)`,
          backgroundSize: '30px 30px'
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-sm mb-4">
            <CheckCircle2 className="w-4 h-4" />
            How It Works
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-black mb-4">
            Simple Rules for <br />
            <span className="bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent">
              Massive Results
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Follow these core principles to maximize your growth and achieve lasting change
          </p>
        </motion.div>

        {/* Rules Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {rules.map((rule, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ y: -5 }}
              className="group bg-black text-white p-8 rounded-2xl shadow-2xl hover:shadow-black/50 transition-all border border-white/10"
            >
              <div className="bg-white/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors">
                <rule.icon className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3">{rule.title}</h3>
              <p className="text-white/70 leading-relaxed">{rule.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Visual Element */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="inline-block bg-black text-white px-8 py-4 rounded-full shadow-2xl">
            <p className="text-lg">
              <span className="font-bold">Remember:</span> Consistency beats perfection every time 🎯
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
