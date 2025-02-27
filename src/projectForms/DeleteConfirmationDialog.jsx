  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription} from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";
  import { Loader2 } from 'lucide-react';
  
  const DeleteConfirmationDialog = ({ 
    isOpen, 
    onClose, 
    onConfirm,
    isPending = false 
  }) => {
    return (
      <Dialog
        open={isOpen}
        onOpenChange={(open) => !open && onClose()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={onConfirm}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : 'Delete Project'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };
  
  export default DeleteConfirmationDialog;