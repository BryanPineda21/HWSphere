import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema} from "./schema";
import { getAuth, signInWithEmailAndPassword} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from 'sonner'
import { Input } from "@nextui-org/react";
import { useState } from "react";



const LoginPage = () =>{

const [email, setEmail] = useState("");

// This is a resolver using zod
    const {register, handleSubmit,setError,formState:{errors,isSubmitting},} = useForm({
        resolver: zodResolver(loginSchema),
    });



    const auth = getAuth();
    const navigate = useNavigate();

    const onSignIn = async (data) => {

    const { email, password } = data;

    try {
        await new Promise((resolve) => setTimeout(resolve, 800));
        await signInWithEmailAndPassword(auth, email, password);
        

        console.log("Login successful");
        toast.success('Logged in successfully!', {
            duration: 4000,
        });

        setTimeout(() => {
            navigate("/Discover");
        }, 1500);
       

    }catch (error) {

            console.log(error);

            if(error.code === "auth/invalid-credential"){
                setError("root", { message: "Invalid Email or Password"});
                toast.error('Invalid Email or Password');
            }else {
                setError("root", { message: "An error occurred. Please try again." });
                toast.error('An error occurred. Please try again.');
            }            
        }
    };

return(

    <div className="login">  
        <form onSubmit={handleSubmit(onSignIn)}>

            <h1>Welcome Back</h1>
            
            <Input
            className="max-w-xs"
            isClearable
            {...register("email")}
            type="email" 
            label="Email"
            labelPlacement="outside"
            name="email" 
            autoComplete="on" 
            placeholder="HWSphere@email.com"
            value={email}
            onValueChange={setEmail}
            errorMessage={errors.email ? errors.email.message : null}
            />

            <label>Password</label>
            <input {...register("password")} type="password" name="password" autoComplete="current-password" placeholder="Password"/>
            {errors.password && (<p style={{ color: 'red' }}>{errors.password.message}</p>)}
            
            <button disabled={isSubmitting} type="submit" className="login-btn"> {isSubmitting ? "Loading..." : "Login"}</button>
            {errors.root && (<p style={{ color: 'red' }}>{errors.root.message}</p>)}
            <button className = "createaccount-btn" onClick={() => navigate("/SignUp")}>Create Account</button>

        </form>


        <Toaster position="bottom-right" closeButton richColors />
     
        <button onClick={() => toast('My first toast')}>
        Give me a toast
      </button>
    


    </div>

)


}


export default LoginPage;