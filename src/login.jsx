import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema} from "./schema";
import { getAuth, signInWithEmailAndPassword} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from 'sonner'
import { Input } from "@heroui/react";
import { useState } from "react";
import googleIcon from './assets/google.svg'
import githubIcon from './assets/github.svg'


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



<div className="bg-gray-50 dark:bg-gray-800">
  <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div className="text-center sm:mx-auto sm:w-full sm:max-w-md">
      <h1 className="text-5xl  text-gray-900 dark:text-white font-geist font-extralight">
        Welcome Back
      </h1>
    </div>
    
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white dark:bg-gray-700 px-4 py-8 sm:rounded-lg sm:px-10 shadow">
        <form onSubmit={handleSubmit(onSignIn)} className="space-y-6">
          <Input
            {...register("email")}
            type="email"
            label="Email"
            labelPlacement="outside"
            name="email"
            autoComplete="on"
            placeholder="HWSphere@email.com"
            value={email}
            onValueChange={setEmail}
            errorMessage={errors.email?.message}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white">
              Password
            </label>
            <input
              {...register("password")}
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Password"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
            {errors.password && (
              <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember_me"
                name="remember_me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600"
              />
              <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-900 dark:text-white">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                Forgot password?
              </a>
            </div>
          </div>

          <button
            disabled={isSubmitting}
            type="submit"
            className="w-full rounded-md bg-lime-700 px-4 py-2 text-sm font-medium text-white hover:bg-lime-800 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? "Loading..." : "Login"}
          </button>
          
          {errors.root && (
            <p className="text-sm text-red-600">{errors.root.message}</p>
          )}
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white dark:bg-gray-700 px-2 text-gray-500 dark:text-white">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-500 dark:text-white shadow-sm hover:bg-gray-50">
              <img src={googleIcon}  className="h-5 w-5" alt="Google icon" />  
              <span className="ml-2">Google</span>
            </button>

            <button className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-500 dark:text-white shadow-sm hover:bg-gray-50">
              <img src={githubIcon}  className="h-5 w-5" alt="GitHub icon" />
               <span className="ml-2">GitHub</span>
              
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <button
              onClick={() => navigate("/SignUp")}
              className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              Create Account
            </button>
          </span>
        </div>

        <Toaster position="bottom-right" closeButton richColors />
      </div>
    </div>
  </div>
</div>
    // <div className="login">  
    //     <form onSubmit={handleSubmit(onSignIn)}>

    //         <h1>Welcome Back</h1>
            
    //         <Input
    //         className="max-w-xs"
    //         isClearable
    //         {...register("email")}
    //         type="email" 
    //         label="Email"
    //         labelPlacement="outside"
    //         name="email" 
    //         autoComplete="on" 
    //         placeholder="HWSphere@email.com"
    //         value={email}
    //         onValueChange={setEmail}
    //         errorMessage={errors.email ? errors.email.message : null}
    //         />

    //         <label>Password</label>
    //         <input {...register("password")} type="password" name="password" autoComplete="current-password" placeholder="Password"/>
    //         {errors.password && (<p style={{ color: 'red' }}>{errors.password.message}</p>)}
            
    //         <button disabled={isSubmitting} type="submit" className="login-btn"> {isSubmitting ? "Loading..." : "Login"}</button>
    //         {errors.root && (<p style={{ color: 'red' }}>{errors.root.message}</p>)}
    //         <button className = "createaccount-btn" onClick={() => navigate("/SignUp")}>Create Account</button>

    //     </form>


    //     <Toaster position="bottom-right" closeButton richColors />
     
    //     <button onClick={() => toast('My first toast')}>
    //     Give me a toast
    //   </button>
    


    // </div>

)


}


export default LoginPage;