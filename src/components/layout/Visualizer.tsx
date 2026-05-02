import { motion } from 'framer-motion';

export const Visualizer = ({ isPlaying }: { isPlaying: boolean }) => {
  return (
    <div className="flex items-center gap-0.5 h-3">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            height: isPlaying ? [4, 12, 6, 10, 4] : 4,
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut"
          }}
          className="w-0.5 bg-[var(--accent-primary)] rounded-full"
        />
      ))}
    </div>
  );
};
