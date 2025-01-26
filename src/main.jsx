import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter,RouterProvider } from 'react-router-dom'
import './index.css'

import { QueryClient,QueryClientProvider } from '@tanstack/react-query'


//-------------------------------------------------

// Import the HeroUIProvider
import {HeroUIProvider} from "@heroui/react";

//-------------------------------------------------



//-------------------------------------------------
// Create a query client
const queryClient = new QueryClient({});
//-------------------------------------------------

//-------------------------------------------------
//Import Toaster from Sonner
// import { Toaster } from 'sonner'
//-------------------------------------------------





//-------------------------------------------------
//import the pages
import Homepage from './home.jsx'
import AboutPage from './about.jsx'
import ResourcesPage from './resources.jsx'
import DiscoverPage from './discover.jsx'
import LoginPage from './login.jsx'
import SignUp from './SignUp.jsx'
import App from './App.jsx'
import AuthContext from './context/AuthContext.jsx'
import Protected from './protected.jsx'
import ProfilePage from './profile.jsx'
import ProjectCard from './projectCard.jsx'
import ProjectPage from './projectView.jsx'
import ProjectCode from './codeView.jsx'


//-------------------------------------------------


//-------------------------------------------------
//The browser router
const router = createBrowserRouter([
{
  path:"/",
  element:<App/>,
  children:[
    {
      path:"/",
      element:<Homepage/>,
    },
    {
      path:"/About",
      element:<AboutPage/>,
    },
    {
      path:"/Discover",
      element:<DiscoverPage/>,
    },
    {
      path:"/Resources",
      element:<Protected><ResourcesPage/></Protected>,
    },
    {
      path:"/Login",
      element:<LoginPage/>,
    },
    {
      path:"/SignUp",
      element:<SignUp/>,
    },
    {
      path:"/u",
      element:<ProfilePage/>,
      children:[ {
        path:"/u/:profileId",
        element:<ProfilePage/>
      },{
        path: "/u/:profileId/projects/new", // New route for project upload
        element: <ProjectCard />, // Your component for project upload
      }
    ],
    },{
      path:"/project",
      element:<ProjectPage/>,
      children:[
        {
          path:"/project/:projectId",
          element:<ProjectPage/>,
        },
      ]
    },{
      path:"/projectCode",
      element:<ProjectCode/>,
      children:[
        {
          path:"/projectCode/:projectId",
          element:<ProjectCode/>,
        }],
    }
    
  ]
}
]);

//-------------------------------------------------

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthContext>
    <QueryClientProvider client={queryClient}>
    <RouterProvider router={router}>
    <HeroUIProvider>
    <App/>
    </HeroUIProvider>
    </RouterProvider>
    </QueryClientProvider>
    </AuthContext>

  </React.StrictMode>,
)
