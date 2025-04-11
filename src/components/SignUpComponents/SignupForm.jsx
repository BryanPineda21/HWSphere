import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormField } from "./FormField";
import { FormError } from "./FormError";
import googleIcon from '../../assets/google.svg';
import githubIcon from '../../assets/github.svg'; // Ensure you have the correct path for your assets   


// Animation variants for card
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export const SignupForm = ({ 
  register, 
  handleSubmit, 
  onSubmit, 
  errors, 
  isSubmitting, 
  showPassword, 
  setShowPassword, 
  formError, 
  formData, 
  primaryGradient,
  DEBUG,
  navigate
}) => {
  return (
    <motion.div 
      className="w-full"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm border border-gray-200/80 dark:border-zinc-800/80 hover:border-emerald-200 dark:hover:border-emerald-800/50 shadow-xl transition-all duration-300 relative overflow-hidden">
        {/* Card background accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent dark:from-emerald-950/20 dark:to-transparent opacity-80 dark:opacity-50 pointer-events-none"></div>
        {/* Card highlight edge */}
        <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400/40 dark:via-emerald-500/30 to-transparent"></div>
        
        <CardContent className="px-4 py-6 sm:px-8 sm:py-8 relative">
          <FormError error={formError} />

          {/* Debug info displayed when DEBUG is true */}
          {DEBUG && !isSubmitting && Object.keys(errors).length > 0 && (
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <FormField 
                register={register}
                id="firstname"
                label="First Name"
                placeholder="John"
                error={errors.firstname}
                index={0}
              />

              <FormField 
                register={register}
                id="lastname"
                label="Last Name"
                placeholder="Doe"
                error={errors.lastname}
                index={1}
              />
            </div>

            {/* Username Field */}
            <FormField 
              register={register}
              id="username"
              label="Username"
              placeholder="johndoe"
              error={errors.username}
              index={2}
            />

            {/* Email Field */}
            <FormField 
              register={register}
              id="email"
              label="Email"
              type="email"
              placeholder="john@example.com"
              error={errors.email}
              index={3}
            />

            {/* Password Field */}
            <FormField 
              register={register}
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password}
              index={4}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              isPassword={true}
            />
            
            {/* Confirm Password Field */}
            <FormField 
              register={register}
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword}
              index={5}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              isPassword={true}
            />

            {/* Sign Up Button */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { 
                  opacity: 1, 
                  y: 0, 
                  transition: { delay: 0.3, duration: 0.3 } 
                }
              }}
              initial="hidden"
              animate="visible"
            >
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
                    <span>Create Account</span>
                  )}
                </span>
              </Button>
            </motion.div>
          </form>

          {/* Debug display of submitted form data */}
          {DEBUG && formData && (
            <div className="mt-4 p-3 bg-gray-100 dark:bg-zinc-900 rounded text-xs">
              <div className="font-medium">Last submitted data:</div>
              <pre>{JSON.stringify(formData, null, 2)}</pre>
            </div>
          )}

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

            <motion.div 
              className="mt-4 sm:mt-6 grid grid-cols-2 gap-2 sm:gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.3 }}
            >
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
            </motion.div>
          </div>

          <div className="mt-4 sm:mt-6 text-center">
            <span className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 transition-colors">
              Already have an account?{" "}
              <Button
                variant="link"
                type="button"
                onClick={() => navigate("/login")}
                className="p-0 h-auto text-xs sm:text-sm text-emerald-600 dark:text-emerald-500 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
              >
                Login
              </Button>
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};