import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import Lottie from 'lottie-react';

interface EnhancedCelebrationScreenProps {
  isVisible: boolean;
  onClose: () => void;
  puzzleTitle?: string;
  timeToSolve?: number;
  failedAttempts?: number;
  celebrationType?: 'confetti' | 'fireworks' | 'party' | 'trophy';
}

// Sample Lottie animations (you can replace these with actual Lottie JSON files)
const celebrationAnimations = {
  confetti: {
    // This would be a confetti Lottie animation JSON
    v: "5.7.4",
    fr: 30,
    ip: 0,
    op: 90,
    w: 400,
    h: 400,
    nm: "Confetti",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "Confetti",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { a: 0, k: 0 },
          p: { a: 0, k: [200, 200, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [100, 100, 100] }
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                d: 1,
                ty: "el",
                s: { a: 0, k: [10, 10] },
                p: { a: 0, k: [0, 0] }
              },
              {
                ty: "fl",
                c: { a: 0, k: [1, 0.5, 0, 1] }
              }
            ]
          }
        ],
        ip: 0,
        op: 90,
        st: 0,
        bm: 0
      }
    ],
    markers: []
  },
  fireworks: {
    // This would be a fireworks Lottie animation JSON
    v: "5.7.4",
    fr: 30,
    ip: 0,
    op: 120,
    w: 400,
    h: 400,
    nm: "Fireworks",
    ddd: 0,
    assets: [],
    layers: [],
    markers: []
  },
  party: {
    // Placeholder: reuse fireworks animation until a party animation is provided
    v: "5.7.4",
    fr: 30,
    ip: 0,
    op: 120,
    w: 400,
    h: 400,
    nm: "Party",
    ddd: 0,
    assets: [],
    layers: [],
    markers: []
  },
  trophy: {
    // Placeholder: reuse fireworks animation until a trophy animation is provided
    v: "5.7.4",
    fr: 30,
    ip: 0,
    op: 120,
    w: 400,
    h: 400,
    nm: "Trophy",
    ddd: 0,
    assets: [],
    layers: [],
    markers: []
  }
};

const EnhancedCelebrationScreen: React.FC<EnhancedCelebrationScreenProps> = ({
  isVisible,
  onClose,
  puzzleTitle,
  timeToSolve = 0,
  failedAttempts = 0,
  celebrationType = 'confetti'
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({
    width: 0,
    height: 0
  });
  const [showLottie, setShowLottie] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowConfetti(true);
      setShowLottie(true);
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
      
      // Stop confetti after 5 seconds
      const timer = setTimeout(() => {
        setShowConfetti(false);
        setShowLottie(false);
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
      return "Perfect! Flawless victory! 🎯";
    } else if (failedAttempts <= 2) {
      return "Excellent work! 🏆";
    } else if (failedAttempts <= 5) {
      return "Great job! 💪";
    } else {
      return "Well done! 🎉";
    }
  };

  const getCelebrationEmoji = () => {
    switch (celebrationType) {
      case 'fireworks': return '🎆';
      case 'party': return '🎉';
      case 'trophy': return '🏆';
      default: return '🎊';
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

  const floatingElements = Array.from({ length: 25 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute text-4xl opacity-20"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
      animate={{
        y: [0, -30, 0],
        rotate: [0, 15, -15, 0],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 4 + Math.random() * 3,
        repeat: Infinity,
        ease: "easeInOut",
        delay: Math.random() * 2
      }}
    >
      {['🎉', '🎊', '✨', '🌟', '💫', '🎈', '🏆', '🥇', '🎆', '🎇'][Math.floor(Math.random() * 10)]}
    </motion.div>
  ));

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
                numberOfPieces={300}
                gravity={0.2}
                initialVelocityY={25}
                colors={['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#FF9F43', '#6C5CE7']}
              />
            </motion.div>
          )}

          {/* Lottie Animation Overlay */}
          {showLottie && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
            >
              <Lottie
                animationData={celebrationAnimations[celebrationType]}
                loop={true}
                style={{ width: '100%', height: '100%' }}
              />
            </motion.div>
          )}

          {/* Floating Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {floatingElements}
          </div>

          {/* Main Content */}
          <motion.div
            className="relative z-10 text-center px-6 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            {/* Success Icon */}
            <motion.div
              className="mb-8"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="text-8xl mb-4">{getCelebrationEmoji()}</div>
            </motion.div>

            {/* Title */}
            <motion.h1
              className="text-5xl md:text-6xl font-bold text-white mb-4"
              variants={itemVariants}
            >
              Puzzle Solved!
            </motion.h1>

            {/* Performance Message */}
            <motion.p
              className="text-xl md:text-2xl text-yellow-300 mb-6"
              variants={itemVariants}
            >
              {getPerformanceMessage()}
            </motion.p>

            {/* Stats */}
            <motion.div
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20"
              variants={itemVariants}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-yellow-400">
                    {formatTime(timeToSolve)}
                  </div>
                  <div className="text-sm text-gray-300">Time to solve</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-400">
                    {failedAttempts}
                  </div>
                  <div className="text-sm text-gray-300">Failed attempts</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-400">
                    {puzzleTitle || 'Daily Puzzle'}
                  </div>
                  <div className="text-sm text-gray-300">Puzzle</div>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={itemVariants}
            >
              <motion.button
                onClick={onClose}
                className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-full text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Continue Playing
              </motion.button>
              
              <motion.button
                onClick={() => {
                  // Add share functionality here
                  if (navigator.share) {
                    navigator.share({
                      title: 'Chess Puzzle Solved!',
                      text: `I just solved today's chess puzzle in ${formatTime(timeToSolve)}! 🎉`,
                    });
                  }
                }}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-full text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Share Victory
              </motion.button>
            </motion.div>

            {/* Celebration Text */}
            <motion.p
              className="text-lg text-gray-300 mt-8"
              variants={itemVariants}
            >
              Your tactical skills are improving! 🧠✨
            </motion.p>
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

export default EnhancedCelebrationScreen;
