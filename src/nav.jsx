import React,{useState} from "react";
import { signOut,getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import {Navbar, NavbarBrand, NavbarContent, NavbarItem,Button, DropdownItem, DropdownTrigger, Dropdown, DropdownMenu, Avatar, NavbarMenuToggle, NavbarMenu, NavbarMenuItem, User, user} from "@nextui-org/react";




const NavigationBar = ()=>{

  const auth = getAuth()
  const navigate = useNavigate();

    const {userLoggedIn,userData} = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const menuItems = [
      "About",
      "Discover",
      "Resources",
      "Login",
    ];

  const handleMenuItemClick = () => {
      setIsMenuOpen(false);
    };



    async function handleSingOut(){
      try{
          
          await signOut(auth);
          navigate("/Login", { replace: true }); // Redirect to login page after sign-out


      }catch(error){

          console.log(error);
      }
  }

return(

    <Navbar 
    className="nav-bar"
     maxWidth={"2xl"}      
    isMenuOpen={isMenuOpen} 
    onMenuOpenChange={setIsMenuOpen}>

      <NavbarContent className="sm:hidden" justify="start">
      <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden text-green-500"
        />
      </NavbarContent>

    <NavbarContent className="sm:hidden pr-3" justify="center">
    <NavbarBrand>
    <NavLink to ="/" className="site-title">{<img 
            src= "/whitelogov2.png" 
            alt="White-logo-png" 
            className="site-logo"
        />}</NavLink>
    </NavbarBrand>
    </NavbarContent>
    


    <NavbarContent className="hidden sm:flex gap-4 items-center" justify="center">
    <NavbarBrand className="mr-auto">
    <NavLink to ="/" className="site-title">{<img 
            src= "/whitelogov2.png" 
            alt="White-logo-png" 
            className="site-logo"
        />}</NavLink>
    </NavbarBrand>
    </NavbarContent>



{userLoggedIn ? (
<>

<NavbarContent as="div" justify="end">
<NavbarItem  className="hidden md:flex lg:flex pr-4">
<Button as={NavLink}
       to="/Discover"  
        className="bg-zinc-600 text-white flex items-center">
          <img src= "/discoverIcon.svg"/>
          Discover
          </Button>
    </NavbarItem>
     
  <NavbarItem>
          <Dropdown placement="bottom-start" className="bg-zinc-800">
          
          <DropdownTrigger className="dropdown-trigger">
          
            <Avatar
              isBordered
              as="button"
              color="success"
              className="transition-transform"
              name={userData?.username || "User"}
              size="md"
              src={userData?.avatar || "/whiteaccount.png"}
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="solid" className="text-white">
            <DropdownItem key="profile" className="h-14 gap-2" textValue={`Signed in as ${userData?.email || "...loading"}`}>
              <p className="font-semibold">Signed in as</p>
              <p className="font-semibold">{userData?.email || "...loading"}</p>
            </DropdownItem>
            
            <DropdownItem as={NavLink} to ={`/u/${userData?.username}`} key="settings_profile">Your Profile</DropdownItem>
            <DropdownItem key="configurations">Configurations</DropdownItem>
            <DropdownItem key="help_and_feedback">Help & Feedback</DropdownItem>
            <DropdownItem key="logout" color="danger" onClick={()=>handleSingOut()} textValue="Log Out">
              <div className="flex items-center gap-2">
              Log Out
              <img src= "/logoutIcon.svg" alt="Logout icon"/>
              </div>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown> 
  </NavbarItem>
      </NavbarContent>
</> 
):
(
<>
    <NavbarContent justify="end">   
    <NavbarItem  className="hidden lg:flex">
    <Button as={NavLink}
       to="/Discover"  
        className="bg-zinc-600 text-white flex items-center">
          <img src= "/discoverIcon.svg"/>
          Discover
          </Button>
      </NavbarItem>

      <NavbarItem className="hidden lg:flex">
        <Button as={NavLink}
       to="/Login"  
        className="bg-zinc-600 text-white flex items-center gap-2">
          <img src= "/loginIcon.svg"/>
          Login</Button>
      </NavbarItem>
      <NavbarItem className="lg:flex flex-none">
        <Button as={NavLink}       
        className="bg-lime-700 text-white flex items-center gap-2"  
         to="/SignUp" variant="solid">
          <img src= "/personIcon.svg"/>
          Sign Up
        </Button>
      </NavbarItem>
    </NavbarContent>
</>
)
}


<NavbarMenu className="bg-lime-700"  aria-label={isMenuOpen ? "Close menu" : "Open menu"}>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <NavLink
             className="w-full text-white"
             to={`/${item}`}
              size="xl"
              onClick={handleMenuItemClick}
            >
              {item}
            </NavLink>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>

  </Navbar>

);

}


export default NavigationBar;




