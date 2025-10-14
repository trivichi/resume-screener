import React from 'react';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function CandidateDetails({ candidate }) {
  const chartData = [
    { skill: 'Skills', score: candidate.skills_score },
    { skill: 'Experience', score: candidate.experience_score },
    { skill: 'Education', score: candidate.education_score },
    { skill: 'Overall Fit', score: candidate.overall_score },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-6 pt-6 border-t border-white/10"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 rounded-2xl bg-white/5">
          <h4 className="text-lg font-bold text-white mb-4">Skill Distribution</h4>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={chartData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="skill" stroke="rgba(255,255,255,0.6)" />
              <PolarRadiusAxis domain={[0, 10]} stroke="rgba(255,255,255,0.3)" />
              <Radar dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              Strengths
            </h4>
            <div className="space-y-2">
              {candidate.strengths.map((strength, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                  <span className="text-white/90 text-sm">{strength}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-400" />
              Areas for Improvement
            </h4>
            <div className="space-y-2">
              {candidate.gaps.map((gap, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                  <span className="text-white/90 text-sm">{gap}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-6 rounded-2xl bg-white/5">
        <h4 className="text-lg font-bold text-white mb-3">AI Analysis</h4>
        <p className="text-white/80 leading-relaxed">{candidate.justification}</p>
      </div>
    </motion.div>
  );
}