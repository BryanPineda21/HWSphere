const ProjectFormProgress = ({ formProgress }) => {
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-zinc-500">Form completion</span>
          <span className="text-xs font-medium text-green-600 dark:text-green-400">{formProgress}%</span>
        </div>
        <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-green-600 h-1.5 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${formProgress}%` }}
          ></div>
        </div>
      </div>
    );
  };
  
  export default ProjectFormProgress;