// init-tags.js
require('dotenv').config(); // If you're using dotenv for environment variables

// Copy your Firebase initialization from your server file
const admin = require('./firebaseAdmin.js');
// Assuming you initialize admin with your service account like in your main server
// Get the Firestore instance directly - don't initialize again
const db = admin.firestore();

// The tag collection initialization function
const createTagsCollection = async () => {
    try {
      // Get all projects from Firestore
      const projectsSnapshot = await db.collection('projects').get();
      
      // Extract and count tags
      const tagCounts = {};
      let skippedCount = 0;
      
      projectsSnapshot.forEach((doc) => {
        const projectData = doc.data();
        
        if (projectData.tags && Array.isArray(projectData.tags)) {
          projectData.tags.forEach(tag => {
            // Skip undefined, null, or empty tags
            if (!tag || typeof tag !== 'string' || tag.trim() === '') {
              skippedCount++;
              return;
            }
            
            if (!tagCounts[tag]) {
              tagCounts[tag] = 0;
            }
            tagCounts[tag]++;
          });
        }
      });
      
      // Create a batch for writing tags
      const batch = db.batch();
      
      // Add each tag to the tags collection
      Object.entries(tagCounts).forEach(([tag, count]) => {
        // Skip empty tags
        if (!tag || tag.trim() === '') {
          console.warn('Skipping empty tag');
          return;
        }
        
        const tagId = tag.replace(/\s+/g, '_').toLowerCase();
        
        // Validate tagId is not empty
        if (!tagId || tagId.trim() === '') {
          console.warn(`Skipping tag "${tag}" as it normalizes to an empty ID`);
          return;
        }
        
        const tagRef = db.collection('tags').doc(tagId);
        batch.set(tagRef, {
          name: tag,
          count: count,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });
      
      // Commit the batch
      await batch.commit();
      
      console.log(`Created tags collection with ${Object.keys(tagCounts).length} tags`);
      console.log(`Skipped ${skippedCount} invalid tags`);
      return { 
        totalTags: Object.keys(tagCounts).length,
        skippedTags: skippedCount
      };
    } catch (error) {
      console.error("Error creating tags collection:", error);
      throw error;
    }
  };
  
  // Run the initialization
  createTagsCollection()
    .then(result => {
      console.log('Tags collection initialized successfully:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('Error initializing tags collection:', error);
      process.exit(1);
    });