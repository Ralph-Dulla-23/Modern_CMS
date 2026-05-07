import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useProfile } from "./ProfileContext";
import { logout } from "../../firebase/authService";
import cmslogo from "../../assets/img/cmslogo.png";

export default function StudentNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { openProfile } = useProfile();

  const navItems = [
    { name: "Home", path: "/Dashboard" },
    { name: "Request", path: "/Request" },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="w-full bg-white/70 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-100/50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/Dashboard")}>
          <div className="relative">
            <div className="absolute inset-0 bg-[#E0BBD1]/20 rounded-xl blur-lg group-hover:blur-xl transition-all"></div>
            <img src={cmslogo} alt="University Logo" className="relative w-10 h-10 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
          </div>
          <span className="text-xl font-black tracking-tight text-[#3B021F] hidden sm:block uppercase">Wellbeing</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 bg-slate-50/50 p-1.5 rounded-2xl border border-slate-100/50">
          {navItems.map((item) => {
            const isActive = location.pathname.toLowerCase() === item.path.toLowerCase();
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-[0.1em] transition-all duration-300 ${isActive
                  ? "bg-white text-[#3B021F] shadow-sm ring-1 ring-slate-100"
                  : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                  }`}
              >
                {item.name}
              </button>
            );
          })}

          <button
            onClick={openProfile}
            className="px-6 py-2 rounded-xl text-xs font-black uppercase tracking-[0.1em] text-slate-400 hover:text-slate-600 hover:bg-white/50 transition-all"
          >
            Profile
          </button>
        </nav>

        {/* Action / Logout */}
        <button
          onClick={handleLogout}
          className="ml-4 flex items-center gap-2.5 px-6 py-3 bg-[#3B021F] hover:bg-[#4B122F] text-white rounded-xl text-xs font-black uppercase tracking-[0.1em] transition-all shadow-lg shadow-[#3B021F]/10 hover:-translate-y-0.5 active:translate-y-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  );
  }

