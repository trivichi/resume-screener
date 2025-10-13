import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, ChevronLeft, Sparkles } from 'lucide-react';

export default function UploadSection({ onAnalyze, onBack }) {
  const [resumes, setResumes] = useState([]);
  const [jobDescription, setJobDescription] = useState('');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true,
    onDrop: (acceptedFiles) => {
      setResumes([...resumes, ...acceptedFiles]);
    },
  });

  const removeResume = (index) => {
    setResumes(resumes.filter((_, i) => i !== index));
  };

  const handleAnalyze = () => {
    if (resumes.length > 0 && jobDescription.trim()) {
      onAnalyze(resumes, jobDescription);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-6xl"
      >
        <div className="flex items-center gap-4 mb-8">
          <motion.button
            whileHover={{ x: -5 }}
            onClick={onBack}
            className="p-3 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">Upload & Analyze</h2>
            <p className="text-white/60">Add resumes and job description to start screening</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <Upload className="w-6 h-6 text-purple-400" />
              <h3 className="text-2xl font-bold text-white">Resume Upload</h3>
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium">
                {resumes.length} files
              </span>
            </div>

            <motion.div
              {...getRootProps()}
              whileHover={{ scale: 1.02 }}
              className={`relative p-12 rounded-3xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${
                isDragActive
                  ? 'border-purple-400 bg-purple-500/10'
                  : 'border-white/20 bg-white/5 backdrop-blur-xl hover:bg-white/10'
              }`}
            >
              <input {...getInputProps()} />
              
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 opacity-50" />
              
              <div className="relative text-center">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-6"
                >
                  <Upload className="w-12 h-12 text-white" />
                </motion.div>
                
                <p className="text-xl font-semibold text-white mb-2">
                  {isDragActive ? 'Drop resumes here' : 'Drag & drop PDF resumes'}
                </p>
                <p className="text-white/60">or click to browse files</p>
              </div>
            </motion.div>

            <AnimatePresence>
              {resumes.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 max-h-80 overflow-y-auto"
                >
                  {resumes.map((file, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2 rounded-lg bg-purple-500/20">
                          <FileText className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{file.name}</p>
                          <p className="text-white/50 text-sm">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeResume(index)}
                        className="p-2 rounded-lg bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/30"
                      >
                        <X className="w-5 h-5" />
                      </motion.button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-pink-400" />
              <h3 className="text-2xl font-bold text-white">Job Description</h3>
            </div>

            <div className="relative">
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here...&#10;&#10;Example:&#10;We are looking for a Frontend Developer with React experience. Must have skills in JavaScript, HTML, CSS, and REST API integration..."
                className="w-full h-[450px] p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-pink-400 focus:bg-white/10 transition-all resize-none"
                style={{ fontSize: '16px', lineHeight: '1.6' }}
              />
              
              <div className="absolute bottom-4 right-4 px-3 py-1 rounded-lg bg-black/30 backdrop-blur-xl text-white/60 text-sm">
                {jobDescription.length} characters
              </div>
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAnalyze}
          disabled={resumes.length === 0 || !jobDescription.trim()}
          className="w-full mt-8 py-6 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white text-xl font-bold shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all relative overflow-hidden group"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-200%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
          <span className="relative flex items-center justify-center gap-3">
            <Sparkles className="w-6 h-6" />
            Analyze {resumes.length} Resume{resumes.length !== 1 ? 's' : ''}
            <Sparkles className="w-6 h-6" />
          </span>
        </motion.button>
      </motion.div>
    </div>
  );
}