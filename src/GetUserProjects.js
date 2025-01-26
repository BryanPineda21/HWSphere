import axios from "axios";

const getUserProjects = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/user/projects/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  }

export default getUserProjects;