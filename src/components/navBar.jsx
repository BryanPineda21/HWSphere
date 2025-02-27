import React,{useState, useEffect} from "react";
import { signOut,getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

import { Menu, Bell, Search, Sun, Moon, LogOut, User, Settings, HelpCircle } from 'lucide-react';

import { useTheme } from "@/components/ui/themeProvider";
import { ModeToggle } from "./mode-toggle";


const NavigationBar = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const { userLoggedIn, userData } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications] = useState(3); // Example notification count
  const [scrolled, setScrolled] = useState(false);
  const { setTheme } = useTheme();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMenuItemClick = () => {
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/Login", { replace: true });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <nav 
      className={`fixed top-4 z-50 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl mx-auto transition-all duration-300 ${
        scrolled 
          ? "bg-white/80 dark:bg-black/80 shadow-lg backdrop-blur-md" 
          : "bg-white/50 dark:bg-black/50 backdrop-blur-sm"
      } rounded-2xl border border-zinc-200 dark:border-zinc-800`}
    >
      <div className="px-3 sm:px-4 lg:px-5">
        <div className="flex items-center justify-between h-14">
          {/* Mobile menu */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-emerald-500 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800">
              <div className="flex flex-col gap-6 py-6">
                <NavLink
                  to="/"
                  onClick={handleMenuItemClick}
                  className="flex items-center gap-2 px-4 py-2"
                >
                  <img src="/whitelogov2.png" alt="Logo" className="h-6 dark:block hidden" />
                  <img src="/blacklogov2.png" alt="Logo" className="h-6 dark:hidden block" />
                </NavLink>
                <div className="px-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full pl-8 pr-4 py-2 text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2 px-2">
                  <NavLink
                    to="/Discover"
                    onClick={handleMenuItemClick}
                    className={({ isActive }) => `flex items-center gap-2 px-4 py-2 ${isActive ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'} rounded-full transition-colors`}
                  >
                    <img src="/discoverIcon.svg" alt="Discover" className="h-5 w-5" />
                    Discover
                  </NavLink>
                  {!userLoggedIn ? (
                    <>
                      <NavLink
                        to="/Login"
                        onClick={handleMenuItemClick}
                        className={({ isActive }) => `flex items-center gap-2 px-4 py-2 ${isActive ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'} rounded-full transition-colors`}
                      >
                        <img src="/loginIcon.svg" alt="Login" className="h-5 w-5" />
                        Login
                      </NavLink>
                      <NavLink
                        to="/SignUp"
                        onClick={handleMenuItemClick}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-full text-white transition-colors"
                      >
                        <User className="h-5 w-5" />
                        Sign Up
                      </NavLink>
                    </>
                  ) : (
                    <>
                      <NavLink
                        to={`/u/${userData?.username}`}
                        onClick={handleMenuItemClick}
                        className={({ isActive }) => `flex items-center gap-2 px-4 py-2 ${isActive ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'} rounded-full transition-colors`}
                      >
                        <User className="h-5 w-5" />
                        Profile
                      </NavLink>
                      <button
                        onClick={() => {
                          handleSignOut();
                          handleMenuItemClick();
                        }}
                        className="flex items-center gap-2 px-4 py-2 w-full hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full text-red-600 dark:text-red-400 transition-colors text-left"
                      >
                        <LogOut className="h-5 w-5" />
                        Log Out
                      </button>
                    </>
                  )}
                  <div className="mt-2 px-4 py-4 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="flex flex-col gap-2">
                      <p className="px-4 text-sm text-zinc-500 dark:text-zinc-400">Theme</p>
                      <button
                        onClick={() => setTheme("light")}
                        className="flex items-center gap-2 w-full px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                      >
                        <Sun className="h-5 w-5" />
                        <span>Light Mode</span>
                      </button>
                      <button
                        onClick={() => setTheme("dark")}
                        className="flex items-center gap-2 w-full px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                      >
                        <Moon className="h-5 w-5" />
                        <span>Dark Mode</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <div className="flex-shrink-0">
            <NavLink to="/" className="flex items-center">
              <img src="/whitelogov2.png" alt="Logo" className="h-6 dark:block hidden" />
              <img src="/blacklogov2.png" alt="Logo" className="h-6 dark:hidden block" />
            </NavLink>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-xs mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-zinc-100/80 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-full pl-9 pr-3 py-1.5 text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="flex items-center space-x-3">
            {userLoggedIn ? (
              <>
                <NavLink to="/Discover" className="hidden md:block">
                  <Button 
                    variant="ghost" 
                    className="rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <img src="/discoverIcon.svg" alt="Discover" className="h-5 w-5 mr-2" />
                    Discover
                  </Button>
                </NavLink>

                {/* Theme Toggle */}
                <ModeToggle className="hidden md:flex" />

                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="hidden md:flex relative rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Bell className="h-5 w-5" />
                      {notifications > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-emerald-500 text-white text-xs rounded-full">
                          {notifications}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-800" />
                    <DropdownMenuItem className="focus:bg-emerald-100 dark:focus:bg-emerald-900/20 rounded-md">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm">New comment on your project</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">2 minutes ago</p>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="hidden md:flex cursor-pointer border-2 border-emerald-500 hover:border-emerald-400 transition-colors">
                      <AvatarImage src={userData?.avatar || "/whiteaccount.png"} />
                      <AvatarFallback className="bg-emerald-500 text-white">
                        {userData?.username?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Signed in as</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{userData?.email || "...loading"}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-800" />
                    <DropdownMenuItem asChild className="focus:bg-emerald-100 dark:focus:bg-emerald-900/20 rounded-md">
                      <NavLink to={`/u/${userData?.username}`} className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Your Profile
                      </NavLink>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="focus:bg-emerald-100 dark:focus:bg-emerald-900/20 rounded-md">
                      <span className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Configurations
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="focus:bg-emerald-100 dark:focus:bg-emerald-900/20 rounded-md">
                      <span className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4" />
                        Help & Feedback
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-800" />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="text-red-600 dark:text-red-400 focus:bg-red-100 dark:focus:bg-red-900/20 rounded-md"
                    >
                      <span className="flex items-center gap-2">
                        <LogOut className="h-4 w-4" />
                        Log Out
                      </span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <NavLink to="/Discover" className="hidden md:block">
                  <Button 
                    variant="ghost" 
                    className="rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <img src="/discoverIcon.svg" alt="Discover" className="h-5 w-5 mr-2" />
                    Discover
                  </Button>
                </NavLink>

                {/* Theme Toggle */}
                <ModeToggle className="hidden md:flex mr-1" />

                {/* Auth buttons */}
                <div className="hidden md:flex items-center gap-2">
                  <NavLink to="/Login">
                    <Button 
                      variant="ghost"
                      className="h-9 px-3 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50 transition-colors"
                    >
                      <img src="/loginIcon.svg" alt="Login" className="h-4 w-4 mr-1.5" />
                      Login
                    </Button>
                  </NavLink>
                  <NavLink to="/SignUp">
                    <Button 
                      className="h-9 px-3 rounded-lg text-sm font-medium text-white relative overflow-hidden group"
                      style={{
                        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      }}
                    >
                      <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <User className="h-4 w-4 mr-1.5" />
                      Sign Up
                    </Button>
                  </NavLink>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;