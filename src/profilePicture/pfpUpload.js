import {ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage} from "../firebaseConfig";


const profilePictureUpload = async (file) => {
const date = new Date();
const storageRef = ref(storage, `images/${date + file.name}`);
const uploadTask = uploadBytesResumable(storageRef, file);

return new Promise((resolve, reject) => {
// Listen for state changes, errors, and completion of the upload.
uploadTask.on('state_changed',
  (snapshot) => {
    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log('Upload is ' + progress + '% done');
  }, 
  (error) => {
   
    reject("something when worong!"+ error.code);
  }, 
  () => {
    // Upload completed successfully, now we can get the download URL
    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        resolve(downloadURL);
    });
  }
);
});
}

export default profilePictureUpload;