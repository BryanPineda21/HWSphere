import axios from "axios";

// Create an axios instance with default config
const api = axios.create({
    baseURL: 'http://localhost:3000',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  /**
   * Lookup a user's ID by their username
   * @param {string} username - The username to lookup
   * @returns {Promise<Object>} - User object with ID
   */
  export const getUserByUsername = async (username) => {
    if (!username) {
      throw new Error('Username is required');
    }
    
    try {
      const response = await api.get(`/api/user/lookup/${username}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error(`User "${username}" not found`);
      }
      throw new Error(error.response?.data?.message || 'Error looking up user');
    }
  };
  
  /**
   * Fetch all projects for a specific user
   * @param {string} userIdOrUsername - The user ID or username
   * @returns {Promise<Array>} - Array of project objects
   */
  export const getUserProjects = async (userIdOrUsername) => {
    if (!userIdOrUsername) {
      console.warn('getUserProjects called without a userId or username');
      return [];
    }
  
    try {
      // We'll let the backend handle username resolution
      console.log(`Fetching projects for user: ${userIdOrUsername}`);
      const response = await api.get(`/api/user/projects/${userIdOrUsername}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user projects:', error);
      
      // If it's a 404, return empty array
      if (error.response?.status === 404) {
        return [];
      }
      
      // Otherwise, throw the error to be handled by the calling code
      throw new Error(error.response?.data || 'Failed to fetch projects');
    }
  };
  
  /**
   * Fetch a single project by ID
   * @param {string} projectId - The project ID
   * @returns {Promise<Object>} - Project object
   */
  export const getProject = async (projectId) => {
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    
    try {
      const response = await api.get(`/api/project/${projectId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('Project not found');
      }
      throw new Error(error.response?.data || 'Error fetching project');
    }
  };
  
  
/**
 * Update a project with multiple file types support
 * @param {string} projectId - The project ID
 * @param {Object} projectData - Project data to update
 * @param {Object} [files] - Object containing optional files
 * @returns {Promise<Object>} - Updated project object
 */
export const updateProject = async (projectId, projectData, files = {}) => {
  if (!projectId) {
    throw new Error('Project ID is required');
  }
  
  try {
    // Create a FormData object for all updates
    const formData = new FormData();
    
    // Basic project fields
    if (projectData.title) formData.append('title', projectData.title);
    if (projectData.description !== undefined) formData.append('description', projectData.description);
    if (projectData.visibility) formData.append('visibility', projectData.visibility);
    
    // Tags - send as JSON string
    if (Array.isArray(projectData.tags)) {
      formData.append('tags', JSON.stringify(projectData.tags));
    }
    
    // File removal flags - always include these with explicit true/false strings
    formData.append('removeThumbnail', projectData.removeThumbnail === true ? 'true' : 'false');
    formData.append('removeCodeFile', projectData.removeCodeFile === true ? 'true' : 'false');
    formData.append('removeModelFile', projectData.removeModelFile === true ? 'true' : 'false');
    formData.append('removePdfFile', projectData.removePdfFile === true ? 'true' : 'false');
    formData.append('removeVideoFile', projectData.removeVideoFile === true ? 'true' : 'false');
    
    // Add new files if they exist
    if (files.thumbnail) formData.append('thumbnail', files.thumbnail);
    if (files.codeFile) formData.append('codeFile', files.codeFile);
    if (files.modelFile) formData.append('modelFile', files.modelFile);
    if (files.pdfFile) formData.append('pdfFile', files.pdfFile);
    if (files.videoFile) formData.append('videoFile', files.videoFile);
    
    // Debug logging
    console.log('Updating project:', projectId);
    console.log('Project data:', {
      title: projectData.title,
      description: projectData.description?.substring(0, 20) + '...',
      visibility: projectData.visibility,
      tags: projectData.tags,
      removeThumbnail: projectData.removeThumbnail,
      removeCodeFile: projectData.removeCodeFile,
      removeModelFile: projectData.removeModelFile,
      removePdfFile: projectData.removePdfFile,
      removeVideoFile: projectData.removeVideoFile
    });
    console.log('Files to upload:', Object.keys(files).filter(key => files[key] !== null));
    
    // Make the request
    const response = await api.put(`/api/edit-project/${projectId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 60000 // 60 second timeout
    });
    
    console.log('Update successful:', response.status);
    return response.data;
  } catch (error) {
    console.error('Error updating project:', error);
    
    let errorMessage = 'Failed to update project';
    if (error.response?.data) {
      errorMessage = typeof error.response.data === 'string' 
        ? error.response.data 
        : JSON.stringify(error.response.data);
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};


  /**
 * Delete a project by ID
 * @param {string} projectId - The project ID to delete
 * @returns {Promise<Object>} - Response with success message
 */
export const deleteProject = async (projectId) => {
  if (!projectId) {
    throw new Error('Project ID is required');
  }

  try {
    const response = await api.delete(`/api/project/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting project:', error);
    throw new Error(error.response?.data || 'Failed to delete project');
  }
};
  

/**
 * Fetch all available tags
 * @returns {Promise<Array>} - Array of tag objects with name and count
 */
export const getTags = async () => {
  try {
    const response = await api.get('/api/tags');
    return response.data;
  } catch (error) {
    console.error('Error fetching tags:', error);
    // Return default value on error
    return [];
  }
};







  /**
   * Toggle pin status of a project
   * @param {string} projectId - The project ID
   * @param {boolean} isPinned - Whether to pin (true) or unpin (false)
   * @returns {Promise<Object>} - Response data
   */
  export const toggleProjectPin = async (projectId, isPinned) => {
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    
    try {
      const response = await api.patch(`/api/project/${projectId}/pin`, { isPinned });
      return response.data;
    } catch (error) {
      console.error('Error toggling project pin status:', error);
      throw new Error(error.response?.data || 'Failed to update pin status');
    }
  };
  
  /**
   * Create a new project with multiple file types support
   * @param {Object} projectData - Project data
   * @param {Object} files - Object containing optional files
   * @returns {Promise<Object>} - Created project object
   */
  export const createProject = async (projectData, files = {}) => {
    try {
      const formData = new FormData();
      
      // Add files if they exist
      if (files.thumbnail) formData.append('thumbnail', files.thumbnail);
      if (files.codeFile) formData.append('codeFile', files.codeFile);
      if (files.modelFile) formData.append('modelFile', files.modelFile);
      if (files.pdfFile) formData.append('pdfFile', files.pdfFile);
      if (files.videoFile) formData.append('videoFile', files.videoFile);
      
      // Add other project fields
      Object.entries(projectData).forEach(([key, value]) => {
        if (value !== undefined) {
          // Handle arrays (like tags)
          if (Array.isArray(value)) {
            value.forEach((item, index) => {
              formData.append(`${key}[${index}]`, item);
            });
          } else {
            formData.append(key, value);
          }
        }
      });
      
      const response = await axios.post('http://localhost:3000/api/project', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw new Error(error.response?.data || 'Failed to create project');
    }
  };

