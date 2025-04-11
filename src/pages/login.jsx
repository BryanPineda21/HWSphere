import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../schema";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { toast } from 'sonner';
import { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/ui/themeProvider";

import '../custom-styles.css'

import { LoginBackground } from "@/components/LoginComponents/LoginBackground";
import { LoginForm } from "@/components/LoginComponents/LoginForm";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const { theme } = useTheme();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
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
      toast.success("Logged in successfully!", {
        duration: 4000,
      });

      setTimeout(() => {
        navigate("/Discover");
      }, 1500);
    } catch (error) {
      console.log(error);

      if (error.code === "auth/invalid-credential") {
        setError("root", { message: "Invalid Email or Password" });
        toast.error("Invalid Email or Password");
      } else {
        setError("root", { message: "An error occurred. Please try again." });
        toast.error("An error occurred. Please try again.");
      }
    }
  };

  // Define gradient colors based on theme - keeping emerald/green for both modes
  const primaryGradient = theme === "dark"
    ? { bg1: "#10b981", bg2: "#059669" }  // Green for dark mode
    : { bg1: "#10b981", bg2: "#047857" }; // Green for light mode too

  return (
    <div className="min-h-screen w-full relative">
      <LoginBackground primaryGradient={primaryGradient} />

      {/* Main content area with proper padding for navbar */}
      <div className="relative z-10 w-full min-h-screen pt-16 sm:pt-20 flex items-center justify-center">
        <div className="w-full max-w-md mx-auto px-4 py-6 sm:py-8 md:py-12 flex flex-col items-center justify-center">
          <motion.div 
            className="text-center w-full max-w-sm sm:max-w-md mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-geist font-extralight text-gray-900 dark:text-white transition-colors">
              Welcome Back
            </h1>
          </motion.div>
          
          <LoginForm 
            register={register}
            handleSubmit={handleSubmit}
            onSignIn={onSignIn}
            errors={errors}
            isSubmitting={isSubmitting}
            email={email}
            setEmail={setEmail}
            primaryGradient={primaryGradient}
            navigate={navigate}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;