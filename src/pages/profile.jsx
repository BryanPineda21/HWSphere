import { useEffect, useState} from "react";
import { useAuth } from "../context/AuthContext";
import profilePictureUpload from "@/profilePicture/pfpUpload";
import { db, storage} from "../firebaseConfig";
import { updateDoc, doc, } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { useNavigate } from "react-router-dom";




// -------------------------------------------------
import { canChangeUsername } from "../api/profile.js";


// Custom Components
import UserProjects from "../components/userProjects.jsx";
import { useParams } from "react-router-dom";
import { serverTimestamp } from "firebase/firestore";
// UI Components

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Pencil, Upload, Github, Linkedin, Mail, User, Calendar, 
  Clock,Info, PlusCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTheme } from "@/components/ui/themeProvider";








// profile page component
const ProfilePage = () => {
  const { profileId } = useParams();
  const { userData, user, setUserData } = useAuth();
  const { theme } = useTheme(); // Add theme context hook
  const navigate = useNavigate();
  
  // Form States
  const [userFname, setUserFname] = useState("");
  const [userLname, setUserLname] = useState("");
  const [userBio, setUserBio] = useState("");
  const [username, setUsername] = useState("");
  const [userGithub, setUserGithub] = useState("");
  const [userLinkedin, setUserLinkedin] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [localUserData, setLocalUserData] = useState(userData);
  const [avatar, setAvatar] = useState({
    file: null,
    url: null,
    error: null
  });
  const [isEditing, setIsEditing] = useState(false);
  
  // Username change state
  const [usernameChangeInfo, setUsernameChangeInfo] = useState({ 
    canChange: true, 
    nextChangeDate: null,
    daysRemaining: 0
  });

  // Check if viewing own profile
  const isOwnProfile = user && (!profileId || profileId === user.uid || profileId === userData?.username);

  // Sync localUserData with userData
  useEffect(() => {
    if (userData) {
      setLocalUserData(userData);
      
      // Check if user can change username
      const usernameStatus = canChangeUsername(userData);
      setUsernameChangeInfo(usernameStatus);
    }
  }, [userData]);

  // Event Handlers
  const handleEditProfileClick = (e) => {
    e?.preventDefault();
    setIsEditing(true);
    
    // Pre-fill form with existing values
    setUserFname(localUserData?.firstname || "");
    setUserLname(localUserData?.lastname || "");
    setUserBio(localUserData?.bio || "");
    setUsername(localUserData?.username || "");
    setUserGithub(localUserData?.github || "");
    setUserLinkedin(localUserData?.linkedin || "");
    setUserEmail(localUserData?.email || "");
  };

  const handleAvatar = (e) => {
    if (e?.target?.files?.[0]) {
      const file = e.target.files[0];
      if (file.type === "image/jpeg" || file.type === "image/png") {
        setAvatar({
          file: file,
          url: URL.createObjectURL(file),
          error: null
        });
      } else {
        setAvatar({
          file: null,
          url: null,
          error: "Please upload a valid image file (JPEG or PNG)"
        });
      }
    }
  };

  const handleProfileUpdate = async (event) => {
    event.preventDefault();
    
    try {
      const updates = {};

      // Check for changes in text fields
      if (userFname !== (localUserData?.firstname || "")) {
        updates.firstname = userFname;
      }
      if (userLname !== (localUserData?.lastname || "")) {
        updates.lastname = userLname;
      }
      if (userBio !== (localUserData?.bio || "")) {
        updates.bio = userBio;
      }
      if (userGithub !== (localUserData?.github || "")) {
        updates.github = userGithub;
      }
      if (userLinkedin !== (localUserData?.linkedin || "")) {
        updates.linkedin = userLinkedin;
      }
      if (userEmail !== (localUserData?.email || "")) {
        updates.email = userEmail;
      }
      
      // Check for username change
      if (username !== localUserData?.username) {
        if (!usernameChangeInfo.canChange) {
          toast.error(`You can only change your username once every 14 days. Try again in ${usernameChangeInfo.daysRemaining} days.`);
          return;
        }
        
        updates.username = username;
        updates.lastUsernameChange = serverTimestamp();
      }

      // Handle avatar update
      if (avatar.file) {
        const imgUrl = await profilePictureUpload(avatar.file);
        const oldImgUrl = localUserData?.avatar;

        if (oldImgUrl && oldImgUrl !== imgUrl) {
          try {
            await deleteObject(ref(storage, oldImgUrl));
          } catch (err) {
            console.error("Issue deleting old image:", err);
          }
        }

        updates.avatar = imgUrl;
      }

      // Add timestamp for the update
      updates.updatedAt = serverTimestamp();

      // Update Firestore if there are changes
      if (Object.keys(updates).length > 0) {
        const docRef = doc(db, "users", user.uid);
        await updateDoc(docRef, updates);
        
        // Update local states
        setUserData(prev => ({ ...prev, ...updates }));
        setLocalUserData(prev => ({ ...prev, ...updates }));
        
        toast.success('Profile updated successfully!');
        
        // Reset form
        resetForm();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(`Failed to update profile: ${error.message}`);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setUserFname("");
    setUserLname("");
    setUserBio("");
    setUsername("");
    setUserGithub("");
    setUserLinkedin("");
    setUserEmail("");
    setAvatar({ file: null, url: null, error: null });
  };

  const cancelEdit = (e) => {
    e?.preventDefault();
    resetForm();
  };

  // Calculate joining date
  const getJoinedDate = () => {
    if (localUserData?.createdAt) {
      const date = typeof localUserData.createdAt === 'object' && 'seconds' in localUserData.createdAt
        ? new Date(localUserData.createdAt.seconds * 1000)
        : new Date(localUserData.createdAt);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    return 'Unknown';
  };

  // Loading State
  if (!localUserData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:via-black dark:to-zinc-900 transition-colors duration-300">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:via-black dark:to-zinc-900 text-zinc-900 dark:text-white mt-6 md:pt-20 p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="relative rounded-xl overflow-hidden bg-white/90 dark:bg-zinc-900/80 backdrop-blur-sm shadow-xl mb-8 border border-zinc-200 dark:border-zinc-800 transition-all duration-300">
          <div className="h-32 md:h-48 bg-gradient-to-r from-emerald-500/10 to-emerald-400/10 dark:from-emerald-600/20 dark:to-emerald-400/20 transition-colors duration-300">
            <div className="absolute inset-0 bg-[url('/pattern-light.svg')] dark:bg-[url('/pattern-dark.svg')] opacity-5 bg-repeat"></div>
          </div>
          <div className="px-4 md:px-8 pb-6 -mt-16 relative z-10">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
              <div className="group relative">
                <Avatar className="w-32 h-32 border-4 border-white dark:border-zinc-900 shadow-lg transition-transform duration-300 group-hover:scale-105">
                  <AvatarImage 
                    src={localUserData?.avatar || "/whiteaccount.png"} 
                    alt="Profile" 
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 text-2xl transition-colors duration-300">
                    {`${localUserData?.firstname?.[0] || ''}${localUserData?.lastname?.[0] || ''}`}
                  </AvatarFallback>
                </Avatar>
                {isOwnProfile && (
                  <div className="absolute -bottom-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            size="icon" 
                            variant="outline" 
                            className="h-8 w-8 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-md"
                            onClick={handleEditProfileClick}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit Profile</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </div>
              
              <div className="flex-1 mt-4 md:mt-0">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white transition-colors duration-300">
                      {`${localUserData?.firstname || ''} ${localUserData?.lastname || ''}`}
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400 flex items-center gap-1 mt-1 transition-colors duration-300">
                      <User className="w-3 h-3" />
                      @{localUserData?.username}
                    </p>
                  </div>
                  
                  {isOwnProfile && (
                    <Dialog open={isEditing} onOpenChange={setIsEditing}>
                      <DialogTrigger asChild>
                        <Button 
                          className="bg-white hover:bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-white border border-zinc-200 dark:border-zinc-700 transition-colors duration-300 shadow-sm"
                          size="sm"
                          onClick={handleEditProfileClick}
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 max-h-[90vh] overflow-y-auto transition-colors duration-300">
                        <DialogHeader>
                          <DialogTitle className="text-emerald-600 dark:text-emerald-400 text-xl transition-colors duration-300">Edit Profile</DialogTitle>
                          <DialogDescription className="text-zinc-600 dark:text-zinc-400 transition-colors duration-300">
                            Make changes to your profile information.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleProfileUpdate} className="space-y-6 mt-4">
                          {/* Avatar Upload */}
                          <div className="flex flex-col items-center">
                            <div className="relative group mb-4">
                              <Avatar className="w-32 h-32 border-4 border-emerald-100 dark:border-emerald-900 transition-colors duration-300">
                                <AvatarImage 
                                  src={avatar.url || localUserData?.avatar || "/whiteaccount.png"} 
                                  alt="Profile" 
                                  className="object-cover"
                                />
                                <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 text-2xl transition-colors duration-300">
                                  {`${localUserData?.firstname?.[0] || ''}${localUserData?.lastname?.[0] || ''}`}
                                </AvatarFallback>
                              </Avatar>
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-full transition-all duration-300 cursor-pointer">
                                <label className="cursor-pointer flex items-center justify-center w-full h-full">
                                  <Upload className="w-6 h-6 text-white" />
                                  <input
                                    type="file"
                                    id="newProfilePicture"
                                    accept="image/png, image/jpeg"
                                    onChange={handleAvatar}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            </div>
                            {avatar.error && (
                              <p className="text-red-500 text-sm mt-1">{avatar.error}</p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Basic Information */}
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="firstname" className="text-zinc-700 dark:text-zinc-300 transition-colors duration-300">First Name</Label>
                                <Input
                                  id="firstname"
                                  placeholder="First Name"
                                  value={userFname}
                                  onChange={(e) => setUserFname(e.target.value)}
                                  className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-colors duration-300"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="lastname" className="text-zinc-700 dark:text-zinc-300 transition-colors duration-300">Last Name</Label>
                                <Input
                                  id="lastname"
                                  placeholder="Last Name"
                                  value={userLname}
                                  onChange={(e) => setUserLname(e.target.value)}
                                  className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-colors duration-300"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="email" className="text-zinc-700 dark:text-zinc-300 transition-colors duration-300">Email</Label>
                                <Input
                                  id="email"
                                  type="email"
                                  placeholder="Email"
                                  value={userEmail}
                                  onChange={(e) => setUserEmail(e.target.value)}
                                  className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-colors duration-300"
                                />
                              </div>
                            </div>

                            {/* Username and Social Links */}
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="username" className="text-zinc-700 dark:text-zinc-300 transition-colors duration-300">Username</Label>
                                  {!usernameChangeInfo.canChange && (
                                    <span className="text-xs text-amber-600 dark:text-amber-400 transition-colors duration-300">
                                      Available in {usernameChangeInfo.daysRemaining} days
                                    </span>
                                  )}
                                </div>
                                <Input
                                  id="username"
                                  placeholder="Username"
                                  value={username}
                                  onChange={(e) => setUsername(e.target.value)}
                                  disabled={!usernameChangeInfo.canChange}
                                  className={`bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-colors duration-300 ${
                                    !usernameChangeInfo.canChange ? 'opacity-50 cursor-not-allowed' : ''
                                  }`}
                                />
                                {!usernameChangeInfo.canChange && (
                                  <p className="text-xs text-zinc-500 dark:text-zinc-500 transition-colors duration-300">
                                    Username can only be changed once every 14 days
                                  </p>
                                )}
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="github" className="text-zinc-700 dark:text-zinc-300 transition-colors duration-300">GitHub Username</Label>
                                <div className="relative">
                                  <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 transition-colors duration-300" size={16} />
                                  <Input
                                    id="github"
                                    placeholder="GitHub username"
                                    value={userGithub}
                                    onChange={(e) => setUserGithub(e.target.value)}
                                    className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white pl-10 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-colors duration-300"
                                  />
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="linkedin" className="text-zinc-700 dark:text-zinc-300 transition-colors duration-300">LinkedIn Username</Label>
                                <div className="relative">
                                  <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 transition-colors duration-300" size={16} />
                                  <Input
                                    id="linkedin"
                                    placeholder="LinkedIn username"
                                    value={userLinkedin}
                                    onChange={(e) => setUserLinkedin(e.target.value)}
                                    className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white pl-10 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-colors duration-300"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Bio */}
                          <div className="space-y-2">
                            <Label htmlFor="bio" className="text-zinc-700 dark:text-zinc-300 transition-colors duration-300">Bio</Label>
                            <Textarea
                              id="bio"
                              placeholder="Tell us about yourself..."
                              value={userBio}
                              onChange={(e) => setUserBio(e.target.value)}
                              className="h-32 bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-colors duration-300"
                            />
                          </div>

                          {/* Username change info box */}
                          {!usernameChangeInfo.canChange && (
                            <Alert className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 transition-colors duration-300">
                              <Info className="h-4 w-4" />
                              <AlertTitle>Username change restricted</AlertTitle>
                              <AlertDescription>
                                You can change your username again on {usernameChangeInfo.nextChangeDate?.toLocaleDateString()} 
                                ({usernameChangeInfo.daysRemaining} days remaining)
                              </AlertDescription>
                            </Alert>
                          )}

                          <div className="flex gap-4 justify-end mt-6">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={cancelEdit}
                              className="border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-colors duration-300"
                            >
                              Cancel
                            </Button>
                            <Button 
                              type="submit"
                              className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white transition-all duration-300 shadow-md hover:shadow-lg"
                            >
                              Save Changes
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
                
                {/* Bio & Stats Section */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-8">
                    <div className="bg-white/50 dark:bg-zinc-800/50 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700 transition-all duration-300 hover:shadow-md">
                      <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2 transition-colors duration-300">About</h3>
                      {localUserData?.bio ? (
                        <p className="text-zinc-800 dark:text-zinc-300 leading-relaxed font-geist font-normal transition-colors duration-300">
                          {localUserData.bio}
                        </p>
                      ) : (
                        <p className="text-zinc-500 dark:text-zinc-500 italic transition-colors duration-300">
                          No bio available
                        </p>
                      )}
                      
                      {/* Social Links */}
                      <div className="flex gap-4 mt-4">
                        {localUserData?.github && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <a 
                                  href={`https://github.com/${localUserData.github}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-all duration-300 hover:scale-110"
                                >
                                  <Github size={18} />
                                </a>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>GitHub Profile</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {localUserData?.linkedin && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <a 
                                  href={`https://linkedin.com/in/${localUserData.linkedin}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-all duration-300 hover:scale-110"
                                >
                                  <Linkedin size={18} />
                                </a>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>LinkedIn Profile</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {localUserData?.email && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <a 
                                  href={`mailto:${localUserData.email}`} 
                                  className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-all duration-300 hover:scale-110"
                                >
                                  <Mail size={18} />
                                </a>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Email</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-4">
                    <div className="bg-white/50 dark:bg-zinc-800/50 rounded-lg p-4 h-full border border-zinc-200 dark:border-zinc-700 transition-all duration-300 hover:shadow-md">
                      <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2 transition-colors duration-300">Stats</h3>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm">
                          <Calendar className="w-4 h-4 mr-2 text-zinc-500 transition-colors duration-300" />
                          <span className="text-zinc-700 dark:text-zinc-400 transition-colors duration-300">Joined {getJoinedDate()}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="w-4 h-4 mr-2 text-zinc-500 transition-colors duration-300" />
                          <span className="text-zinc-700 dark:text-zinc-400 transition-colors duration-300">Active developer</span>
                        </div>
                        {localUserData?.role && (
                          <Badge className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 transition-colors duration-300">
                            {localUserData.role}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs & Content Section */}
        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-sm mb-6 border border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
            <TabsTrigger 
              value="projects" 
              className="data-[state=active]:bg-emerald-500 data-[state=active]:dark:bg-emerald-600 data-[state=active]:text-white transition-all duration-300"
            >
              Projects
            </TabsTrigger>
            <TabsTrigger 
              value="likes" 
              className="data-[state=active]:bg-emerald-500 data-[state=active]:dark:bg-emerald-600 data-[state=active]:text-white transition-all duration-300"
            >
              Likes
            </TabsTrigger>
            <TabsTrigger 
              value="comments" 
              className="data-[state=active]:bg-emerald-500 data-[state=active]:dark:bg-emerald-600 data-[state=active]:text-white transition-all duration-300"
            >
              Comments
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="projects" className="w-full">
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-sm shadow-lg transition-colors duration-300">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6 transition-colors duration-300">
                <CardTitle className="text-xl font-bold text-emerald-600 dark:text-emerald-400 transition-colors duration-300">
                  {isOwnProfile ? 'Your Projects' : `${localUserData?.firstname || 'User'}'s Projects`}
                </CardTitle>
                {isOwnProfile && (
                  <Button 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-300 shadow-md hover:shadow-lg"
                    onClick={() => navigate(`/u/${profileId || user.uid}/projects/new`)}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    New Project
                  </Button>
                )}
              </CardHeader>
              <CardContent className="pt-6">
                {/* Pass the profile ID to UserProjects */}
                <UserProjects profileId={profileId || user?.uid} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="likes">
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-sm shadow-lg transition-colors duration-300">
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800/80 flex items-center justify-center mb-4 transition-colors duration-300">
                    <Clock className="w-8 h-8 text-zinc-500 transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-medium text-zinc-700 dark:text-zinc-400 transition-colors duration-300">Coming Soon</h3>
                  <p className="text-zinc-600 dark:text-zinc-500 max-w-md mt-2 transition-colors duration-300">
                    The likes feature is under development and will be available soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="comments">
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-sm shadow-lg transition-colors duration-300">
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800/80 flex items-center justify-center mb-4 transition-colors duration-300">
                    <Clock className="w-8 h-8 text-zinc-500 transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-medium text-zinc-700 dark:text-zinc-400 transition-colors duration-300">Coming Soon</h3>
                  <p className="text-zinc-600 dark:text-zinc-500 max-w-md mt-2 transition-colors duration-300">
                    The comments feature is under development and will be available soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;