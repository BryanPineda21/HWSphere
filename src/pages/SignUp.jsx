import { useForm } from "react-hook-form";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { schema } from "../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/ui/themeProvider";
import { Toaster, toast } from 'sonner';



import { SignupForm, SignupBackground, FormError} from "@/components/SignUpComponents/SignUpExport";

import "@/custom-styles.css"; // Ensure custom styles are imported
// Debug flag - set to true during development
const DEBUG = true;

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formData, setFormData] = useState(null);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const auth = getAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isValid, isDirty },
    watch,
  } = useForm({
    defaultValues: {
      email: "",
      firstname: "",
      lastname: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
    resolver: zodResolver(schema),
  });

  // Watch all form values for debugging
  const watchedValues = watch();
  
  // Debug form state changes
  useEffect(() => {
    if (DEBUG) {
      console.log("Form state changed:", {
        values: watchedValues,
        errors,
        isValid,
        isDirty,
        isSubmitting
      });
    }
  }, [watchedValues, errors, isValid, isDirty, isSubmitting]);

  // Debug log helper function
  const logDebug = (message, data) => {
    if (DEBUG) {
      console.log(`[DEBUG] ${message}`, data || '');
    }
  };

  const onSubmit = data => {
    logDebug("Form submitted with data:", data);
    setFormData(data);
    return onSignUp(data);
  };

  const onSignUp = async (data) => {
    setFormError(null);
    const { firstname, lastname, username, email, password } = data;

    try {
      logDebug("Starting account creation process...");
      
      // First, create the authentication user
      logDebug("Creating auth user with email:", email);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      ).catch(error => {
        logDebug("Auth creation error:", error);
        throw error; // Re-throw to be caught by outer catch
      });
      
      logDebug("Auth user created successfully:", userCredential.user.uid);
      const user = userCredential.user;
      const userId = user.uid;

      // Create a timestamp for dates
      const now = new Date();
      
      // Create user document with ALL fields from your schema
      const userData = {
        firstname: firstname || "",
        lastname: lastname || "",
        username: username || "",
        email: email || "",
        avatar: "",
        bio: "",
        github: "",
        linkedin: "",
        createdAt: now,
        updatedAt: now,
        lastUsernameChange: now
      };
      
      logDebug("Attempting to write user data to Firestore:", userData);
      
      try {
        // Add user to Firestore with nested try/catch for better error isolation
        await setDoc(doc(db, "users", userId), userData);
        logDebug("User document created successfully");
        
        // Show success toast
        toast.success("Account created successfully!", {
          duration: 4000,
        });
      } catch (firestoreError) {
        logDebug("Firestore error:", firestoreError);
        // Special handling for Firestore errors
        setFormError(`Database error: ${firestoreError.code} - ${firestoreError.message}. This might be due to database permissions.`);
        toast.error("Error creating account");
        return; // Stop execution but don't navigate away
      }
      
      // Navigate to user profile
      logDebug("Signup successful, navigating to:", `/u/${username}`);
      setTimeout(() => {
        navigate(`/u/${username}`);
      }, 1500);
    } catch (error) {
      logDebug("Signup error:", { code: error.code, message: error.message });
      
      // Handle specific Firebase auth errors
      if (error.code === 'auth/email-already-in-use') {
        setError("email", { message: "This email is already registered. Try logging in instead." });
        toast.error("Email already in use");
      } else if (error.code === 'auth/invalid-email') {
        setError("email", { message: "Please enter a valid email address." });
        toast.error("Invalid email format");
      } else if (error.code === 'auth/weak-password') {
        setError("password", { message: "Password should be at least 6 characters." });
        toast.error("Password too weak");
      } else if (error.code === 'auth/network-request-failed') {
        setFormError("Network error. Please check your connection and try again.");
        toast.error("Network error");
      } else {
        // Show a more detailed error message to help with debugging
        setFormError(`Account creation failed: ${error.code} - ${error.message}`);
        toast.error("Account creation failed");
      }
    }
  };

  // Define gradient colors based on theme - matching login page
  const primaryGradient = theme === "dark"
    ? { bg1: "#10b981", bg2: "#059669" }  // Green for dark mode
    : { bg1: "#10b981", bg2: "#047857" }; // Green for light mode too

  return (
    <div className="min-h-screen w-full relative">
      <SignupBackground primaryGradient={primaryGradient} />

      {/* Main content area with proper padding for navbar */}
      <div className="relative z-10 w-full min-h-screen pt-20 sm:pt-24 md:pt-28 flex items-center justify-center">
        <div className="w-full max-w-md mx-auto px-4 py-8 sm:py-10 md:py-12 flex flex-col items-center justify-center">
        

          <motion.div 
              className="text-center w-full max-w-sm sm:max-w-md mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-geist font-extralight text-gray-900 dark:text-white transition-colors">
                Create The Vision
              </h1>
              <h2 className="mt-3 text-xl sm:text-2xl md:text-3xl font-light text-emerald-600 dark:text-emerald-500 transition-colors">
                Launch Your Project Space with HWSphere
              </h2>
            </motion.div>
          
          <SignupForm 
            register={register}
            handleSubmit={handleSubmit}
            onSubmit={onSubmit}
            errors={errors}
            isSubmitting={isSubmitting}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            formError={formError}
            formData={formData}
            primaryGradient={primaryGradient}
            DEBUG={DEBUG}
            navigate={navigate}
          />
          
          <Toaster position="bottom-right" closeButton richColors />
        </div>
      </div>
    </div>
  );
};

export default SignUp;