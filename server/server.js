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

// Update project endpoint
app.put('/api/edit-project/:projectId', cors(corsOptions), upload.fields(projectUploadFields), async (req, res) => {
  const { projectId } = req.params;
  
  try {
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();
    
    if (!projectDoc.exists) {
      return res.status(404).send('Project not found');
    }
    
    // Get the current project data
    const existingProject = projectDoc.data();
    
    // Check ownership if applicable
    // (Add auth middleware check here in a real app)
    
    // Get the updated data from the request body
    const updatedData = req.body;
    
    // Handle boolean conversion for isPinned
    if (updatedData.isPinned === 'true') {
      updatedData.isPinned = true;
    } else if (updatedData.isPinned === 'false') {
      updatedData.isPinned = false;
    }
    
    // Handle tags properly
    if (updatedData.tags) {
      let projectTags = [];
      
      if (typeof updatedData.tags === 'string') {
        // Handle comma-separated tags
        projectTags = updatedData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      } else if (Array.isArray(updatedData.tags)) {
        projectTags = updatedData.tags.filter(tag => tag);
      }
      
      // Limit to 4 tags
      updatedData.tags = projectTags.slice(0, 4);
    }
    
    // Handle file uploads
    const files = req.files;
    
    // Upload thumbnail if provided
    if (files.thumbnail && files.thumbnail[0]) {
      const thumbnail = files.thumbnail[0];
      const thumbnailFilename = `thumbnails/${existingProject.ownerId}_${Date.now()}_${thumbnail.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
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
      
      updatedData.thumbnailUrl = thumbnailUrl;
    }
    
    // Upload code file if provided
    if (files.codeFile && files.codeFile[0]) {
      const codeFile = files.codeFile[0];
      const codeFilename = `projectFiles/${existingProject.ownerId}_${Date.now()}_${codeFile.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
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
      
      updatedData.codeUrl = codeUrl;
    }
    
    // Upload model file if provided
    if (files.modelFile && files.modelFile[0]) {
      const modelFile = files.modelFile[0];
      const modelFilename = `projectFiles/${existingProject.ownerId}_${Date.now()}_${modelFile.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
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
      
      updatedData.modelUrl = modelUrl;
    }
    
    // Upload PDF file if provided
    if (files.pdfFile && files.pdfFile[0]) {
      const pdfFile = files.pdfFile[0];
      const pdfFilename = `projectFiles/${existingProject.ownerId}_${Date.now()}_${pdfFile.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
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
      
      updatedData.pdfUrl = pdfUrl;
    }
    
    // Upload video file if provided
    if (files.videoFile && files.videoFile[0]) {
      const videoFile = files.videoFile[0];
      const videoFilename = `projectFiles/${existingProject.ownerId}_${Date.now()}_${videoFile.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
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
      
      updatedData.videoUrl = videoUrl;
    }
    
    // Add updatedAt timestamp
    updatedData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    
    // Update the project
    await projectRef.update(updatedData);
    
    // Get the updated project document
    const updatedProjectDoc = await projectRef.get();
    const projectData = updatedProjectDoc.data();
    
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