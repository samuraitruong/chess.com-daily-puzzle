import React from 'react';
import { motion } from 'framer-motion';

interface CelebrationConfigProps {
  celebrationType: 'confetti' | 'fireworks' | 'party' | 'trophy';
  onTypeChange: (type: 'confetti' | 'fireworks' | 'party' | 'trophy') => void;
}

const celebrationTypes = [
  {
    id: 'confetti' as const,
    name: 'Confetti',
    emoji: '🎊',
    description: 'Classic confetti celebration'
  },
  {
    id: 'fireworks' as const,
    name: 'Fireworks',
    emoji: '🎆',
    description: 'Spectacular fireworks display'
  },
  {
    id: 'party' as const,
    name: 'Party',
    emoji: '🎉',
    description: 'Fun party celebration'
  },
  {
    id: 'trophy' as const,
    name: 'Trophy',
    emoji: '🏆',
    description: 'Victory trophy celebration'
  }
];

const CelebrationConfig: React.FC<CelebrationConfigProps> = ({
  celebrationType,
  onTypeChange
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Choose Celebration Style</h3>
      <div className="grid grid-cols-2 gap-3">
        {celebrationTypes.map((type) => (
          <motion.button
            key={type.id}
            onClick={() => onTypeChange(type.id)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              celebrationType === type.id
                ? 'border-yellow-400 bg-yellow-400/10'
                : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-2xl mb-2">{type.emoji}</div>
            <div className="text-sm font-medium text-white">{type.name}</div>
            <div className="text-xs text-gray-400">{type.description}</div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default CelebrationConfig;
