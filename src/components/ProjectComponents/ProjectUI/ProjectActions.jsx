// /components/project/ui/ProjectActions.jsx
import React,{useState}from 'react';
import { Pencil, Trash2, Share2, Check, Copy, ExternalLink, Mail, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
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

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from 'sonner';

const ProjectActions = ({ 
  projectId, 
  projectTitle,
  onEdit, 
  onDelete, 
  isDeleteDialogOpen, 
  setIsDeleteDialogOpen 
}) => {
  const [copied, setCopied] = useState(false);
  const [shareExpanded, setShareExpanded] = useState(false);
  
  const shareUrl = `${window.location.origin}/project/${projectId}`;
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopied(true);
        toast.success('Project link copied to clipboard');
        
        // Reset copied state after 2 seconds
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        toast.error('Failed to copy link');
      });
  };
  
  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Check out this project: ${projectTitle || 'My Project'}`);
    const body = encodeURIComponent(`I thought you might be interested in this project:\n\n${shareUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
    setShareExpanded(false);
  };
  
  const handleOpenLink = () => {
    window.open(shareUrl, '_blank');
    setShareExpanded(false);
  };
  
  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: projectTitle || 'My Project',
        text: 'Check out this project',
        url: shareUrl
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      handleCopyLink();
    }
    setShareExpanded(false);
  };

  const buttonVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 24 
      } 
    },
    exit: { 
      opacity: 0, 
      y: 20, 
      transition: { 
        duration: 0.2 
      } 
    },
    hover: { 
      scale: 1.02,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 10 
      }
    },
    tap: { 
      scale: 0.98 
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <motion.div 
        initial="initial"
        animate="animate"
        className="space-y-3"
        variants={{
          initial: { opacity: 0 },
          animate: { 
            opacity: 1,
            transition: { 
              staggerChildren: 0.1,
              delayChildren: 0.1
            }
          }
        }}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button 
                variant="default" 
                className="w-full bg-gradient-to-r from-[#90EE90] via-[#66CDAA] to-[#32CD32] hover:brightness-110 text-white dark:text-white hover:shadow-md transition-all border-[#66CDAA]/40 dark:border-[#66CDAA]/40"
                onClick={onEdit}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit Project
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Edit project details and content</p>
          </TooltipContent>
        </Tooltip>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <AnimatePresence mode="wait">
            {!shareExpanded ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div 
                    key="shareButton"
                    variants={buttonVariants} 
                    whileHover="hover" 
                    whileTap="tap"
                    className="flex-1"
                  >
                    <Button
                      variant="default" 
                      className="w-full border bg-blue-500/80 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-500 text-white border-blue-400/40 dark:border-blue-400/40"
                      onClick={() => setShareExpanded(true)}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                      <ChevronDown className="w-3 h-3 ml-2 opacity-70" />
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Share this project</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <motion.div 
                key="shareOptions"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex-1 flex flex-col gap-2"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                      <Button
                        variant="default"
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:brightness-110 text-white dark:text-white border-blue-400/40"
                        onClick={handleCopyLink}
                      >
                        {copied ? <Check className="w-4 h-4 mr-2 text-white" /> : <Copy className="w-4 h-4 mr-2" />}
                        Copy Link
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Copy link to clipboard</p>
                  </TooltipContent>
                </Tooltip>
                
                <div className="flex gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" className="flex-1">
                                                  <Button
                          variant="default"
                          size="sm"
                          className="w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:brightness-110 text-white dark:text-white border-purple-400/40"
                          onClick={handleEmailShare}
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Share via email</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" className="flex-1">
                                                  <Button
                          variant="default"
                          size="sm"
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:brightness-110 text-white dark:text-white border-green-400/40"
                          onClick={handleNativeShare}
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Share natively</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" className="flex-1">
                                                  <Button
                          variant="default"
                          size="sm"
                          className="w-full bg-gradient-to-r from-cyan-500 to-sky-500 hover:brightness-110 text-white dark:text-white border-cyan-400/40"
                          onClick={handleOpenLink}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Open in new tab</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" className="flex-1">
                                                  <Button
                          variant="default"
                          size="sm"
                          className="w-full bg-gradient-to-r from-gray-500 to-gray-700 hover:brightness-110 text-white dark:text-white border-gray-400/40"
                          onClick={() => setShareExpanded(false)}
                        >
                          <ChevronDown className="w-4 h-4 rotate-180" />
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Close sharing options</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div 
                  variants={buttonVariants} 
                  whileHover="hover" 
                  whileTap="tap"
                  className="flex-1"
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="default"
                      className="w-full bg-destructive hover:bg-destructive/90 text-white dark:text-white border-destructive/30"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Delete this project</p>
              </TooltipContent>
            </Tooltip>
            
            <AlertDialogContent className="bg-background  dark:border-emerald-700/30 border-emerald-400/30 shadow-lg shadow-emerald-500/5">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
              >
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-2xl bg-gradient-to-r from-[#90EE90] via-[#66CDAA] to-[#32CD32] bg-clip-text text-transparent font-bold">Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription className="text-destructive/90 dark:text-destructive font-medium text-base mt-2">
                    This action cannot be undone. This will permanently delete your
                    project and remove all associated files from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-6">
                  <AlertDialogCancel className="bg-background text-foreground border-border hover:bg-muted/20 transition-all">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-all"
                    onClick={onDelete}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </motion.div>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </motion.div>
    </TooltipProvider>
  );
};

export default ProjectActions;