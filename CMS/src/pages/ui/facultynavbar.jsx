import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useProfile } from "./ProfileContext";
import { logout } from "../../firebase/authService";

export default function FacultyNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { openProfile } = useProfile();

  const navItems = [
    { name: "Home", path: "/Facultydash" },
    { name: "Refer a Student", path: "/Forms" },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/Facultydash")}>
          <img src="/src/assets/img/cmslogo.png" alt="University Logo" className="w-10 h-10" onError={(e) => { e.target.style.display = 'none'; }} />
          <span className="text-xl font-bold tracking-tight text-[#3B021F] hidden sm:block">Faculty Portal</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname.toLowerCase() === item.path.toLowerCase();
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${isActive
                  ? "bg-[#E0BBD1]/30 text-[#3B021F]"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`}
              >
                {item.name}
              </button>
            );
          })}

          <button
            onClick={openProfile}
            className="px-5 py-2 rounded-full text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all"
          >
            Profile
          </button>
        </nav>

        {/* Action / Logout */}
        <button
          onClick={handleLogout}
          className="ml-4 flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-sm font-semibold transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  );
}
