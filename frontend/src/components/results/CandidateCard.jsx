import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, TrendingUp, AlertCircle, XCircle, X, ChevronDown, ChevronUp } from 'lucide-react';
import CandidateDetails from './CandidateDetails';

const getRecommendationColor = (rec) => {
  const colors = {
    'Highly Recommended': 'from-green-500 to-emerald-500',
    'Recommended': 'from-blue-500 to-cyan-500',
    'Maybe': 'from-yellow-500 to-orange-500',
    'Not Recommended': 'from-red-500 to-rose-500',
  };
  return colors[rec] || 'from-gray-500 to-slate-500';
};

const getRecommendationIcon = (rec) => {
  const icons = {
    'Highly Recommended': CheckCircle2,
    'Recommended': TrendingUp,
    'Maybe': AlertCircle,
    'Not Recommended': XCircle,
  };
  const Icon = icons[rec] || AlertCircle;
  return <Icon className="w-5 h-5" />;
};

export default function CandidateCard({ 
  candidate, 
  index, 
  isExpanded, 
  onToggleExpand, 
  onDelete, 
  isDeleting 
}) {
  const scoreMetrics = [
    { label: 'Skills', score: candidate.skills_score, color: 'from-blue-500 to-cyan-500' },
    { label: 'Experience', score: candidate.experience_score, color: 'from-purple-500 to-pink-500' },
    { label: 'Education', score: candidate.education_score, color: 'from-orange-500 to-red-500' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.05 }}
      layout
      className="relative"
    >
      {index < 3 && (
        <div className={`absolute -left-4 -top-4 w-12 h-12 rounded-full bg-gradient-to-r ${
          index === 0 ? 'from-yellow-400 to-orange-500' :
          index === 1 ? 'from-gray-300 to-gray-400' :
          'from-amber-600 to-amber-700'
        } flex items-center justify-center text-white font-bold text-lg shadow-lg z-10`}>
          #{index + 1}
        </div>
      )}

      <motion.div className="p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all group">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1" onClick={onToggleExpand}>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-bold text-white">{candidate.candidate_name}</h3>
              <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getRecommendationColor(candidate.recommendation)} text-white text-sm font-semibold flex items-center gap-2`}>
                {getRecommendationIcon(candidate.recommendation)}
                {candidate.recommendation}
              </div>
            </div>
            <p className="text-white/60">{candidate.email}</p>
            <p className="text-white/50 text-sm mt-1">{candidate.filename}</p>
          </div>

          <div className="flex items-start gap-4">
            <div className="text-right" onClick={onToggleExpand}>
              <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {candidate.overall_score.toFixed(1)}
              </div>
              <div className="text-white/60 text-sm">Overall Score</div>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onDelete}
              disabled={isDeleting}
              className="p-2 rounded-lg bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/30 disabled:opacity-50"
              title="Delete this resume"
            >
              {isDeleting ? (
                <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <X className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6" onClick={onToggleExpand}>
          {scoreMetrics.map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm font-medium">{item.label}</span>
                <span className="text-white font-bold">{item.score.toFixed(1)}/10</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.score / 10) * 100}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className={`h-full bg-gradient-to-r ${item.color}`}
                />
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={onToggleExpand}
          className="w-full flex items-center justify-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          {isExpanded ? (
            <>
              <span>Show Less</span>
              <ChevronUp className="w-5 h-5" />
            </>
          ) : (
            <>
              <span>View Details</span>
              <ChevronDown className="w-5 h-5" />
            </>
          )}
        </button>

        <AnimatePresence>
          {isExpanded && <CandidateDetails candidate={candidate} />}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}