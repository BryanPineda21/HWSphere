import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const FileUploadCard = ({
  icon: Icon,
  label,
  hasFile,
  fileName,
  fileType,
  acceptTypes,
  colorClass,
  handleFileChange,
  handleRemoveFile
}) => {
  // Generate appropriate color classes based on the colorClass input
  const getBorderClass = () => {
    if (!hasFile) return 'hover:border-zinc-400 dark:hover:border-zinc-600';
    return `border-${colorClass}-300 bg-${colorClass}-50 dark:border-${colorClass}-900 dark:bg-${colorClass}-900/20`;
  };
  
  const getIconClass = () => {
    if (!hasFile) return 'text-zinc-400';
    return `text-${colorClass}-600 dark:text-${colorClass}-400`;
  };
  
  const getTextClass = () => {
    if (!hasFile) return '';
    return `text-${colorClass}-700 dark:text-${colorClass}-300`;
  };
  
  const getButtonClass = () => {
    return `mt-2 h-6 text-xs text-${colorClass}-700 dark:text-${colorClass}-300 hover:bg-${colorClass}-100 dark:hover:bg-${colorClass}-900/30`;
  };
  
  const getBadgeClass = () => {
    return `bg-${colorClass}-100 text-${colorClass}-700 dark:bg-${colorClass}-900/30 dark:text-${colorClass}-300`;
  };

  return (
    <div className={`border rounded-lg p-3 text-center ${hasFile ? getBorderClass() : 'hover:border-zinc-400 dark:hover:border-zinc-600'} transition-all`}>
      <label className="cursor-pointer flex flex-col items-center h-full">
        <Icon className={`h-8 w-8 mb-2 ${hasFile ? getIconClass() : 'text-zinc-400'}`} />
        <span className="text-sm font-medium mb-1">{label}</span>
        {hasFile ? (
          <div className="mt-1 flex flex-col items-center">
            <span className={`text-xs ${getTextClass()} font-medium truncate max-w-full px-2`}>
              {fileName.length > 15 ? fileName.slice(0, 12) + '...' : fileName}
            </span>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className={getButtonClass()}
              onClick={(e) => {
                e.preventDefault();
                handleRemoveFile(fileType);
              }}
            >
              <X className="h-3 w-3 mr-1" /> Remove
            </Button>
          </div>
        ) : (
          <div className="mt-1 flex items-center justify-center">
            <span className={`${getBadgeClass()} px-3 py-1 rounded-full text-xs`}>
              Upload
            </span>
            <input
              type="file"
              accept={acceptTypes}
              className="hidden"
              onChange={(e) => handleFileChange(e, fileType)}
            />
          </div>
        )}
      </label>
    </div>
  );
};

export default FileUploadCard;