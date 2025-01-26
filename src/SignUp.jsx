import { useForm } from "react-hook-form";
import { getAuth, createUserWithEmailAndPassword} from "firebase/auth";
import { setDoc,doc,collection} from "firebase/firestore";
import { db } from "./firebaseConfig";
import { schema } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useState } from "react";
import googleIcon from './assets/google.svg'
import githubIcon from './assets/github.svg'


const SignUp = ()=>{

   const [showPassword, setShowPassword] = useState(false);
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

  <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
  <div className="text-center sm:mx-auto sm:w-full sm:max-w-md">
    <h1 className="text-5xl  text-gray-900 font-geist font-extralight">Launch Your Project Space With Us</h1>
  </div>
  
  <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
    <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
      <form onSubmit={handleSubmit(onSignUp)} className="space-y-6">
        {/* First Name and Last Name fields unchanged */}
        <div>
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              {...register("firstname")}
              type="text"
              placeholder="First Name"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-lime-500 focus:outline-none focus:ring-lime-500"
            />
            {errors.firstname && (<p className="mt-2 text-sm text-red-600">{errors.firstname.message}</p>)}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              {...register("lastname")}
              type="text"
              placeholder="Last Name"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-lime-500 focus:outline-none focus:ring-lime-500"
            />
            {errors.lastname && (<p className="mt-2 text-sm text-red-600">{errors.lastname.message}</p>)}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              {...register("username")}
              type="text"
              placeholder="Username"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-lime-500 focus:outline-none focus:ring-lime-500"
            />
            {errors.username && (<p className="mt-2 text-sm text-red-600">{errors.username.message}</p>)}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              {...register("email")}
              type="text"
              placeholder="Email"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-lime-500 focus:outline-none focus:ring-lime-500"
            />
            {errors.email && (<p className="mt-2 text-sm text-red-600">{errors.email.message}</p>)}
          </div>
        {/* Password field with visibility toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <div className="relative mt-1">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-lime-500 focus:outline-none focus:ring-lime-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              {showPassword ? (
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
        </div>

        <button
          disabled={isSubmitting}
          type="submit"
          className="w-full rounded-md bg-lime-700 px-4 py-2 text-sm font-medium text-white hover:bg-lime-800 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? "Loading..." : "Sign Up"}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50">
            <img src={googleIcon}  className="h-5 w-5" alt="Google icon" />
            
            <span className="ml-2">Google</span>
          </button>

          <button className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50">
          <img src={githubIcon}  className="h-5 w-5" alt="GitHub icon" />
            <span className="ml-2">GitHub</span>
          </button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <span className="text-sm text-gray-600">
          Already have an account?{' '}
          <button
            onClick={() => navigate("/login")}
            className="font-medium  text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            Login
          </button>
        </span>
      </div>
    </div>
  </div>
</div>
   
)}


export default SignUp;