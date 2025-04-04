import { Button } from '@/components/ui/button';
import { Save, Trash2 } from 'lucide-react';
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

const ProjectFormActions = ({
  isFormValid,
  hideForm,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  handleDeleteProject
}) => {
  return (
    <div className="flex justify-between gap-4 mt-6">
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300 transition-all"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Project
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="border-red-200 dark:border-red-900/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-700 dark:text-red-400">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              project and remove all associated files from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteProject}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={hideForm}
          className="border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all"
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          className="bg-green-600 hover:bg-green-700 transition-colors"
          disabled={!isFormValid}
        >
          <Save className="w-4 h-4 mr-2" />
          Update Project
        </Button>
      </div>
    </div>
  );
};

export default ProjectFormActions;