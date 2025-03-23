import React from 'react'
import ReactDOM from 'react-dom/client'
import { 
  createBrowserRouter, 
  RouterProvider, 
  Route, 
  createRoutesFromElements 
} from 'react-router-dom'
import './index.css'

import { ThemeProvider } from './components/ui/themeProvider'

import { QueryClient,QueryClientProvider } from '@tanstack/react-query'





//-------------------------------------------------
// Create a query client
const queryClient = new QueryClient({});
//-------------------------------------------------





//-------------------------------------------------
//import the pages
import Homepage from './pages/home.jsx'
import AboutPage from './pages/about.jsx'
import ResourcesPage from './components/resourcesPage.jsx'
import DiscoverPage from './pages/discover.jsx'
import LoginPage from './pages/login.jsx'
import SignUp from './pages/SignUp.jsx'
import App from './App.jsx'
import AuthContext from './context/AuthContext.jsx'
import Protected from './protected.jsx'
import ProfilePage from './pages/profile.jsx'
import ProjectPage from './pages/projectViewPage.jsx'
import CreateProjectForm from './projectForms/createProjectForm.jsx'
import EditProjectRoute from './projectForms/editProjectRoute'


//-------------------------------------------------


//-------------------------------------------------
// React Router v7 uses a more declarative approach with Route elements
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<Homepage />} />
      <Route path="about" element={<AboutPage />} />
      <Route path="discover" element={<DiscoverPage />} />
      <Route 
        path="resources" 
        element={
          <Protected>
            <ResourcesPage />
          </Protected>
        } 
      />
      <Route path="login" element={<LoginPage />} />
      <Route path="signup" element={<SignUp />} />
      
      {/* Profile routes */}
      <Route path="u">
        <Route index element={<ProfilePage />} />
        <Route path=":profileId" element={<ProfilePage />} />
        <Route path=":profileId/projects/new" element={<CreateProjectForm />} />
      </Route>
      
      {/* Project routes */}
      <Route path="project">
        <Route index element={<ProjectPage />} />
        <Route path=":projectId" element={<ProjectPage />} />
      </Route>

      {/* Edit Project page */}

      <Route path="edit-project">
      <Route index element={<Protected><EditProjectRoute /></Protected>} />
      <Route path=":projectId" element={<Protected><EditProjectRoute /></Protected>} />
      </Route> 

     
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
    <AuthContext>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </AuthContext>
    </ThemeProvider>
  </React.StrictMode>,
)