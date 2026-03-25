import { motion } from "motion/react";
import { Zap, Brain, Trophy, Users, LineChart, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Benefits() {
  const navigate = useNavigate();
  const benefits = [
    {
      icon: Zap,
      title: "Boost Productivity",
      description: "Accomplish more in less time with focused goal tracking and smart task management.",
      gradient: "from-yellow-400 to-orange-500",
    },
    {
      icon: Brain,
      title: "Build Better Habits",
      description: "Transform your daily routines into powerful habits that stick for life.",
      gradient: "from-purple-400 to-pink-500",
    },
    {
      icon: Trophy,
      title: "Achieve Your Goals",
      description: "Turn your dreams into reality with structured planning and consistent action.",
      gradient: "from-green-400 to-blue-500",
    },
    {
      icon: Users,
      title: "Stay Accountable",
      description: "Regular check-ins and progress tracking keep you motivated and on track.",
      gradient: "from-blue-400 to-cyan-500",
    },
    {
      icon: LineChart,
      title: "Track Growth",
      description: "Visualize your progress with detailed analytics and insightful metrics.",
      gradient: "from-pink-400 to-red-500",
    },
    {
      icon: Shield,
      title: "Build Confidence",
      description: "Celebrate wins and build unshakeable confidence with each milestone reached.",
      gradient: "from-indigo-400 to-purple-500",
    },
  ];

  return (
    <section id="benefits" className="py-24 bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(45deg, white 25%, transparent 25%, transparent 75%, white 75%, white), 
                             linear-gradient(45deg, white 25%, transparent 25%, transparent 75%, white 75%, white)`,
            backgroundSize: '60px 60px',
            backgroundPosition: '0 0, 30px 30px',
          }}
        />
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
          <div className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full text-sm mb-4">
            <Zap className="w-4 h-4" />
            Why Choose Us
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Transform Your Life
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Experience the benefits that thousands of users are already enjoying
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-all"
            >
              <div className={`bg-gradient-to-br ${benefit.gradient} w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                <benefit.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">{benefit.title}</h3>
              <p className="text-white/60 leading-relaxed">{benefit.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-20 text-center"
        >
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12 max-w-4xl mx-auto">
            <h3 className="text-4xl font-bold text-white mb-4">
              Ready to Start Your Journey?
            </h3>
            <p className="text-xl text-white/60 mb-8">
              Join thousands of people who are already becoming their best version
            </p>
            <motion.button
              onClick={() => {navigate(`/signup`)}}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-black px-10 py-4 cursor-pointer rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-2xl"
            >
              Get Started Free
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
