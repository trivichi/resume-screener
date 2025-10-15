import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, TrendingUp, AlertCircle, XCircle, X, 
  ChevronDown, ChevronUp, Mail, Phone, FileText, Target
} from 'lucide-react';
import CandidateDetails from './CandidateDetails';

const getRecommendationStyle = (rec) => {
  const styles = {
    'Highly Recommended': { 
      bg: 'bg-green-500/20', 
      border: 'border-green-500/50', 
      text: 'text-green-400',
      icon: CheckCircle2 
    },
    'Recommended': { 
      bg: 'bg-blue-500/20', 
      border: 'border-blue-500/50', 
      text: 'text-blue-400',
      icon: TrendingUp 
    },
    'Maybe': { 
      bg: 'bg-yellow-500/20', 
      border: 'border-yellow-500/50', 
      text: 'text-yellow-400',
      icon: AlertCircle 
    },
    'Not Recommended': { 
      bg: 'bg-red-500/20', 
      border: 'border-red-500/50', 
      text: 'text-red-400',
      icon: XCircle 
    }
  };
  return styles[rec] || styles['Maybe'];
};

const getScoreColor = (score) => {
  if (score >= 8) return 'text-green-400';
  if (score >= 6) return 'text-blue-400';
  if (score >= 4) return 'text-yellow-400';
  return 'text-red-400';
};

const getScoreBg = (score) => {
  if (score >= 8) return 'from-green-500 to-emerald-500';
  if (score >= 6) return 'from-blue-500 to-cyan-500';
  if (score >= 4) return 'from-yellow-500 to-orange-500';
  return 'from-red-500 to-pink-500';
};

export default function CandidateCard({ 
  candidate, 
  index, 
  isExpanded, 
  onToggleExpand, 
  onDelete, 
  isDeleting 
}) {
  const recStyle = getRecommendationStyle(candidate.recommendation);
  const RecIcon = recStyle.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.05 }}
      layout
      className="relative"
    >
      {/* Rank Badge for Top 3 */}
      {index < 3 && (
        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3 + index * 0.1, type: "spring", stiffness: 200 }}
          className={`absolute -left-3 -top-3 w-14 h-14 rounded-full flex flex-col items-center justify-center font-black z-10 border-4 border-slate-900 shadow-2xl ${
            index === 0 ? 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 text-white' :
            index === 1 ? 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 text-slate-900' :
            'bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white'
          }`}
        >
          <div className="text-lg leading-none mb-0.5">
            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
          </div>
          <div className="text-xs leading-none">#{index + 1}</div>
        </motion.div>
      )}

      <motion.div 
        whileHover={{ y: -4 }}
        className={`p-6 rounded-2xl backdrop-blur-xl border transition-all group ${
          index < 3 
            ? 'bg-white/10 border-white/20 shadow-xl' 
            : 'bg-white/5 border-white/10 hover:bg-white/8'
        }`}
      >
        {/* Header: Candidate Info */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex-1 min-w-0">
            {/* Name & Recommendation Badge */}
            <div className="flex items-start gap-3 mb-3">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{candidate.candidate_name}</h3>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${recStyle.bg} border ${recStyle.border} ${recStyle.text} text-sm font-semibold`}>
                  <RecIcon className="w-4 h-4" />
                  {candidate.recommendation}
                </div>
              </div>
            </div>
            
            {/* Contact & File Info */}
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-2 text-white/70">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{candidate.email}</span>
              </div>
              {candidate.phone && candidate.phone !== 'Not Found' && (
                <div className="flex items-center gap-2 text-white/70">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>{candidate.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-white/50">
                <FileText className="w-4 h-4 flex-shrink-0" />
                <span className="truncate text-xs">{candidate.filename}</span>
              </div>
            </div>
          </div>

          {/* Overall Score Circle */}
          <div className="flex items-start gap-3 ml-4">
            <div className="text-center">
              <div className="relative w-20 h-20 mb-2">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-white/10"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeDasharray={`${(candidate.overall_score / 10) * 201} 201`}
                    className={getScoreColor(candidate.overall_score)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-2xl font-black ${getScoreColor(candidate.overall_score)}`}>
                    {candidate.overall_score.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="text-xs text-white/60 font-semibold">Overall Match</div>
            </div>

            {/* Delete Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onDelete}
              disabled={isDeleting}
              className="p-2 rounded-lg bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/30 disabled:opacity-50"
            >
              {isDeleting ? (
                <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <X className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Score Breakdown Table */}
        <div className="mb-5">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Skills Match', score: candidate.skills_score, key: 'skills' },
              { label: 'Experience Fit', score: candidate.experience_score, key: 'exp' },
              { label: 'Education', score: candidate.education_score, key: 'edu' }
            ].map((item) => (
              <div key={item.key} className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-xs text-white/60 mb-2 font-medium">{item.label}</div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl font-bold ${getScoreColor(item.score)}`}>
                    {item.score.toFixed(1)}
                  </span>
                  <span className="text-sm text-white/40">/10</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.score * 10}%` }}
                    transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                    className={`h-full bg-gradient-to-r ${getScoreBg(item.score)}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Highlights Preview (when collapsed) */}
        {!isExpanded && (
          <div className="grid grid-cols-2 gap-4 mb-5">
            {/* Top Skills Preview */}
            {candidate.skills && candidate.skills.length > 0 && (
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-semibold text-purple-300">Top Skills</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {candidate.skills.slice(0, 5).map((skill, i) => (
                    <span key={i} className="px-2 py-0.5 rounded text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {skill}
                    </span>
                  ))}
                  {candidate.skills.length > 5 && (
                    <span className="px-2 py-0.5 text-xs text-purple-400">
                      +{candidate.skills.length - 5}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-semibold text-blue-300">Quick Stats</span>
              </div>
              <div className="space-y-1 text-xs text-white/70">
                <div>✓ {candidate.strengths.length} Key Strengths</div>
                <div>⚠ {candidate.gaps.length} Growth Areas</div>
              </div>
            </div>
          </div>
        )}

        {/* Expand Button */}
        <motion.button 
          onClick={onToggleExpand}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all text-sm font-semibold"
        >
          {isExpanded ? (
            <>
              <span>Hide Detailed Analysis</span>
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>View Full Analysis & Spider Chart</span>
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </motion.button>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && <CandidateDetails candidate={candidate} />}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}