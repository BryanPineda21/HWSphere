import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EyeIcon, EyeOffIcon } from "lucide-react";

// Animation variants for form fields and errors
const formItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: index => ({ 
    opacity: 1, 
    x: 0, 
    transition: { 
      delay: index * 0.05,
      duration: 0.3
    } 
  })
};

const errorVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: "auto", transition: { duration: 0.2 } },
  exit: { opacity: 0, height: 0, transition: { duration: 0.2 } }
};

export const FormField = ({ 
  register, 
  id, 
  label, 
  type = "text", 
  placeholder, 
  error, 
  index = 0,
  showPassword,
  setShowPassword,
  isPassword = false
}) => {
  return (
    <motion.div 
      className="space-y-1 sm:space-y-2"
      variants={formItemVariants}
      initial="hidden"
      animate="visible"
      custom={index}
    >
      <Label htmlFor={id} className="text-sm text-gray-700 dark:text-zinc-300 transition-colors">
        {label}
      </Label>
      
      <div className="relative">
        <Input
          {...register(id)}
          id={id}
          type={isPassword ? (showPassword ? "text" : "password") : type}
          placeholder={placeholder}
          className="h-9 sm:h-10 text-sm bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-gray-200 dark:border-zinc-700 focus:border-emerald-400 dark:focus:border-emerald-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:ring-emerald-400/20 dark:focus:ring-emerald-600/20 dark:focus:ring-offset-zinc-900 transition-colors"
          {...(isPassword && { className: "h-9 sm:h-10 text-sm pr-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-gray-200 dark:border-zinc-700 focus:border-emerald-400 dark:focus:border-emerald-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:ring-emerald-400/20 dark:focus:ring-emerald-600/20 dark:focus:ring-offset-zinc-900 transition-colors" })}
        />
        
        {isPassword && setShowPassword && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-300"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeIcon className="h-4 w-4" />
            ) : (
              <EyeOffIcon className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
      
      <AnimatePresence>
        {error && (
          <motion.p 
            variants={errorVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="text-xs sm:text-sm text-red-500"
          >
            {error.message}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};