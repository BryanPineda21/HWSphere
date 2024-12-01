import { useContext, createContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc} from "firebase/firestore";
import { db } from "../firebaseConfig";

export const Context = createContext();

export function useAuth(){
    return useContext(Context);
}


const AuthContext = ({children})=>{

    const auth = getAuth();

    const [user,setUser] = useState(null);
    const [userLoggedIn,setUserLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true)
    const [userData, setUserData] = useState(null);
    const [userProjects, setUserProjects] = useState([]);


    useEffect(()=>{
        

        const unsubscribe = onAuthStateChanged(auth, async(currentUser) => {
            setLoading(false)
            if(currentUser){
                setUser({...currentUser});
                setUserLoggedIn(true);

                //Put this getdata into a function outsire of useEffect
                const docRef = doc(db,"users",currentUser.uid);//start of getdata
                try{
                    const docSnap  = await getDoc(docRef);
                    if(docSnap.exists()){
                       setUserData(docSnap.data());
                    }
                }catch(error){
                    console.log(error.code);
                }
                //End of getdata

            }else{
                setUser(null);
                setUserLoggedIn(false);
            }

        });


     return () => unsubscribe();
    },[]);
    

        const values = {
            user: user,
            setUser: setUser,
            userLoggedIn: userLoggedIn,
            userData: userData,
            setUserData: setUserData,
        }

    return(
       <Context.Provider value={values}>
        {!loading && children}
       </Context.Provider>
    )




}


export default AuthContext;