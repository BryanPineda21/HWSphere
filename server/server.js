const dotenv = require("dotenv")
dotenv.config({ path: `../.env` });
const multer = require('multer');
const admin = require('./firebaseAdmin.js');
const { Storage } = require('@google-cloud/storage');
const express = require('express');
const cors = require('cors');





// Use environment variables from .env file 
const storage = new Storage({
  projectId: process.env.FIREBASE_PROJECT_ID,
  keyFilename: process.env.firebase_service_account_key,
  bucket: process.env.FIREBASE_STORAGE_BUCKET 
});

const app = express();

const corsOptions = {
  origin: 'http://localhost:5173',
  allowedHeaders: '*',
  allowMethods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json()); // Add this to parse JSON request bodies

const port = 3000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

const db = admin.firestore();

// Setup multer for file uploads with higher size limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit as requested
  }
});

// File upload fields matching your schema
const projectUploadFields = [
  { name: 'thumbnail', maxCount: 1 },
  { name: 'codeFile', maxCount: 1 },
  { name: 'modelFile', maxCount: 1 },
  { name: 'pdfFile', maxCount: 1 },
  { name: 'videoFile', maxCount: 1 }
];



// File upload and removal handler - FIXED VERSION
const handleFileUploadRemoval = async (fileType, storageFolder, existingUrlKey) => {
  // Map fileType to the correct form field name
  const formKey = fileType === 'thumbnail' ? 'thumbnail' : `${fileType}File`;
  
  // Map to correct removal flag name - e.g., 'removeThumbnail', 'removeCodeFile', etc.
  const removeKey = fileType === 'thumbnail' ? 'removeThumbnail' : `remove${fileType.charAt(0).toUpperCase() + fileType.slice(1)}File`;
  
  console.log(`Processing ${fileType}:`, {
    formKey,
    removeKey,
    shouldRemove: req.body[removeKey] === 'true',
    hasExistingFile: !!existingProject[existingUrlKey],
    hasNewFile: !!(req.files && req.files[formKey] && req.files[formKey][0])
  });
  
  // HANDLE FILE REMOVAL
  if (req.body[removeKey] === 'true' && existingProject[existingUrlKey]) {
    try {
      // Extract just the filename part from the URL
      const url = existingProject[existingUrlKey];
      const urlParts = url.split('/');
      
      // Get the filename which should be the last part before any query parameters
      let filename = urlParts[urlParts.length - 1].split('?')[0];
      
      console.log(`Attempting to delete ${fileType} file:`, filename);
      
      // Create correct file path in storage bucket
      const filePath = `${storageFolder}/${filename}`;
      console.log(`Full file path for deletion: ${filePath}`);
      
      // Delete from storage
      await storage.bucket(process.env.FIREBASE_STORAGE_BUCKET).file(filePath).delete()
        .catch(err => {
          console.warn(`Warning: Could not delete ${fileType} file (${filePath}):`, err.message);
        });
      
      // Mark URL as null in updatedData
      updatedData[existingUrlKey] = null;
      console.log(`Marked ${existingUrlKey} as null after removal`);
    } catch (error) {
      console.warn(`Warning: Could not delete ${fileType} file:`, error.message);
      // Still set the URL to null even if deletion failed
      updatedData[existingUrlKey] = null;
    }
  }

  // HANDLE NEW FILE UPLOAD
  if (req.files && req.files[formKey] && req.files[formKey][0]) {
    const file = req.files[formKey][0];
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    const filename = `${existingProject.ownerId}_${Date.now()}_${sanitizedFilename}`;
    const filePath = `${storageFolder}/${filename}`;
    
    console.log(`Uploading new ${fileType} file:`, {
      originalName: file.originalname,
      newFilename: filename,
      fullPath: filePath,
      size: file.size,
      mimetype: file.mimetype
    });
    
    try {
      // Upload the file to storage
      const storageFile = storage.bucket(process.env.FIREBASE_STORAGE_BUCKET).file(filePath);
      
      await storageFile.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
        },
      });
      
      // Generate a signed URL
      const [fileUrl] = await storageFile.getSignedUrl({
        action: 'read',
        expires: '03-01-2500',
      });
      
      // Update the URL in the updatedData
      updatedData[existingUrlKey] = fileUrl;
      console.log(`Successfully uploaded ${fileType} and set ${existingUrlKey} to new URL`);
    } catch (uploadError) {
      console.error(`Error uploading ${fileType} file:`, uploadError);
      throw new Error(`Failed to upload ${fileType} file: ${uploadError.message}`);
    }
  }
};

// Tag count update function
// This function updates the tag counts in Firestore

const updateTagCounts = async (newTags = [], oldTags = []) => {
  try {
    // Skip if both arrays are empty
    if (!newTags.length && !oldTags.length) return;
    
    // Find tags to add and remove
    const tagsToAdd = newTags.filter(tag => !oldTags.includes(tag));
    const tagsToRemove = oldTags.filter(tag => !newTags.includes(tag));
    
    // Skip if no changes
    if (!tagsToAdd.length && !tagsToRemove.length) return;
    
    const batch = db.batch();
    
    // Increment count for new tags
    for (const tag of tagsToAdd) {
      const tagId = tag.replace(/\s+/g, '_').toLowerCase();
      const tagRef = db.collection('tags').doc(tagId);
      
      // Check if tag exists
      const tagDoc = await tagRef.get();
      
      if (tagDoc.exists) {
        // Update existing tag
        batch.update(tagRef, {
          count: admin.firestore.FieldValue.increment(1),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      } else {
        // Create new tag
        batch.set(tagRef, {
          name: tag,
          count: 1,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }
    
    // Decrement count for removed tags
    for (const tag of tagsToRemove) {
      const tagId = tag.replace(/\s+/g, '_').toLowerCase();
      const tagRef = db.collection('tags').doc(tagId);
      
      // Check if tag exists
      const tagDoc = await tagRef.get();
      
      if (tagDoc.exists) {
        const currentCount = tagDoc.data().count;
        
        if (currentCount <= 1) {
          // Delete tag if count will reach zero
          batch.delete(tagRef);
        } else {
          // Decrement tag count
          batch.update(tagRef, {
            count: admin.firestore.FieldValue.increment(-1),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      }
    }
    
    // Commit all changes
    await batch.commit();
    
    return {
      added: tagsToAdd.length,
      removed: tagsToRemove.length
    };
  } catch (error) {
    console.error("Error updating tag counts:", error);
  }
};


// Get all available tags
app.get('/api/tags', cors(corsOptions), async (req, res) => {
  try {
    const tagsSnapshot = await db.collection('tags')
      .orderBy('count', 'desc')
      .get();
    
    const tags = [];
    
    tagsSnapshot.forEach(doc => {
      tags.push({
        id: doc.id,
        name: doc.data().name,
        count: doc.data().count
      });
    });
    
    res.status(200).json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});



// Get projects by owner id
app.get('/api/user/projects/:ownerId', cors(corsOptions), async (req, res) => {
  let { ownerId } = req.params;
  
  try {
    // Handle username lookup if needed
    if (ownerId.length < 20 || !ownerId.match(/^[A-Za-z0-9]+$/)) {
      const usersRef = db.collection('users');
      const snapshot = await usersRef.where('username', '==', ownerId).limit(1).get();
      
      if (snapshot.empty) {
        return res.status(200).json([]); // Return empty array if no user found
      }
      
      // Use the actual UID instead of the username
      ownerId = snapshot.docs[0].id;
    }
    
    // Query projects with the proper ownerId
    const snapshot = await db.collection('projects')
      .where('ownerId', '==', ownerId)
      .orderBy('createdAt', 'desc')
      .get();
    
    if (snapshot.empty) {
      return res.status(200).json([]);
    }
    
    const projects = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
    }));
    
    res.status(200).json(projects);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send(`Failed to fetch projects: ${error.message}`);
  }
});



// Fetch a single project by ID
app.get('/api/project/:projectId', cors(corsOptions), async (req, res) => {
  const { projectId } = req.params;
  
  if (!projectId) {
    return res.status(400).json({ error: 'Project ID is required' });
  }
  
  try {
    // Fetch the project document
    const projectDoc = await db.collection('projects').doc(projectId).get();
    console.log('GETTING THE PROJECT');
    
    if (!projectDoc.exists) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Format the project data
    const project = {
      id: projectDoc.id,
      ...projectDoc.data(),
      createdAt: projectDoc.data().createdAt?.toDate?.() || projectDoc.data().createdAt,
      updatedAt: projectDoc.data().updatedAt?.toDate?.() || projectDoc.data().updatedAt
    };
    
    res.status(200).json(project);
    console.log('PROJECT FETCHED SUCCESSFULLY', project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: `Failed to fetch project: ${error.message}` });
  }
});

// Create project with all file types support
app.post('/api/project', cors(corsOptions), upload.fields(projectUploadFields), async (req, res) => {
  try {
    const { 
      title, 
      description, 
      ownerId, 
      tags = [], 
      visibility = 'unlisted' 
    } = req.body;
    
    if (!title || !ownerId) {
      return res.status(400).send('Title and ownerId are required');
    }
    
    // Get user to store author information
    const userDoc = await db.collection('users').doc(ownerId).get();
    if (!userDoc.exists) {
      return res.status(404).send('User not found');
    }
    
    const userData = userDoc.data();
    
    // Initialize tags array from form data
    let projectTags = [];
    if (typeof tags === 'string') {
      // Handle comma-separated tags or single tag
      projectTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    } else if (Array.isArray(tags)) {
      projectTags = tags.filter(tag => tag);
    }
    
    // Limit to 4 tags
    projectTags = projectTags.slice(0, 4);
    
    // Project base data, matching your schema
    const projectData = {
      title,
      description: description || '',
      ownerId,
      author: userData.username || 'anonymous',
      visibility: visibility || 'unlisted',
      isPinned: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      tags: projectTags,
      
      // Initialize URL fields as empty strings
      thumbnailUrl: '',
      codeUrl: '',
      modelUrl: '',
      pdfUrl: '',
      videoUrl: ''
    };
    
    // Handle file uploads
    const files = req.files;
    
    // Upload thumbnail if provided
    if (files.thumbnail && files.thumbnail[0]) {
      const thumbnail = files.thumbnail[0];
      const thumbnailFilename = `thumbnails/${ownerId}_${Date.now()}_${thumbnail.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const thumbnailFile = storage.bucket(process.env.FIREBASE_STORAGE_BUCKET).file(thumbnailFilename);
      
      await thumbnailFile.save(thumbnail.buffer, {
        metadata: {
          contentType: thumbnail.mimetype,
        },
      });
      
      const [thumbnailUrl] = await thumbnailFile.getSignedUrl({
        action: 'read',
        expires: '03-01-2500',
      });
      
      projectData.thumbnailUrl = thumbnailUrl;
    }
    
    // Upload code file if provided
    if (files.codeFile && files.codeFile[0]) {
      const codeFile = files.codeFile[0];
      const codeFilename = `projectFiles/${ownerId}_${Date.now()}_${codeFile.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const file = storage.bucket(process.env.FIREBASE_STORAGE_BUCKET).file(codeFilename);
      
      await file.save(codeFile.buffer, {
        metadata: {
          contentType: 'text/plain',
        },
      });
      
      const [codeUrl] = await file.getSignedUrl({
        action: 'read',
        expires: '03-01-2500',
      });
      
      projectData.codeUrl = codeUrl;
    }
    
    // Upload model file if provided
    if (files.modelFile && files.modelFile[0]) {
      const modelFile = files.modelFile[0];
      const modelFilename = `projectFiles/${ownerId}_${Date.now()}_${modelFile.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const file = storage.bucket(process.env.FIREBASE_STORAGE_BUCKET).file(modelFilename);
      
      await file.save(modelFile.buffer, {
        metadata: {
          contentType: modelFile.mimetype,
        },
      });
      
      const [modelUrl] = await file.getSignedUrl({
        action: 'read',
        expires: '03-01-2500',
      });
      
      projectData.modelUrl = modelUrl;
    }
    
    // Upload PDF file if provided
    if (files.pdfFile && files.pdfFile[0]) {
      const pdfFile = files.pdfFile[0];
      const pdfFilename = `projectFiles/${ownerId}_${Date.now()}_${pdfFile.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const file = storage.bucket(process.env.FIREBASE_STORAGE_BUCKET).file(pdfFilename);
      
      await file.save(pdfFile.buffer, {
        metadata: {
          contentType: 'application/pdf',
        },
      });
      
      const [pdfUrl] = await file.getSignedUrl({
        action: 'read',
        expires: '03-01-2500',
      });
      
      projectData.pdfUrl = pdfUrl;
    }
    
    // Upload video file if provided
    if (files.videoFile && files.videoFile[0]) {
      const videoFile = files.videoFile[0];
      const videoFilename = `projectFiles/${ownerId}_${Date.now()}_${videoFile.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const file = storage.bucket(process.env.FIREBASE_STORAGE_BUCKET).file(videoFilename);
      
      await file.save(videoFile.buffer, {
        metadata: {
          contentType: videoFile.mimetype,
        },
      });
      
      const [videoUrl] = await file.getSignedUrl({
        action: 'read',
        expires: '03-01-2500',
      });
      
      projectData.videoUrl = videoUrl;
    }
    
    // Create project in Firestore
    const projectRef = await db.collection('projects').add(projectData);
    
    // Get the created project
    const newProject = await projectRef.get();
    
    // Tag update
    await updateTagCounts(projectTags, []);


    res.status(201).json({
      id: projectRef.id,
      ...newProject.data(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).send(`Failed to create project: ${error.message}`);
  }
});




// BROKEN AND NOT WORKING CODE, PLEASE FIX THIS ASAP


// Update project endpoint
app.put('/api/edit-project/:projectId', cors(corsOptions), upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'codeFile', maxCount: 1 },
  { name: 'modelFile', maxCount: 1 },
  { name: 'pdfFile', maxCount: 1 },
  { name: 'videoFile', maxCount: 1 }
]), async (req, res) => {
  const { projectId } = req.params;
  
  try {
    console.log('Updating project:', projectId);
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Files received:', req.files ? Object.keys(req.files).map(key => `${key} (${req.files[key].length})`) : 'No files');
    
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();
    
    if (!projectDoc.exists) {
      return res.status(404).send('Project not found');
    }
    
    // Get the current project data
    const existingProject = projectDoc.data();
    console.log('Existing project:', {
      id: projectId,
      title: existingProject.title,
      hasThumb: !!existingProject.thumbnailUrl,
      hasCode: !!existingProject.codeUrl,
      hasModel: !!existingProject.modelUrl,
      hasPdf: !!existingProject.pdfUrl,
      hasVideo: !!existingProject.videoUrl
    });
    
    const oldTags = existingProject.tags || [];

    // Get the updated data from the request body
    const updatedData = {};
    
    // Explicitly add fields we want to update
    if (req.body.title) updatedData.title = req.body.title;
    if (req.body.description !== undefined) updatedData.description = req.body.description;
    if (req.body.visibility) updatedData.visibility = req.body.visibility;
    
    // Handle tags properly
    if (req.body.tags) {
      let projectTags = [];
      
      try {
        // Try to parse as JSON first
        if (typeof req.body.tags === 'string' && req.body.tags.startsWith('[')) {
          projectTags = JSON.parse(req.body.tags);
        } else if (typeof req.body.tags === 'string') {
          projectTags = req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        } else if (Array.isArray(req.body.tags)) {
          projectTags = req.body.tags;
        }
      } catch (e) {
        console.error('Error parsing tags:', e);
        // Default to empty array on error
        projectTags = [];
      }
      
      // Limit to 4 tags
      updatedData.tags = Array.isArray(projectTags) ? projectTags.slice(0, 4) : [];
    }
    
    // Debug logging for file removal flags
    console.log('File removal flags:', {
      removeThumbnail: req.body.removeThumbnail,
      removeCodeFile: req.body.removeCodeFile,
      removeModelFile: req.body.removeModelFile, 
      removePdfFile: req.body.removePdfFile,
      removeVideoFile: req.body.removeVideoFile
    });

    // Enhanced file upload and removal handler
    const handleFileUploadRemoval = async (fileType, storageFolder, existingUrlKey) => {
      // Map fileType to the correct form field name
      const formKey = fileType === 'thumbnail' ? 'thumbnail' : `${fileType}File`;
      
      // Map to correct removal flag name
      const removeKey = fileType === 'thumbnail' ? 'removeThumbnail' : `remove${fileType.charAt(0).toUpperCase() + fileType.slice(1)}File`;
      
      const shouldRemove = req.body[removeKey] === 'true';
      const hasExistingFile = !!existingProject[existingUrlKey];
      const hasNewFile = !!(req.files && req.files[formKey] && req.files[formKey][0]);
      
      console.log(`Processing ${fileType}:`, {
        formKey,
        removeKey,
        shouldRemove,
        hasExistingFile,
        hasNewFile
      });
      
      // Handle file removal
      if (shouldRemove && hasExistingFile) {
        try {
          // Extract just the filename (without path or query parameters)
          const url = existingProject[existingUrlKey];
          
          // Parse the URL to get just the pathname
          const urlObj = new URL(url);
          const pathname = urlObj.pathname;
          
          // Get just the filename - the last part of the path
          const parts = pathname.split('/');
          const filename = parts[parts.length - 1];
          
          console.log(`Attempting to delete ${fileType}:`, {
            originalUrl: url,
            extractedFilename: filename
          });
          
          // Create the file reference and delete it
          const file = storage.bucket(process.env.FIREBASE_STORAGE_BUCKET).file(`${storageFolder}/${filename}`);
          
          await file.delete().catch(err => {
            console.warn(`Warning: Could not delete ${fileType} file:`, err.message);
          });
          
          // Mark URL as null in updatedData
          updatedData[existingUrlKey] = null;
          console.log(`Successfully marked ${existingUrlKey} as null`);
        } catch (error) {
          console.warn(`Warning: Error during ${fileType} file deletion:`, error.message);
          // Still set the URL to null even if deletion failed
          updatedData[existingUrlKey] = null;
        }
      }

      // Handle new file upload
      if (hasNewFile) {
        const file = req.files[formKey][0];
        const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
        const filename = `${existingProject.ownerId}_${Date.now()}_${sanitizedFilename}`;
        
        console.log(`Uploading new ${fileType} file:`, {
          originalName: file.originalname,
          newFilename: filename,
          size: file.size,
          mimetype: file.mimetype
        });
        
        try {
          // Upload the file to storage
          const storageFile = storage.bucket(process.env.FIREBASE_STORAGE_BUCKET).file(`${storageFolder}/${filename}`);
          
          await storageFile.save(file.buffer, {
            metadata: {
              contentType: file.mimetype,
            },
          });
          
          // Generate a signed URL
          const [fileUrl] = await storageFile.getSignedUrl({
            action: 'read',
            expires: '03-01-2500',
          });
          
          // Update the URL in updatedData
          updatedData[existingUrlKey] = fileUrl;
          console.log(`Successfully uploaded ${fileType} and set ${existingUrlKey} to new URL`);
        } catch (uploadError) {
          console.error(`Error uploading ${fileType} file:`, uploadError);
          throw new Error(`Failed to upload ${fileType} file: ${uploadError.message}`);
        }
      }
    };

    // Process file uploads and removals - THIS IS WHERE THE MAGIC HAPPENS
    await Promise.all([
      handleFileUploadRemoval('thumbnail', 'thumbnails', 'thumbnailUrl'),
      handleFileUploadRemoval('code', 'projectFiles', 'codeUrl'),
      handleFileUploadRemoval('model', 'projectFiles', 'modelUrl'),
      handleFileUploadRemoval('pdf', 'projectFiles', 'pdfUrl'),
      handleFileUploadRemoval('video', 'projectFiles', 'videoUrl')
    ]);

    // Add updatedAt timestamp
    updatedData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    
    console.log('Final update data:', Object.keys(updatedData).map(key => `${key}: ${typeof updatedData[key]}`));
    
    // Validate that there's something to update
    if (Object.keys(updatedData).length <= 1) { // accounting for updatedAt
      return res.status(400).send('No update data provided');
    }

    // Update the project
    await projectRef.update(updatedData);
    
    // Get the updated project document
    const updatedProjectDoc = await projectRef.get();
    const projectData = updatedProjectDoc.data();

    // Update tag counts if the function exists
    if (typeof updateTagCounts === 'function') {
      await updateTagCounts(updatedData.tags || [], oldTags);
    }
    
    res.status(200).json({ 
      id: projectId, 
      ...projectData,
      createdAt: projectData.createdAt?.toDate?.() || projectData.createdAt,
      updatedAt: projectData.updatedAt?.toDate?.() || projectData.updatedAt
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).send(`Failed to update project: ${error.message}`);
  }
});
// -------------------------------------------------------------------------

// Toggle pin status for a project
app.patch('/api/project/:projectId/pin', cors(corsOptions), async (req, res) => {
  const { projectId } = req.params;
  const { isPinned } = req.body;
  
  try {
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();
    
    if (!projectDoc.exists) {
      return res.status(404).send('Project not found');
    }

    // Parse boolean if it comes as string
    const pinnedValue = typeof isPinned === 'string' 
      ? isPinned === 'true' 
      : !!isPinned;

    // If trying to pin, check if user already has 4 pinned projects
    if (pinnedValue) {
      const ownerId = projectDoc.data().ownerId;
      const pinnedProjectsSnapshot = await db.collection('projects')
        .where('ownerId', '==', ownerId)
        .where('isPinned', '==', true)
        .get();
      
      // Don't count the current project if it's already pinned
      const currentIsPinned = projectDoc.data().isPinned === true;
      const pinnedCount = pinnedProjectsSnapshot.size - (currentIsPinned ? 1 : 0);
      
      if (pinnedCount >= 4) {
        return res.status(400).json({ 
          error: 'Maximum pinned projects limit reached',
          message: 'You can only pin up to 4 projects'
        });
      }
    }
    
    // Update the pin status
    await projectRef.update({ 
      isPinned: pinnedValue,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.status(200).json({ 
      id: projectId, 
      isPinned: pinnedValue,
      message: pinnedValue ? 'Project pinned successfully' : 'Project unpinned successfully'
    });
  } catch (error) {
    console.error('Error updating pin status:', error);
    res.status(500).send(`Failed to update pin status: ${error.message}`);
  }
});

// User lookup endpoint
app.get('/api/user/lookup/:username', cors(corsOptions), async (req, res) => {
  const { username } = req.params;
  
  try {
    // Query Firestore for a user with this username
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('username', '==', username).limit(1).get();
    
    if (snapshot.empty) {
      return res.status(404).json({ 
        error: 'User not found', 
        message: `No user found with username "${username}"`
      });
    }
    
    // Get the first matching user
    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    
    // Return the user ID and basic profile info
    res.status(200).json({
      id: userDoc.id,
      username: userData.username,
      displayName: userData.displayName || userData.username,
      avatarUrl: userData.avatarUrl || null,
      bio: userData.bio || null
    });
  } catch (error) {
    console.error('Error looking up user:', error);
    res.status(500).send(`Error looking up user: ${error.message}`);
  }
});



// Delete project endpoint

app.delete('/api/project/:projectId', cors(corsOptions), async (req, res) => {
  const { projectId } = req.params;
  
  try {
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();
    
    if (!projectDoc.exists) {
      return res.status(404).send('Project not found');
    }
    
    // Get the current project data to access file URLs
    const projectData = projectDoc.data();
    
    // Check ownership if applicable
    // (Add auth middleware check here in a real app)
    // Example: if (projectData.ownerId !== req.userId) return res.status(403).send('Unauthorized');
    
    // Delete files from storage if they exist
    const filesToDelete = [];
    
    if (projectData.thumbnailUrl) {
      const thumbnailPath = getFilePathFromUrl(projectData.thumbnailUrl);
      if (thumbnailPath) {
        filesToDelete.push(storage.bucket(process.env.FIREBASE_STORAGE_BUCKET).file(thumbnailPath).delete());
      }
    }
    
    if (projectData.codeUrl) {
      const codePath = getFilePathFromUrl(projectData.codeUrl);
      if (codePath) {
        filesToDelete.push(storage.bucket(process.env.FIREBASE_STORAGE_BUCKET).file(codePath).delete());
      }
    }
    
    if (projectData.modelUrl) {
      const modelPath = getFilePathFromUrl(projectData.modelUrl);
      if (modelPath) {
        filesToDelete.push(storage.bucket(process.env.FIREBASE_STORAGE_BUCKET).file(modelPath).delete());
      }
    }
    
    if (projectData.pdfUrl) {
      const pdfPath = getFilePathFromUrl(projectData.pdfUrl);
      if (pdfPath) {
        filesToDelete.push(storage.bucket(process.env.FIREBASE_STORAGE_BUCKET).file(pdfPath).delete());
      }
    }
    
    if (projectData.videoUrl) {
      const videoPath = getFilePathFromUrl(projectData.videoUrl);
      if (videoPath) {
        filesToDelete.push(storage.bucket(process.env.FIREBASE_STORAGE_BUCKET).file(videoPath).delete());
      }
    }
    
    // Wait for all file deletions to complete (if any)
    if (filesToDelete.length > 0) {
      await Promise.all(filesToDelete).catch(error => {
        console.error('Error deleting files:', error);
        // Continue with project deletion even if file deletion fails
      });
    }


    if (projectData.tags && Array.isArray(projectData.tags)) {
      await updateTagCounts([], projectData.tags);
    }
    
    // Delete the project document from Firestore
    await projectRef.delete();
    
    res.status(200).json({ 
      id: projectId,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).send(`Failed to delete project: ${error.message}`);
  }
});

// Helper function to extract file path from Storage URL
function getFilePathFromUrl(url) {
  try {
    // Parse the URL to get the pathname
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Handle Google Cloud Storage URL format (your format)
    // Example: https://storage.googleapis.com/someweb-6e246.appspot.com/thumbnails/filename.png
    if (pathname.includes('.appspot.com/')) {
      const parts = pathname.split('.appspot.com/');
      if (parts.length > 1) {
        // Get everything after the bucket name
        const filePath = parts[1].split('?')[0]; // Remove query parameters
        return filePath;
      }
    }
    
    // Handle alternative Firebase Storage URL format (older format)
    // Example: https://firebasestorage.googleapis.com/v0/b/bucket-name/o/filename
    else if (pathname.includes('/o/')) {
      const parts = pathname.split('/o/');
      if (parts.length > 1) {
        return decodeURIComponent(parts[1].split('?')[0]); // Remove query parameters
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing file URL:', error);
    return null;
  }
}