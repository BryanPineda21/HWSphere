import { useForm } from "react-hook-form";
import { getAuth, createUserWithEmailAndPassword} from "firebase/auth";
import { setDoc,doc} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { schema } from "../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import googleIcon from '../assets/google.svg'
import githubIcon from '../assets/github.svg'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { useTheme } from "@/components/ui/themeProvider";

import '../custom-styles.css';

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme(); // Get current theme from your theme provider

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "example@email.com",
    },
    resolver: zodResolver(schema),
  });

  const auth = getAuth();

  const onSignUp = async (data) => {
    const { firstname, lastname, username, email, password } = data;

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const userId = user.uid;

      await setDoc(doc(db, "users", userId), {
        firstname,
        lastname,
        username,
        email,
      });

      navigate(`/u/${username}`);
    } catch (error) {
      console.log(error);
      setError("root", { message: "Invalid input" });
    }
  };

  // Define gradient colors based on theme - keeping emerald/green for both modes
  const primaryGradient = theme === "dark" 
    ? { bg1: "#10b981", bg2: "#059669" }  // Green for dark mode
    : { bg1: "#10b981", bg2: "#047857" }; // Green for light mode too

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-950 dark:to-black transition-colors duration-300 overflow-hidden">
      {/* Enhanced background with multiple elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Primary gradient blobs */}
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-15 dark:opacity-20 transition-opacity duration-500 animate-pulse"
          style={{ backgroundColor: primaryGradient.bg1, animationDuration: '8s' }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-15 dark:opacity-20 transition-opacity duration-500 animate-pulse"
          style={{ backgroundColor: primaryGradient.bg2, animationDuration: '12s' }}
        />
        
        {/* Secondary elements */}
        <div
          className="absolute top-1/3 right-1/3 w-64 h-64 rounded-full blur-2xl opacity-10 dark:opacity-15 transition-opacity duration-500 animate-pulse"
          style={{ backgroundColor: primaryGradient.bg1, animationDuration: '15s' }}
        />
        
        {/* Decorative patterns */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" 
             style={{ backgroundImage: 'radial-gradient(circle at 25px 25px, currentColor 2px, transparent 0), radial-gradient(circle at 75px 75px, currentColor 2px, transparent 0)', 
                      backgroundSize: '100px 100px' }}>
        </div>
        
        {/* Light mesh gradient for added depth - only in light mode */}
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-transparent to-emerald-500/5 dark:opacity-0 transition-opacity duration-500"></div>
      </div>

      <div className="relative flex min-h-screen flex-col justify-center py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
        <div className="text-center mx-auto w-full max-w-sm sm:max-w-md">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-geist font-extralight text-gray-900 dark:text-white mb-2 transition-colors">
            Launch Your Project Space
          </h1>
        </div>

        <div className="mt-6 sm:mt-8 mx-auto w-full max-w-sm sm:max-w-md">
          <Card className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm border border-gray-200/80 dark:border-zinc-800/80 hover:border-emerald-200 dark:hover:border-emerald-800/50 shadow-xl transition-all duration-300 relative overflow-hidden">
            {/* Card background accent */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent dark:from-emerald-950/20 dark:to-transparent opacity-80 dark:opacity-50 pointer-events-none"></div>
            {/* Card highlight edge */}
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400/40 dark:via-emerald-500/30 to-transparent"></div>
            <CardContent className="px-4 py-6 sm:px-8 sm:py-8 relative">
              <form onSubmit={handleSubmit(onSignUp)} className="space-y-4 sm:space-y-6">
                {/* Name Fields - Responsive Grid Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="firstname" className="text-sm text-gray-700 dark:text-zinc-300 transition-colors">
                      First Name
                    </Label>
                    <Input
                      {...register("firstname")}
                      id="firstname"
                      type="text"
                      placeholder="John"
                      className="h-9 sm:h-10 text-sm bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-gray-200 dark:border-zinc-700 focus:border-emerald-400 dark:focus:border-emerald-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:ring-emerald-400/20 dark:focus:ring-emerald-600/20 dark:focus:ring-offset-zinc-900 transition-colors"
                    />
                    {errors.firstname && (
                      <p className="text-xs sm:text-sm text-red-500">
                        {errors.firstname.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="lastname" className="text-sm text-gray-700 dark:text-zinc-300 transition-colors">
                      Last Name
                    </Label>
                    <Input
                      {...register("lastname")}
                      id="lastname"
                      type="text"
                      placeholder="Doe"
                      className="h-9 sm:h-10 text-sm bg-gray-50 dark:bg-zinc-900 border-gray-300 dark:border-zinc-700 focus:border-blue-600 dark:focus:border-green-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:ring-blue-600/20 dark:focus:ring-green-600/20 dark:focus:ring-offset-zinc-900 transition-colors"
                    />
                    {errors.lastname && (
                      <p className="text-xs sm:text-sm text-red-500">
                        {errors.lastname.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Username and Email - Responsive Grid Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="username" className="text-sm text-gray-700 dark:text-zinc-300 transition-colors">
                      Username
                    </Label>
                    <Input
                      {...register("username")}
                      id="username"
                      type="text"
                      placeholder="johndoe"
                      className="h-9 sm:h-10 text-sm bg-gray-50 dark:bg-zinc-900 border-gray-300 dark:border-zinc-700 focus:border-blue-600 dark:focus:border-green-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:ring-blue-600/20 dark:focus:ring-green-600/20 dark:focus:ring-offset-zinc-900 transition-colors"
                    />
                    {errors.username && (
                      <p className="text-xs sm:text-sm text-red-500">
                        {errors.username.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="email" className="text-sm text-gray-700 dark:text-zinc-300 transition-colors">
                      Email
                    </Label>
                    <Input
                      {...register("email")}
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      className="h-9 sm:h-10 text-sm bg-gray-50 dark:bg-zinc-900 border-gray-300 dark:border-zinc-700 focus:border-blue-600 dark:focus:border-green-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:ring-blue-600/20 dark:focus:ring-green-600/20 dark:focus:ring-offset-zinc-900 transition-colors"
                    />
                    {errors.email && (
                      <p className="text-xs sm:text-sm text-red-500">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="password" className="text-sm text-gray-700 dark:text-zinc-300 transition-colors">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      {...register("password")}
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="h-9 sm:h-10 text-sm bg-gray-50 dark:bg-zinc-900 border-gray-300 dark:border-zinc-700 focus:border-blue-600 dark:focus:border-green-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:ring-blue-600/20 dark:focus:ring-green-600/20 dark:focus:ring-offset-zinc-900 transition-colors"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent hover:text-emerald-600 dark:hover:text-emerald-500 text-gray-500 dark:text-zinc-400 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      ) : (
                        <EyeOffIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-xs sm:text-sm text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  disabled={isSubmitting}
                  type="submit"
                  className="h-9 sm:h-10 w-full text-sm font-medium relative overflow-hidden group transition-all"
                  style={{
                    background: `linear-gradient(135deg, ${primaryGradient.bg1} 0%, ${primaryGradient.bg2} 100%)`,
                  }}
                >
                  {/* Enhanced button styling with multi-layered effects */}
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 group-active:opacity-10 transition-all duration-300" />
                  <span className="absolute bottom-0 inset-x-0 h-0.5 bg-black/10 dark:bg-black/20"></span>
                  <span className="relative flex items-center justify-center gap-1.5">
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Account</span>
                      </>
                    )}
                  </span>
                </Button>
              </form>

              <div className="mt-4 sm:mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-zinc-800 transition-colors"></div>
                  </div>
                  <div className="relative flex justify-center text-xs sm:text-sm">
                    <span className="bg-white dark:bg-zinc-950 px-2 text-gray-500 dark:text-zinc-400 transition-colors">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-2 sm:gap-3">
                  <Button
                    variant="outline"
                    className="h-9 sm:h-10 text-xs sm:text-sm bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 hover:border-emerald-200 dark:hover:bg-zinc-800 dark:hover:border-emerald-800/30 transition-all relative overflow-hidden group"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <img src={googleIcon} className="h-4 w-4 mr-1.5 sm:h-5 sm:w-5 sm:mr-2" alt="Google icon" />
                    Google
                  </Button>

                  <Button
                    variant="outline"
                    className="h-9 sm:h-10 text-xs sm:text-sm bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 hover:border-emerald-200 dark:hover:bg-zinc-800 dark:hover:border-emerald-800/30 transition-all relative overflow-hidden group"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <img src={githubIcon} className="h-4 w-4 mr-1.5 sm:h-5 sm:w-5 sm:mr-2" alt="GitHub icon" />
                    GitHub
                  </Button>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 text-center">
                <span className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 transition-colors">
                  Already have an account?{" "}
                  <Button
                    variant="link"
                    onClick={() => navigate("/login")}
                    className="text-xs sm:text-sm p-0 h-auto text-blue-600 dark:text-green-500 hover:text-blue-500 dark:hover:text-green-400 transition-colors"
                  >
                    Login
                  </Button>
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    
  );
};

export default SignUp;