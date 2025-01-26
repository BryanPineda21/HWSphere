import { useEffect, useState} from "react";
import { useAuth } from "./context/AuthContext";
import upload from "./upload";
import { db, storage} from "./firebaseConfig";
import { updateDoc, doc, } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import ProjectCard from "./projectCard.jsx";
import UserProjects from "./userProjects.jsx";
import {Divider} from "@heroui/divider";
import { Avatar, Button } from "@heroui/react";


const ProfilePage = () => {

  

    const {userData,user,setUserData} = useAuth();
    const [userFname, setUserFname] = useState("");
    const [userLname, setUserLname] = useState("");
    const [userBio, setUserBio] = useState("");
    const [localUserData, setLocalUserData] = useState(userData);
    const [avatar, setAvatar] = useState({
        file: null,
        url: null,
    });

    const [isEditing, setIsEditing] = useState(false);

    const handleEditProfileClick = (e) => {
      e.preventDefault();
      setIsEditing(true);
    };


    useEffect(() => {
      setLocalUserData(userData);
    }, [userData]);
    

    const handleAvatar = (e) => {
        if(e){
          const file = e.target.files[0];
          if (file.type === "image/jpeg" || file.type === "image/png") {
            setAvatar({
                file: file,
                url: URL.createObjectURL(file),
            });
          }else{
            setAvatar({
                error: "Please upload a valid image file (JPEG or PNG)",
            });
            console.error("Please upload a valid image file (JPEG or PNG)");
          }
        }
    };

    
    const handleProfileUpdate = async (event) => {
      event.preventDefault();
    
      try {
        const updates = {}; // Object to store updates

        // Update first name if it has changed
        if (userFname && userFname !== (localUserData.firstname || "")) { // Assuming userFname is set after typing
          updates.firstname = userFname;
        }
        // Update last name if it has changed 
        if (userLname && userLname !== (localUserData.lastname || "")) { // Assuming userLname is set after typing
          updates.lastname = userLname;
        }
    
        // Update bio if it has changed
        if (userBio && userBio !== (localUserData.bio || "")) { // Assuming userBio is set after typing
          updates.bio = userBio;
        }
    
        // Update profile picture if applicable
        // Check if a new avatar file is selected
        if (avatar.file) {
          // Upload the new avatar file and get the URL
          const imgUrl = await upload(avatar.file);
          // Get the URL of the old avatar from localUserData
          const oldImgUrl = localUserData.avatar; // Assuming 'img' field stores the old image URL

          // Check if there is an old avatar URL and it is different from the new URL
          if (oldImgUrl && oldImgUrl !== imgUrl) {
            // Get a reference to the old image in storage
            const oldImgRef = ref(storage, oldImgUrl);
            try {
              // Delete the old image from storage
              await deleteObject(oldImgRef);
              console.log("Image deleted successfully!");
            } catch (err) {
              console.error("Issue deleting image:", err);
            }
          }

          // Update the updates object with the new avatar URL
          updates.avatar = imgUrl; // Update only after successful upload
        }
    
        // Update Firestore with constructed updates object (check for undefined)
        if (Object.keys(updates).length > 0) {
          const docRef = doc(db, "users", user.uid);
          await updateDoc(docRef, updates);
          console.log("Profile updated successfully!");
          setIsEditing(false); // Hide the form after successful update
          setUserFname("");
          setUserLname("");
          setUserBio("");
          setAvatar({ file: null, url: null, error: null })
        } else {
          console.log("No changes detected in bio or profile picture.");
        }
    
        // Update local and user data regardless of upload success/failure
        setUserData((prevData) => ({
          ...prevData,
          ...updates,
        }));
        setLocalUserData((prevData) => ({
          ...prevData,
          ...updates,
        }));
      } catch (error) {
        console.error("Error updating profile:", error);
        alert("Failed to update profile! Please try again."); // More informative message
      }
    };

    const cancelEdit = (e) => {
      e.preventDefault();
      setIsEditing(false);
    }


    
return(

<div className="min-h-full p-4">
  {localUserData ? (
    <div className="max-w-full mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left side: User Profile */}
        <div className="lg:col-span-3">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Avatar src={localUserData.avatar || "/whiteaccount.png"} className="w-36 h-36 text-large mx-auto lg:mx-0" />
            <h1 className="text-2xl font-bold mt-4">{localUserData.firstname + " " + localUserData.lastname}</h1>
            <p className="text-gray-600">@{localUserData.username}</p>
             {localUserData.bio ? (
              <div className="mt-4 space-y-2">
                <p className="text-gray-700 leading-relaxed">{localUserData.bio}</p>
              </div>
            ) : (
              <p className="text-gray-500 italic mt-4">No bio available</p>
            )}  
            <Button onClick={handleEditProfileClick} className="mt-4 w-full lg:w-auto bg-green-600">Edit Profile</Button>
          </div>
        </div>



        {/* Middle and Right: User Projects Section and Project Card */}
        <div className="lg:col-span-9">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* User Projects Section */}
            <div className="flex-grow bg-white p-6 rounded-lg shadow-md max-w-6xl">
              <h2 className="text-xl font-semibold mb-4">User Projects</h2>
              <UserProjects userId={user.uid} />
            </div>

            {/* Project Card, move this next to edit btn */}
            <div className="lg:self-start">
              <ProjectCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <p className="text-center">Loading profile data...</p>
  )}

  

    

      {isEditing && (
        <div className="edit-form">
          <form onSubmit={handleProfileUpdate}>
          <h2>Edit Profile</h2>
            <label htmlFor="firstname">First Name:</label>
            <input type="text" id="firstname" value={userFname} onChange={(e) => setUserFname(e.target.value)} />
          <label htmlFor="lastname">Last Name:</label>
            <input type="text" id="lastname" value={userLname} onChange={(e) => setUserLname(e.target.value)} />

            <label htmlFor="bio">Bio:</label>
            <textarea type ="text" className="bio-text" id="bio" value={userBio} onChange={(e) => setUserBio(e.target.value)} />

            <label htmlFor="newProfilePicture">Change Profile Picture:</label>
            <input
              type="file"
              id="newProfilePicture"
              accept="image/png, image/jpeg" 
              onChange={handleAvatar}
            />
            {avatar.url && <img src={avatar.url} alt="Profile Preview" />}
            {avatar.error && <p className="error">{avatar.error}</p>}

            <button  className="save-btn" type="submit">Save</button>
            <button  className="cancel-btn" type="submit"  onClick={cancelEdit}>Cancel</button>

          </form>
        </div>  
  )}    

  
  </div>

  
     

)
}

export default ProfilePage;
