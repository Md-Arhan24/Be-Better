import { motion } from "motion/react";
import { Target, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Navbar() {
  const navigate = useNavigate();

  function redirect(){
    navigate('/signup');
  }
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <motion.div 
          className="flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <div className="bg-white p-2 rounded-lg">
            <Target className="w-5 h-5 text-black" />
          </div>
          <span className="text-white text-xl font-bold">Be Better</span>
        </motion.div>

        {/* Navigation Links  we dont need them know*/}
        {/* <div className="hidden md:flex items-center gap-8">
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#benefits">Benefits</NavLink>
          <NavLink href="#about">About</NavLink>
        </div> */}

        {/* CTA Button */}
        <div className="flex items-center gap-4">
          <motion.button
            onClick={redirect}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden md:block bg-white text-black px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Get Started
          </motion.button>
          <button className="md:hidden text-white">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </motion.nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <motion.a
      href={href}
      className="text-white/70 hover:text-white transition-colors relative group"
      whileHover={{ y: -2 }}
    >
      {children}
      <motion.div 
        className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"
      />
    </motion.a>
  );
}
