import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react';

export default function StatsCards({ candidates }) {
  const stats = [
    { 
      label: 'Total Candidates', 
      value: candidates.length,
      icon: Trophy,
      color: 'from-purple-500 to-pink-500'
    },
    { 
      label: 'Highly Recommended', 
      value: candidates.filter(c => c.recommendation === 'Highly Recommended').length,
      icon: CheckCircle2,
      color: 'from-green-500 to-emerald-500'
    },
    { 
      label: 'Recommended', 
      value: candidates.filter(c => c.recommendation === 'Recommended').length,
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      label: 'Avg Score', 
      value: candidates.length > 0 
        ? (candidates.reduce((acc, c) => acc + c.overall_score, 0) / candidates.length).toFixed(1) 
        : '0',
      icon: AlertCircle,
      color: 'from-yellow-500 to-orange-500'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10"
        >
          <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${stat.color} mb-3`}>
            <stat.icon className="w-6 h-6 text-white" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
          <div className="text-sm text-white/60">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  );
}