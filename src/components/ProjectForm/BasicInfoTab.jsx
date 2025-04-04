import { TabsContent } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageIcon, X, Upload, Users, Eye, EyeOff, Tag } from 'lucide-react';

const BasicInfoTab = ({ 
  activeTab, 
  editedProject, 
  setEditedProject, 
  thumbnailPreview, 
  setThumbnailPreview, 
  files, 
  setFiles, 
  fileNames, 
  setFileNames, 
  project,
  setActiveTab
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProject({
      ...editedProject,
      [name]: value
    });
  };

  const handleTagsChange = (e) => {
    const tagsString = e.target.value;
    
    // Split by comma, clean up each tag, and remove empty tags
    const tagsArray = tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    // Update the project state with the new tags (limit to 4)
    setEditedProject(prev => ({
      ...prev,
      tags: tagsArray.slice(0, 4)
    }));
  };

  const handleTagsKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      
      const inputValue = e.target.value.trim();
      
      // If input doesn't end with comma, add one
      if (inputValue && !inputValue.endsWith(',')) {
        const updatedValue = inputValue + ',';
        e.target.value = updatedValue;
        
        // Trigger the onChange handler with the updated value
        const changeEvent = new Event('input', { bubbles: true });
        e.target.dispatchEvent(changeEvent);
      }
    }
  };

  const handleVisibilityChange = (value) => {
    setEditedProject(prev => ({
      ...prev,
      visibility: value
    }));
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Update the files state
    setFiles(prev => ({
      ...prev,
      [fileType]: file
    }));

    // Update fileNames based on the fileType
    const fileKey = 
      fileType === 'codeFile' ? 'code' : 
      fileType === 'modelFile' ? 'model' : 
      fileType === 'pdfFile' ? 'pdf' :
      fileType === 'videoFile' ? 'video' :
      fileType;
    
    setFileNames(prev => ({
      ...prev,
      [fileKey]: file.name
    }));
    
    // If it's a thumbnail, create a preview
    if (fileType === 'thumbnail' && file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <TabsContent value="basic" className="mt-4 space-y-4">
      {/* Thumbnail Upload */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Project Thumbnail</Label>
        <div className="border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-4 transition-all hover:border-zinc-500 dark:hover:border-zinc-500">
          {thumbnailPreview ? (
            <div className="relative">
              <img 
                src={thumbnailPreview} 
                alt="Project thumbnail" 
                className="w-full h-48 object-cover rounded-md"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="absolute bottom-2 right-2 bg-black/60 hover:bg-black/80 text-white"
                onClick={() => {
                  setThumbnailPreview(null);
                  setFiles(prev => ({ ...prev, thumbnail: null }));
                  setFileNames(prev => ({ ...prev, thumbnail: '' }));
                  if (project.thumbnailUrl) {
                    setEditedProject(prev => ({ ...prev, removeThumbnail: true }));
                  }
                }}
              >
                <X className="w-4 h-4 mr-1" /> Remove
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 bg-zinc-50 dark:bg-zinc-900/30 rounded-md">
              <ImageIcon className="h-12 w-12 text-zinc-300 mb-2" />
              <label className="cursor-pointer">
                <span className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Upload Image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, 'thumbnail')}
                />
              </label>
              <p className="text-xs text-zinc-500 mt-2">
                Recommended: 1200×630px or larger
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium">Project Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="Enter a descriptive title for your project"
          required
          onChange={handleChange}
          value={editedProject.title}
          className="transition-all focus:ring-green-500 focus:border-green-500"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Describe what your project is about, how it works, or what makes it special"
          onChange={handleChange}
          value={editedProject.description}
          className="h-32 transition-all focus:ring-green-500 focus:border-green-500"
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="tags" className="text-sm font-medium">Tags</Label>
          <span className="text-xs text-zinc-500">
            {editedProject.tags.length}/4 tags used
          </span>
        </div>
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Tag className="h-4 w-4 text-zinc-400" />
          </div>
          <Input
            id="tags"
            value={editedProject.tags.join(', ')}
            onChange={handleTagsChange}
            onKeyDown={handleTagsKeyDown}
            placeholder="e.g. javascript, engineering, 3d, tutorial"
            className="pl-9 transition-all focus:ring-green-500 focus:border-green-500"
            aria-describedby="tags-help"
          />
        </div>
        <p id="tags-help" className="text-xs text-zinc-500">
          Enter tags separated by commas, press Enter after each tag
        </p>
        {editedProject.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {editedProject.tags.map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 flex items-center gap-1"
              >
                {tag}
                <button 
                  type="button" 
                  className="ml-1 hover:bg-green-200 dark:hover:bg-green-800 rounded-full w-4 h-4 inline-flex items-center justify-center"
                  onClick={() => {
                    const updatedTags = [...editedProject.tags];
                    updatedTags.splice(index, 1);
                    setEditedProject(prev => ({
                      ...prev,
                      tags: updatedTags
                    }));
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Visibility */}
      <div className="space-y-2">
        <Label htmlFor="visibility" className="text-sm font-medium">Visibility</Label>
        <Select value={editedProject.visibility} onValueChange={handleVisibilityChange}>
          <SelectTrigger className="w-full transition-all focus:ring-green-500 focus:border-green-500">
            <SelectValue placeholder="Select visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-500" />
                <span>Public</span>
              </div>
            </SelectItem>
            <SelectItem value="unlisted">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-amber-500" />
                <span>Unlisted</span>
              </div>
            </SelectItem>
            <SelectItem value="private">
              <div className="flex items-center gap-2">
                <EyeOff className="h-4 w-4 text-red-500" />
                <span>Private</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-zinc-500 mt-1">
          {editedProject.visibility === 'public' && "Anyone can discover and view your project"}
          {editedProject.visibility === 'unlisted' && "Only people with the link can view your project"}
          {editedProject.visibility === 'private' && "Only you can view your project"}
        </p>
      </div>

      <div className="pt-2 flex items-center justify-between">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={() => setActiveTab("files")}
          className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
        >
          <Upload className="h-4 w-4" />
          Next: Update Files
        </Button>
        
        <div className="text-xs text-zinc-500">Step 1 of 2</div>
      </div>
    </TabsContent>
  );
};

export default BasicInfoTab;