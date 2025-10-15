import React from 'react';
import { motion } from 'framer-motion';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Tooltip 
} from 'recharts';
import { 
  CheckCircle2, AlertCircle, Code, Briefcase, GraduationCap, 
  Award, TrendingUp, TrendingDown, Target, Zap
} from 'lucide-react';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-purple-500/30 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-white font-semibold text-sm">{payload[0].payload.category}</p>
        <p className="text-purple-400 font-bold">{payload[0].value.toFixed(1)}/10</p>
      </div>
    );
  }
  return null;
};

export default function CandidateDetails({ candidate }) {
  // Spider Chart Data - The Star of the Show!
  const spiderData = [
    { category: 'Technical Skills', score: candidate.skills_score, fullMark: 10 },
    { category: 'Work Experience', score: candidate.experience_score, fullMark: 10 },
    { category: 'Education', score: candidate.education_score, fullMark: 10 },
    { category: 'Overall Fit', score: candidate.overall_score, fullMark: 10 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-6 pt-6 border-t border-white/20"
    >
      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        {/* LEFT: Spider Chart (HERO) - Takes 3 columns */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3 p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-purple-500/20 border-2 border-purple-500/30 relative overflow-hidden"
        >
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-bold text-white flex items-center gap-2">
                <Target className="w-6 h-6 text-purple-400" />
                Candidate Fit Analysis
              </h4>
              <div className="px-3 py-1 rounded-lg bg-purple-500/20 border border-purple-500/30">
                <span className="text-purple-300 text-sm font-semibold">Spider Chart</span>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={spiderData}>
                <PolarGrid 
                  stroke="rgba(168, 85, 247, 0.3)" 
                  strokeWidth={1.5}
                />
                <PolarAngleAxis 
                  dataKey="category" 
                  stroke="rgba(255,255,255,0.9)" 
                  tick={{ 
                    fill: 'rgba(255,255,255,0.9)', 
                    fontSize: 13, 
                    fontWeight: 600 
                  }}
                />
                <PolarRadiusAxis 
                  domain={[0, 10]} 
                  stroke="rgba(168, 85, 247, 0.4)"
                  tick={{ 
                    fill: 'rgba(255,255,255,0.7)', 
                    fontSize: 11,
                    fontWeight: 500
                  }}
                  tickCount={6}
                />
                <Tooltip content={<CustomTooltip />} />
                <Radar 
                  name="Score" 
                  dataKey="score" 
                  stroke="#a855f7" 
                  fill="#a855f7" 
                  fillOpacity={0.6}
                  strokeWidth={3}
                />
              </RadarChart>
            </ResponsiveContainer>

            {/* Score Legend */}
            <div className="grid grid-cols-4 gap-3 mt-4">
              {spiderData.map((item, i) => (
                <div key={i} className="text-center p-2 rounded-lg bg-white/5">
                  <div className="text-2xl font-bold text-purple-400 mb-1">
                    {item.score.toFixed(1)}
                  </div>
                  <div className="text-xs text-white/70 leading-tight">
                    {item.category.split(' ')[0]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* RIGHT: Category Breakdown - Takes 2 columns */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-4"
        >
          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Score Breakdown
          </h4>

          {[
            { 
              label: 'Skills Match', 
              score: candidate.skills_score, 
              icon: Code, 
              color: 'purple',
              desc: 'Technical & soft skills alignment'
            },
            { 
              label: 'Experience Fit', 
              score: candidate.experience_score, 
              icon: Briefcase, 
              color: 'blue',
              desc: 'Relevant work history & projects'
            },
            { 
              label: 'Education', 
              score: candidate.education_score, 
              icon: GraduationCap, 
              color: 'pink',
              desc: 'Academic background & certifications'
            }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className={`p-4 rounded-xl bg-${item.color}-500/10 border border-${item.color}-500/20`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-${item.color}-500/20`}>
                  <item.icon className={`w-5 h-5 text-${item.color}-400`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-white text-sm">{item.label}</span>
                    <span className={`text-xl font-bold text-${item.color}-400`}>
                      {item.score.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-xs text-white/60 mb-2">{item.desc}</p>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.score * 10}%` }}
                      transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                      className={`h-full bg-gradient-to-r from-${item.color}-500 to-${item.color}-400`}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Skills Section */}
      {candidate.skills && candidate.skills.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <Code className="w-5 h-5 text-blue-400" />
              Extracted Skills
            </h4>
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-semibold">
              {candidate.skills.length} skills
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {candidate.skills.map((skill, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.02 }}
                whileHover={{ scale: 1.05 }}
                className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 text-sm border border-blue-500/30 font-medium hover:bg-blue-500/30 transition-all cursor-default"
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Strengths vs Gaps - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Strengths */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="p-5 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              Key Strengths
            </h4>
            <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold">
              {candidate.strengths.length}
            </span>
          </div>
          <div className="space-y-2">
            {candidate.strengths.map((strength, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.05 }}
                className="flex items-start gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 transition-all group"
              >
                <TrendingUp className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-white/90 text-sm leading-relaxed">{strength}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Gaps / Areas for Improvement */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.55 }}
          className="p-5 rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-400" />
              Areas for Growth
            </h4>
            <span className="px-2 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold">
              {candidate.gaps.length}
            </span>
          </div>
          <div className="space-y-2">
            {candidate.gaps.map((gap, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.65 + i * 0.05 }}
                className="flex items-start gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 transition-all group"
              >
                <TrendingDown className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-white/90 text-sm leading-relaxed">{gap}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* AI Analysis Summary */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            AI-Generated Justification
          </h4>
          <div className="flex gap-4">
            <div className="w-1 bg-gradient-to-b from-yellow-400 to-orange-400 rounded-full flex-shrink-0" />
            <p className="text-white/90 leading-relaxed text-sm">
              {candidate.justification}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}