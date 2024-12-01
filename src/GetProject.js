import axios from "axios";


const getProject = async (projectId) => {
    try {
        const response = await axios.get(`http://localhost:3000/api/projects/${projectId}`,{
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

export default getProject;