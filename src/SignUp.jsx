import { useForm } from "react-hook-form";
import { getAuth, createUserWithEmailAndPassword} from "firebase/auth";
import { setDoc,doc,collection} from "firebase/firestore";
import { db } from "./firebaseConfig";
import { schema } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";


const SignUp = ()=>{
    const navigate = useNavigate();
    const { userData } = useAuth();


    const {register, handleSubmit,setError,formState:{errors,isSubmitting},} = useForm({
        defaultValues:{
            email:"example@email.com",
        },
        resolver: zodResolver(schema),
    });
        
        const auth = getAuth()
        
        const onSignUp = async (data) => {
            const { firstname, lastname, username, email, password } = data;

            try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const userId = user.uid;        
                
            
            await setDoc(doc(db, "users", userId), {
                    firstname,
                    lastname,
                    username,
                    email,
                });
           

            navigate(`/u/:${username}`);

            } catch (error) {
            console.log(error);
            setError("root", { message: "Invalid input" });
            }
        };
   



return(

    <div className="SignUp">
        <form className="signup-form" onSubmit={handleSubmit(onSignUp)}>
            <h5>Sign Up</h5>

            <label>First Name
            <input {...register("firstname")} type="text" placeholder="First Name"/>
            {errors.firstname && (<p style={{ color: 'red' }}>{errors.firstname.message}</p>)}
            </label>

            <label>Last Name
            <input {...register("lastname" )} type="text" placeholder="Last Name"/>
            {errors.lastname && (<p style={{ color: 'red' }}>{errors.lastname.message}</p>)}
            </label>

            <label>Username
            <input {...register("username")} type="text" placeholder="Username"/>
            {errors.username && (<p style={{ color: 'red' }}>{errors.username.message}</p>)}
            </label>

            <label>Email
            <input {...register("email")} type="text" placeholder="Email"/>
            {errors.email && (<p style={{ color: 'red' }}>{errors.email.message}</p> )}
            </label>

            <label>Password
            <input {...register("password")} type="password" placeholder="Password"/>
            {errors.password && (<p style={{ color: 'red' }}>{errors.password.message}</p>)}
            </label>
            
            <label>ConfirmPassword
            <input {...register("confirmPassword")} type="password" placeholder="confirmPassword"/>
            {errors.confirmPassword && (<p style={{ color: 'red' }}>{errors.confirmPassword.message}</p>)}
            </label>

            <button disabled={isSubmitting} className="signup-btn" type="submit"> {isSubmitting ? "Loading..." : "Sign Up"}</button>
            {errors.root && (<p style={{ color: 'red' }}>{errors.root.message}</p>)}
            
        </form>


        






    </div>
   
)}


export default SignUp;