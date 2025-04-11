// /components/project/ui/ProjectActions.jsx
import React from 'react';
import { Pencil, Trash2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

const ProjectActions = ({ 
  projectId, 
  onEdit, 
  onDelete, 
  isDeleteDialogOpen, 
  setIsDeleteDialogOpen 
}) => {
  const handleShare = () => {
    // Create a URL to share
    const shareUrl = `${window.location.origin}/project/${projectId}`;
    
    // Try to use the Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: 'Check out this project',
        url: shareUrl
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          toast.success('Project link copied to clipboard');
        })
        .catch(err => {
          console.error('Failed to copy:', err);
          toast.error('Failed to copy link');
        });
    }
  };

  return (
    <div className="space-y-3">
      <Button 
        variant="outline" 
        className="w-full dark:bg-zinc-800/50 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 transition-all"
        onClick={onEdit}
      >
        <Pencil className="w-4 h-4 mr-2" />
        Edit Project
      </Button>
      
      <div className="flex gap-2">
        <Button
          variant="outline" 
          className="flex-1 border-muted hover:bg-muted/10"
          onClick={handleShare}
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-background border-border dark:border-emerald-700 border-emerald-400">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-emerald-600 font-geist font-extrabold">Are you sure?</AlertDialogTitle>
              <AlertDialogDescription className="text-destructive/90 dark:text-destructive font-geist text-base">
                This action cannot be undone. This will permanently delete your
                project and remove all associated files from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-background text-foreground border-border hover:bg-muted/20">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                onClick={onDelete}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ProjectActions;