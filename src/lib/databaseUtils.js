import { db } from '@/firebaseConfig';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  writeBatch,
  serverTimestamp,
  increment
} from 'firebase/firestore';

export const generateSearchIndexes = (project) => {
  // Create a searchable string from the project data
  const searchableText = [
    project.title,
    project.description,
    project.author,
    ...(project.tags || [])
  ].filter(Boolean).join(' ').toLowerCase();
  
  // Create an array of keywords for array-contains-any queries
  const keywords = new Set();
  
  // Add individual words
  searchableText.split(/\s+/).forEach(word => {
    // Only add words with 3+ characters to avoid noise
    if (word.length >= 3) {
      keywords.add(word);
    }
  });
  
  // Add title words (these are more important)
  const titleWords = project.title.toLowerCase().split(/\s+/);
  titleWords.forEach(word => {
    if (word.length >= 2) {
      keywords.add(word);
    }
  });
  
  // Add author username as keyword
  if (project.author) {
    keywords.add(project.author.toLowerCase());
  }
  
  // Add tags as individual keywords
  if (project.tags) {
    project.tags.forEach(tag => {
      // Add full tag
      keywords.add(tag.toLowerCase());
      
      // Add individual words from multi-word tags
      tag.toLowerCase().split(/\s+/).forEach(word => {
        if (word.length >= 3) {
          keywords.add(word);
        }
      });
    });
  }
  
  return {
    searchIndex: searchableText,
    keywordArray: Array.from(keywords)
  };
};

// Add a new project 
export const addProject = async (projectData, userId) => {
  try {
    // Generate a new project ID if not provided
    const projectId = projectData.id || doc(collection(db, 'projects')).id;
    const projectRef = doc(db, 'projects', projectId);
    
    // Optionally generate search indexes for more efficient search
    // This can be a future improvement
    // const searchIndexes = generateSearchIndexes(projectData);
    
    // Create the final project object based on your schema
    const project = {
      ...projectData,
      // ...searchIndexes, // For future use
      ownerId: userId,
      commentCount: projectData.commentCount || 0,
      likeCount: projectData.likeCount || 0,
      viewCount: projectData.viewCount || 0,
      isPinned: projectData.isPinned || false,
      visibility: projectData.visibility || 'public',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Save to Firestore
    await setDoc(projectRef, project);


    // Update tag counts
    if (project.tags && Array.isArray(project.tags)) {
      await updateTagCounts(project.tags, []);
    }
    
    return {
      id: projectId,
      ...project
    };
  } catch (error) {
    console.error("Error adding project:", error);
    throw error;
  }
};

// Update a project
export const updateProject = async (projectId, projectData) => {
  try {
    const projectRef = doc(db, 'projects', projectId);

     // Get old project data for tag comparison
     const oldProjectDoc = await getDoc(projectRef);
     const oldTags = oldProjectDoc.exists() ? (oldProjectDoc.data().tags || []) : [];
    
    // Update with new data
    await setDoc(projectRef, {
      ...projectData,
      updatedAt: serverTimestamp()
    }, { merge: true });
    

    // Update tag counts
    if (projectData.tags && Array.isArray(projectData.tags)) {
      await updateTagCounts(projectData.tags, oldTags);
    }

    return {
      id: projectId,
      ...projectData
    };
  } catch (error) {
    console.error("Error updating project:", error);
    throw error;
  }
};

// Create a Tags collection for better search performance
export const createTagsCollection = async () => {
  try {
    // Get all unique tags from projects
    const projectsRef = collection(db, 'projects');
    const snapshot = await getDocs(projectsRef);
    
    // Extract and count tags
    const tagCounts = {};
    
    snapshot.forEach((docSnapshot) => {
      const projectData = docSnapshot.data();
      
      if (projectData.tags && Array.isArray(projectData.tags)) {
        projectData.tags.forEach(tag => {
          if (!tagCounts[tag]) {
            tagCounts[tag] = 0;
          }
          tagCounts[tag]++;
        });
      }
    });
    
    // Create a batch for writing tags
    const batch = writeBatch(db);
    
    // Add each tag to the tags collection
    Object.entries(tagCounts).forEach(([tag, count]) => {
      const tagRef = doc(db, 'tags', tag.replace(/\s+/g, '_').toLowerCase());
      batch.set(tagRef, {
        name: tag,
        count: count,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });
    
    // Commit the batch
    await batch.commit();
    
    return { 
      totalTags: Object.keys(tagCounts).length 
    };
  } catch (error) {
    console.error("Error creating tags collection:", error);
    throw error;
  }
};

// Batch update existing projects to add search indexes (future improvement)
export const updateAllProjectsWithSearchIndexes = async (batchSize = 500) => {
  try {
    const projectsRef = collection(db, 'projects');
    const snapshot = await getDocs(projectsRef);
    
    let batch = writeBatch(db);
    let operationCount = 0;
    let totalUpdated = 0;
    
    for (const docSnapshot of snapshot.docs) {
      const projectData = docSnapshot.data();
      const projectRef = doc(db, 'projects', docSnapshot.id);
      
      // Only update if search indexes don't exist
      if (!projectData.searchIndex || !projectData.keywordArray) {
        const searchIndexes = generateSearchIndexes(projectData);
        
        batch.update(projectRef, {
          ...searchIndexes,
          updatedAt: serverTimestamp()
        });
        
        operationCount++;
        totalUpdated++;
        
        // Commit batch when it reaches the batch size
        if (operationCount >= batchSize) {
          await batch.commit();
          batch = writeBatch(db);
          operationCount = 0;
        }
      }
    }
    
    // Commit any remaining operations
    if (operationCount > 0) {
      await batch.commit();
    }
    
    return { totalUpdated };
  } catch (error) {
    console.error("Error updating projects with search indexes:", error);
    throw error;
  }
};

/**
 * Gets a normalized tag ID from a tag name
 * @param {string} tagName - Original tag name (e.g., "C++")
 * @returns {string} - Normalized tag ID (e.g., "c++")
 */
export const getNormalizedTagId = (tagName) => {
  return tagName.replace(/\s+/g, '_').toLowerCase();
};

/**
 * Updates tag counts when a project is created or updated
 * @param {Array} newTags - New tags for the project
 * @param {Array} oldTags - Previous tags (if updating a project)
 */
export const updateTagCounts = async (newTags = [], oldTags = []) => {
  try {
    // Skip if both arrays are empty
    if (!newTags.length && !oldTags.length) return;
    
    // Find tags to add and remove
    const tagsToAdd = newTags.filter(tag => !oldTags.includes(tag));
    const tagsToRemove = oldTags.filter(tag => !newTags.includes(tag));
    
    // Skip if no changes
    if (!tagsToAdd.length && !tagsToRemove.length) return;
    
    const batch = writeBatch(db);
    
    // Increment count for new tags
    for (const tag of tagsToAdd) {
      const tagId = getNormalizedTagId(tag);
      const tagRef = doc(db, 'tags', tagId);
      
      // Check if tag exists
      const tagDoc = await getDoc(tagRef);
      
      if (tagDoc.exists()) {
        // Update existing tag
        batch.update(tagRef, {
          count: increment(1),
          updatedAt: serverTimestamp()
        });
      } else {
        // Create new tag
        batch.set(tagRef, {
          name: tag,
          count: 1,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    }
    
    // Decrement count for removed tags
    for (const tag of tagsToRemove) {
      const tagId = getNormalizedTagId(tag);
      const tagRef = doc(db, 'tags', tagId);
      
      // Check if tag exists
      const tagDoc = await getDoc(tagRef);
      
      if (tagDoc.exists()) {
        const currentCount = tagDoc.data().count;
        
        if (currentCount <= 1) {
          // Delete tag if count will reach zero
          batch.delete(tagRef);
        } else {
          // Decrement tag count
          batch.update(tagRef, {
            count: increment(-1),
            updatedAt: serverTimestamp()
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
    // Don't throw, just log - allow the project operation to continue
  }
};

/**
 * Fetch tags from Firestore
 * @returns {Promise<Array>} Array of tag objects with name and count
 */
export const getTagsFromFirestore = async () => {
  try {
    const tagsCollection = collection(db, 'tags');
    const tagsSnapshot = await getDocs(tagsCollection);
    
    const tags = [];
    tagsSnapshot.forEach(doc => {
      tags.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort by count in descending order
    return tags.sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
};