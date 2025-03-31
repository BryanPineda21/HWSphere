import { useForm } from "react-hook-form";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { setDoc,doc} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { schema } from "../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import googleIcon from '../assets/google.svg'
import githubIcon from '../assets/github.svg'
import { useEffect } from "react";

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { useTheme } from "@/components/ui/themeProvider";
import { Alert, AlertDescription } from "@/components/ui/alert";

import '../custom-styles.css';

// Debug flag - set to true during development
const DEBUG = true;

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formData, setFormData] = useState(null); // Store form data for debugging
  const navigate = useNavigate();
  const { theme } = useTheme();

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
    mode: "onChange", // Validate on change
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

  const auth = getAuth();

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
      } catch (firestoreError) {
        logDebug("Firestore error:", firestoreError);
        // Special handling for Firestore errors
        setFormError(`Database error: ${firestoreError.code} - ${firestoreError.message}. This might be due to database permissions.`);
        return; // Stop execution but don't navigate away
      }
      
      // Navigate to user profile
      logDebug("Signup successful, navigating to:", `/u/${username}`);
      navigate(`/u/${username}`);
    } catch (error) {
      logDebug("Signup error:", { code: error.code, message: error.message });
      
      // Handle specific Firebase auth errors
      if (error.code === 'auth/email-already-in-use') {
        setError("email", { message: "This email is already registered. Try logging in instead." });
      } else if (error.code === 'auth/invalid-email') {
        setError("email", { message: "Please enter a valid email address." });
      } else if (error.code === 'auth/weak-password') {
        setError("password", { message: "Password should be at least 6 characters." });
      } else if (error.code === 'auth/network-request-failed') {
        setFormError("Network error. Please check your connection and try again.");
      } else {
        // Show a more detailed error message to help with debugging
        setFormError(`Account creation failed: ${error.code} - ${error.message}`);
      }
    }
  };

  // Define a simpler gradient style
  const primaryColor = theme === "dark" ? "#10b981" : "#059669";
  const buttonStyle = {
    background: theme === "dark" 
      ? "linear-gradient(to right, #10b981, #059669)" 
      : "linear-gradient(to right, #10b981, #047857)"
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900 p-4 sm:p-6">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20 dark:opacity-10"
          style={{ backgroundColor: primaryColor }}
        />
        <div 
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-20 dark:opacity-10"
          style={{ backgroundColor: primaryColor }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-light text-gray-900 dark:text-white">
            Create Your Account
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Get started with your project space
          </p>
        </div>

        <Card className="border border-gray-200 dark:border-gray-800 shadow-lg bg-white dark:bg-zinc-800">
          <CardContent className="pt-6">
            {formError && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            {/* Debug info displayed when DEBUG is true */}
            {DEBUG && !isValid && Object.keys(errors).length > 0 && (
              <Alert className="mb-6 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
                <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                  <div className="font-medium">Validation issues:</div>
                  <ul className="text-sm mt-1">
                    {Object.entries(errors).map(([field, error]) => (
                      <li key={field}>{field}: {error.message}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="firstname" className="text-sm">
                    First Name
                  </Label>
                  <Input
                    {...register("firstname")}
                    id="firstname"
                    type="text"
                    placeholder="John"
                    className="h-10"
                  />
                  {errors.firstname && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.firstname.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="lastname" className="text-sm">
                    Last Name
                  </Label>
                  <Input
                    {...register("lastname")}
                    id="lastname"
                    type="text"
                    placeholder="Doe"
                    className="h-10"
                  />
                  {errors.lastname && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.lastname.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Username Field */}
              <div className="space-y-1">
                <Label htmlFor="username" className="text-sm">
                  Username
                </Label>
                <Input
                  {...register("username")}
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  className="h-10"
                />
                {errors.username && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-1">
                <Label htmlFor="email" className="text-sm">
                  Email
                </Label>
                <Input
                  {...register("email")}
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  className="h-10"
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <Label htmlFor="password" className="text-sm">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    {...register("password")}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-10 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>
              
              {/* Confirm Password Field */}
              <div className="space-y-1">
                <Label htmlFor="confirmPassword" className="text-sm">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    {...register("confirmPassword")}
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-10 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Sign Up Button */}
              <Button
                disabled={isSubmitting}
                type="submit"
                className="w-full h-10 mt-2 text-white"
                style={buttonStyle}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            {/* Debug display of submitted form data */}
            {DEBUG && formData && (
              <div className="mt-4 p-3 bg-gray-100 dark:bg-zinc-900 rounded text-xs">
                <div className="font-medium">Last submitted data:</div>
                <pre>{JSON.stringify(formData, null, 2)}</pre>
              </div>
            )}

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-zinc-800 text-gray-500 dark:text-gray-400">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-10"
                  type="button"
                  onClick={() => console.log("Google sign-in not implemented")}
                >
                  <img src={googleIcon} className="h-5 w-5 mr-2" alt="Google" />
                  Google
                </Button>

                <Button
                  variant="outline"
                  className="h-10"
                  type="button"
                  onClick={() => console.log("GitHub sign-in not implemented")}
                >
                  <img src={githubIcon} className="h-5 w-5 mr-2" alt="GitHub" />
                  GitHub
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Already have an account?{" "}
                <Button
                  variant="link"
                  type="button"
                  onClick={() => navigate("/login")}
                  className="p-0 h-auto text-blue-600 dark:text-green-500 hover:text-blue-500 dark:hover:text-green-400"
                >
                  Login
                </Button>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;