import { db } from '@/firebaseConfig'; 
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  doc,
  getDoc,
  startAt,
  endAt
} from 'firebase/firestore';

// Cache system to minimize reads
const cache = {
  projects: null,
  tags: null,
  lastQuery: null,
  lastQueryResult: null,
  expiryTime: 5 * 60 * 1000, // 5 minutes
  lastFetchTime: 0
};

export const getProjects = async (options = {}) => {
  const { 
    pageSize = 6, 
    lastVisible = null,
    tag = null,
    orderByField = 'likeCount',
    orderDirection = 'desc',
    filterType = 'trending' // trending, newest, featured
  } = options;
  
  try {
    // Build the query
    let projectsQuery = collection(db, 'projects');
    let constraints = [];
    
    // Only show public projects
    constraints.push(where('visibility', '==', 'public'));
    
    // Add tag filter if provided
    if (tag && tag !== 'All') {
      constraints.push(where('tags', 'array-contains', tag));
    }
    
    // Add filter type constraints
    if (filterType === 'featured') {
      constraints.push(where('isPinned', '==', true));
    } else if (filterType === 'newest') {
      constraints.push(orderBy('createdAt', 'desc'));
    } else {
      // Default trending - order by likes, views or other engagement metrics
      constraints.push(orderBy(orderByField, orderDirection));
    }
    
    // Add pagination constraints
    constraints.push(limit(pageSize));
    if (lastVisible) {
      constraints.push(startAfter(lastVisible));
    }
    
    // Execute query
    const projectsRef = query(projectsQuery, ...constraints);
    const snapshot = await getDocs(projectsRef);
    
    // Process results
    const projects = [];
    snapshot.forEach((doc) => {
      projects.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Get the last visible document for pagination
    const lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];
    
    return {
      projects,
      lastVisible: lastVisibleDoc
    };
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

export const getTags = async () => {
  // Check cache first
  if (cache.tags && (Date.now() - cache.lastFetchTime < cache.expiryTime)) {
    return cache.tags;
  }
  
  try {
    // Query the tags collection directly instead of scanning projects
    const tagsCollection = collection(db, 'tags');
    // Order by count to get most popular tags first
    const tagsQuery = query(tagsCollection, orderBy('count', 'desc'));
    const snapshot = await getDocs(tagsQuery);
    
    // Start with 'All' as the first option
    const tags = ['All'];
    
    // Extract tag names from the documents
    snapshot.forEach((doc) => {
      const tagData = doc.data();
      tags.push(tagData.name);
    });
    
    // Update cache
    cache.tags = tags;
    cache.lastFetchTime = Date.now();
    
    return tags;
  } catch (error) {
    console.error("Error fetching tags:", error);
    return ['All']; // Return at least 'All' on error
  }
};

// Cost-effective search implementation
export const searchProjects = async (searchQuery, options = {}) => {
  const { 
    pageSize = 6, 
    tag = null,
    filterType = 'trending'
  } = options;
  
  // Check cache for exact same query
  const cacheKey = `${searchQuery}-${tag}-${filterType}-${pageSize}`;
  if (
    cache.lastQuery === cacheKey && 
    cache.lastQueryResult && 
    (Date.now() - cache.lastFetchTime < cache.expiryTime)
  ) {
    return cache.lastQueryResult;
  }
  
  try {
    if (!searchQuery || searchQuery.trim() === '') {
      // If no search query, return regular projects
      return getProjects(options);
    }
    
    // Convert to lowercase for case-insensitive search
    const searchLower = searchQuery.toLowerCase();
    
    // Create array of search terms
    const searchTerms = searchLower.split(/\s+/).filter(term => term.length > 0);
    
    // Base constraints - always filter for public projects
    const baseConstraints = [
      where('visibility', '==', 'public')
    ];
    
    // Add tag filter if provided
    if (tag && tag !== 'All') {
      baseConstraints.push(where('tags', 'array-contains', tag));
    }
    
    // Prepare query based on number of search terms
    let projectsRef;
    
    // For your existing data structure which doesn't have search-specific fields yet,
    // we'll use a combination of field-specific searches and client-side filtering
    
    // We'll search across multiple fields with OR conditions
    // This requires multiple queries that we'll merge client-side
    const titleResults = [];
    const descResults = [];
    const authorResults = [];
    const tagResults = [];
    
    // Limit our read operations by using a smart search strategy
    // 1. First search for exact title matches (highest relevance)
    const titleQuery = query(
      collection(db, 'projects'),
      ...baseConstraints,
      where('title', '>=', searchTerms[0]),
      where('title', '<=', searchTerms[0] + '\uf8ff'),
      limit(pageSize)
    );
    const titleSnapshot = await getDocs(titleQuery);
    titleSnapshot.forEach(doc => {
      titleResults.push({ id: doc.id, ...doc.data(), _searchSource: 'title' });
    });
    
    // 2. If we still need more results, try author searches
    if (titleResults.length < pageSize) {
      const authorQuery = query(
        collection(db, 'projects'),
        ...baseConstraints,
        where('author', '>=', searchTerms[0]),
        where('author', '<=', searchTerms[0] + '\uf8ff'),
        limit(pageSize)
      );
      const authorSnapshot = await getDocs(authorQuery);
      authorSnapshot.forEach(doc => {
        // Avoid duplicates
        if (!titleResults.some(p => p.id === doc.id)) {
          authorResults.push({ id: doc.id, ...doc.data(), _searchSource: 'author' });
        }
      });
    }
    
    // 3. For remaining terms and general matches, we do a tag search
    // Tags are often more structured and provide good filtering
    if (titleResults.length + authorResults.length < pageSize && searchTerms.length > 0) {
      // Use array-contains for tag search, very efficient in Firebase
      // We can only use array-contains with a single value
      const tagQuery = query(
        collection(db, 'projects'),
        ...baseConstraints,
        where('tags', 'array-contains-any', searchTerms.slice(0, 10)), // Firebase limits to 10 values
        limit(pageSize * 2)
      );
      const tagSnapshot = await getDocs(tagQuery);
      tagSnapshot.forEach(doc => {
        // Avoid duplicates
        if (!titleResults.some(p => p.id === doc.id) && 
            !authorResults.some(p => p.id === doc.id)) {
          tagResults.push({ id: doc.id, ...doc.data(), _searchSource: 'tag' });
        }
      });
    }
    
    // 4. If we still need more results, do a more expensive description search
    // This is more expensive because descriptions are longer and less structured
    let descriptionQueryNeeded = titleResults.length + authorResults.length + tagResults.length < pageSize;
    
    // For description, we'll do client-side filtering since we can't easily do prefix search on long text
    if (descriptionQueryNeeded) {
      // Get a larger batch to filter client-side
      const descQuery = query(
        collection(db, 'projects'),
        ...baseConstraints,
        orderBy('createdAt', 'desc'), // Get recent projects first
        limit(pageSize * 3)
      );
      const descSnapshot = await getDocs(descQuery);
      
      descSnapshot.forEach(doc => {
        // Avoid duplicates and filter by description content client-side
        const data = doc.data();
        if (!titleResults.some(p => p.id === doc.id) && 
            !authorResults.some(p => p.id === doc.id) &&
            !tagResults.some(p => p.id === doc.id)) {
          
          const description = (data.description || '').toLowerCase();
          
          // Check if ANY search term is in the description
          // We're less strict here since we need more results
          if (searchTerms.some(term => description.includes(term))) {
            descResults.push({ id: doc.id, ...data, _searchSource: 'description' });
          }
        }
      });
    }
    
    // Combine all results and do final client-side ranking and filtering
    let allResults = [...titleResults, ...authorResults, ...tagResults, ...descResults];
    
    // Do more accurate multi-term filtering for all results
    if (searchTerms.length > 1) {
      allResults = allResults.filter(project => {
        const projectText = (
          (project.title || '').toLowerCase() + ' ' +
          (project.description || '').toLowerCase() + ' ' +
          (project.author || '').toLowerCase() + ' ' +
          (project.tags ? project.tags.join(' ').toLowerCase() : '')
        );
        
        // A project passes if all search terms are found in at least one of its fields
        return searchTerms.every(term => projectText.includes(term));
      });
    }
    
    // Apply sorting based on filterType
    if (filterType === 'newest') {
      allResults.sort((a, b) => 
        (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)
      );
    } else if (filterType === 'featured') {
      allResults = allResults.filter(p => p.isPinned === true);
    } else {
      // Default 'trending' - sort by likes then views
      allResults.sort((a, b) => 
        (b.likeCount || 0) - (a.likeCount || 0) || 
        (b.viewCount || 0) - (a.viewCount || 0)
      );
    }
    
    // Limit results to requested page size
    const projects = allResults.slice(0, pageSize);
    
    // For pagination, we use the last document from our queries
    // This is a simplified approach - for a production app, you might need
    // more sophisticated cursor-based pagination
    const lastVisibleDoc = projects.length > 0 ? 
      { 
        id: projects[projects.length - 1].id,
        createdAt: projects[projects.length - 1].createdAt,
        likeCount: projects[projects.length - 1].likeCount
      } : null;
    
    const result = {
      projects,
      lastVisible: lastVisibleDoc
    };
    
    // Update cache
    cache.lastQuery = cacheKey;
    cache.lastQueryResult = result;
    cache.lastFetchTime = Date.now();
    
    return result;
  } catch (error) {
    console.error("Error searching projects:", error);
    throw error;
  }
};