import axios from "axios";


const getUserProjects = async (userId) => {
    try {
        const response = await axios.get(`http://localhost:3000/api/projects${userId}`,{
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching user projects:', error);
        return [];
    }
}

export default getUserProjects;