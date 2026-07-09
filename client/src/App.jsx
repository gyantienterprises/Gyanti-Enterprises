import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import Navbar from "./components/navbar/navbar.jsx";
import Client from "./components/client/Client.jsx";
import Admin from "./components/admin/Admin.jsx";
import BottomBar from "./components/bottombar/BottomBar.jsx";

function App() {
  return (
    <Router>
      <div className="bg-bg-main text-text-primary min-h-screen">
        {/* Navbar stays on top for all pages, or you can conditionally hide it */}
        <Navbar /> 
        
        <Routes>
          {/* Main User Facing Route */}
          <Route path="/" element={<Client />} />
          
          {/* Admin Route */}
          <Route path="/admin" element={<Admin />} />
        </Routes>

        <BottomBar/>
      </div>
    </Router>
  );
}

export default App;