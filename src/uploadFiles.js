import {collection, addDoc } from 'firebase/firestore';
import {ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage, db} from "./firebaseConfig";


const uploadFile = async (file, fileName) => {
  if (!file) {
    throw new Error("File is undefined");
  }


  const date = new Date();
  const storageRef = ref(storage, `projectFiles/${date + fileName}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload of ${fileName} is ${progress}% done`);
      }, 
      (error) => {
        reject(`Something went wrong with ${fileName} upload: ${error.code}`);
      }, 
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
          return downloadURL;
        } catch (error) {
          reject(`Error getting download URL for ${fileName}: ${error}`);
        }
      }
    );
  });
}

const createProject = async (projectData, codeFile, modelFile) => {
  try {
    // const [codeFileUrl, modelFileUrl] = await Promise.all([
    //   if (codeFile) {
    //     codeFileUrl = await uploadFile(codeFile, 'code_' + codeFile.name);
    //   }
  
    //   if (modelFile) {
    //     modelFileUrl = await uploadFile(modelFile, 'model_' + modelFile.name);
    //   }

    // ]);

    let codeUrl, modelUrl;

    const uploadPromises = [];

    if (codeFile) {
      uploadPromises.push(
        uploadFile(codeFile, 'code_' + codeFile.name)
          .then(url => { codeUrl = url; })
      );
    }

    if (modelFile) {
      uploadPromises.push(
        uploadFile(modelFile, 'model_' + modelFile.name)
          .then(url => { modelUrl = url; })
      );
    }

    await Promise.all(uploadPromises);

    const docRef = await addDoc(collection(db, "projects"), {
      ...projectData,
      codeUrl,
      modelUrl,
      createdAt: new Date()
    });

    return { docId: docRef.id, codeUrl, modelUrl };
  } catch (error) {
    throw new Error("Error creating project: " + error);
  }
}




export {createProject, uploadFile}; 