import { Outlet } from "react-router-dom";
import NavigationBar from "./nav";
import './App.css'

function App() {

  return (
    <div className="App">

    <NavigationBar/>
    <Outlet/>
    </div>
  )
}

export default App
