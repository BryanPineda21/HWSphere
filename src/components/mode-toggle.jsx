import React,{useEffect} from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useTheme } from "@/components/ui/themeProvider";

export function ModeToggle (){
    const { theme, setTheme } = useTheme();
    
    // Set dark mode as default on component mount
    useEffect(() => {
      if (!localStorage.getItem("theme")) {
        setTheme("dark");
      }
    }, [setTheme]);
  
    // Simple toggle function
    const toggleTheme = () => {
      setTheme(theme === "dark" ? "light" : "dark");
    };
  
    return (

        <Button 
        variant="outline" 
        size="icon" 
        onClick={toggleTheme}
        className="rounded-full border-2 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-300">
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">
          {theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        </span>
      </Button>

    );
  }

