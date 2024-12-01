const dotenv = require("dotenv")
dotenv.config({ path: `../.env` });
const multer = require('multer');
const admin = require('./firebaseAdmin.js');
const { Storage } = require('@google-cloud/storage');
const redis = require('redis');
const express = require('express');
const cors = require('cors');



// Create a Redis client  -- Redis might be an option for caching user content

// let client;

// (async () => {
//  client = redis.createClient({
//     password: process.env.REDIS_PW,
//     socket: {
//         host: process.env.REDIS_HOST,
//         port: process.env.REDIS_PORT,
//     }})


//     client.on('error', error => {
//       console.error(`Redis client error:`, error);
//     });


//     if(!client.isOpen){
//       await client.connect().then(() => {
//       console.log('Connected to Redis');
//       });
//     }

// })();


// Use environment variables from .env file 
const storage = new Storage({
    projectId: process.env.FIREBASE_PROJECT_ID, // Replace with environment variable
    keyFilename: process.env.firebase_service_account_key, // Replace with environment variable
}); // configuration for initializing Storage

const app = express();

const corsOptions = {
    origin: 'http://localhost:5173', // Allow the React app to connect to the server
    allowedHeaders: '*',
    allowMethods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204 for preflight requests
};

app.use(cors(corsOptions)); // Use CORS middleware globally

const port = 3000;

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });


  const db = admin.firestore();





app.get('/api/projects:ownerId',cors(corsOptions),async (req, res) => {


  res.set('Access-Control-Allow-Origin', 'http://localhost:5173'); // Replace with actual domain
  res.set('Access-Control-Allow-Methods', 'GET'); // Method for this route



  const projectsRef = db.collection('projects');
  const { ownerId } = req.params;

  console.log('Fetching projects for owner:', ownerId);


  

  try {

    
    const snapshot = await projectsRef.where('ownerId', '==', ownerId).get();

      if (snapshot.empty) {
        console.log('No matching documents.');
        return res.status(404).send('No projects found');
        }

        const projects = [];
        snapshot.forEach(doc => {
          projects.push({ id: doc.id, ...doc.data() });
        });

        console.log('Project fetch successful');

        res.status(200).json(projects);


  } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).send('Failed to fetch projects');
  }
});



// get project by id

app.get('/api/projects/:projectId',cors(corsOptions),async (req, res) => {  

  const projectsRef = db.collection('projects');
  const { projectId } = req.params;

  console.log('Fetching project:', projectId);

  try {
    const projectDoc = await projectsRef.doc(projectId).get();

    if (!projectDoc.exists) {
      console.log('No matching project.');
      return res.status(404).send('Project not found');
    }

    const projectData = projectDoc.data();
    console.log('Project fetch successful');

    const codeUrl = projectData.codeUrl;
    if (!codeUrl) {
      return res.status(400).send('No code URL found for the project');
    }

       // Parse the URL to get the path
       const urlObj = new URL(codeUrl);
       const filePath = decodeURIComponent(urlObj.pathname.split('/o/')[1]);
   
       // Get the file from the bucket
       const bucket = storage.bucket(process.env.FIREBASE_STORAGE_BUCKET);
       const file = bucket.file(filePath);
   
       // Download the file contents
       const [fileContent] = await file.download();



    res.status(200).json({ id: projectDoc.id, ...projectData, codeContent: fileContent.toString('utf8')});

  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).send('Failed to fetch project');
  }
});




