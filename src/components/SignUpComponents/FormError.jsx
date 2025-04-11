import { motion, AnimatePresence } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Animation variants for error messages
const errorVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: "auto", transition: { duration: 0.2 } },
  exit: { opacity: 0, height: 0, transition: { duration: 0.2 } }
};

export const FormError = ({ error }) => {
  if (!error) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        variants={errorVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="mb-4"
      >
        <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50">
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
};