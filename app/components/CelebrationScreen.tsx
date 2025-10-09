import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { DayPicker } from 'react-day-picker';
import { addDays, format, subDays, isSameDay } from 'date-fns';
import 'react-day-picker/dist/style.css';

interface CelebrationScreenProps {
  isVisible: boolean;
  onClose: () => void;
  puzzleTitle?: string;
  timeToSolve?: number;
  failedAttempts?: number;
  currentDate: Date;
  disabledDays?: Date[];
  solvedDays?: Date[];
  onDateSelect?: (date: Date) => void;
  videoUrl?: string;
}

const CelebrationScreen: React.FC<CelebrationScreenProps> = ({
  isVisible,
  onClose,
  puzzleTitle,
  timeToSolve = 0,
  failedAttempts = 0,
  currentDate,
  disabledDays = [],
  solvedDays = [],
  onDateSelect,
  videoUrl
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({
    width: 0,
    height: 0
  });

  useEffect(() => {
    if (isVisible) {
      setShowConfetti(true);
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
      
      // Stop confetti after 5 seconds
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPerformanceMessage = () => {
    if (failedAttempts === 0) {
      return "Perfect! Flawless problem solving! 🎯";
    } else if (failedAttempts <= 2) {
      return "Excellent work! 🏆";
    } else if (failedAttempts <= 5) {
      return "Great job! 💪";
    } else {
      return "Well done! 🎉";
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.2
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.8
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const confettiVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      scale: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  const floatingElements = Array.from({ length: 20 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute text-4xl opacity-20"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
      animate={{
        y: [0, -20, 0],
        rotate: [0, 10, -10, 0],
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {['🎉', '🎊', '✨', '🌟', '💫', '🎈', '🏆', '🥇'][Math.floor(Math.random() * 8)]}
    </motion.div>
  ));

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate && onDateSelect) {
      onDateSelect(selectedDate);
      onClose();
    }
  };

  const gotoPrevDate = () => {
    let d = subDays(currentDate, 1);
    let guard = 0;
    while (disabledDays.some(dd => isSameDay(dd, d)) && guard < 366) {
      d = subDays(d, 1);
      guard++;
    }
    if (onDateSelect) {
      onDateSelect(d);
      onClose();
    }
  };

  const gotoNextDate = () => {
    let d = addDays(currentDate, 1);
    let guard = 0;
    while (disabledDays.some(dd => isSameDay(dd, d)) && guard < 366) {
      d = addDays(d, 1);
      guard++;
    }
    if (onDateSelect) {
      onDateSelect(d);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Confetti Animation */}
          {showConfetti && (
            <motion.div
              variants={confettiVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <Confetti
                width={windowDimensions.width}
                height={windowDimensions.height}
                recycle={false}
                numberOfPieces={200}
                gravity={0.3}
                initialVelocityY={20}
                colors={['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8']}
              />
            </motion.div>
          )}

          {/* Floating Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {floatingElements}
          </div>

          {/* Main Content Container */}
          <motion.div
            className="relative z-10 w-full max-w-6xl mx-auto px-4 py-8"
            variants={itemVariants}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Left Side - Celebration Content */}
              <motion.div
                className="text-center lg:text-left"
                variants={itemVariants}
              >
                {/* Success Icon */}
                <motion.div
                  className="mb-6"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="text-6xl mb-4">🎉</div>
                </motion.div>

                {/* Title */}
                <motion.h1
                  className="text-4xl lg:text-5xl font-bold text-white mb-4"
                  variants={itemVariants}
                >
                  Puzzle Solved!
                </motion.h1>

                {/* Performance Message */}
                <motion.p
                  className="text-lg lg:text-xl text-yellow-300 mb-6"
                  variants={itemVariants}
                >
                  {getPerformanceMessage()}
                </motion.p>

                {/* Stats */}
                <motion.div
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20"
                  variants={itemVariants}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-yellow-400">
                        {formatTime(timeToSolve)}
                      </div>
                      <div className="text-sm text-gray-300">Time to solve</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-400">
                        {failedAttempts}
                      </div>
                      <div className="text-sm text-gray-300">Failed attempts</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-400">
                        {puzzleTitle || 'Daily Puzzle'}
                      </div>
                      <div className="text-sm text-gray-300">Puzzle</div>
                    </div>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                  variants={itemVariants}
                >
                  <motion.button
                    onClick={onClose}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-full text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Review Solution 📋
                  </motion.button>
                  
                  {videoUrl && (
                    <motion.button
                      onClick={() => setShowVideo(true)}
                      className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold rounded-full text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Watch Video 🎥
                    </motion.button>
                  )}
                  
                  <motion.button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: 'Chess Puzzle Solved!',
                          text: `I just solved today's chess puzzle in ${formatTime(timeToSolve)}! 🎉`,
                        });
                      }
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-full text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Share Victory 📤
                  </motion.button>
                </motion.div>

                {/* Celebration Text */}
                <motion.p
                  className="text-base text-gray-300 mt-6"
                  variants={itemVariants}
                >
                  Your tactical skills are improving! 🧠✨
                </motion.p>
              </motion.div>

              {/* Right Side - Calendar or Video */}
              <motion.div
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                variants={itemVariants}
              >
                {!showVideo ? (
                  // Calendar View
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white">Choose Your Next Challenge</h3>
                      <div className="flex gap-2">
                        <motion.button
                          onClick={gotoPrevDate}
                          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          ←
                        </motion.button>
                        <motion.button
                          onClick={gotoNextDate}
                          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          →
                        </motion.button>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-2 mb-4">
                      <DayPicker
                        className="rdp-dark w-full"
                        month={currentDate}
                        mode="single"
                        selected={currentDate}
                        onSelect={handleDateSelect}
                        disabled={disabledDays}
                        modifiers={{ 
                          solved: solvedDays,
                          current: [currentDate]
                        }}
                        modifiersClassNames={{ 
                          solved: 'bg-green-500/20 text-green-300 border-green-400/50',
                          current: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/50 font-bold'
                        }}
                        styles={{
                          day: {
                            borderRadius: '8px',
                            margin: '2px',
                            transition: 'all 0.2s ease'
                          },
                          day_selected: {
                            backgroundColor: '#F59E0B',
                            color: '#000',
                            fontWeight: 'bold'
                          },
                          day_today: {
                            backgroundColor: '#F59E0B',
                            color: '#000',
                            fontWeight: 'bold'
                          }
                        }}
                      />
                    </div>

                    <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-green-500/20 border border-green-400/50"></div>
                        <span>Solved</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-yellow-500/20 border border-yellow-400/50"></div>
                        <span>Today</span>
                      </div>
                    </div>
                  </>
                ) : (
                  // Video View
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white">Solution Video</h3>
                      <motion.button
                        onClick={() => setShowVideo(false)}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        ✕
                      </motion.button>
                    </div>

                    <div className="rounded-lg overflow-hidden bg-slate-800">
                      <video
                        controls
                        playsInline
                        className="w-full h-auto max-h-[70vh] object-contain"
                        poster=""
                        preload="metadata"
                        autoPlay
                      >
                        <source src={videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>

                    <div className="mt-3 flex items-center justify-center gap-4 text-sm text-gray-300">
                      <motion.button
                        onClick={() => window.open(videoUrl, '_blank')}
                        className="text-sm text-blue-400 hover:text-blue-300 underline"
                        whileHover={{ scale: 1.05 }}
                      >
                        Open in new tab
                      </motion.button>
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* Close Button */}
          <motion.button
            onClick={onClose}
            className="absolute top-6 right-6 text-white/70 hover:text-white text-2xl z-20"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ✕
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CelebrationScreen;
