import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";


function Layout() {
  return (
    <div style={{display: "flex"}}> 
        <Sidebar />

        <div style={{flex: 1}}>
            <Navbar /> 
            <div style={{padding: "20px"}}>
                <Outlet />    
            </div> 
        </div>
    </div>
  );
}

export default Layout;