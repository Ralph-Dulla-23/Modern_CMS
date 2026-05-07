import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useProfile } from "./ProfileContext";
import { logout } from "../../firebase/authService";
import cmslogo from "../../assets/img/cmslogo.png";

export default function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { openProfile } = useProfile();

  const navItems = [
    { name: "Dashboard", path: "/Admindashboard" },
    { name: "Reports", path: "/Reports" },
    { name: "Submission", path: "/SubmittedFormsManagement" },
    { name: "Schedule", path: "/Schedule" },
    { name: "History", path: "/History" },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="w-full bg-white/90 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-100 shadow-sm font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-[1440px] mx-auto px-8 h-24 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate("/Admindashboard")}>
          <img src={cmslogo} alt="University Logo" className="w-12 h-12 transition-transform group-hover:scale-105" onError={(e) => { e.target.style.display = 'none'; }} />
          <div className="hidden sm:block">
            <span className="text-xl font-extrabold tracking-tight text-slate-900 block leading-none">Admin <span className="text-[#3B021F]">Hub</span></span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 block">Command Center</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname.toLowerCase() === item.path.toLowerCase();
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${isActive
                  ? "bg-[#3B021F] text-white shadow-md"
                  : "text-slate-500 hover:bg-[#E0BBD1]/20 hover:text-[#3B021F]"
                  }`}
              >
                {item.name}
              </button>
            );
          })}
          
          <button
            onClick={openProfile}
            className="px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest text-slate-500 hover:bg-[#E0BBD1]/20 hover:text-[#3B021F] transition-all whitespace-nowrap"
          >
            Profile
          </button>
        </nav>

        {/* Action / Logout */}
        <button
          onClick={handleLogout}
          className="ml-6 flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-[#3B021F] hover:border-[#3B021F]/20 rounded-full text-[11px] font-black uppercase tracking-widest transition-all shadow-sm shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  );
}
