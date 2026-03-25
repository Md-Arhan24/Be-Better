import React from 'react';
import { motion } from "motion/react";
import { useState } from 'react';
import axios from 'axios';
import {URL} from '../api';
import {useNavigate} from 'react-router-dom';
import { Target, Mail, Lock, User, ArrowRight, Sparkles, Eye, EyeOff } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SignupPage = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const[form,setForm] = useState({username:"",email:"",password:""});
  const navigate = useNavigate();

  function handleFrom(event){
    setForm((prev_obj) => {
      return {...prev_obj,[event.target.name]:event.target.value};
    });
  }

  async function handleFormSubmit(e){
    e.preventDefault();
    console.log(form);
    
    try{
      const response = await axios.post(`${URL}/signup`,form);

      console.log("user creater",response);
      toast.success("user registerd successfully",{position:"bottom-right"});
      setTimeout(() => {
         navigate('/main');
      }, 1500);


     

    }catch(e){
      console.log(e);
      toast.failure(`${e.message}`,{position:"bottom-right"});
    }
    setForm({username:"",email:"",password:""});
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden p-6">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"
        />
      </div>

      {/* Signup Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center gap-2 mb-6"
          >
            <div className="bg-white p-3 rounded-xl">
              <Target className="w-8 h-8 text-black" />
            </div>
            <span className="text-white text-3xl font-bold">Be Better</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-4">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-white/90 text-sm">Join the Community</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Create Account
            </h1>
            <p className="text-white/60">
              Start your journey to becoming the best version of yourself
            </p>
          </motion.div>
        </div>

        {/* Signup Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl"
        >
          <form className="space-y-5" onSubmit={handleFormSubmit}>
            {/* Username Input */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  type="text"
                  placeholder="user_name"
                  name='username'
                  value={form.username}
                  onChange={handleFrom}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-12 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  name='email'
                  value={form.email}
                  onChange={handleFrom}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-12 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  name='password'
                  value={form.password}
                  onChange={handleFrom}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-12 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-white/40 text-xs mt-2">
                Must be at least 8 characters long
              </p>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                className="w-4 h-4 rounded border-white/20 bg-white/10 text-white focus:ring-white/50 mt-0.5"
              />
              <label htmlFor="terms" className="text-white/70 text-sm cursor-pointer">
                I agree to the{" "}
                <a href="#" className="text-white hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-white hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-white text-black py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors shadow-xl group"
            >
              Create Account
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-black text-white/50">Or sign up with</span>
            </div>
          </div>

          {/* Social Signup Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/10 border border-white/20 text-white py-3 rounded-xl font-medium hover:bg-white/20 transition-all"
            >
              Google
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/10 border border-white/20 text-white py-3 rounded-xl font-medium hover:bg-white/20 transition-all"
            >
              GitHub
            </motion.button>
          </div>

          {/* Toggle to Login */}
          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-white font-medium hover:underline"
              >
                Sign in
              </a>
            </p>
          </div>
        </motion.div>

        {/* Footer Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-white/40 text-sm mt-6"
        >
          Join 10,000+ users who are already becoming their best version
        </motion.p>
      </motion.div>
         <ToastContainer />
    </div>
  );
};

export default SignupPage;
