import { db } from '@/firebaseConfig';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  writeBatch,
  serverTimestamp 
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
    
    // Update with new data
    await setDoc(projectRef, {
      ...projectData,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
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