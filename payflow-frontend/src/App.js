
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import AddUser from './pages/AddUser';
import ResetPassword from './pages/ResetPassword';
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import ManagerLogin from './pages/ManagerLogin';
import HRLogin from './pages/HRLogin';
import Onboarding from "./pages/Onboarding";
import EmployeeLogin from "./pages/EmployeeLogin";
import Home from "./pages/Home";
import Sidebar from "./components/Sidebar";
import UnifiedLogin from "./pages/UnifiedLogin";
import EmployeeList from "./pages/EmployeeList";

// import Login from "./components/Login";


function App() {
    return (
        <BrowserRouter>
            <Navbar/>
            <Routes>
                <Route path="/" element={<Home/>} />
                <Route path="/login" element={<UnifiedLogin/>}/>
                <Route path="/hr-dashboard" element={<Dashboard/>} />
                {/*<Route path="/login/admin" element={<AdminLoginPage />} />*/}
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/navbar" element={<Navbar/>} />
                <Route path="/sidebar" element={<Sidebar/>}/>
                <Route path="/create-user" element={<AddUser/>} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/onboarding" element={<Onboarding />} />
                {/*<Route path="/login/hr" element={<HRLogin />} />*/}
                {/*<Route path="/login/manager" element={<ManagerLogin />} />*/}
                <Route path="/employee" element={<EmployeeList />} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;