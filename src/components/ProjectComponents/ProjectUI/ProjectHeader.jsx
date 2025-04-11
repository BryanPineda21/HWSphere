// /components/project/ui/ProjectHeader.jsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Calendar, RefreshCw, Tag, Clock } from 'lucide-react';

const ProjectHeader = ({ project }) => {
  // Function to get badge color based on tag name
  const getBadgeStyles = (tag) => {
    const tagMap = {
      'c++': 'bg-blue-500/10 text-blue-500 border-blue-500/20 dark:bg-blue-900/20 dark:text-blue-300',
      'python': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 dark:bg-yellow-900/20 dark:text-yellow-300',
      'javascript': 'bg-amber-500/10 text-amber-500 border-amber-500/20 dark:bg-amber-900/20 dark:text-amber-300',
      'typescript': 'bg-blue-500/10 text-blue-500 border-blue-500/20 dark:bg-blue-900/20 dark:text-blue-300',
      'react': 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20 dark:bg-cyan-900/20 dark:text-cyan-300',
      'next.js': 'bg-black/10 text-gray-800 border-black/20 dark:bg-white/10 dark:text-gray-300',
      'html': 'bg-orange-500/10 text-orange-500 border-orange-500/20 dark:bg-orange-900/20 dark:text-orange-300',
      'css': 'bg-blue-500/10 text-blue-500 border-blue-500/20 dark:bg-blue-900/20 dark:text-blue-300',
      'stl': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:bg-emerald-900/20 dark:text-emerald-300',
      'engineering': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:bg-emerald-900/20 dark:text-emerald-300',
      'open source': 'bg-purple-500/10 text-purple-500 border-purple-500/20 dark:bg-purple-900/20 dark:text-purple-300',
      'research': 'bg-pink-500/10 text-pink-500 border-pink-500/20 dark:bg-pink-900/20 dark:text-pink-300',
      'education': 'bg-orange-500/10 text-orange-500 border-orange-500/20 dark:bg-orange-900/20 dark:text-orange-300',
      'ai': 'bg-purple-500/10 text-purple-500 border-purple-500/20 dark:bg-purple-900/20 dark:text-purple-300',
      'machine learning': 'bg-purple-500/10 text-purple-500 border-purple-500/20 dark:bg-purple-900/20 dark:text-purple-300',
      'web': 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20 dark:bg-indigo-900/20 dark:text-indigo-300',
      'mobile': 'bg-sky-500/10 text-sky-500 border-sky-500/20 dark:bg-sky-900/20 dark:text-sky-300',
      'ux': 'bg-pink-500/10 text-pink-500 border-pink-500/20 dark:bg-pink-900/20 dark:text-pink-300',
      'ui': 'bg-rose-500/10 text-rose-500 border-rose-500/20 dark:bg-rose-900/20 dark:text-rose-300',
      'game': 'bg-red-500/10 text-red-500 border-red-500/20 dark:bg-red-900/20 dark:text-red-300',
    };
    
    return tagMap[tag.toLowerCase()] || 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20 dark:bg-zinc-400/10 dark:text-zinc-300';
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };
  
  const badgeVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 500,
        damping: 25
      }
    },
    hover: { 
      scale: 1.1,
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  // Calculate time difference for "Last updated"
  const getTimeAgo = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  // Add some extra category info if available
  const projectCategory = project.category || (project.tags && project.tags[0]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="mb-8 space-y-6"
    >
      {/* Title section with optional category */}
      <div className="space-y-2">
        {projectCategory && (
          <motion.div variants={itemVariants} className="flex items-center">
            <Tag className="w-4 h-4 mr-2 text-primary/70" />
            <span className="text-sm font-medium text-primary/70 uppercase tracking-wider">
              {projectCategory}
            </span>
          </motion.div>
        )}
        
        <motion.h1 
          variants={itemVariants}
          className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#90EE90] via-[#66CDAA] to-[#32CD32] bg-clip-text text-transparent"
        >
          {project.title}
        </motion.h1>
        
        {/* Dates row - more compact and with icons */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground text-sm"
        >
          {project.createdAt && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(project.createdAt)}</span>
            </div>
          )}
          
          {project.updatedAt && (
            <div className="flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Updated {getTimeAgo(project.updatedAt)}</span>
            </div>
          )}
          
          {project.readTime && (
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{project.readTime} min read</span>
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Description with light left border for visual interest */}
      <motion.div 
        variants={itemVariants}
        className="border-l-2 border-primary/20 pl-4 my-6"
      >
        <p className="text-foreground/80 dark:text-foreground/90 text-sm sm:text-base leading-relaxed">
          {project.description}
        </p>
      </motion.div>
      
      {/* Tags with animation */}
      <motion.div 
        variants={itemVariants}
        className="flex flex-wrap gap-2 items-center"
      >
        <span className="text-muted-foreground text-sm mr-1 flex items-center">
          <Tag className="w-3.5 h-3.5 mr-1.5" /> Tags:
        </span>
        
        {project.tags && project.tags.length > 0 ? (
          project.tags.map((tag, index) => (
            <motion.div
              key={index}
              variants={badgeVariants}
              whileHover="hover"
            >
              <Badge 
                variant="outline" 
                className={`${getBadgeStyles(tag)} text-xs px-2.5 py-0.5 font-medium`}
              >
                {tag}
              </Badge>
            </motion.div>
          ))
        ) : (
          <>
            <motion.div variants={badgeVariants} whileHover="hover">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:bg-emerald-900/20 dark:text-emerald-300 text-xs px-2.5 py-0.5 font-medium">
                Engineering
              </Badge>
            </motion.div>
            <motion.div variants={badgeVariants} whileHover="hover">
              <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 dark:bg-blue-900/20 dark:text-blue-300 text-xs px-2.5 py-0.5 font-medium">
                C++
              </Badge>
            </motion.div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ProjectHeader;