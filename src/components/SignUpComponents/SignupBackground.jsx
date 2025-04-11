import { motion } from "framer-motion";

export const SignupBackground = ({ primaryGradient }) => {
  return (
    <>
      {/* Fixed background layer - always visible regardless of scroll */}
      <div className="fixed inset-0 w-screen h-screen pointer-events-none -z-10 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-950 dark:to-black transition-colors duration-300"></div>
      
      {/* Animated gradient elements */}
      <div className="fixed inset-0 w-screen h-screen pointer-events-none -z-5 overflow-hidden">
        {/* Subtle gradient accents */}
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-5 dark:opacity-10 transition-opacity duration-500"
          style={{ backgroundColor: primaryGradient.bg1 }}
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: ["0.05", "0.08", "0.05"]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            repeatType: "reverse" 
          }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-5 dark:opacity-10 transition-opacity duration-500"
          style={{ backgroundColor: primaryGradient.bg2 }}
          animate={{ 
            scale: [1, 1.08, 1],
            opacity: ["0.05", "0.08", "0.05"]
          }}
          transition={{ 
            duration: 12, 
            repeat: Infinity, 
            repeatType: "reverse" 
          }}
        />
        
        {/* Small accent blob */}
        <motion.div
          className="absolute top-1/3 right-1/3 w-64 h-64 rounded-full blur-2xl opacity-5 dark:opacity-8 transition-opacity duration-500"
          style={{ backgroundColor: primaryGradient.bg1 }}
          animate={{ 
            y: [0, -20, 0],
            opacity: ["0.05", "0.07", "0.05"]
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity, 
            repeatType: "reverse" 
          }}
        />
        
        {/* Decorative patterns - very subtle */}
        <div className="absolute inset-0 opacity-[0.01] dark:opacity-[0.02]" 
             style={{ backgroundImage: 'radial-gradient(circle at 25px 25px, currentColor 1px, transparent 0), radial-gradient(circle at 75px 75px, currentColor 1px, transparent 0)', 
                      backgroundSize: '100px 100px' }}>
        </div>
        
        {/* Light mesh gradient for added depth - extremely subtle */}
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/2 via-transparent to-emerald-500/2 dark:from-emerald-900/5 dark:via-transparent dark:to-emerald-900/5 transition-opacity duration-500"></div>
      </div>
    </>
  );
};