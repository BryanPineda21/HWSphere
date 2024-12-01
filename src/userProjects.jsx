import { useState,useMemo, useEffect } from "react";
import getUserProjects from "./GetUserProjects.js";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "react-router-dom";
//-----------------THREE JS IMPORTS-----------------

import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";

const UserProjects = ({userId}) => {

  const {userData} = useAuth();

  const navigate = useNavigate();


    const { data:projects , isLoading, isError } = useQuery({
        
        queryFn: ()=> getUserProjects(userId),
        queryKey: ["projects", {userId}],
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
      
    });



    if (isLoading) {return <div>Loading...</div>;}
    if (isError) {return <div>Error fetching projects</div>;}



  

    return (
      <div>
      {projects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        <div className="project-displayContainer">
          <ul>
            {projects?.map((project) => ( // Use index as key for now
              <div className="project" key={project.id}>
                <li onClick={()=>{navigate(`/project/${project.id}`)}}>
                  
                  <h3>{project.title}</h3>
                  
                </li>
              </div>
            ))}
          </ul>
        </div>
      )}
    </div>
      
    );
}    


export default UserProjects;