import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Trophy, TrendingUp, AlertCircle, CheckCircle2, XCircle, Download, Home, ChevronDown, ChevronUp, Trash2, X } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function ResultsDashboard({ results, onReset }) {
  const [expandedCard, setExpandedCard] = useState(null);
  const [sortBy, setSortBy] = useState('overall_score');
  const [showClearModal, setShowClearModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [candidates, setCandidates] = useState(results.shortlisted_candidates);

  const sortedCandidates = [...candidates].sort((a, b) => {
    return b[sortBy] - a[sortBy];
  });

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

  const deleteCandidate = async (resumeId) => {
    setDeletingId(resumeId);
    try {
      const response = await fetch(`http://localhost:8000/resumes/${resumeId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Remove from local state
        setCandidates(candidates.filter(c => c.resume_id !== resumeId));
        
        // Show success message
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        toast.textContent = '✓ Resume deleted successfully';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting resume:', error);
      alert('Error deleting resume. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const exportResults = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(20);
    doc.setTextColor(139, 92, 246);
    doc.text('Resume Screening Results', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Candidates: ${candidates.length}`, 20, 35);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 40);
    
    doc.setFontSize(12);
    doc.setTextColor(139, 92, 246);
    doc.text('Job Description:', 20, 50);
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    const splitJobDesc = doc.splitTextToSize(results.job_description, pageWidth - 40);
    doc.text(splitJobDesc, 20, 56);
    
    let yPos = 56 + (splitJobDesc.length * 4) + 10;
    
    sortedCandidates.forEach((candidate, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFillColor(139, 92, 246);
      doc.rect(20, yPos, pageWidth - 40, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.text(`#${index + 1} ${candidate.candidate_name}`, 22, yPos + 5);
      
      yPos += 12;
      
      doc.autoTable({
        startY: yPos,
        head: [['Metric', 'Score']],
        body: [
          ['Overall Score', `${candidate.overall_score.toFixed(1)}/10`],
          ['Skills', `${candidate.skills_score.toFixed(1)}/10`],
          ['Experience', `${candidate.experience_score.toFixed(1)}/10`],
          ['Education', `${candidate.education_score.toFixed(1)}/10`],
          ['Recommendation', candidate.recommendation],
        ],
        theme: 'striped',
        headStyles: { fillColor: [139, 92, 246] },
        margin: { left: 20, right: 20 },
      });
      
      yPos = doc.lastAutoTable.finalY + 5;
      
      doc.setFontSize(10);
      doc.setTextColor(34, 197, 94);
      doc.text('✓ Strengths:', 20, yPos);
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      candidate.strengths.forEach((strength) => {
        yPos += 5;
        const wrapped = doc.splitTextToSize(`• ${strength}`, pageWidth - 45);
        doc.text(wrapped, 25, yPos);
        yPos += (wrapped.length - 1) * 4;
      });
      
      yPos += 5;
      
      doc.setFontSize(10);
      doc.setTextColor(249, 115, 22);
      doc.text('⚠ Areas for Improvement:', 20, yPos);
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      candidate.gaps.forEach((gap) => {
        yPos += 5;
        const wrapped = doc.splitTextToSize(`• ${gap}`, pageWidth - 45);
        doc.text(wrapped, 25, yPos);
        yPos += (wrapped.length - 1) * 4;
      });
      
      yPos += 5;
      
      doc.setFontSize(10);
      doc.setTextColor(139, 92, 246);
      doc.text('AI Analysis:', 20, yPos);
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      const wrappedJustification = doc.splitTextToSize(candidate.justification, pageWidth - 40);
      yPos += 5;
      doc.text(wrappedJustification, 20, yPos);
      
      yPos += (wrappedJustification.length * 4) + 10;
    });
    
    doc.save(`resume-screening-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const clearAllData = async () => {
    try {
      const response = await fetch('http://localhost:8000/resumes', {
        method: 'DELETE',
      });
      
      if (response.ok) {
        alert('All data cleared successfully!');
        onReset();
      } else {
        throw new Error('Failed to clear data');
      }
    } catch (error) {
      console.error('Error clearing data:', error);
      alert('Error clearing data. Please try again.');
    }
    setShowClearModal(false);
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto mb-12"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onReset}
              className="p-3 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 transition-all"
            >
              <Home className="w-6 h-6" />
            </motion.button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-8 h-8 text-yellow-400" />
                <h1 className="text-4xl font-bold text-white">Screening Results</h1>
              </div>
              <p className="text-white/60">
                Analyzed {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowClearModal(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 font-semibold hover:bg-red-500/30 transition-all"
            >
              <Trash2 className="w-5 h-5" />
              Clear All Data
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportResults}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              <Download className="w-5 h-5" />
              Export PDF
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { 
              label: 'Total Candidates', 
              value: candidates.length,
              icon: Trophy,
              color: 'from-purple-500 to-pink-500'
            },
            { 
              label: 'Highly Recommended', 
              value: sortedCandidates.filter(c => c.recommendation === 'Highly Recommended').length,
              icon: CheckCircle2,
              color: 'from-green-500 to-emerald-500'
            },
            { 
              label: 'Recommended', 
              value: sortedCandidates.filter(c => c.recommendation === 'Recommended').length,
              icon: TrendingUp,
              color: 'from-blue-500 to-cyan-500'
            },
            { 
              label: 'Avg Score', 
              value: candidates.length > 0 ? (sortedCandidates.reduce((acc, c) => acc + c.overall_score, 0) / sortedCandidates.length).toFixed(1) : '0',
              icon: AlertCircle,
              color: 'from-yellow-500 to-orange-500'
            },
          ].map((stat, i) => (
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

        <div className="flex items-center gap-3">
          <span className="text-white/60">Sort by:</span>
          {['overall_score', 'skills_score', 'experience_score'].map((option) => (
            <button
              key={option}
              onClick={() => setSortBy(option)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                sortBy === option
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {option.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto space-y-6">
        <AnimatePresence>
          {sortedCandidates.map((candidate, index) => (
            <motion.div
              key={candidate.resume_id}
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

              <motion.div
                className="p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all group"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1" onClick={() => setExpandedCard(expandedCard === index ? null : index)}>
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
                    <div className="text-right" onClick={() => setExpandedCard(expandedCard === index ? null : index)}>
                      <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {candidate.overall_score.toFixed(1)}
                      </div>
                      <div className="text-white/60 text-sm">Overall Score</div>
                    </div>

                    {/* Delete Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => deleteCandidate(candidate.resume_id)}
                      disabled={deletingId === candidate.resume_id}
                      className="p-2 rounded-lg bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/30 disabled:opacity-50"
                      title="Delete this resume"
                    >
                      {deletingId === candidate.resume_id ? (
                        <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <X className="w-5 h-5" />
                      )}
                    </motion.button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6" onClick={() => setExpandedCard(expandedCard === index ? null : index)}>
                  {[
                    { label: 'Skills', score: candidate.skills_score, color: 'from-blue-500 to-cyan-500' },
                    { label: 'Experience', score: candidate.experience_score, color: 'from-purple-500 to-pink-500' },
                    { label: 'Education', score: candidate.education_score, color: 'from-orange-500 to-red-500' },
                  ].map((item) => (
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
                  onClick={() => setExpandedCard(expandedCard === index ? null : index)}
                  className="w-full flex items-center justify-center gap-2 text-white/60 hover:text-white transition-colors"
                >
                  {expandedCard === index ? (
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
                  {expandedCard === index && (
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
                            <RadarChart data={[
                              { skill: 'Skills', score: candidate.skills_score },
                              { skill: 'Experience', score: candidate.experience_score },
                              { skill: 'Education', score: candidate.education_score },
                              { skill: 'Overall Fit', score: candidate.overall_score },
                            ]}>
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
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>

        {candidates.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Trophy className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No candidates found</h3>
            <p className="text-white/60">All resumes have been deleted</p>
            <button
              onClick={onReset}
              className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold"
            >
              Upload New Resumes
            </button>
          </motion.div>
        )}
      </div>

      {/* Clear All Confirmation Modal */}
      <AnimatePresence>
        {showClearModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl"
            onClick={() => setShowClearModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-md w-full mx-4"
            >
              <div className="text-center">
                <div className="inline-flex p-4 rounded-full bg-red-500/20 mb-4">
                  <Trash2 className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Clear All Data?</h3>
                <p className="text-white/70 mb-6">
                  This will permanently delete all {candidates.length} resume{candidates.length !== 1 ? 's' : ''} and their analysis results. This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowClearModal(false)}
                    className="flex-1 px-6 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={clearAllData}
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold shadow-lg hover:shadow-red-500/50 transition-all"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}