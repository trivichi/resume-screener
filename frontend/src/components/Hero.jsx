import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Target, ArrowRight } from 'lucide-react';

export default function Hero({ onStart }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-6">
      <div className="max-w-6xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-7xl md:text-8xl font-black mb-6 leading-tight"
        >
          <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Smart Resume
          </span>
          <br />
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
            Screening
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-white/70 mb-12 max-w-3xl mx-auto font-light"
        >
          Instantly analyze hundreds of resumes with cutting-edge AI. 
          Get detailed candidate scoring, skill matching, and hiring recommendations in seconds.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto"
        >
          {[
            { icon: Zap, title: 'Lightning Fast', desc: 'Batch process unlimited resumes' },
            { icon: Target, title: 'Precision Matching', desc: 'AI-powered skill & experience analysis' },
            { icon: Sparkles, title: 'Smart Insights', desc: 'Detailed strengths & gap identification' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05, y: -5 }}
              className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all"
            >
              <feature.icon className="w-10 h-10 text-purple-400 mb-4 mx-auto" />
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-white/60">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="group relative px-12 py-5 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white text-lg font-bold shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/80 transition-all overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
          
          <span className="relative flex items-center gap-3">
            Start Screening Resumes
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 flex justify-center gap-12 text-white/60"
        >
          {[
            { value: '10x', label: 'Faster Screening' },
            { value: '95%', label: 'Accuracy' },
            { value: '0', label: 'Bias' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-20 left-20 w-32 h-32 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-3xl"
      />
      <motion.div
        animate={{
          y: [0, 20, 0],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-gradient-to-br from-orange-500/20 to-purple-500/20 blur-3xl"
      />
    </div>
  );
}