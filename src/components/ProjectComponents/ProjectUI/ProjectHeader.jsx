// /components/project/ui/ProjectHeader.jsx
import React from 'react';
import { Badge } from '@/components/ui/badge';

const ProjectHeader = ({ project }) => {
  // Function to get badge color based on tag name
  const getBadgeStyles = (tag) => {
    const tagMap = {
      'c++': 'bg-blue-500/10 text-blue-400 border-blue-500/20 dark:bg-blue-900/20 dark:text-blue-300',
      'python': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 dark:bg-yellow-900/20 dark:text-yellow-300',
      'javascript': 'bg-amber-500/10 text-amber-500 border-amber-500/20 dark:bg-amber-900/20 dark:text-amber-300',
      'stl': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:bg-emerald-900/20 dark:text-emerald-300',
      'engineering': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:bg-emerald-900/20 dark:text-emerald-300',
      'open source': 'bg-purple-500/10 text-purple-500 border-purple-500/20 dark:bg-purple-900/20 dark:text-purple-300',
      'research': 'bg-pink-500/10 text-pink-500 border-pink-500/20 dark:bg-pink-900/20 dark:text-pink-300',
      'education': 'bg-orange-500/10 text-orange-500 border-orange-500/20 dark:bg-orange-900/20 dark:text-orange-300',
    };
    
    return tagMap[tag.toLowerCase()] || 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20 dark:bg-zinc-400/10 dark:text-zinc-300';
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#90EE90] via-[#66CDAA] to-[#32CD32] bg-clip-text text-transparent transition-opacity hover:opacity-90">
          {project.title}
        </h1>
      </div>
      
      <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-light">
        {project.description}
      </p>
      
      <div className="mt-6 flex flex-wrap gap-2">
        {project.tags && project.tags.length > 0 ? (
          project.tags.map((tag, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className={`${getBadgeStyles(tag)} transition-all hover:scale-105`}
            >
              {tag}
            </Badge>
          ))
        ) : (
          <>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:bg-emerald-900/20 dark:text-emerald-300 transition-all hover:scale-105">
              Engineering
            </Badge>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 dark:bg-blue-900/20 dark:text-blue-300 transition-all hover:scale-105">
              C++
            </Badge>
          </>
        )}
      </div>
      
      {project.createdAt && (
        <div className="mt-6 text-muted-foreground text-sm font-geist font-light">
          Created: {new Date(project.createdAt).toLocaleDateString()}
        </div>
      )}
      
      {project.updatedAt && (
        <div className="text-muted-foreground text-sm font-geist font-light">
          Last updated: {new Date(project.updatedAt).toLocaleDateString()}
        </div>
      )}
    </>
  );
};

export default ProjectHeader;