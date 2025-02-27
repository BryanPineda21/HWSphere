


// Function to check if a user can change their username
// Add this to your AuthContext or a utility file

/**
 * Checks if a user can change their username based on the 14-day restriction
 * @param {Object} userData - The user's data from Firestore
 * @returns {Object} - Object with canChange boolean and nextChangeDate if applicable
 */
export const canChangeUsername = (userData) => {
    // If user has never changed username or no lastUsernameChange field exists
    if (!userData?.lastUsernameChange) {
      return { canChange: true };
    }
    
    // Get the date of last username change
    const lastChange = new Date(userData.lastUsernameChange.seconds * 1000);
    
    // Calculate the next allowed change date (14 days later)
    const nextChangeDate = new Date(lastChange);
    nextChangeDate.setDate(nextChangeDate.getDate() + 14);
    
    // Get current date
    const currentDate = new Date();
    
    // Check if 14 days have passed
    const canChange = currentDate >= nextChangeDate;
    
    return { 
      canChange, 
      nextChangeDate: canChange ? null : nextChangeDate,
      daysRemaining: canChange ? 0 : Math.ceil((nextChangeDate - currentDate) / (1000 * 60 * 60 * 24))
    };
  };
  
  /**
   * Updates a user's profile including handling username changes with restrictions
   * @param {string} userId - The user's ID
   * @param {Object} updates - The updates to apply to the user's profile
   * @param {Object} currentUserData - The user's current data from Firestore
   * @returns {Promise} - Promise that resolves when the update is complete
   */
  export const updateUserProfile = async (userId, updates, currentUserData) => {
    // Check if username is being changed
    const isUsernameChanging = 
      updates.username && 
      updates.username !== currentUserData.username;
    
    // If username is changing, check if it's allowed
    if (isUsernameChanging) {
      const { canChange, nextChangeDate, daysRemaining } = canChangeUsername(currentUserData);
      
      if (!canChange) {
        throw new Error(
          `Username can only be changed once every 14 days. ` +
          `You can change it again in ${daysRemaining} days (${nextChangeDate.toLocaleDateString()}).`
        );
      }
      
      // Add the lastUsernameChange timestamp
      updates.lastUsernameChange = new Date();
    }
    
    // Always update the updatedAt timestamp
    updates.updatedAt = new Date();
    
    // Update the user document
    const userRef = doc(db, 'users', userId);
    return updateDoc(userRef, updates);
  };