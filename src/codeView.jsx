import React, { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import getProject from "./GetProject";
import Prism from "prismjs";
import 'prismjs/components/prism-javascript'; // For C++ highlighting
import 'prismjs/themes/prism-okaidia.css'; // For Prism theme


const ProjectCode =()=>{

    const { projectId } = useParams();

    const { data:project , isLoading, isError } = useQuery({
          
      queryFn: ()=> getProject(projectId),
      queryKey: ["projects", {projectId}],
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    
  });
  
  const codeRef = useRef(null);

 useEffect(() => {
    Prism.highlightAll();
    }, []);

    return(
        <div>
            <h1>Project Code</h1>
            {
                project && (
                    <div className="project-code">
                        <pre className={"language-javascript"}>
                            <code className={"language-javascript"}>
                           {project.codeContent}
                            </code>
                        </pre>
                    </div>
                )
            }
        </div>
    )

}


export default ProjectCode;