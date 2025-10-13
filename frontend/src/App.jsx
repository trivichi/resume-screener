import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedBackground from './components/AnimatedBackground';
import Hero from './components/Hero';
import UploadSection from './components/UploadSection';
import ResultsDashboard from './components/ResultsDashboard';
import LoadingOverlay from './components/LoadingOverlay';
import './App.css';

function App() {
  const [resumes, setResumes] = useState([]);
  const [jobDescription, setJobDescription] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState('hero'); // hero, upload, results

  const handleStartScreening = () => {
    setStage('upload');
  };

  const handleAnalyze = async (uploadedResumes, jobDesc) => {
    setLoading(true);
    setResumes(uploadedResumes);
    setJobDescription(jobDesc);

    try {
      // Upload resumes to backend
      const formData = new FormData();
      uploadedResumes.forEach(file => {
        formData.append('files', file);
      });

      const uploadResponse = await fetch('http://localhost:8000/batch-upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) throw new Error('Upload failed');

      // Match with job description
      const matchFormData = new FormData();
      matchFormData.append('job_description', jobDesc);

      const matchResponse = await fetch('http://localhost:8000/match', {
        method: 'POST',
        body: matchFormData,
      });

      if (!matchResponse.ok) throw new Error('Matching failed');

      const matchData = await matchResponse.json();
      setResults(matchData);
      setStage('results');
    } catch (error) {
      console.error('Error:', error);
      alert('Error processing resumes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStage('hero');
    setResults(null);
    setResumes([]);
    setJobDescription('');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      
      
      <AnimatePresence mode="wait">
        {stage === 'hero' && (
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Hero onStart={handleStartScreening} />
          </motion.div>
        )}

        {stage === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            <UploadSection onAnalyze={handleAnalyze} onBack={handleReset} />
          </motion.div>
        )}

        {stage === 'results' && results && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          >
            <ResultsDashboard results={results} onReset={handleReset} />
          </motion.div>
        )}
      </AnimatePresence>

      {loading && <LoadingOverlay />}
      <AnimatedBackground />
    </div>
  );
}

export default App;