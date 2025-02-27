import { Outlet } from "react-router-dom";
import NavigationBar from "./components/navBar";


function App() {

  return (
    <>

      <NavigationBar/>
        <Outlet/>
    
    </>
  )
}

export default App
