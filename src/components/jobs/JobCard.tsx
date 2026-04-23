import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, Calendar, 
  Trash2, ChevronRight, ChevronLeft,
  ExternalLink,
  Target
} from 'lucide-react';
import type { JobApp } from '../../store/sovereign';
import { cn } from '../../lib/utils';

interface JobCardProps {
  job: JobApp;
  onMove: (direction: 1 | -1) => void;
  onDelete: () => void;
  onClick: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({ 
  job, 
  onMove, 
  onDelete, 
  onClick,
  isFirst,
  isLast
}) => {

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className="group relative bg-white/[0.03] border border-white/10 rounded-xl p-3 transition-all hover:bg-white/[0.05] hover:border-white/20"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col gap-1.5">
          <div className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center">
            <Building2 size={14} className="text-white/40" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white leading-tight line-clamp-2 mb-1">{job.company}</h4>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider line-clamp-1">{job.role}</p>
          </div>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="opacity-0 group-hover:opacity-100 p-2 text-white/20 hover:text-red-400 transition-all rounded-lg hover:bg-red-400/10"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Meta Info */}
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="flex items-center gap-1 text-[8px] font-bold text-white/20 truncate uppercase">
          <Calendar size={10} />
          {new Date(job.date).toLocaleDateString()}
        </div>
        {job.followUpDate && (
           <div className={cn(
             "flex items-center gap-1 text-[8px] font-bold px-1.5 py-0.5 rounded-full border",
             new Date(job.followUpDate) <= new Date() 
               ? "bg-red-400/10 border-red-400/20 text-red-400 font-bold" 
               : "bg-white/5 border-white/10 text-white/40"
           )}>
             <Target size={10} />
             FOLLOW-UP
           </div>
        )}
      </div>

      {/* Strategic Intel Snippet */}
      {job.notes && (
        <div className="mb-3 px-2 py-1.5 bg-black/20 rounded-lg border border-white/5">
          <p className="text-[9px] font-bold leading-relaxed text-white/30 italic line-clamp-2">
            "{job.notes}"
          </p>
        </div>
      )}

      {/* Action Tray */}
      <div className="flex items-center justify-between pt-2.5 border-t border-white/5">
        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
          <button
            disabled={isFirst}
            onClick={() => onMove(-1)}
            className="p-1.5 rounded-md hover:bg-white/5 text-white/20 hover:text-white disabled:opacity-0 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            disabled={isLast}
            onClick={() => onMove(1)}
            className="p-1.5 rounded-md hover:bg-white/5 text-white/20 hover:text-white disabled:opacity-0 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <button
          onClick={onClick}
          className="text-[9px] font-bold font-black uppercase tracking-[0.2em] text-white/20 group-hover:text-white/60 flex items-center gap-1 transition-colors"
        >
          Details <ExternalLink size={10} />
        </button>
      </div>
    </motion.div>
  );
};
