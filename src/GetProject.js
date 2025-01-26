import axios from "axios";


const getProject = async (projectId) => {
    try {
        const response = await axios.get(`http://localhost:3000/api/project/${projectId}`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching project:', error);
        return null;
    }
}


export default getProject;