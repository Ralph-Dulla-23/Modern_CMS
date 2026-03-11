import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../../firebase/authService";

export default function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/Admindashboard" },
    { name: "Reports", path: "/Reports" },
    { name: "Submission", path: "/SubmittedFormsManagement" },
    { name: "Schedule", path: "/Schedule" },
    { name: "History", path: "/History" },
    { name: "Profile", path: "/AProfile" },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200/60">
      <div className="max-w-[1400px] mx-auto px-6 h-20 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/Admindashboard")}>
          <img src="/src/assets/img/cmslogo.png" alt="University Logo" className="w-10 h-10" onError={(e) => { e.target.style.display = 'none'; }} />
          <span className="text-xl font-bold tracking-tight text-[#3B021F] hidden sm:block">Admin Hub</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname.toLowerCase() === item.path.toLowerCase();
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${isActive
                  ? "bg-[#E0BBD1]/30 text-[#3B021F]"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`}
              >
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Action / Logout */}
        <button
          onClick={handleLogout}
          className="ml-4 flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-sm font-semibold transition-colors shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  );
}
