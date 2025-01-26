import { useState } from "react";
import axios from "axios";
import { useAuth } from "./context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import {Button, CircularProgress, Input} from "@heroui/react";
import {createProject, uploadFile} from "./uploadFiles"




const ProjectCard = () => {

    const queryClient = useQueryClient();

    const {userData,user} = useAuth();

    const navigate = useNavigate();

    const userId = user.uid;


    // --------------------------------------------------------

    //This is for the file upload start here



    //This is for the form visibility state
    const[isFormVisible, setFormVisible] = useState(false);
    //This is for new project state
    const [newProject, setNewProject] = useState({
        title: '',
        description: '',
    }); 

    //This is for the file state
    const [selectedFile1, setSelectedFile1] = useState(null);
    const [selectedFile2, setSelectedFile2] = useState(null);
// --------------------------------------------------------



//This is for the form visibility start here
    const showForm = (e) => {
        if (e.target !== document.querySelector('.project-form')) {  // Check if not form
            e.stopPropagation();
            setFormVisible(!isFormVisible);
            navigate(`/u/${userData.username}/projects/new`);
          }
    }
    const hideForm = (e) => {
        e.preventDefault();
        setFormVisible(false);
        navigate(`/u/${userData.username}`);
    }
    //This is for the form visibility end here
 // --------------------------------------------------------


    //Project handling starts here

    const handleChange = (e) => {
        setNewProject({
            ...newProject,
            [e.target.name]: e.target.value
        });
    }

    const handleFileChange = (e) => {
      const files = e.target.files;
        setSelectedFile1(files[0]); // Assuming you want the first file
        setSelectedFile2(files[1]); // Assuming you want the second file
        // ... (optional) update UI to show selected filenames
      };
    //Project handling ends here

//---------------------------------------------------------


// //This is for the file upload start here
// const createProject = async (projectData) => {
  
//     try {
//       const response = await axios.post('http://localhost:3000/api/projects', projectData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
         
//       });
     
//       return response.data;
//     } catch (error) {
//       console.error('Upload error:', error);
//       throw new Error('Upload failed');
//     }
//   };






//---------------------------------------------------------



 //---------------------------------------------------------




    //Project Submit starts here

    const handleSubmit = async (event) => {
      event.preventDefault();

      const formData = new FormData();
      formData.append('title', newProject.title);
      formData.append('description', newProject.description);
      formData.append('ownerId', userId); 
      formData.append('author', userData.username);

      if (selectedFile1) {
          formData.append('codeFile', selectedFile1);
          
      }
      if (selectedFile2) {
          formData.append('modelFile', selectedFile2);
      }

      try {

        // const response = await axios.post('http://localhost:3000/api/projects', formData, {
        //   headers: {
        //     'Content-Type': 'multipart/form-data',
        //   },
           
        // });



        const projectData = {
            title: newProject.title,
            description: newProject.description,
            ownerId: userId,
            author: userData.username,
          };
      

          const { docId, codeUrl, modelUrl } = await createProject(projectData, selectedFile1, selectedFile2);

          console.log('Project created:', { docId, codeUrl, modelUrl }); 



      } catch (error) {
          console.error('Upload error:', error);
          throw new Error('Upload failed');
      }
  };
  



    //Project Submit ends here
 // --------------------------------------------------------



 const {mutate:addProject, isPending, isError} = useMutation({
    mutationFn: handleSubmit,
    onSuccess: () => {
      queryClient.invalidateQueries(['projects', {userId}]);
      setFormVisible(false);
      navigate(`/u/${userData.username}`);
    },
    onError: (error) => {
        console.error('Project upload error:', error);
        },

 })
  
   
    return(

        <div>

                <Button
                    onClick={showForm}
                    className="bg-zinc-700 text-white h-12 px-4 rounded-lg flex items-center w-full lg:w-auto"
                >
                    <div className="w-8 h-8 mr-2 flex items-center justify-center">
                    <img src="/addIcon.svg" alt="Add" className="w-8 h-8" />
                    </div>
                    Add Project
                </Button>


            <div className={`overlay ${isFormVisible ? 'active' : ''}`}/>

            { 
             

                isFormVisible && (
                    <form className="flex w-auto h-auto  flex-col gap-4 project-form" onClick={(e) => e.stopPropagation()} onSubmit={addProject}>
                        {!isPending ? (
                            <>
                        <h2>My New Project</h2>
                        <label>Title</label>
                        <input type="text" name="title" placeholder="Enter project name" required onChange={handleChange} />    
                        <Input type="email" variant="bordered" label="Email" placeholder="Enter your email" />

                        <label>Description</label>
                        <textarea name="description" placeholder="Enter project description" required onChange={handleChange}></textarea>
                        <label htmlFor="project-files">Add Files</label>
                        <input type="file" className="upload-button" id="project-files" accept="*" multiple required onChange={handleFileChange} />
                        <div className="button-container">
                        <button type="submit" className="project-uploadBtn">
                        save
                        </button>
                        <button type="submit" className="project-cancelBtn" onClick={hideForm}>cancel</button>
                        </div>
                        </>) : (
                            <>
                            <CircularProgress color="success" size="lg" label="loading..." />

                            <h3>Please be Paitient</h3>
                            </>
                            )
                        }
                    </form>
                )}
         
            

        </div>


    );



}


export default ProjectCard;