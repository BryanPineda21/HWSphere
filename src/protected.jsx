import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { Context } from "./context/AuthContext";


const Protected = ({children}) => {

    const {user} = useContext(Context);

    if(!user){
        return <Navigate to="/Login" replace/>
    }else{


        return children
    }

}

export default Protected;