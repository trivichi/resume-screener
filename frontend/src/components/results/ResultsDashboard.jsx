import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Home, Trash2 } from 'lucide-react';
import StatsCards from './StatsCards';
import SortControls from './SortControls';
import CandidateCard from './CandidateCard';
import DeleteConfirmModal from './DeleteConfirmModal';

export default function ResultsDashboard({ results, onReset }) {
  const [expandedCard, setExpandedCard] = useState(null);
  const [sortBy, setSortBy] = useState('overall_score');
  const [showClearModal, setShowClearModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [candidates, setCandidates] = useState(results.shortlisted_candidates);

  const sortedCandidates = [...candidates].sort((a, b) => b[sortBy] - a[sortBy]);

  const deleteCandidate = async (resumeId) => {
    setDeletingId(resumeId);
    try {
      const response = await fetch(`http://localhost:8000/resumes/${resumeId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setCandidates(candidates.filter(c => c.resume_id !== resumeId));
        
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        toast.textContent = 'Resume deleted successfully';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
      } else {
        throw new Error('Failed to delete');
      }
    } catch {
      alert('Error deleting resume. Please try again.');
    } finally {
      setDeletingId(null);
    }
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
    } catch {
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

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowClearModal(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 font-semibold hover:bg-red-500/30 transition-all"
          >
            <Trash2 className="w-5 h-5" />
            Clear All Data
          </motion.button>
        </div>

        <StatsCards candidates={sortedCandidates} />
        <SortControls sortBy={sortBy} setSortBy={setSortBy} />
      </motion.div>

      <div className="max-w-7xl mx-auto space-y-6">
        <AnimatePresence>
          {sortedCandidates.map((candidate, index) => (
            <CandidateCard
              key={candidate.resume_id}
              candidate={candidate}
              index={index}
              isExpanded={expandedCard === index}
              onToggleExpand={() => setExpandedCard(expandedCard === index ? null : index)}
              onDelete={() => deleteCandidate(candidate.resume_id)}
              isDeleting={deletingId === candidate.resume_id}
            />
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

      <DeleteConfirmModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={clearAllData}
        candidatesCount={candidates.length}
      />
    </div>
  );
}
